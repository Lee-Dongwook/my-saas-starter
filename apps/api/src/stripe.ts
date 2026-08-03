import Stripe from "stripe";

import { env } from "./env";

/**
 * Shared Stripe client, or `null` when billing isn't configured.
 *
 * Both the secret key and the webhook secret are required: without the webhook
 * we would create subscriptions we could never hear about again.
 */
export const stripeClient =
  env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET
    ? new Stripe(env.STRIPE_SECRET_KEY)
    : null;

export const billingEnabled = stripeClient !== null;
