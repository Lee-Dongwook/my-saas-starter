import { MailCheck } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import { sendVerificationEmail, useSession } from "@/lib/auth-client";

/**
 * "Check your inbox" screen. The verification link itself points at the API
 * (`/api/auth/verify-email`), which verifies the token and redirects back — so
 * this page only has to explain the state and offer a resend.
 */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const email = searchParams.get("email") ?? session?.user.email ?? "";
  const failed = searchParams.get("error");

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <MailCheck aria-hidden className="size-8 text-primary" />
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          {email
            ? `We sent a verification link to ${email}.`
            : "We sent you a verification link."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {failed ? (
          <Alert variant="destructive">
            <AlertDescription>
              That verification link is invalid or has expired. Send yourself a
              new one below.
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          fullWidth
          variant="outline"
          loading={sending}
          disabled={!email}
          onClick={async () => {
            setSending(true);
            try {
              await sendVerificationEmail({ email, callbackURL: "/" });
              toast({ variant: "success", title: "Verification email sent" });
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Could not send the email",
                description: errorMessage(error),
              });
            } finally {
              setSending(false);
            }
          }}
        >
          Resend verification email
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/" className="font-medium text-primary hover:underline">
            Continue to the app
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
