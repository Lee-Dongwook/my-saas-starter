import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
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
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth-client";

const schema = z.object({ email: z.email("Enter a valid email address") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    // Errors are swallowed on purpose: revealing whether an address exists
    // would turn this form into an account-enumeration oracle.
    await requestPasswordReset({ email, redirectTo: "/reset-password" });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          We&apos;ll email you a link to choose a new one.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSubmitSuccessful ? (
          <Alert variant="success">
            <AlertDescription>
              If an account exists for that address, a reset link is on its way.
              The link expires in one hour.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label="Email" error={errors.email?.message}>
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

            <Button type="submit" fullWidth loading={isSubmitting}>
              Send reset link
            </Button>
          </form>
        )}

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
