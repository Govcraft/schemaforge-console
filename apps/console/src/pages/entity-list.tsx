import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EntityTable, useEntityList, useSchema, type SortDir } from "@schemaforge/react"

// The whole page: page-local sort/pager state, data from the shared hooks, and
// the shared EntityTable for presentation. Detail/edit routes are follow-ups —
// row links currently point back to the list.
export function EntityListPage() {
  const { schema } = useParams<{ schema: string }>()
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const sort = sortField ? (sortDir === "desc" ? `-${sortField}` : sortField) : undefined
  const meta = useSchema(schema)
  const rows = useEntityList(schema, { limit: 50, sort })

  if (!schema) return null
  if (meta.isLoading) return <main className="sf-page"><p className="sf-empty">Loading…</p></main>
  if (meta.error)
    return <main className="sf-page"><p className="sf-error">Failed to load {schema}.</p></main>

  const fields = (meta.data?.fields ?? []).filter((f) => f.kind !== "composite")

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

  return (
    <main className="sf-page">
      <p><Link to="/">← Catalog</Link></p>
      <h1>{schema}</h1>
      <p className="sf-muted">{(rows.data?.count ?? 0).toLocaleString()} total</p>
      <EntityTable
        schema={schema}
        fields={fields}
        rows={rows.data?.rows ?? []}
        sortField={sortField}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        permissions={rows.data?.permissions}
        detailHref={(id) => `/${encodeURIComponent(schema)}?id=${encodeURIComponent(id)}`}
      />
    </main>
  )
}
