import type { Meta, StoryObj } from "@storybook/react-vite"
import type { EnumColor, EntityRow, FieldMeta } from "@schemaforge/client"
import { EntityCard } from "@schemaforge/react"

// EntityCard renders one entity as a compact card: a linked headline over a few
// summary fields, each drawn by FieldValue. It's the unit the KanbanBoard
// stacks in each column, but it stands alone for dashboards and galleries too.

const meta: Meta<typeof EntityCard> = {
  title: "Molecules/EntityCard",
  component: EntityCard,
}
export default meta
type Story = StoryObj<typeof EntityCard>

const STAGE_COLORS: Record<string, EnumColor> = {
  prospecting: "gray",
  qualification: "blue",
  proposal: "amber",
  negotiation: "purple",
  closed_won: "green",
  closed_lost: "red",
}

const titleField: FieldMeta = { name: "name", kind: "text", required: true }

const summaryFields: FieldMeta[] = [
  { name: "stage", kind: "enum", required: true, widget: "status_badge", enumColors: STAGE_COLORS },
  { name: "value", kind: "float", required: false, format: "currency" },
  { name: "probability", kind: "integer", required: false, widget: "progress", format: "percent" },
]

const row: EntityRow = {
  id: "deal_01hzx9",
  name: "Acme — Platform License",
  stage: "negotiation",
  value: 184000,
  probability: 65,
}

export const Default: Story = {
  args: { row, titleField, fields: summaryFields, href: "/Deal/deal_01hzx9" },
}

// No summary fields → headline only (the minimal card).
export const TitleOnly: Story = {
  args: { row, titleField, fields: [], href: "/Deal/deal_01hzx9" },
}

// No href → static headline (e.g. a read-only digest where nothing is clickable).
export const Unlinked: Story = {
  args: { row, titleField, fields: summaryFields },
}

// Empty headline value falls back to a shortened id so a card is never blank.
export const FallbackTitle: Story = {
  args: {
    row: { id: "deal_01hq9z7k3m4n5p6q7r8s9t", name: "", stage: "prospecting", value: null },
    titleField,
    fields: summaryFields,
    href: "/Deal/deal_01hq9z7k3m4n5p6q7r8s9t",
  },
}
