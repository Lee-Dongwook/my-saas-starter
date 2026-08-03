/**
 * Client-side mirror of Better Auth's default organization roles.
 *
 * These checks only decide what to *render* — the server re-checks every
 * mutation, so a stale or forged role here cannot grant access.
 */
export type OrgRole = "owner" | "admin" | "member";

export const ORG_ROLES: OrgRole[] = ["owner", "admin", "member"];

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export const ORG_ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner: "Full access, including deleting the organization",
  admin: "Manage members, invitations and organization settings",
  member: "Access the organization's data",
};

const permissions = {
  inviteMember: ["owner", "admin"],
  cancelInvitation: ["owner", "admin"],
  removeMember: ["owner", "admin"],
  updateMemberRole: ["owner", "admin"],
  updateOrganization: ["owner", "admin"],
  deleteOrganization: ["owner"],
} satisfies Record<string, OrgRole[]>;

export type OrgPermission = keyof typeof permissions;

export function can(
  role: string | null | undefined,
  permission: OrgPermission,
): boolean {
  return (permissions[permission] as readonly string[]).includes(role ?? "");
}

export function isOrgRole(role: string): role is OrgRole {
  return (ORG_ROLES as string[]).includes(role);
}
