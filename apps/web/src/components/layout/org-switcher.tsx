import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

import { CreateOrganizationForm } from "@/components/organization/create-organization-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
} from "@/lib/auth-client";

export function OrgSwitcher() {
  const { data: organizations, isPending } = useListOrganizations();
  const { data: active } = useActiveOrganization();
  const [creating, setCreating] = useState(false);

  if (isPending) return <Skeleton className="h-9 w-full" />;

  return (
    <>
      <DropdownMenu
        className="w-full"
        trigger={(props) => (
          <button
            {...props}
            className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-left transition-colors hover:bg-accent"
          >
            <Avatar size="sm" name={active?.name ?? "?"} src={active?.logo} />
            <span className="flex-1 truncate text-sm font-medium">
              {active?.name ?? "Select organization"}
            </span>
            <ChevronsUpDown
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
          </button>
        )}
      >
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {organizations?.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => {
              if (org.id !== active?.id) {
                void organization.setActive({ organizationId: org.id });
              }
            }}
          >
            <Avatar size="sm" name={org.name} src={org.logo} />
            <span className="flex-1 truncate">{org.name}</span>
            <Check
              className={cn(
                "size-4",
                org.id === active?.id ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setCreating(true)}>
          <Plus />
          New organization
        </DropdownMenuItem>
      </DropdownMenu>

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New organization"
        description="Organizations keep members, billing and data separate."
      >
        <div className="pb-4">
          <CreateOrganizationForm
            onCreated={() => setCreating(false)}
            secondaryAction={
              <Button variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            }
          />
        </div>
      </Dialog>
    </>
  );
}
