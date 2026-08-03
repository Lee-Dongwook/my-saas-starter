import { Hono } from "hono";

import { env } from "../env";
import { billingEnabled } from "../stripe";

/**
 * Public feature flags.
 *
 * The web app cannot read server env, so it asks the API which optional
 * features were actually configured (OAuth providers, billing) and hides the
 * corresponding UI when they are off. Plan details are served separately by
 * GET /api/billing/plans, which also resolves live prices from Stripe.
 */
export interface AppConfig {
  app: { name: string };
  auth: {
    emailAndPassword: boolean;
    socialProviders: Array<"github" | "google">;
  };
  billing: { enabled: boolean };
}

export function buildAppConfig(): AppConfig {
  const socialProviders: AppConfig["auth"]["socialProviders"] = [];
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.push("github");
  }
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.push("google");
  }

  return {
    app: { name: env.APP_NAME },
    auth: { emailAndPassword: true, socialProviders },
    billing: { enabled: billingEnabled },
  };
}

export const configRoutes = new Hono().get("/", (c) =>
  c.json(buildAppConfig()),
);
