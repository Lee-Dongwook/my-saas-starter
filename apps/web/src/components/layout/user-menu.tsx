import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { useCurrentSession } from "@/components/auth/route-guards";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

export function UserMenu() {
  const { user } = useCurrentSession();
  const navigate = useNavigate();

  return (
    <DropdownMenu
      align="end"
      trigger={(props) => (
        <button
          {...props}
          className="rounded-full transition-opacity hover:opacity-80"
        >
          <Avatar name={user.name} src={user.image} />
          <span className="sr-only">Account menu</span>
        </button>
      )}
    >
      <DropdownMenuLabel className="normal-case">
        <span className="block text-sm font-medium text-foreground">
          {user.name}
        </span>
        <span className="block truncate">{user.email}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        destructive
        onSelect={async () => {
          await signOut();
          navigate("/sign-in", { replace: true });
        }}
      >
        <LogOut />
        Sign out
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
