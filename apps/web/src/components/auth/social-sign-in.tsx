import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import { signIn } from "@/lib/auth-client";
import { useAppConfig } from "@/providers/config-provider";

const providerLabels = {
  github: "GitHub",
  google: "Google",
} as const;

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.21.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.61v3h3.86c2.26-2.08 3.58-5.15 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.26a7.2 7.2 0 0 1 0-4.52v-3.1H1.28a12 12 0 0 0 0 10.72l3.98-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.64l3.98 3.1C6.21 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

const providerIcons = {
  github: GitHubIcon,
  google: GoogleIcon,
} as const;

export interface SocialSignInProps {
  /** Where to land after the provider redirects back. */
  callbackURL?: string;
}

/**
 * Renders one button per OAuth provider the API reports as configured, so a
 * deployment without GitHub/Google credentials shows nothing at all.
 */
export function SocialSignIn({ callbackURL = "/" }: SocialSignInProps) {
  const { auth } = useAppConfig();
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  if (auth.socialProviders.length === 0) return null;

  return (
    <div className="space-y-4">
      <Separator label="or continue with" />
      <div className="grid gap-2">
        {auth.socialProviders.map((provider) => {
          const Icon = providerIcons[provider];
          return (
            <Button
              key={provider}
              variant="outline"
              fullWidth
              loading={pending === provider}
              disabled={pending !== null}
              onClick={async () => {
                setPending(provider);
                const { error } = await signIn.social({
                  provider,
                  callbackURL,
                });
                if (error) {
                  setPending(null);
                  toast({
                    variant: "destructive",
                    title: `Could not sign in with ${providerLabels[provider]}`,
                    description: errorMessage(error.message),
                  });
                }
                // On success the browser navigates away; keep the spinner.
              }}
            >
              <Icon className="size-4" />
              {providerLabels[provider]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
