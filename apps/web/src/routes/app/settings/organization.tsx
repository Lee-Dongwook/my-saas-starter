import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

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
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useOrganization } from "@/hooks/use-organization";
import { errorMessage } from "@/lib/api";
import { organization } from "@/lib/auth-client";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().min(2, "Use at least 2 characters").max(64),
  slug: z
    .string()
    .min(2, "Use at least 2 characters")
    .max(48)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and dashes only",
    ),
});

type Values = z.infer<typeof schema>;

export function OrganizationSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    organization: activeOrg,
    isPending,
    refetch,
    role,
    ownerCount,
    can,
  } = useOrganization();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  });

  // The form is mounted before the organization resolves, so seed it once the
  // data arrives (and again whenever the active organization changes).
  useEffect(() => {
    if (activeOrg) {
      reset({ name: activeOrg.name, slug: activeOrg.slug ?? "" });
    }
  }, [activeOrg, reset]);

  const canEdit = can("updateOrganization");
  const isLastOwner = role === "owner" && ownerCount === 1;

  const onSubmit = handleSubmit(async (values) => {
    if (!activeOrg) return;

    const { error } = await organization.update({
      organizationId: activeOrg.id,
      data: values,
    });

    if (error) {
      setError("root", {
        message:
          error.status === 400
            ? "That slug is already taken."
            : (error.message ?? "Could not save the changes."),
      });
      return;
    }

    toast({ variant: "success", title: "Organization updated" });
    reset(values);
    void refetch();
  });

  async function leaveOrganization() {
    if (!activeOrg) return;
    setBusy(true);
    const { error } = await organization.leave({
      organizationId: activeOrg.id,
    });
    setBusy(false);
    setConfirmLeave(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not leave the organization",
        description: errorMessage(error.message),
      });
      return;
    }
    await moveToAnotherOrganization();
  }

  async function deleteOrganization() {
    if (!activeOrg) return;
    setBusy(true);
    const { error } = await organization.delete({
      organizationId: activeOrg.id,
    });
    setBusy(false);
    setConfirmDelete(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not delete the organization",
        description: errorMessage(error.message),
      });
      return;
    }
    toast({ variant: "success", title: "Organization deleted" });
    await moveToAnotherOrganization();
  }

  /**
   * After leaving or deleting, the session still points at an organization
   * that is gone — activate a remaining one, or fall through to onboarding.
   */
  async function moveToAnotherOrganization() {
    const { data: remaining } = await organization.list();
    const next = remaining?.[0];
    if (next) {
      await organization.setActive({ organizationId: next.id });
      navigate("/", { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  }

  if (isPending || !activeOrg) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit} noValidate>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              The name and URL slug for this organization.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errors.root ? (
              <Alert variant="destructive">
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            ) : null}

            <Field label="Name" required error={errors.name?.message}>
              {(props) => (
                <Input {...props} {...register("name")} disabled={!canEdit} />
              )}
            </Field>

            <Field
              label="Slug"
              required
              error={errors.slug?.message}
              hint="Used in URLs. Lowercase letters, numbers and dashes."
            >
              {(props) => (
                <Input
                  {...props}
                  {...register("slug", {
                    // Normalise as the user types so the pattern rarely fires.
                    setValueAs: (value: string) => slugify(value),
                  })}
                  disabled={!canEdit}
                />
              )}
            </Field>
          </CardContent>

          {canEdit ? (
            <CardFooter className="justify-end">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
            </CardFooter>
          ) : (
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Only owners and admins can change these settings.
              </p>
            </CardFooter>
          )}
        </form>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>These actions cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Leave organization</p>
              <p className="text-xs text-muted-foreground">
                {isLastOwner
                  ? "Transfer ownership to someone else first."
                  : "You'll lose access until someone invites you back."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastOwner}
              onClick={() => setConfirmLeave(true)}
            >
              Leave
            </Button>
          </div>

          {can("deleteOrganization") ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium">Delete organization</p>
                <p className="text-xs text-muted-foreground">
                  Permanently removes members, invitations and data.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        title="Leave this organization?"
        description={`You'll immediately lose access to ${activeOrg.name}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={busy}
              onClick={leaveOrganization}
            >
              Leave
            </Button>
          </>
        }
      />

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this organization?"
        description={`${activeOrg.name}, its members and all of its data will be removed permanently.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={busy}
              onClick={deleteOrganization}
            >
              Delete organization
            </Button>
          </>
        }
      />
    </div>
  );
}
