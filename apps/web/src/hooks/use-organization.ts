import { useCurrentSession } from "@/components/auth/route-guards";
import { useActiveOrganization } from "@/lib/auth-client";
import { can, type OrgPermission } from "@/lib/permissions";

/**
 * The active organization plus the current user's membership in it.
 *
 * Only usable under <RequireOrganization>, where an active organization is
 * guaranteed to exist.
 */
export function useOrganization() {
  const { user } = useCurrentSession();
  const { data: organization, isPending, refetch } = useActiveOrganization();

  const members = organization?.members ?? [];
  const invitations = organization?.invitations ?? [];
  const membership = members.find((member) => member.userId === user.id);
  const role = membership?.role ?? null;

  return {
    organization,
    isPending,
    refetch,
    members,
    pendingInvitations: invitations.filter(
      (invitation) => invitation.status === "pending",
    ),
    membership,
    role,
    /** Owners are the only members who can be the last one standing. */
    ownerCount: members.filter((member) => member.role === "owner").length,
    can: (permission: OrgPermission) => can(role, permission),
  };
}
