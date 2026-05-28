import type { ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"
import type { FieldMeta } from "@schemaforge/client"
import { EntityForm } from "@schemaforge/react"
import { widgetFields, widgetRows } from "./mock-client"

// EntityForm renders some affordances only when given the matching prop — most
// visibly, the Cancel button appears only when `onCancel` is set. Rather than
// bake those choices into fixed stories (which then under-represent the shipped
// form), expose them as Controls so any optional prop can be exercised from the
// panel. `showCancel` is a synthetic boolean dial mapped to the real optional
// `onCancel` in render(); the rest are direct prop controls.

// A field readable by anyone but writable only by "superuser" — with the
// story's "admin" role it renders read-only inside the form.
const withWriteDenied: FieldMeta[] = [
  ...widgetFields,
  { name: "audit_id", kind: "text", required: false, accessWrite: ["superuser"] },
]

type FormArgs = ComponentProps<typeof EntityForm> & {
  /** Synthetic dial: whether to wire the optional onCancel (→ Cancel button). */
  showCancel: boolean
}

const meta: Meta<FormArgs> = {
  title: "Organisms/EntityForm",
  component: EntityForm,
  render: ({ showCancel, ...args }) => (
    <EntityForm {...args} onCancel={showCancel ? fn() : undefined} />
  ),
  args: {
    fields: widgetFields,
    onSubmit: fn(),
    submitLabel: "Save",
    submitting: false,
    error: null,
    showCancel: true,
  },
  argTypes: {
    showCancel: {
      name: "Cancel button",
      control: "boolean",
      description: "Render the optional Cancel action (passes onCancel). The console always sets it.",
    },
    submitLabel: { control: "text", description: "Submit button label" },
    submitting: { control: "boolean", description: "Disables inputs and shows “Saving…”" },
    error: { control: "text", description: "Inline error message (role=alert)" },
    // Props without a meaningful inline editor: drive these via dedicated stories.
    fields: { control: false },
    initialValues: { control: false },
    classes: { control: false },
    onSubmit: { control: false },
    onCancel: { table: { disable: true } },
  },
}
export default meta
type Story = StoryObj<FormArgs>

export const New: Story = { args: { submitLabel: "Create" } }

export const Edit: Story = { args: { initialValues: widgetRows[0], submitLabel: "Save" } }

export const WriteDeniedReadOnly: Story = {
  args: { fields: withWriteDenied, initialValues: { ...widgetRows[0], audit_id: "audit_42" } },
}

export const Submitting: Story = { args: { initialValues: widgetRows[0], submitting: true } }

export const WithError: Story = {
  args: { initialValues: widgetRows[0], error: "Validation failed: name is required" },
}

// The embedded/inline variant: no Cancel affordance (e.g. when the host frames
// its own actions). Flip the "Cancel button" dial on any story to compare.
export const WithoutCancel: Story = { args: { initialValues: widgetRows[0], showCancel: false } }
