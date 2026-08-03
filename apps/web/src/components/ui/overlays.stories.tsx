import type { Meta, StoryObj } from "@storybook/react";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";

import { Avatar } from "./avatar";
import { Button } from "./button";
import { Dialog } from "./dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu";
import { ToastProvider, useToast } from "./toast";

// No `component` here: these stories compose several overlays, and pinning the
// meta to one of them would force every story to declare that component's props.
const meta: Meta = { title: "UI/Overlays" };

export default meta;
type Story = StoryObj;

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete organization
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete organization?"
        description="This permanently removes the organization, its members and all of its data."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Yes, delete it
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Members will lose access immediately. This action cannot be undone.
        </p>
      </Dialog>
    </>
  );
}

export const DialogExample: Story = {
  name: "Dialog",
  render: () => <DialogDemo />,
};

export const DropdownMenuExample: Story = {
  name: "Dropdown menu",
  render: () => (
    <div className="flex justify-end">
      <DropdownMenu
        align="end"
        trigger={(props) => (
          <button
            {...props}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
          >
            <Avatar size="sm" name="Ada Lovelace" />
            <span className="text-sm font-medium">Ada Lovelace</span>
          </button>
        )}
      >
        <DropdownMenuLabel>ada@example.com</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  ),
};

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          toast({ title: "Saved", description: "Your changes are live." })
        }
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() => toast({ variant: "success", title: "Invitation sent" })}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({ variant: "warning", title: "Payment is past due" })
        }
      >
        Warning
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            variant: "destructive",
            title: "Could not sign in",
            description: "Invalid email or password.",
            duration: 0,
          })
        }
      >
        Destructive (sticky)
      </Button>
    </div>
  );
}

export const ToastExample: Story = {
  name: "Toast",
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
