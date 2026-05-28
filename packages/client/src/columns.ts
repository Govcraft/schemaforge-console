// @schemaforge/client — list-view column curation (pure).
//
// Turns a schema's full field set into the ordered, capped column list a list
// view should show, honoring the `@list(primary|column|hidden)` hints:
//
//   primary  → headline cell; forced in, sorted to the front, marked primary
//   column   → forced in even if it wouldn't show by default
//   hidden   → suppressed even if it would show by default
//
// Without any `@list` hint a sensible default set is shown (scalars/enums/dates
// and single relations, media + heavy fields dropped) capped at `limit` so a
// 19-field schema doesn't render a 19-column wall. Explicit `primary`/`column`
// hints always survive the cap — author intent wins over the heuristic.

import type { FieldMeta } from "./types"

export type ListColumn = {
  field: FieldMeta
  /** The headline column (from `@list(primary)`, else the display field, else
   *  the first column). Hosts can style it more prominently. */
  primary: boolean
}

const DEFAULT_COLUMN_LIMIT = 6

function isMediaWidget(widget?: string): boolean {
  return widget === "image" || widget === "avatar" || widget === "file"
}

/** Fields shown by default (before `@list` adjustments): excludes heavy/wide
 *  kinds (composite, derived collections, JSON, rich text, files) and media
 *  widgets that don't belong in a dense cell. */
function defaultVisible(field: FieldMeta): boolean {
  switch (field.kind) {
    case "composite":
    case "relation_many":
    case "json":
    case "rich_text":
    case "file":
      return false
    default:
      return !isMediaWidget(field.widget)
  }
}

export type ListColumnOptions = {
  /** Max auto-selected columns. Explicit `@list(primary|column)` fields are
   *  always kept regardless. Defaults to 6. */
  limit?: number
  /** The schema's `@display` field, used as the headline when no field carries
   *  `@list(primary)`. */
  displayField?: string
}

/**
 * Curate and order the columns for a list view. Pure: same inputs → same output.
 */
export function listColumns(fields: FieldMeta[], options: ListColumnOptions = {}): ListColumn[] {
  const limit = options.limit ?? DEFAULT_COLUMN_LIMIT
  const seen = new Set<string>()
  const columns: ListColumn[] = []

  const push = (field: FieldMeta, primary: boolean) => {
    if (seen.has(field.name)) return
    seen.add(field.name)
    columns.push({ field, primary })
  }

  // 1. Explicit primary headline(s), 2. forced columns, in declaration order.
  for (const f of fields) if (f.listHint === "primary") push(f, true)
  for (const f of fields) if (f.listHint === "column") push(f, false)

  // 3. Fill the rest from the default-visible set (skipping anything @list(hidden)
  //    or already added) up to the cap.
  for (const f of fields) {
    if (columns.length >= limit) break
    if (f.listHint === "hidden") continue
    if (f.listHint === undefined && defaultVisible(f)) push(f, false)
  }

  // Fallback: everything was hidden/heavy — show the first field so the table
  // is never headerless.
  if (columns.length === 0 && fields.length > 0) push(fields[0], true)

  // Ensure exactly one headline. If no @list(primary), promote the display
  // field, else the first column.
  if (!columns.some((c) => c.primary) && columns.length > 0) {
    const headline =
      (options.displayField && columns.find((c) => c.field.name === options.displayField)) ||
      columns[0]
    headline.primary = true
  }

  return columns
}
