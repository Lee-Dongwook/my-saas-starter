import { Hono } from "hono";

import { env } from "../env";

/**
 * Public feature flags.
 *
 * The web app cannot read server env, so it asks the API which optional
 * features were actually configured (OAuth providers, billing, email
 * verification) and hides the corresponding UI when they are off.
 */
export interface AppConfig {
  app: { name: string };
  auth: {
    emailAndPassword: boolean;
    socialProviders: Array<"github" | "google">;
  };
  billing: { enabled: boolean; plans: Array<{ name: string }> };
}

export function buildAppConfig(): AppConfig {
  const socialProviders: AppConfig["auth"]["socialProviders"] = [];
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.push("github");
  }
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.push("google");
  }

  const billingEnabled = Boolean(
    env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET,
  );

  return {
    app: { name: env.APP_NAME },
    auth: { emailAndPassword: true, socialProviders },
    billing: {
      enabled: billingEnabled,
      plans: billingEnabled && env.STRIPE_PRICE_PRO ? [{ name: "pro" }] : [],
    },
  };
}

export const configRoutes = new Hono().get("/", (c) =>
  c.json(buildAppConfig()),
);
