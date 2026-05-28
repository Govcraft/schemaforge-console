import { Link } from "react-router-dom"
import type { ChildRelation } from "@schemaforge/client"
import { ChildCollectionSection, useChildRelations, useEntityList, useSchema } from "@schemaforge/react"

// One connected section per discovered child relation. Lives here (not in the
// package) because each needs its own data query, and React forbids hooks in a
// loop — so we render N of these. Shared by the detail and edit routes.
function ChildSection({ relation, parentId }: { relation: ChildRelation; parentId: string }) {
  const meta = useSchema(relation.schema)
  const list = useEntityList(relation.schema, {
    filters: { [relation.foreignKey]: parentId },
    limit: 50,
  })
  // Pre-link the new child to this parent via the FK query param (read back by
  // the edit page in "new" mode).
  const createHref = `/${encodeURIComponent(relation.schema)}/new?${new URLSearchParams({
    [relation.foreignKey]: parentId,
  }).toString()}`

  return (
    <ChildCollectionSection
      schema={relation.schema}
      fields={meta.data?.fields ?? []}
      rows={list.data?.rows ?? []}
      loading={meta.isLoading || list.isLoading}
      error={list.error ? "Failed to load related records." : undefined}
      permissions={list.data?.permissions}
      detailHref={(id) => `/${encodeURIComponent(relation.schema)}/${encodeURIComponent(id)}`}
      createHref={createHref}
      renderRowActions={(row, perms) =>
        perms?.update ? (
          <Link to={`/${encodeURIComponent(relation.schema)}/${encodeURIComponent(row.id)}/edit`}>Edit</Link>
        ) : null
      }
    />
  )
}

/** Discovers and renders every child collection of a parent, as a fragment of
 *  sections suitable for the children slot of <EntityParentChild>. */
export function ChildCollections({ parentSchema, parentId }: { parentSchema: string; parentId: string }) {
  const relations = useChildRelations(parentSchema)
  return (
    <>
      {(relations.data ?? []).map((rel) => (
        <ChildSection key={`${rel.schema}.${rel.foreignKey}`} relation={rel} parentId={parentId} />
      ))}
    </>
  )
}
