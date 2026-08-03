import { Navigate, Outlet, useLocation } from "react-router";

import { Spinner } from "@/components/ui/spinner";
import { useSession, type Session } from "@/lib/auth-client";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}

/**
 * Gate for authenticated areas. While the session is still being fetched we
 * render a loader rather than redirecting, otherwise every hard refresh would
 * bounce a signed-in user to /sign-in.
 */
export function RequireAuth() {
  const { data, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <FullPageLoader />;

  if (!data) {
    const next = `${location.pathname}${location.search}`;
    const search = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;
    return <Navigate to={`/sign-in${search}`} replace />;
  }

  return <Outlet />;
}

/** Keeps signed-in users out of the sign-in / sign-up screens. */
export function RequireGuest() {
  const { data, isPending } = useSession();

  if (isPending) return <FullPageLoader />;
  if (data) return <Navigate to="/" replace />;

  return <Outlet />;
}

/**
 * Session accessor for components rendered under <RequireAuth>, where the
 * session is guaranteed to exist.
 */
export function useCurrentSession(): Session {
  const { data } = useSession();
  if (!data) {
    throw new Error("useCurrentSession must be used inside <RequireAuth>");
  }
  return data;
}
