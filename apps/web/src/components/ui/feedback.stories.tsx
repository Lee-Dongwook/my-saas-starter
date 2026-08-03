import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { Spinner } from "./spinner";

const meta = {
  title: "UI/Feedback",
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alerts: Story = {
  render: () => (
    <div className="max-w-xl space-y-3">
      {(["info", "success", "warning", "destructive"] as const).map(
        (variant) => (
          <Alert key={variant} variant={variant}>
            <AlertTitle className="capitalize">{variant}</AlertTitle>
            <AlertDescription>
              Your invitation to acme-inc could not be delivered.
            </AlertDescription>
          </Alert>
        ),
      )}
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Owner</Badge>
      <Badge variant="secondary">Member</Badge>
      <Badge variant="outline">Invited</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Past due</Badge>
      <Badge variant="destructive">Canceled</Badge>
    </div>
  ),
};

export const Avatars: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm" name="Ada Lovelace" />
      <Avatar size="md" name="Grace Hopper" />
      <Avatar size="lg" name="alan@example.com" />
      <Avatar
        size="xl"
        name="Broken image"
        src="https://example.invalid/x.png"
      />
    </div>
  ),
};

export const Separators: Story = {
  render: () => (
    <div className="max-w-sm space-y-6">
      <Separator />
      <Separator label="or continue with" />
      <div className="flex h-8 items-center gap-3">
        <span className="text-sm">Left</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Right</span>
      </div>
    </div>
  ),
};

export const Spinners: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner />
      <Spinner className="h-6 w-6 text-primary" />
      <Spinner className="h-8 w-8 text-muted-foreground" />
    </div>
  ),
};
