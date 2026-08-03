import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Input, Select, Textarea } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Field",
  component: Field,
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email",
    hint: "We'll never share it.",
    children: (props) => (
      <Input {...props} type="email" placeholder="you@example.com" />
    ),
  },
  render: (args) => (
    <div className="max-w-sm">
      <Field {...args} />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    label: "Email",
    required: true,
    error: "Enter a valid email address.",
    children: (props) => <Input {...props} type="email" defaultValue="nope" />,
  },
  render: (args) => (
    <div className="max-w-sm">
      <Field {...args} />
    </div>
  ),
};

export const Controls: Story = {
  args: { children: () => null },
  render: () => (
    <div className="max-w-sm space-y-4">
      <Field label="Organization name" required>
        {(props) => <Input {...props} placeholder="Acme Inc." />}
      </Field>

      <Field label="Role" hint="Controls what this member can do.">
        {(props) => (
          <Select {...props} defaultValue="member">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </Select>
        )}
      </Field>

      <Field label="Notes">
        {(props) => <Textarea {...props} placeholder="Anything to add?" />}
      </Field>

      <div className="flex items-center gap-2">
        <Checkbox id="tos" defaultChecked />
        <Label htmlFor="tos" className="font-normal">
          I agree to the terms of service
        </Label>
      </div>
    </div>
  ),
};
