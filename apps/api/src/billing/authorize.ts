import { prisma } from "../db";

type Action =
  | "upgrade-subscription"
  | "list-subscription"
  | "cancel-subscription"
  | "restore-subscription"
  | "billing-portal";

/**
 * Subscriptions in this starter are owned by organizations, so `referenceId`
 * is an organization id. Better Auth calls this before every subscription
 * action to confirm the signed-in user may act on that reference.
 *
 * Reading is open to any member; anything that changes money is restricted to
 * owners and admins.
 */
export async function authorizeOrganizationReference({
  userId,
  referenceId,
  action,
}: {
  userId: string;
  referenceId: string;
  action: Action;
}) {
  // Better Auth falls back to the user's own id when no reference is passed;
  // that is a personal subscription and always belongs to the caller.
  if (referenceId === userId) return true;

  const member = await prisma.member.findFirst({
    where: { organizationId: referenceId, userId },
    select: { role: true },
  });

  if (!member) return false;
  if (action === "list-subscription") return true;

  return member.role === "owner" || member.role === "admin";
}
