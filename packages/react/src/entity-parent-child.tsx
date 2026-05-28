// @schemaforge/react — EntityParentChild: master-detail organism.
//
// This organism is a COMPOSITION of the others: the host fills the parent slot
// with SpecSheet (view) or EntityForm (edit), and each related collection
// renders through EntityTable. That is the design statement — organisms stack,
// so a parent-with-children view is not a new rendering surface to maintain,
// just an arrangement of the ones we already ship (and already made 508/WCAG-
// conformant). The parent being a slot is what makes "edit the parent in place"
// (the PayloadCMS pattern) fall out for free — pass an EntityForm instead.
//
// Split into two presentational pieces:
//   - EntityParentChild  — the page shell: a labeled parent slot + child sections.
//   - ChildCollectionSection — one related collection (heading, "Add", table).
//
// The number of child collections is data-driven (discovered via
// findChildRelations), and each needs its own data query — which React's rules
// forbid in a loop. So the host renders one connected component per relation as
// JSX children of the shell. The package stays presentational; Storybook drives
// it with canned sections.

import { useId, useState, type ReactNode } from "react"
import {
  sortRows,
  type EntityPermissions,
  type EntityRow,
  type FieldMeta,
  type SchemaPermissions,
} from "@schemaforge/client"
import { EntityTable, type SortDir } from "./entity-table"
import { useForgeNav } from "./context"

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export type EntityParentChildClasses = {
  container?: string
  section?: string
  heading?: string
}

export type EntityParentChildProps = {
  parentSchema: string
  parentId: string
  /** The parent content. Typically <SpecSheet> for a read view or <EntityForm>
   *  for an edit view — the organism owns only the labeled region and layout,
   *  so swapping read for edit is the host's call. */
  parent: ReactNode
  /** Heading for the parent section (e.g. "Details" or "Edit"). */
  detailsLabel?: string
  /** Child collection sections — typically <ChildCollectionSection> connected
   *  to data by the host, one per discovered relation. */
  children?: ReactNode
  classes?: EntityParentChildClasses
}

export function EntityParentChild({
  parentSchema,
  parentId,
  parent,
  detailsLabel = "Details",
  children,
  classes,
}: EntityParentChildProps) {
  const headingId = useId()
  return (
    <div className={classes?.container ?? "sf-pc"}>
      <section className={classes?.section ?? "sf-pc-section"} aria-labelledby={headingId}>
        <h2 id={headingId} className={classes?.heading ?? "sf-pc-heading"}>
          {detailsLabel}
          <span className="sf-sr-only">{` for ${parentSchema} ${parentId}`}</span>
        </h2>
        {parent}
      </section>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Child collection section
// ---------------------------------------------------------------------------

export type ChildCollectionSectionClasses = {
  section?: string
  header?: string
  heading?: string
}

export type ChildCollectionSectionProps = {
  /** Child schema name. */
  schema: string
  /** Section heading; defaults to the schema name. */
  title?: string
  /** Child field set (read gating is applied by the inner EntityTable). */
  fields: FieldMeta[]
  rows: EntityRow[]
  loading?: boolean
  error?: string
  /** Schema-level permission gating the "Add" affordance. */
  permissions?: SchemaPermissions
  /** Detail href for a child row id. */
  detailHref: (id: string) => string
  /** Href to create a child pre-linked to the parent. When absent, no Add button. */
  createHref?: string
  /** Optional per-row actions (e.g. an Edit link). */
  renderRowActions?: (row: EntityRow, perms: EntityPermissions | undefined) => ReactNode
  classes?: ChildCollectionSectionClasses
}

export function ChildCollectionSection({
  schema,
  title,
  fields,
  rows,
  loading,
  error,
  permissions,
  detailHref,
  createHref,
  renderRowActions,
  classes,
}: ChildCollectionSectionProps) {
  const { Link } = useForgeNav()
  const headingId = useId()
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = sortRows(rows, sortField, sortDir)

  return (
    <section className={classes?.section ?? "sf-pc-section"} aria-labelledby={headingId}>
      <div className={classes?.header ?? "sf-pc-header"}>
        <h2 id={headingId} className={classes?.heading ?? "sf-pc-heading"}>
          {title ?? schema}
          {!loading && !error ? <span className="sf-muted"> ({rows.length})</span> : null}
        </h2>
        {permissions?.create && createHref ? (
          <Link to={createHref} className="sf-btn">
            Add {title ?? schema}
          </Link>
        ) : null}
      </div>
      {loading ? (
        <p className="sf-empty">Loading…</p>
      ) : error ? (
        <p className="sf-error" role="alert">
          Error: {error}
        </p>
      ) : (
        <EntityTable
          schema={schema}
          fields={fields}
          rows={sorted}
          sortField={sortField}
          sortDir={sortDir}
          onToggleSort={toggleSort}
          detailHref={detailHref}
          renderRowActions={renderRowActions}
        />
      )}
    </section>
  )
}
