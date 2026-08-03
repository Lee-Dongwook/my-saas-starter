import { Navigate, createBrowserRouter } from "react-router";

import { RequireAuth, RequireGuest } from "@/components/auth/route-guards";
import { AppShell } from "@/components/layout/app-shell";
import { RequireOrganization } from "@/components/organization/require-organization";

import { AuthLayout } from "./auth/auth-layout";
import { ForgotPasswordPage } from "./auth/forgot-password";
import { ResetPasswordPage } from "./auth/reset-password";
import { SignInPage } from "./auth/sign-in";
import { SignUpPage } from "./auth/sign-up";
import { VerifyEmailPage } from "./auth/verify-email";
import { AcceptInvitationPage } from "./accept-invitation";
import { DashboardPage } from "./app/dashboard";
import { OnboardingPage } from "./app/onboarding";
import { MembersPage } from "./app/settings/members";
import { OrganizationSettingsPage } from "./app/settings/organization";
import { SettingsLayout } from "./app/settings/settings-layout";
import { NotFoundPage } from "./not-found";

export const router = createBrowserRouter([
  {
    // Signed-out only: a logged-in visitor is bounced to the dashboard.
    element: <RequireGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/sign-in", element: <SignInPage /> },
          { path: "/sign-up", element: <SignUpPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    // Reachable in either state — you land here right after signing up.
    element: <AuthLayout />,
    children: [{ path: "/verify-email", element: <VerifyEmailPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      // Outside the org gate: reachable by users with no organization yet —
      // which is exactly the case for someone accepting their first invite.
      { path: "/onboarding", element: <OnboardingPage /> },
      {
        path: "/accept-invitation/:invitationId",
        element: <AcceptInvitationPage />,
      },
      {
        element: <RequireOrganization />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: "/", element: <DashboardPage /> },
              {
                path: "/settings",
                element: <SettingsLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="organization" replace />,
                  },
                  {
                    path: "organization",
                    element: <OrganizationSettingsPage />,
                  },
                  { path: "members", element: <MembersPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
