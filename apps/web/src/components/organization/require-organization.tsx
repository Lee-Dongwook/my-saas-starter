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
 * - organizations but none active (fresh sign-in, or the active one was
 *   deleted) -> activate the first and wait for the session to catch up
 */
export function RequireOrganization() {
  const { data: session } = useSession();
  const { data: organizations, isPending: listPending } =
    useListOrganizations();
  const { data: active, isPending: activePending } = useActiveOrganization();

  const activeId = session?.session.activeOrganizationId ?? null;
  // A ref, not state: this must fire once per missing-active-org situation and
  // never re-trigger a render on its own.
  const activating = useRef<string | null>(null);

  useEffect(() => {
    if (activeId || !organizations?.length) return;
    const first = organizations[0]!;
    if (activating.current === first.id) return;
    activating.current = first.id;
    void organization.setActive({ organizationId: first.id });
  }, [activeId, organizations]);

  if (listPending) return <FullPageLoader />;
  if (!organizations?.length) return <Navigate to="/onboarding" replace />;
  if (!activeId || activePending || !active) return <FullPageLoader />;

  return <Outlet />;
}
