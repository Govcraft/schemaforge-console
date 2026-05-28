import type { Meta, StoryObj } from "@storybook/react"
import type { EnumColor, EntityRow, FieldMeta } from "@schemaforge/client"
import { KanbanBoard } from "@schemaforge/react"

// KanbanBoard is the rendering surface for `@kanban_column` +
// `@dashboard(layout:"kanban")`. It groups rows by the kanban enum field into
// KanbanColumns (headed by a StatusBadge tinted from `@enum_colors`) and stacks
// an EntityCard per row. Grouping order follows the enum's declared variants.

const meta: Meta<typeof KanbanBoard> = {
  title: "Organisms/KanbanBoard",
  component: KanbanBoard,
}
export default meta
type Story = StoryObj<typeof KanbanBoard>

const STAGE_COLORS: Record<string, EnumColor> = {
  prospecting: "gray",
  qualification: "blue",
  proposal: "amber",
  negotiation: "purple",
  closed_won: "green",
  closed_lost: "red",
}

// A Deal schema: `stage @widget("status_badge") @kanban_column @enum_colors(...)`,
// `name @display`, plus a few summary fields the cards surface.
const dealFields: FieldMeta[] = [
  { name: "name", kind: "text", required: true, listHint: "primary" },
  {
    name: "stage",
    kind: "enum",
    required: true,
    widget: "status_badge",
    kanbanColumn: true,
    enumVariants: ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"],
    enumColors: STAGE_COLORS,
  },
  { name: "value", kind: "float", required: false, format: "currency" },
  { name: "probability", kind: "integer", required: false, widget: "progress", format: "percent" },
  { name: "owner", kind: "text", required: false },
  { name: "notes", kind: "rich_text", required: false },
]

const dealRows: EntityRow[] = [
  { id: "deal_01", name: "Acme — Platform License", stage: "negotiation", value: 184000, probability: 65, owner: "R. Vance" },
  { id: "deal_02", name: "Globex — Renewal", stage: "negotiation", value: 92000, probability: 80, owner: "K. Osei" },
  { id: "deal_03", name: "Initech — Pilot", stage: "qualification", value: 24000, probability: 30, owner: "R. Vance" },
  { id: "deal_04", name: "Soylent — Expansion", stage: "proposal", value: 310000, probability: 50, owner: "M. Lind" },
  { id: "deal_05", name: "Umbrella — New Logo", stage: "prospecting", value: 15000, probability: 10, owner: "K. Osei" },
  { id: "deal_06", name: "Wayne — Multi-year", stage: "closed_won", value: 540000, probability: 100, owner: "M. Lind" },
  { id: "deal_07", name: "Stark — POC", stage: "closed_lost", value: 0, probability: 0, owner: "R. Vance" },
  { id: "deal_08", name: "Hooli — Migration", stage: "proposal", value: 128000, probability: 45, owner: "K. Osei" },
]

export const Default: Story = {
  args: {
    schema: "Deal",
    fields: dealFields,
    rows: dealRows,
    displayField: "name",
    detailHref: (id) => `/Deal/${id}`,
  },
}

// A row whose stage is empty (or an unknown variant) collects into a trailing
// "Uncategorized" column rather than vanishing.
export const WithUncategorized: Story = {
  args: {
    schema: "Deal",
    fields: dealFields,
    rows: [...dealRows, { id: "deal_09", name: "Vehement — Inbound", stage: null, value: 8000, probability: 5, owner: "—" }],
    displayField: "name",
    detailHref: (id) => `/Deal/${id}`,
  },
}

// No enum field at all → the board explains itself instead of rendering blank.
export const NoKanbanField: Story = {
  args: {
    schema: "Note",
    fields: [
      { name: "title", kind: "text", required: true },
      { name: "body", kind: "rich_text", required: false },
    ],
    rows: [{ id: "note_01", title: "Standup notes", body: "..." }],
    displayField: "title",
    detailHref: (id) => `/Note/${id}`,
  },
}
