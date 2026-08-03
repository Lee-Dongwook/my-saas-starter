import { stripeClient } from "@better-auth/stripe/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { API_BASE_URL } from "./api";

/**
 * Better Auth browser client.
 *
 * The plugin list must mirror the server's (`apps/api/src/auth.ts`) — that is
 * what gives us `authClient.organization.*` and `authClient.subscription.*`
 * with end-to-end types. Calls go to `${API_BASE_URL}/api/auth/**`; when
 * API_BASE_URL is empty they are same-origin and Vite's dev proxy forwards
 * them to the API on port 8000.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL || undefined,
  plugins: [organizationClient(), stripeClient({ subscription: true })],
});

export const {
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  changePassword,
  updateUser,
  deleteUser,
  useSession,
  getSession,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  listAccounts,
  organization,
  useActiveOrganization,
  useListOrganizations,
  subscription,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type SessionUser = Session["user"];
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Organization = typeof authClient.$Infer.Organization;
export type Member = typeof authClient.$Infer.Member;
export type Invitation = typeof authClient.$Infer.Invitation;
