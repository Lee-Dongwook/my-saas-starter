import { Building2, CreditCard, Users } from "lucide-react";

import { useCurrentSession } from "@/components/auth/route-guards";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActiveOrganization } from "@/lib/auth-client";
import { useAppConfig } from "@/providers/config-provider";

export function DashboardPage() {
  const { user } = useCurrentSession();
  const { data: activeOrg } = useActiveOrganization();
  const { billing } = useAppConfig();

  const memberCount = activeOrg?.members?.length ?? 0;
  const role = activeOrg?.members?.find(
    (member) => member.userId === user.id,
  )?.role;

  const stats = [
    {
      label: "Organization",
      value: activeOrg?.name ?? "—",
      icon: Building2,
      hint: role ? `You are ${role}` : undefined,
    },
    {
      label: "Members",
      value: String(memberCount),
      icon: Users,
      hint: memberCount === 1 ? "Just you so far" : undefined,
    },
    {
      label: "Billing",
      value: billing.enabled ? "Enabled" : "Not configured",
      icon: CreditCard,
      hint: billing.enabled ? undefined : "Set the Stripe env vars to turn on",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in{" "}
          {activeOrg?.name ?? "your workspace"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon aria-hidden className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              {hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>
            The building blocks still landing in this starter kit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {[
            "Invite teammates and manage roles",
            "Subscribe to a plan and open the billing portal",
            "Update your profile, password and active sessions",
          ].map((item) => (
            <p key={item} className="flex items-center gap-2">
              <Badge variant="outline">Soon</Badge>
              {item}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
