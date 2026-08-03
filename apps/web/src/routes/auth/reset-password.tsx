import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/toast";
import { resetPassword } from "@/lib/auth-client";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Better Auth appends `?token=` to the redirect URL from the reset email,
  // and `?error=` when the token was already invalid at redirect time.
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) return;

    const { error } = await resetPassword({ newPassword: password, token });

    if (error) {
      setError("root", {
        message:
          error.message ??
          "This reset link is no longer valid. Request a new one.",
      });
      return;
    }

    toast({ variant: "success", title: "Password updated. You can sign in." });
    navigate("/sign-in", { replace: true });
  });

  if (!token || linkError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link expired</CardTitle>
          <CardDescription>
            This password reset link is invalid or has already been used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button fullWidth onClick={() => navigate("/forgot-password")}>
            Request a new link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          Pick something you haven&apos;t used before.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errors.root ? (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field
            label="New password"
            required
            error={errors.password?.message}
            hint="At least 8 characters."
          >
            {(props) => (
              <PasswordInput
                {...props}
                {...register("password")}
                autoComplete="new-password"
              />
            )}
          </Field>

          <Field
            label="Confirm password"
            required
            error={errors.confirmPassword?.message}
          >
            {(props) => (
              <PasswordInput
                {...props}
                {...register("confirmPassword")}
                autoComplete="new-password"
              />
            )}
          </Field>

          <Button type="submit" fullWidth loading={isSubmitting}>
            Update password
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
