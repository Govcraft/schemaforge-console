import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import type { FieldMeta } from "@schemaforge/client"
import { FieldRenderer } from "@schemaforge/react"

// Controlled harness so the editor stories are interactive.
function Harness({ field, initial, readOnly }: { field: FieldMeta; initial: unknown; readOnly?: boolean }) {
  const [value, setValue] = useState<unknown>(initial)
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "center", maxWidth: 480 }}>
      <label htmlFor="f" className="sf-muted">{field.name}</label>
      <FieldRenderer id="f" field={field} value={value} onChange={setValue} readOnly={readOnly} />
    </div>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Molecules/FieldRenderer",
  component: Harness,
}
export default meta
type Story = StoryObj<typeof Harness>

export const Text: Story = { args: { field: { name: "name", kind: "text", required: true }, initial: "Acme Anvil" } }

export const Enum: Story = {
  args: {
    field: { name: "status", kind: "enum", required: true, enumVariants: ["draft", "active", "retired"] },
    initial: "active",
  },
}

export const Boolean_: Story = {
  name: "Boolean",
  args: { field: { name: "in_stock", kind: "boolean", required: false }, initial: true },
}

export const DateTime: Story = {
  args: { field: { name: "ships_at", kind: "datetime", required: false }, initial: "2026-06-01T09:30" },
}

// Data-bound: pulls options from the (mock) Category schema via useRelationOptions.
export const RelationOne: Story = {
  args: { field: { name: "category", kind: "relation_one", required: false, relationTarget: "Category" }, initial: "category_01a" },
}

export const ReadOnly: Story = {
  args: { field: { name: "price", kind: "float", required: false, format: "currency" }, initial: 49.99, readOnly: true },
}
