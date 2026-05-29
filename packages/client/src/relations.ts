// @schemaforge/client — child-relation discovery (pure).
//
// A "child collection" of a parent entity is any *other* schema that carries a
// relation_one field pointing back at the parent schema. This is the master-
// detail relationship the EntityParentChild organism renders. Discovery is a
// pure function over already-described schemas so it is trivially testable and
// host-agnostic; the React layer wraps it in a query.

import type { EntityRow, FieldMeta, SchemaView } from "./types"

/**
 * Suffix of the sibling key the server adds to a row for each relation field.
 * The query API resolves the related record's `@display` field and ships its
 * value alongside the raw id — e.g. a `company` relation produces both
 * `company` (the id) and `company__display` (the human label). For
 * relation_many the sibling is an array ordered to match the id array.
 */
export const RELATION_DISPLAY_SUFFIX = "__display"

/**
 * The server-resolved display label(s) for a relation field on a row, or
 * `undefined` for a non-relation field or when the server resolved none (the
 * target schema has no `@display`, or the query was made with `resolve=false`).
 * relation_one → string; relation_many → string[]. Pure: no fetch, no schema
 * lookup — it just reads the sibling the wire already carries.
 */
export function relationDisplay(row: EntityRow, field: FieldMeta): unknown {
  if (field.kind !== "relation_one" && field.kind !== "relation_many") return undefined
  return row[`${field.name}${RELATION_DISPLAY_SUFFIX}`]
}

export type ChildRelation = {
  /** The child schema's name. */
  schema: string
  /** The relation_one field on the child that references the parent. */
  foreignKey: string
}

/**
 * Find every schema that has a relation_one field targeting `parentSchema`.
 * Returns one ChildRelation per such field (a child may reference the parent
 * through more than one field — each is its own collection).
 */
export function findChildRelations(
  parentSchema: string,
  views: readonly SchemaView[],
): ChildRelation[] {
  const out: ChildRelation[] = []
  for (const view of views) {
    if (view.schema.name === parentSchema) continue
    for (const field of view.fields) {
      if (field.kind === "relation_one" && field.relationTarget === parentSchema) {
        out.push({ schema: view.schema.name, foreignKey: field.name })
      }
    }
  }
  return out
}
