import { useNavigate } from "react-router";

import { CreateOrganizationForm } from "@/components/organization/create-organization-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Shown when a signed-in user belongs to no organization yet. Everything in
 * the app hangs off an organization, so this is the one screen they can reach.
 */
export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your organization</CardTitle>
          <CardDescription>
            Organizations hold your members, billing and data. You can create
            more later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm
            submitLabel="Continue"
            onCreated={() => navigate("/", { replace: true })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
