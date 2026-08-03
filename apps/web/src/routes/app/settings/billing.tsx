import { Check, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useOrganization } from "@/hooks/use-organization";
import { errorMessage } from "@/lib/api";
import { subscription } from "@/lib/auth-client";
import {
  fetchPlans,
  formatLimit,
  formatPrice,
  type PublicPlan,
} from "@/lib/billing";
import { cn } from "@/lib/cn";
import { useAppConfig } from "@/providers/config-provider";

interface ActiveSubscription {
  id: string;
  plan: string;
  status: string;
  periodEnd?: Date | string | null;
  trialEnd?: Date | string | null;
  cancelAtPeriodEnd?: boolean | null;
  seats?: number | null;
}

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  active: "success",
  trialing: "success",
  past_due: "warning",
  incomplete: "warning",
  unpaid: "destructive",
  canceled: "destructive",
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

export function BillingPage() {
  const { billing } = useAppConfig();
  const { organization: activeOrg, can } = useOrganization();
  const { toast } = useToast();

  const [plans, setPlans] = useState<PublicPlan[] | null>(null);
  const [current, setCurrent] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [annual, setAnnual] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const organizationId = activeOrg?.id;
  const canManageBilling = can("updateOrganization");

  const loadSubscription = useCallback(async () => {
    if (!organizationId || !billing.enabled) return;
    const { data } = await subscription.list({
      query: { referenceId: organizationId },
    });
    // The plugin returns every non-cancelled subscription for the reference;
    // an organization only ever has one that matters.
    setCurrent((data?.[0] as ActiveSubscription | undefined) ?? null);
  }, [organizationId, billing.enabled]);

  useEffect(() => {
    let active = true;

    Promise.all([fetchPlans(), loadSubscription()])
      .then(([plansResponse]) => {
        if (active) setPlans(plansResponse.plans);
      })
      .catch((error: unknown) => {
        if (active) {
          toast({
            variant: "destructive",
            title: "Could not load billing",
            description: errorMessage(error),
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadSubscription, toast]);

  async function upgrade(plan: PublicPlan) {
    if (!organizationId) return;
    setBusy(plan.name);

    const { data, error } = await subscription.upgrade({
      plan: plan.name,
      annual: annual && Boolean(plan.annual),
      referenceId: organizationId,
      customerType: "organization",
      successUrl: `${window.location.origin}/settings/billing`,
      cancelUrl: `${window.location.origin}/settings/billing`,
    });

    if (error) {
      setBusy(null);
      toast({
        variant: "destructive",
        title: "Could not start checkout",
        description: errorMessage(error.message),
      });
      return;
    }

    // Stripe Checkout lives on Stripe's domain; keep the spinner during the
    // hand-off instead of clearing `busy`.
    if (data?.url) window.location.href = data.url;
  }

  async function openBillingPortal() {
    if (!organizationId) return;
    setBusy("portal");

    const { data, error } = await subscription.billingPortal({
      referenceId: organizationId,
      customerType: "organization",
      returnUrl: `${window.location.origin}/settings/billing`,
    });

    if (error) {
      setBusy(null);
      toast({
        variant: "destructive",
        title: "Could not open the billing portal",
        description: errorMessage(error.message),
      });
      return;
    }

    if (data?.url) window.location.href = data.url;
  }

  async function restore() {
    if (!organizationId) return;
    setBusy("restore");
    const { error } = await subscription.restore({
      referenceId: organizationId,
      customerType: "organization",
    });
    setBusy(null);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not resume the subscription",
        description: errorMessage(error.message),
      });
      return;
    }
    toast({ variant: "success", title: "Subscription resumed" });
    void loadSubscription();
  }

  if (!billing.enabled) {
    return (
      <Alert variant="info">
        <AlertTitle>Billing is not configured</AlertTitle>
        <AlertDescription>
          Set <code className="font-mono text-xs">STRIPE_SECRET_KEY</code>,{" "}
          <code className="font-mono text-xs">STRIPE_WEBHOOK_SECRET</code> and
          at least one <code className="font-mono text-xs">STRIPE_PRICE_*</code>{" "}
          price id, then restart the API to enable subscriptions.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading || !plans) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const currentPlanName = current?.plan ?? "free";
  const hasAnnualOption = plans.some((plan) => plan.annual);
  const renewsOn = formatDate(current?.periodEnd);
  const trialEndsOn = formatDate(current?.trialEnd);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardDescription>Current plan</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              {plans.find((plan) => plan.name === currentPlanName)
                ?.displayName ?? currentPlanName}
              {current ? (
                <Badge variant={statusVariant[current.status] ?? "secondary"}>
                  {current.status.replace(/_/g, " ")}
                </Badge>
              ) : null}
            </CardTitle>
          </div>
          {canManageBilling && current ? (
            <Button
              variant="outline"
              size="sm"
              loading={busy === "portal"}
              onClick={openBillingPortal}
            >
              <ExternalLink />
              Manage billing
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {trialEndsOn ? <p>Trial ends on {trialEndsOn}.</p> : null}
          {current?.cancelAtPeriodEnd && renewsOn ? (
            <p>Cancels on {renewsOn}. You keep access until then.</p>
          ) : renewsOn ? (
            <p>Renews on {renewsOn}.</p>
          ) : (
            <p>No paid subscription for this organization yet.</p>
          )}
          {current?.seats ? <p>{current.seats} seats.</p> : null}
        </CardContent>

        {canManageBilling && current?.cancelAtPeriodEnd ? (
          <CardFooter>
            <Button size="sm" loading={busy === "restore"} onClick={restore}>
              Resume subscription
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Plans</h2>
            <p className="text-sm text-muted-foreground">
              {canManageBilling
                ? "Change the plan for this organization."
                : "Only owners and admins can change the plan."}
            </p>
          </div>

          {hasAnnualOption ? (
            <div className="flex rounded-md border border-border p-0.5">
              {[
                { value: false, label: "Monthly" },
                { value: true, label: "Annual" },
              ].map(({ value, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={annual === value}
                  onClick={() => setAnnual(value)}
                  className={cn(
                    "rounded px-3 py-1 text-sm font-medium transition-colors",
                    annual === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = annual && plan.annual ? plan.annual : plan.monthly;
            const isCurrent = plan.name === currentPlanName;
            const isFree = !plan.monthly;

            return (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col",
                  plan.highlighted && "border-primary shadow-md",
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.displayName}</CardTitle>
                    {isCurrent ? (
                      <Badge variant="outline">Current</Badge>
                    ) : null}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {price ? (
                      <>
                        {formatPrice(price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          / {price.interval}
                        </span>
                      </>
                    ) : (
                      "Free"
                    )}
                  </p>

                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-success"
                        />
                        {feature}
                      </li>
                    ))}
                    <li className="flex items-start gap-2">
                      <Check
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-success"
                      />
                      {formatLimit(plan.limits.members)} members ·{" "}
                      {formatLimit(plan.limits.projects)} projects
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  {isFree ? (
                    <p className="text-xs text-muted-foreground">
                      {isCurrent
                        ? "You're on the free plan."
                        : "Downgrade from the billing portal."}
                    </p>
                  ) : (
                    <Button
                      fullWidth
                      variant={plan.highlighted ? "default" : "outline"}
                      disabled={!canManageBilling || isCurrent}
                      loading={busy === plan.name}
                      onClick={() => upgrade(plan)}
                    >
                      {isCurrent
                        ? "Current plan"
                        : `Upgrade to ${plan.displayName}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
