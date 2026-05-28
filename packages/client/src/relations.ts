// @schemaforge/client — child-relation discovery (pure).
//
// A "child collection" of a parent entity is any *other* schema that carries a
// relation_one field pointing back at the parent schema. This is the master-
// detail relationship the EntityParentChild organism renders. Discovery is a
// pure function over already-described schemas so it is trivially testable and
// host-agnostic; the React layer wraps it in a query.

import type { SchemaView } from "./types"

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
