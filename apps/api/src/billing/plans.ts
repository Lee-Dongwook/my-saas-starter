import { env } from "../env";

/**
 * A billable plan.
 *
 * `name` is the identifier Better Auth stores on the subscription row and that
 * the client passes to `subscription.upgrade({ plan })` — keep it stable.
 * Everything else is presentation, served to the web app by
 * GET /api/billing/plans.
 */
export interface PlanDefinition {
  name: string;
  displayName: string;
  description: string;
  features: string[];
  /** Soft limits enforced by the app; also handed to Better Auth as `limits`. */
  limits: { members: number; projects: number };
  priceId?: string;
  annualDiscountPriceId?: string;
  highlighted?: boolean;
}

/** `-1` means "no limit" — JSON has no Infinity. */
export const UNLIMITED = -1;

/**
 * The free tier is not a Stripe plan: it is what an organization has when it
 * holds no active subscription, so it carries no price id.
 */
export const FREE_PLAN: PlanDefinition = {
  name: "free",
  displayName: "Free",
  description: "Everything you need to try things out.",
  features: ["Up to 3 members", "Up to 3 projects", "Community support"],
  limits: { members: 3, projects: 3 },
};

const PAID_PLANS: PlanDefinition[] = [
  {
    name: "pro",
    displayName: "Pro",
    description: "For growing teams that need room to work.",
    features: [
      "Up to 25 members",
      "Unlimited projects",
      "Email support",
      "Audit log",
    ],
    limits: { members: 25, projects: UNLIMITED },
    priceId: env.STRIPE_PRICE_PRO,
    annualDiscountPriceId: env.STRIPE_PRICE_PRO_ANNUAL,
    highlighted: true,
  },
  {
    name: "business",
    displayName: "Business",
    description: "For organizations with compliance requirements.",
    features: [
      "Unlimited members",
      "Unlimited projects",
      "Priority support",
      "SAML single sign-on",
    ],
    limits: { members: UNLIMITED, projects: UNLIMITED },
    priceId: env.STRIPE_PRICE_BUSINESS,
    annualDiscountPriceId: env.STRIPE_PRICE_BUSINESS_ANNUAL,
  },
];

/** Only plans with a configured monthly price id can actually be bought. */
export const paidPlans: PlanDefinition[] = PAID_PLANS.filter((plan) =>
  Boolean(plan.priceId),
);

export const allPlans: PlanDefinition[] = [FREE_PLAN, ...paidPlans];

export function findPlan(name: string) {
  return allPlans.find((plan) => plan.name === name);
}

/** The subset of each plan Better Auth's stripe plugin needs. */
export function toStripePlans() {
  return paidPlans.map((plan) => ({
    name: plan.name,
    priceId: plan.priceId!,
    ...(plan.annualDiscountPriceId
      ? { annualDiscountPriceId: plan.annualDiscountPriceId }
      : {}),
    limits: plan.limits as unknown as Record<string, unknown>,
  }));
}
