import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { listColumns, type EnumColor, type EntityRow, type FieldMeta } from "@schemaforge/client"
import { EntityTable, type EntityTableProps, type SortDir } from "@schemaforge/react"
import { widgetFields, widgetRows } from "./mock-client"

// EntityTable owns sort *state* in the host, so the stories wrap it in a small
// stateful harness — exactly how a real page (or customer app) drives it.
function Harness(props: Omit<EntityTableProps, "sortField" | "sortDir" | "onToggleSort">) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  function toggle(field: string) {
    if (sortField !== field) {
      setSortField(field)
      setSortDir("asc")
    } else if (sortDir === "asc") setSortDir("desc")
    else setSortField(null)
  }
  return <EntityTable {...props} sortField={sortField} sortDir={sortDir} onToggleSort={toggle} />
}

const meta: Meta<typeof Harness> = {
  title: "Organisms/EntityTable",
  component: Harness,
}
export default meta
type Story = StoryObj<typeof Harness>

const base: Omit<EntityTableProps, "sortField" | "sortDir" | "onToggleSort"> = {
  schema: "Widget",
  fields: widgetFields,
  rows: widgetRows,
  detailHref: (id) => `/Widget/${id}`,
}

export const Default: Story = { args: base }

export const WithRowActions: Story = {
  args: {
    ...base,
    renderRowActions: (_row, perms) => (
      <>
        {perms?.update ? <button type="button">Edit</button> : null}
        {perms?.delete ? <button type="button">Delete</button> : null}
      </>
    ),
  },
}

export const CustomCells: Story = {
  args: {
    ...base,
    renderCell: (field, value) =>
      field.name === "price" && typeof value === "number" ? (
        <strong>{`$${value.toFixed(2)}`}</strong>
      ) : value == null ? (
        <span className="sf-muted">—</span>
      ) : (
        String(value)
      ),
  },
}

// Same component, a customer's design system via class overrides — no fork.
export const Retheme: Story = {
  args: {
    ...base,
    classes: { table: "acme-grid", th: "acme-grid__head", td: "acme-grid__cell", row: "acme-grid__row" },
  },
}

export const Empty: Story = { args: { ...base, rows: [] } }

// Demonstrates `@list` column curation + widget-rich cells end to end. The
// Milestone schema declares `name @list(primary)`, `status @list(column)`, and
// `completed_at @list(hidden)`; `listColumns` puts `name` first, forces
// `status`, drops `completed_at`, and fills the rest up to the cap. Cells render
// via FieldValue: `status` is a colored status badge, `due_date` a calendar date.
const MS_STATUS_COLORS: Record<string, EnumColor> = {
  upcoming: "gray",
  in_progress: "blue",
  completed: "green",
  missed: "red",
}

const milestoneFields: FieldMeta[] = [
  { name: "name", kind: "text", required: true, listHint: "primary" },
  { name: "description", kind: "text", required: false },
  { name: "due_date", kind: "datetime", required: true, format: "date" },
  { name: "completed_at", kind: "datetime", required: false, format: "relative", listHint: "hidden" },
  {
    name: "status",
    kind: "enum",
    required: false,
    widget: "status_badge",
    listHint: "column",
    enumVariants: ["upcoming", "in_progress", "completed", "missed"],
    enumColors: MS_STATUS_COLORS,
  },
  { name: "project", kind: "relation_one", required: true, relationTarget: "Project" },
]

const milestoneRows: EntityRow[] = [
  { id: "ms_01hq", name: "Public Beta", description: "Open the beta to all tenants", due_date: "2026-02-28T00:00:00Z", completed_at: null, status: "in_progress", project: "project_01" },
  { id: "ms_02hr", name: "General Availability", description: "1.0 ships", due_date: "2026-06-15T00:00:00Z", completed_at: "2026-05-01T00:00:00Z", status: "completed", project: "project_01" },
  { id: "ms_03hs", name: "Security Audit", description: null, due_date: "2026-01-10T00:00:00Z", completed_at: null, status: "missed", project: "project_01" },
]

export const CuratedColumns: Story = {
  args: {
    schema: "Milestone",
    fields: listColumns(milestoneFields, { displayField: "name" }).map((c) => c.field),
    rows: milestoneRows,
    detailHref: (id) => `/Milestone/${id}`,
  },
}
