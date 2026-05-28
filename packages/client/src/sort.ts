// @schemaforge/client — client-side row sorting (pure).
//
// Used for bounded, already-fetched collections (e.g. a parent's child rows)
// where a server round-trip per sort would be wasteful. Server-backed lists
// still sort via ListEntitiesParams.sort. Stable, null-last, type-aware.

import type { EntityRow } from "./types"

export type SortDir = "asc" | "desc"

function compare(a: unknown, b: unknown): number {
  const aEmpty = a === null || a === undefined || a === ""
  const bEmpty = b === null || b === undefined || b === ""
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1 // empties sort last regardless of direction
  if (bEmpty) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? 1 : -1
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })
}

/** Return a new array sorted by `field`. A null `field` returns the input order.
 *  Empties always sort last; the `dir` flips only the non-empty comparison. */
export function sortRows(rows: readonly EntityRow[], field: string | null, dir: SortDir): EntityRow[] {
  if (!field) return [...rows]
  const factor = dir === "asc" ? 1 : -1
  // index-tagged for stability (Array.prototype.sort is stable in modern JS,
  // but the empties-last rule must not be inverted by `factor`).
  return rows
    .map((row, i) => ({ row, i }))
    .sort((x, y) => {
      const xe = x.row[field] === null || x.row[field] === undefined || x.row[field] === ""
      const ye = y.row[field] === null || y.row[field] === undefined || y.row[field] === ""
      if (xe || ye) {
        const c = compare(x.row[field], y.row[field])
        return c !== 0 ? c : x.i - y.i
      }
      const c = compare(x.row[field], y.row[field]) * factor
      return c !== 0 ? c : x.i - y.i
    })
    .map((t) => t.row)
}
