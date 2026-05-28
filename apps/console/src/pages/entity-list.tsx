import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { EntityTable, useEntityList, useEntityMutations, useSchema, type SortDir } from "@schemaforge/react"

// Entity browser: page-local sort state, data from the shared hooks, the shared
// EntityTable for presentation. Rows link to detail; New + per-row Edit/Delete
// are gated by the server's permission decisions.
export function EntityListPage() {
  const { schema } = useParams<{ schema: string }>()
  const navigate = useNavigate()
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const sort = sortField ? (sortDir === "desc" ? `-${sortField}` : sortField) : undefined
  const meta = useSchema(schema)
  const rows = useEntityList(schema, { limit: 50, sort })
  const { remove } = useEntityMutations(schema)

  if (!schema) return null
  if (meta.isLoading) return <main className="sf-page"><p className="sf-empty">Loading…</p></main>
  if (meta.error) return <main className="sf-page"><p className="sf-error">Failed to load {schema}.</p></main>

  const fields = (meta.data?.fields ?? []).filter((f) => f.kind !== "composite")
  const canCreate = rows.data?.permissions?.create ?? false

  function toggleSort(field: string) {
    if (sortField !== field) {
      setSortField(field)
      setSortDir("asc")
    } else if (sortDir === "asc") {
      setSortDir("desc")
    } else {
      setSortField(null)
      setSortDir("asc")
    }
  }

  function onDelete(id: string) {
    if (!window.confirm(`Delete this ${schema}? This cannot be undone.`)) return
    remove.mutate(id)
  }

  return (
    <main className="sf-page">
      <p><Link to="/">← Catalog</Link></p>
      <div className="sf-page-head">
        <h1>{schema}</h1>
        {canCreate ? (
          <button type="button" className="sf-btn" onClick={() => navigate(`/${encodeURIComponent(schema)}/new`)}>
            New {schema}
          </button>
        ) : null}
      </div>
      <p className="sf-muted">{(rows.data?.count ?? 0).toLocaleString()} total</p>
      <EntityTable
        schema={schema}
        fields={fields}
        rows={rows.data?.rows ?? []}
        sortField={sortField}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        permissions={rows.data?.permissions}
        detailHref={(id) => `/${encodeURIComponent(schema)}/${encodeURIComponent(id)}`}
        renderRowActions={(row, perms) => (
          <span className="sf-row-actions">
            {perms?.update ? (
              <Link to={`/${encodeURIComponent(schema)}/${encodeURIComponent(row.id)}/edit`}>Edit</Link>
            ) : null}
            {perms?.delete ? (
              <button type="button" className="sf-link-btn" disabled={remove.isPending} onClick={() => onDelete(row.id)}>
                Delete
              </button>
            ) : null}
          </span>
        )}
      />
    </main>
  )
}
