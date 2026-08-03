import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { organization } from "@/lib/auth-client";
import { slugifyWithSuffix } from "@/lib/slug";

const schema = z.object({
  name: z.string().min(2, "Use at least 2 characters").max(64),
});

type Values = z.infer<typeof schema>;

export interface CreateOrganizationFormProps {
  onCreated?: (organizationId: string) => void;
  submitLabel?: string;
  /** Rendered next to the submit button, e.g. a Cancel button in a dialog. */
  secondaryAction?: React.ReactNode;
}

export function CreateOrganizationForm({
  onCreated,
  submitLabel = "Create organization",
  secondaryAction,
}: CreateOrganizationFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    const { data, error } = await organization.create({
      name,
      // Slugs are globally unique; a random suffix avoids collisions on
      // everyday names like "Acme".
      slug: slugifyWithSuffix(name),
    });

    if (error || !data) {
      setError("root", {
        message: error?.message ?? "Could not create the organization.",
      });
      return;
    }

    await organization.setActive({ organizationId: data.id });
    onCreated?.(data.id);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {errors.root ? (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      ) : null}

      <Field
        label="Organization name"
        required
        error={errors.name?.message}
        hint="You can rename it later."
      >
        {(props) => (
          <Input {...props} {...register("name")} placeholder="Acme Inc." />
        )}
      </Field>

      <div className="flex justify-end gap-2">
        {secondaryAction}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
