import { Mail, UserPlus, X } from "lucide-react";
import { useState } from "react";

import { useCurrentSession } from "@/components/auth/route-guards";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useOrganization } from "@/hooks/use-organization";
import { errorMessage } from "@/lib/api";
import { organization } from "@/lib/auth-client";
import { ORG_ROLE_LABELS, isOrgRole, type OrgRole } from "@/lib/permissions";

import { InviteMemberDialog } from "./invite-member-dialog";

const roleBadgeVariant = {
  owner: "default",
  admin: "secondary",
  member: "outline",
} as const;

export function MembersPage() {
  const { user } = useCurrentSession();
  const { toast } = useToast();
  const {
    isPending,
    refetch,
    members,
    pendingInvitations,
    role,
    ownerCount,
    can,
  } = useOrganization();

  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<{
    memberId: string;
    name: string;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const canManageMembers = can("removeMember");
  const canChangeRoles = can("updateMemberRole");
  // Only an owner may create another owner.
  const assignableRoles: OrgRole[] =
    role === "owner" ? ["owner", "admin", "member"] : ["admin", "member"];

  async function changeRole(memberId: string, nextRole: string) {
    if (!isOrgRole(nextRole)) return;
    setBusyId(memberId);
    const { error } = await organization.updateMemberRole({
      memberId,
      role: nextRole,
    });
    setBusyId(null);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not change the role",
        description: errorMessage(error.message),
      });
      return;
    }
    toast({ variant: "success", title: "Role updated" });
    void refetch();
  }

  async function removeMember(memberId: string) {
    setBusyId(memberId);
    const { error } = await organization.removeMember({
      memberIdOrEmail: memberId,
    });
    setBusyId(null);
    setRemoving(null);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not remove the member",
        description: errorMessage(error.message),
      });
      return;
    }
    toast({ variant: "success", title: "Member removed" });
    void refetch();
  }

  async function cancelInvitation(invitationId: string) {
    setBusyId(invitationId);
    const { error } = await organization.cancelInvitation({ invitationId });
    setBusyId(null);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not cancel the invitation",
        description: errorMessage(error.message),
      });
      return;
    }
    toast({ variant: "success", title: "Invitation cancelled" });
    void refetch();
  }

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "person" : "people"} in
              this organization.
            </CardDescription>
          </div>
          {can("inviteMember") ? (
            <Button size="sm" onClick={() => setInviting(true)}>
              <UserPlus />
              Invite
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="divide-y divide-border border-t border-border p-0">
          {members.map((member) => {
            const isSelf = member.userId === user.id;
            // The last owner must keep the role, or the org becomes orphaned.
            const isLastOwner = member.role === "owner" && ownerCount === 1;
            // Admins can manage members and other admins, but not owners —
            // which also keeps the role <Select> from holding a value that
            // isn't among its options.
            const outranksViewer = member.role === "owner" && role !== "owner";

            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <Avatar
                  name={member.user.name || member.user.email}
                  src={member.user.image}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.user.name || member.user.email}
                    {isSelf ? (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        You
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>

                {canChangeRoles && !isLastOwner && !outranksViewer ? (
                  <Select
                    aria-label={`Role for ${member.user.email}`}
                    className="h-8 w-32"
                    value={member.role}
                    disabled={busyId === member.id}
                    onChange={(event) =>
                      changeRole(member.id, event.target.value)
                    }
                  >
                    {assignableRoles.map((option) => (
                      <option key={option} value={option}>
                        {ORG_ROLE_LABELS[option]}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Badge
                    variant={
                      roleBadgeVariant[
                        member.role as keyof typeof roleBadgeVariant
                      ] ?? "outline"
                    }
                  >
                    {ORG_ROLE_LABELS[member.role as OrgRole] ?? member.role}
                  </Badge>
                )}

                {canManageMembers &&
                !isSelf &&
                !isLastOwner &&
                !outranksViewer ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${member.user.email}`}
                    disabled={busyId === member.id}
                    onClick={() =>
                      setRemoving({
                        memberId: member.id,
                        name: member.user.name || member.user.email,
                      })
                    }
                  >
                    <X />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {pendingInvitations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>
              Invitations that haven&apos;t been accepted yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border border-t border-border p-0">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3 p-4">
                <Mail
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {invitation.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">
                  {ORG_ROLE_LABELS[invitation.role as OrgRole] ??
                    invitation.role}
                </Badge>
                {can("cancelInvitation") ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyId === invitation.id}
                    onClick={() => cancelInvitation(invitation.id)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Mounted only while open so the invite form resets between openings. */}
      {inviting ? (
        <InviteMemberDialog
          open
          onClose={() => setInviting(false)}
          onInvited={refetch}
        />
      ) : null}

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove member?"
        description={
          removing
            ? `${removing.name} will immediately lose access to this organization.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={busyId === removing?.memberId}
              onClick={() => removing && removeMember(removing.memberId)}
            >
              Remove
            </Button>
          </>
        }
      />
    </div>
  );
}
