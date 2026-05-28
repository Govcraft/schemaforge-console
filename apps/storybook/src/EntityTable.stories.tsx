import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
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
