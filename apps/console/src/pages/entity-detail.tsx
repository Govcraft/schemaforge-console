import { Link, useNavigate, useParams } from "react-router-dom"
import { EntityParentChild, SpecSheet, useEntity, useEntityMutations, useSchema } from "@schemaforge/react"
import { ChildCollections } from "./child-sections"

// Detail view: the parent's fields plus every child collection that references
// it. Edit/Delete are gated by the row's Cedar decision (__permissions).
export function EntityDetailPage() {
  const { schema, id } = useParams<{ schema: string; id: string }>()
  const navigate = useNavigate()
  const meta = useSchema(schema)
  const entity = useEntity(schema, id)
  const { remove } = useEntityMutations(schema)

  if (!schema || !id) return null
  if (meta.isLoading || entity.isLoading)
    return <div className="sf-page"><p className="sf-empty">Loading…</p></div>
  if (meta.error || entity.error || !entity.data)
    return <div className="sf-page"><p className="sf-error">Record not found.</p></div>

  const data = entity.data
  const perms = data.__permissions

  function onDelete() {
    if (!window.confirm(`Delete this ${schema}? This cannot be undone.`)) return
    remove.mutate(id!, { onSuccess: () => navigate(`/${schema}`) })
  }

  return (
    <div className="sf-page">
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
        parent={<SpecSheet fields={meta.data?.fields ?? []} data={data} />}
      >
        <ChildCollections parentSchema={schema} parentId={id} />
      </EntityParentChild>
    </div>
  )
}
