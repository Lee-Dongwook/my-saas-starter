import { useNavigate } from "react-router";

import { useCurrentSession } from "@/components/auth/route-guards";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "@/lib/auth-client";
import { useAppConfig } from "@/providers/config-provider";
import { useTheme } from "@/providers/theme-provider";

/** Placeholder landing page; the real app shell arrives with the layout work. */
export function DashboardPage() {
  const { user } = useCurrentSession();
  const { app } = useAppConfig();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{app.name}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {resolvedTheme === "dark" ? "Light" : "Dark"} mode
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              navigate("/sign-in", { replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar size="lg" name={user.name} src={user.image} />
          <div className="space-y-1">
            <CardTitle>Welcome, {user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You&apos;re signed in. Organizations, billing and account settings
          land here next.
        </CardContent>
      </Card>
    </div>
  );
}
