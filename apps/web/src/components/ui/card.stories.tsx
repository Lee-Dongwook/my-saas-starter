import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Skeleton } from "./skeleton";

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pro plan</CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
        <CardDescription>
          Renews on 1 September 2026 · $29 per seat / month
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Unlimited projects, priority support and SSO for your whole
        organization.
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" size="sm">
          Manage billing
        </Button>
        <Button size="sm">Upgrade</Button>
      </CardFooter>
    </Card>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
    </Card>
  ),
};
