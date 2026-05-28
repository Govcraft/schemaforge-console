import { Link, useNavigate, useParams } from "react-router-dom"
import type { ChildRelation } from "@schemaforge/client"
import {
  ChildCollectionSection,
  EntityParentChild,
  useChildRelations,
  useEntity,
  useEntityList,
  useEntityMutations,
  useSchema,
} from "@schemaforge/react"

// One connected section per discovered child relation. Lives here (not in the
// package) because each needs its own data query, and React forbids hooks in a
// loop — so the page renders N of these as children of EntityParentChild.
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

// Detail view: the parent's fields plus every child collection that references
// it. Edit/Delete are gated by the row's Cedar decision (__permissions).
export function EntityDetailPage() {
  const { schema, id } = useParams<{ schema: string; id: string }>()
  const navigate = useNavigate()
  const meta = useSchema(schema)
  const entity = useEntity(schema, id)
  const relations = useChildRelations(schema)
  const { remove } = useEntityMutations(schema)

  if (!schema || !id) return null
  if (meta.isLoading || entity.isLoading)
    return <main className="sf-page"><p className="sf-empty">Loading…</p></main>
  if (meta.error || entity.error || !entity.data)
    return <main className="sf-page"><p className="sf-error">Record not found.</p></main>

  const data = entity.data
  const perms = data.__permissions

  function onDelete() {
    if (!window.confirm(`Delete this ${schema}? This cannot be undone.`)) return
    remove.mutate(id!, { onSuccess: () => navigate(`/${schema}`) })
  }

  return (
    <main className="sf-page">
      <p><Link to={`/${encodeURIComponent(schema)}`}>← {schema}</Link></p>
      <div className="sf-page-head">
        <h1>{schema} record</h1>
        <div className="sf-actions">
          {perms?.update ? (
            <Link className="sf-btn" to={`/${encodeURIComponent(schema)}/${encodeURIComponent(id)}/edit`}>
              Edit
            </Link>
          ) : null}
          {perms?.delete ? (
            <button type="button" className="sf-btn sf-btn-danger" disabled={remove.isPending} onClick={onDelete}>
              {remove.isPending ? "Deleting…" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
      <p className="sf-muted sf-mono">{data.id}</p>
      <EntityParentChild
        parentSchema={schema}
        parentId={id}
        parentFields={meta.data?.fields ?? []}
        parentData={data}
      >
        {(relations.data ?? []).map((rel) => (
          <ChildSection key={`${rel.schema}.${rel.foreignKey}`} relation={rel} parentId={id} />
        ))}
      </EntityParentChild>
    </main>
  )
}
