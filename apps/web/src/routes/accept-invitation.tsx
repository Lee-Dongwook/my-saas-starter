import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useCurrentSession } from "@/components/auth/route-guards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import { organization } from "@/lib/auth-client";
import { ORG_ROLE_LABELS, type OrgRole } from "@/lib/permissions";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationName: string;
  inviterEmail?: string;
}

export function AcceptInvitationPage() {
  const { invitationId = "" } = useParams();
  const { user } = useCurrentSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    organization
      .getInvitation({ query: { id: invitationId } })
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) {
          setLoadError(
            error?.message ??
              "This invitation is no longer valid. Ask for a new one.",
          );
          return;
        }
        setInvitation({
          id: data.id,
          email: data.email,
          role: data.role,
          status: data.status,
          organizationName: data.organizationName,
          inviterEmail: data.inviterEmail,
        });
      })
      .catch((error: unknown) => {
        if (active) setLoadError(errorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [invitationId]);

  async function accept() {
    setBusy(true);
    const { data, error } = await organization.acceptInvitation({
      invitationId,
    });
    setBusy(false);

    if (error || !data) {
      toast({
        variant: "destructive",
        title: "Could not accept the invitation",
        description: errorMessage(error?.message),
      });
      return;
    }

    // Land straight in the organization you just joined.
    await organization.setActive({
      organizationId: data.invitation.organizationId,
    });
    toast({ variant: "success", title: "You're in" });
    navigate("/", { replace: true });
  }

  async function reject() {
    setBusy(true);
    const { error } = await organization.rejectInvitation({ invitationId });
    setBusy(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not decline the invitation",
        description: errorMessage(error.message),
      });
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        {loadError ? (
          <>
            <CardHeader>
              <CardTitle>Invitation unavailable</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                fullWidth
                onClick={() => navigate("/", { replace: true })}
              >
                Go to the app
              </Button>
            </CardFooter>
          </>
        ) : !invitation ? (
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Join {invitation.organizationName}</CardTitle>
              <CardDescription>
                You&apos;ve been invited as{" "}
                {ORG_ROLE_LABELS[invitation.role as OrgRole] ?? invitation.role}
                {invitation.inviterEmail
                  ? ` by ${invitation.inviterEmail}`
                  : ""}
                .
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {invitation.status !== "pending" ? (
                <Alert variant="warning">
                  <AlertDescription>
                    This invitation has already been {invitation.status}.
                  </AlertDescription>
                </Alert>
              ) : null}

              {invitation.email.toLowerCase() !== user.email.toLowerCase() ? (
                <Alert variant="warning">
                  <AlertDescription>
                    This invitation was sent to{" "}
                    <strong>{invitation.email}</strong>, but you&apos;re signed
                    in as <strong>{user.email}</strong>. Sign in with the
                    invited address to accept it.
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>

            <CardFooter className="justify-end">
              <Button variant="outline" disabled={busy} onClick={reject}>
                Decline
              </Button>
              <Button
                loading={busy}
                disabled={invitation.status !== "pending"}
                onClick={accept}
              >
                Accept invitation
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
