// @schemaforge/react — EntityTable: presentational organism.
//
// PURE presentational: takes fields + rows + sort state + callbacks. No data
// fetch, no react-query, no router import. Navigation comes from context; the
// host feeds data (typically via useEntityList, but any source works).
//
// DECISION (a11y lives in the library): the sortable-header semantics —
// aria-sort, the sr-only sort-direction announcement, the row-action labelling
// — are baked in here so every consumer inherits 508/WCAG conformance instead
// of re-implementing it. This is the reason to ship styled organisms, not just
// hooks.
//
// DECISION (styling): default classNames are token-driven; every structural
// node accepts a className override via `classes`, and cells are overridable
// via `renderCell`. Restyle = retheme, not fork.

import { type ReactNode } from "react"
import {
  canReadField,
  formatFieldValue,
  type EntityPermissions,
  type EntityRow,
  type FieldMeta,
  type SchemaPermissions,
} from "@schemaforge/client"
import { useForgeNav, useForgeRoles } from "./context"

export type SortDir = "asc" | "desc"

export type EntityTableClasses = {
  table?: string
  th?: string
  td?: string
  row?: string
}

export type EntityTableProps = {
  schema: string
  /** Candidate columns. The organism drops any the current roles cannot read
   *  (`@field_access`), so the host passes the full non-composite set and need
   *  not re-implement read gating. */
  fields: FieldMeta[]
  rows: EntityRow[]
  sortField: string | null
  sortDir: SortDir
  onToggleSort: (field: string) => void
  /** Schema-level permission for the "New" affordance (rendered by the host header, not here). */
  permissions?: SchemaPermissions
  /** Optional cell override. Default renders `String(value)` with an em-dash for empties. */
  renderCell?: (field: FieldMeta, value: unknown, row: EntityRow) => ReactNode
  /** Optional per-row action slot (Edit/Delete). Receives the row's Cedar decision. */
  renderRowActions?: (row: EntityRow, perms: EntityPermissions | undefined) => ReactNode
  /** Build the detail-page href for a row id. */
  detailHref: (id: string) => string
  classes?: EntityTableClasses
}

function defaultCell(field: FieldMeta, value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") return <span className="sf-muted">—</span>
  // Shared formatter: datetimes, arrays, money, booleans, files — never raw JSON.
  return formatFieldValue(value, field)
}

function shortId(id: string): string {
  if (id.length <= 18) return id
  return id.slice(0, 8) + "…" + id.slice(-6)
}

export function EntityTable({
  schema,
  fields,
  rows,
  sortField,
  sortDir,
  onToggleSort,
  renderCell = defaultCell,
  renderRowActions,
  detailHref,
  classes,
}: EntityTableProps) {
  const { Link } = useForgeNav()
  const roles = useForgeRoles()
  const visibleFields = fields.filter((f) => canReadField(f, roles))
  return (
    <table className={classes?.table ?? "sf-table"}>
      <thead>
        <tr>
          <th className={classes?.th}>id</th>
          {visibleFields.map((f) => {
            const active = sortField === f.name
            const arrow = active ? (sortDir === "asc" ? " ↑" : " ↓") : ""
            const ariaSort: "ascending" | "descending" | "none" = active
              ? sortDir === "asc"
                ? "ascending"
                : "descending"
              : "none"
            const announce = active
              ? `, sorted ${sortDir === "asc" ? "ascending" : "descending"}`
              : ", not sorted"
            return (
              <th key={f.name} aria-sort={ariaSort} className={classes?.th}>
                <button type="button" onClick={() => onToggleSort(f.name)}>
                  {f.name}
                  <span className="sf-sr-only">{announce}</span>
                  {active ? <span aria-hidden="true">{arrow}</span> : null}
                </button>
              </th>
            )
          })}
          <th className={classes?.th}>
            <span className="sf-sr-only">Row actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className={classes?.row}>
            <td className={classes?.td}>
              <Link to={detailHref(row.id)}>{shortId(row.id)}</Link>
            </td>
            {visibleFields.map((f) => (
              <td key={f.name} className={classes?.td}>
                {renderCell(f, row[f.name], row)}
              </td>
            ))}
            <td className={classes?.td}>{renderRowActions?.(row, row.__permissions)}</td>
          </tr>
        ))}
        {rows.length === 0 ? (
          <tr>
            <td colSpan={visibleFields.length + 2}>
              <div className="sf-empty">No {schema} records</div>
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  )
}
