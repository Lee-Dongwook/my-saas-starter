import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { SocialSignIn } from "@/components/auth/social-sign-in";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signUp } from "@/lib/auth-client";

const schema = z
  .object({
    name: z.string().min(1, "Enter your name"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;

export function SignUpPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    const { error } = await signUp.email({ name, email, password });

    if (error) {
      // 422 is what Better Auth returns for an already-registered address.
      setError("root", {
        message:
          error.status === 422
            ? "An account with that email already exists."
            : (error.message ?? "Could not create your account."),
      });
      return;
    }

    navigate("/", { replace: true });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start your workspace in a minute.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errors.root ? (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Name" required error={errors.name?.message}>
            {(props) => (
              <Input {...props} {...register("name")} autoComplete="name" />
            )}
          </Field>

          <Field label="Email" required error={errors.email?.message}>
            {(props) => (
              <Input
                {...props}
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            )}
          </Field>

          <Field
            label="Password"
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
            Create account
          </Button>
        </form>

        <SocialSignIn />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
