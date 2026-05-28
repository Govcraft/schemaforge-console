// @schemaforge/client — kanban grouping (pure).
//
// Turns a schema's rows into the ordered columns a kanban board renders, keyed
// by the enum field carrying `@kanban_column`. Columns follow the enum's
// declared variant order (so the board reads left→right like the workflow it
// models); rows whose value is empty or outside the declared variants collect
// into a trailing "Uncategorized" column — never dropped. Pure and host-
// agnostic so it is trivially testable; the React layer only renders the result.

import type { EntityRow, EnumColor, FieldMeta } from "./types"

export type KanbanGroup = {
  /** The enum variant key, or "" for the uncategorized bucket. */
  key: string
  /** Human-readable column header (`closed_won` → `Closed Won`). */
  label: string
  /** Badge color from the field's `@enum_colors` (undefined → neutral). */
  color?: EnumColor
  rows: EntityRow[]
}

/**
 * The field a board groups by: the enum carrying `@kanban_column`. Falls back to
 * the first enum field so a board can still render a workflow when no field is
 * explicitly annotated. Returns undefined when the schema has no enum at all.
 */
export function findKanbanField(fields: FieldMeta[]): FieldMeta | undefined {
  return (
    fields.find((f) => f.kind === "enum" && f.kanbanColumn) ??
    fields.find((f) => f.kind === "enum")
  )
}

/** `closed_won` → `Closed Won`. */
function humanizeToken(token: string): string {
  return token
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === ""
}

/**
 * Group rows into ordered kanban columns by `field`'s value. Pure: same inputs →
 * same output. Empty or unknown-variant values collect into a trailing
 * "Uncategorized" column, which appears only when it would hold rows.
 */
export function kanbanGroups(rows: EntityRow[], field: FieldMeta): KanbanGroup[] {
  const variants = field.enumVariants ?? []
  const colors = field.enumColors ?? {}
  const byKey = new Map<string, EntityRow[]>()
  for (const v of variants) byKey.set(v, [])
  const uncategorized: EntityRow[] = []

  for (const row of rows) {
    const raw = row[field.name]
    const key = isEmptyValue(raw) ? "" : String(raw)
    const bucket = byKey.get(key)
    if (bucket) bucket.push(row)
    else uncategorized.push(row)
  }

  const groups: KanbanGroup[] = variants.map((v) => ({
    key: v,
    label: humanizeToken(v),
    color: colors[v],
    rows: byKey.get(v) ?? [],
  }))
  if (uncategorized.length > 0) {
    groups.push({ key: "", label: "Uncategorized", color: "gray", rows: uncategorized })
  }
  return groups
}
