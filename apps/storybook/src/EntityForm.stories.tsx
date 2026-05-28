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
  args: { onSubmit: (values) => console.log("submit", values) },
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
