import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router";

import { FullPageLoader } from "@/components/auth/route-guards";
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
  useSession,
} from "@/lib/auth-client";

/**
 * Guarantees that everything below it renders with an active organization.
 *
 * - no organizations at all -> the onboarding screen
 * - organizations but none active -> activate the first and wait for the
 *   session to catch up. This covers a fresh sign-in as well as the session
 *   still pointing at an organization that was just left or deleted.
 */
export function RequireOrganization() {
  const { data: session } = useSession();
  const { data: organizations, isPending: listPending } =
    useListOrganizations();
  const { data: active, isPending: activePending } = useActiveOrganization();

  const activeId = session?.session.activeOrganizationId ?? null;
  const resolved = Boolean(activeId && active);

  // A ref, not state: this must fire once per missing-active-org situation and
  // must never re-trigger a render on its own.
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    if (resolved) {
      // Healthy again — allow a future recovery attempt.
      attempted.current = null;
      return;
    }
    if (activePending || !organizations?.length) return;

    const first = organizations[0]!;
    if (attempted.current === first.id) return;
    attempted.current = first.id;
    void organization.setActive({ organizationId: first.id });
  }, [resolved, activePending, organizations]);

  if (listPending) return <FullPageLoader />;
  if (!organizations?.length) return <Navigate to="/onboarding" replace />;
  if (!resolved) return <FullPageLoader />;

  return <Outlet />;
}
