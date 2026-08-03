import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { compare, hash } from "bcryptjs";

import { authorizeOrganizationReference } from "./billing/authorize";
import { toStripePlans } from "./billing/plans";
import { prisma } from "./db";
import { sendEmail } from "./email";
import {
  organizationInvitationTemplate,
  resetPasswordTemplate,
  verifyEmailTemplate,
} from "./emails/templates";
import { env } from "./env";
import { stripeClient } from "./stripe";

const socialProviders = {
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [env.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    // Keep the project's existing bcrypt hashing so seeded credentials work.
    password: {
      hash: (password) => hash(password, 12),
      verify: ({ hash: hashed, password }) => compare(password, hashed),
    },
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...resetPasswordTemplate(url) });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...verifyEmailTemplate(url) });
    },
  },
  socialProviders,
  plugins: [
    organization({
      sendInvitationEmail: async ({
        id,
        email,
        role,
        organization: org,
        inviter,
      }) => {
        await sendEmail({
          to: email,
          ...organizationInvitationTemplate({
            organizationName: org.name,
            inviterName: inviter.user.name,
            role,
            // The invitation is accepted in the web app, not the API.
            url: `${env.WEB_ORIGIN}/accept-invitation/${id}`,
          }),
        });
      },
    }),
    ...(stripeClient
      ? [
          stripe({
            stripeClient,
            stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            // Gives organizations their own Stripe customer, so an invoice
            // belongs to the team rather than whoever happened to subscribe.
            organization: { enabled: true },
            subscription: {
              enabled: true,
              plans: toStripePlans(),
              // Subscriptions are referenced by organization id.
              authorizeReference: ({ user, referenceId, action }) =>
                authorizeOrganizationReference({
                  userId: user.id,
                  referenceId,
                  action,
                }),
            },
          }),
        ]
      : []),
  ],
});
