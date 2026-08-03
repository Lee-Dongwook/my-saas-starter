import { apiFetch } from "./api";

/** Mirrors PlanPrice / PublicPlan / PlansResponse in apps/api/src/routes/billing.ts. */
export interface PlanPrice {
  /** Smallest currency unit, e.g. cents. */
  amount: number;
  currency: string;
  interval: "month" | "year";
}

export interface PublicPlan {
  name: string;
  displayName: string;
  description: string;
  features: string[];
  limits: { members: number; projects: number };
  highlighted?: boolean;
  monthly: PlanPrice | null;
  annual: PlanPrice | null;
}

export interface PlansResponse {
  enabled: boolean;
  plans: PublicPlan[];
}

/** `-1` stands in for Infinity, which JSON can't carry. */
export const UNLIMITED = -1;

export function formatLimit(value: number) {
  return value === UNLIMITED ? "Unlimited" : String(value);
}

export function formatPrice(price: PlanPrice, locale?: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency.toUpperCase(),
    // Stripe amounts are integers in the minor unit; drop the ".00" tail on
    // round prices, which is what pricing pages normally show.
    minimumFractionDigits: price.amount % 100 === 0 ? 0 : 2,
  }).format(price.amount / 100);
}

export function fetchPlans() {
  return apiFetch<PlansResponse>("/api/billing/plans");
}
