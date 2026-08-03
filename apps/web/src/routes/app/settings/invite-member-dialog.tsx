import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { organization } from "@/lib/auth-client";
import {
  ORG_ROLE_DESCRIPTIONS,
  ORG_ROLE_LABELS,
  type OrgRole,
} from "@/lib/permissions";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["admin", "member"]),
});

type Values = z.infer<typeof schema>;

export interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onInvited: () => void;
  /** Owners can hand out any role; admins cannot create other owners. */
  assignableRoles?: Array<Extract<OrgRole, "admin" | "member">>;
}

export function InviteMemberDialog({
  open,
  onClose,
  onInvited,
  assignableRoles = ["admin", "member"],
}: InviteMemberDialogProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "member" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async ({ email, role }) => {
    const { error } = await organization.inviteMember({ email, role });

    if (error) {
      setError("root", {
        message: error.message ?? "Could not send the invitation.",
      });
      return;
    }

    toast({
      variant: "success",
      title: "Invitation sent",
      description: `${email} will receive an email with a link to join.`,
    });
    onInvited();
    close();
  });

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite a member"
      description="They'll get an email with a link to join this organization."
    >
      <form onSubmit={onSubmit} className="space-y-4 pb-4" noValidate>
        {errors.root ? (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        ) : null}

        <Field label="Email" required error={errors.email?.message}>
          {(props) => (
            <Input
              {...props}
              {...register("email")}
              type="email"
              placeholder="teammate@example.com"
            />
          )}
        </Field>

        <Field label="Role" error={errors.role?.message}>
          {(props) => (
            <Select {...props} {...register("role")}>
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {ORG_ROLE_LABELS[role]} — {ORG_ROLE_DESCRIPTIONS[role]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Send invitation
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
