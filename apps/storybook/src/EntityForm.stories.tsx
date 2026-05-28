import type { Meta, StoryObj } from "@storybook/react"
import type { FieldMeta } from "@schemaforge/client"
import { EntityForm } from "@schemaforge/react"
import { widgetFields, widgetRows } from "./mock-client"

// A field readable by anyone but writable only by "superuser" — with the
// story's "admin" role it renders read-only inside the form.
const withWriteDenied: FieldMeta[] = [
  ...widgetFields,
  { name: "audit_id", kind: "text", required: false, accessWrite: ["superuser"] },
]

const meta: Meta<typeof EntityForm> = {
  title: "Organisms/EntityForm",
  component: EntityForm,
  // The console always wires onCancel (→ navigate back), so the stories do too:
  // EntityForm renders the Cancel button only when given onCancel, and a story
  // that omits it under-represents the shipped form. Override to `undefined` in
  // a story to document the no-cancel (embedded/inline) variant.
  args: {
    onSubmit: (values) => console.log("submit", values),
    onCancel: () => console.log("cancel"),
  },
}
export default meta
type Story = StoryObj<typeof EntityForm>

export const New: Story = { args: { fields: widgetFields, submitLabel: "Create" } }

export const Edit: Story = { args: { fields: widgetFields, initialValues: widgetRows[0], submitLabel: "Save" } }

export const WriteDeniedReadOnly: Story = {
  args: { fields: withWriteDenied, initialValues: { ...widgetRows[0], audit_id: "audit_42" } },
}

export const Submitting: Story = { args: { fields: widgetFields, initialValues: widgetRows[0], submitting: true } }

export const WithError: Story = {
  args: { fields: widgetFields, initialValues: widgetRows[0], error: "Validation failed: name is required" },
}
