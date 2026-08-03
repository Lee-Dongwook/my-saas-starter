import { Hono } from "hono";
import type Stripe from "stripe";

import { allPlans, type PlanDefinition } from "../billing/plans";
import { stripeClient } from "../stripe";

export interface PlanPrice {
  /** Smallest currency unit, e.g. cents. */
  amount: number;
  currency: string;
  interval: "month" | "year";
}

export interface PublicPlan extends Omit<
  PlanDefinition,
  "priceId" | "annualDiscountPriceId"
> {
  monthly: PlanPrice | null;
  annual: PlanPrice | null;
}

export interface PlansResponse {
  enabled: boolean;
  plans: PublicPlan[];
}

/**
 * Prices live in Stripe, not in this repo — hard-coding them here would drift
 * the moment someone edits the dashboard. They change rarely, so a short
 * in-process cache keeps the pricing page off the Stripe API on every load.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { expiresAt: number; value: PlansResponse } | null = null;

async function fetchPrice(
  client: Stripe,
  priceId: string | undefined,
): Promise<PlanPrice | null> {
  if (!priceId) return null;

  try {
    const price = await client.prices.retrieve(priceId);
    if (price.unit_amount === null) return null;
    return {
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval === "year" ? "year" : "month",
    };
  } catch (error) {
    // A mistyped price id shouldn't take the whole pricing page down; the plan
    // simply renders without an amount.
    console.error(`[billing] could not load Stripe price ${priceId}:`, error);
    return null;
  }
}

async function buildPlans(): Promise<PlansResponse> {
  if (!stripeClient) {
    // Billing is off: only the free tier is meaningful.
    return {
      enabled: false,
      plans: allPlans
        .filter((plan) => !plan.priceId)
        .map((plan) => ({
          ...stripDetails(plan),
          monthly: null,
          annual: null,
        })),
    };
  }

  const plans = await Promise.all(
    allPlans.map(async (plan) => ({
      ...stripDetails(plan),
      monthly: await fetchPrice(stripeClient!, plan.priceId),
      annual: await fetchPrice(stripeClient!, plan.annualDiscountPriceId),
    })),
  );

  return { enabled: true, plans };
}

/** Price ids are an implementation detail — don't ship them to the browser. */
function stripDetails(plan: PlanDefinition) {
  const { priceId: _priceId, annualDiscountPriceId: _annual, ...rest } = plan;
  return rest;
}

export const billingRoutes = new Hono().get("/plans", async (c) => {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return c.json(cache.value);

  const value = await buildPlans();
  cache = { expiresAt: now + CACHE_TTL_MS, value };
  return c.json(value);
});
