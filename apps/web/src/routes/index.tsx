import { createBrowserRouter } from "react-router";

import { RequireAuth, RequireGuest } from "@/components/auth/route-guards";

import { AuthLayout } from "./auth/auth-layout";
import { ForgotPasswordPage } from "./auth/forgot-password";
import { ResetPasswordPage } from "./auth/reset-password";
import { SignInPage } from "./auth/sign-in";
import { SignUpPage } from "./auth/sign-up";
import { VerifyEmailPage } from "./auth/verify-email";
import { DashboardPage } from "./dashboard";
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
    children: [{ path: "/", element: <DashboardPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);
