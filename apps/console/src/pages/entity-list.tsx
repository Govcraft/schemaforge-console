import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { listColumns } from "@schemaforge/client"
import {
  ConfirmDialog,
  EntityTable,
  ErrorBlock,
  useEntityList,
  useEntityMutations,
  useSchema,
  type SortDir,
} from "@schemaforge/react"

const PAGE_SIZES = [25, 50, 100, 200] as const

// Entity browser: page-local sort/filter/pager state, data from the shared
// hooks, the shared EntityTable for presentation. New + per-row Edit/Delete are
// gated by the server's permission decisions.
export function EntityListPage() {
  const { schema } = useParams<{ schema: string }>()
  const navigate = useNavigate()

  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [filterField, setFilterField] = useState("")
  const [filterInput, setFilterInput] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Debounce the filter so keystrokes don't stampede the backend.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilterValue(filterInput)
      setOffset(0)
    }, 300)
    return () => clearTimeout(t)
  }, [filterInput])

  const meta = useSchema(schema)
  const filterableFields = (meta.data?.fields ?? []).filter((f) => f.kind === "text" || f.kind === "enum")
  const effectiveFilterField = filterField || filterableFields[0]?.name || ""
  const filters =
    effectiveFilterField && filterValue ? { [`${effectiveFilterField}__contains`]: filterValue } : undefined
  const sort = sortField ? (sortDir === "desc" ? `-${sortField}` : sortField) : undefined

  const rows = useEntityList(schema, { limit, offset, sort, filters })
  const { remove } = useEntityMutations(schema)

  if (!schema) return null
  if (meta.isLoading)
    return <div className="sf-page"><p className="sf-empty">Loading…</p></div>
  if (meta.error)
    return (
      <div className="sf-page">
        <ErrorBlock title={`Failed to load ${schema}`} error={meta.error} onRetry={() => meta.refetch()} />
      </div>
    )

  // Curate columns via the `@list` hints (primary headline, forced columns,
  // hidden suppressed) with a sane default cap so wide schemas don't render a
  // 19-column wall. The full field set is still reachable on the detail page.
  const fields = listColumns(meta.data?.fields ?? [], { displayField: meta.data?.displayField }).map(
    (c) => c.field,
  )
  const canCreate = rows.data?.permissions?.create ?? false
  const total = rows.data?.count ?? 0
  const pageStart = total === 0 ? 0 : offset + 1
  const pageEnd = Math.min(offset + (rows.data?.rows.length ?? 0), total)

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
    setOffset(0)
  }

  function confirmDelete() {
    if (!deleteId) return
    const id = deleteId
    remove.mutate(id, {
      onSuccess: () => {
        toast.success(`Deleted ${schema}`)
        setDeleteId(null)
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : `Failed to delete ${schema}`),
    })
  }

  return (
    <div className="sf-page">
      <div className="sf-page-head">
        <div>
          <div className="sf-eyebrow">Entity</div>
          <h1>{schema}</h1>
          <p className="sf-page-sub">
            <span className="sf-mono">{total.toLocaleString()}</span> total
          </p>
        </div>
        {canCreate ? (
          <div className="sf-actions">
            <button type="button" className="sf-btn" onClick={() => navigate(`/${encodeURIComponent(schema)}/new`)}>
              New {schema}
            </button>
          </div>
        ) : null}
      </div>

      <div className="sf-toolbar">
        {filterableFields.length > 0 ? (
          <>
            <select
              className="sf-select sf-toolbar-select"
              aria-label="Filter field"
              value={effectiveFilterField}
              onChange={(e) => setFilterField(e.target.value)}
            >
              {filterableFields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
            <input
              className="sf-input sf-toolbar-filter"
              aria-label={`Filter by ${effectiveFilterField} (contains)`}
              placeholder="contains…"
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
            />
          </>
        ) : null}
        <span className="sf-grow" />
        <select
          className="sf-select sf-toolbar-select"
          aria-label="Rows per page"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value))
            setOffset(0)
          }}
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>
      </div>

      {rows.error ? (
        <div className="sf-table-wrap">
          <ErrorBlock title="Failed to load records" error={rows.error} onRetry={() => rows.refetch()} />
        </div>
      ) : (
        <div className="sf-table-wrap">
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
                  <button type="button" className="sf-link-btn" onClick={() => setDeleteId(row.id)}>
                    Delete
                  </button>
                ) : null}
              </span>
            )}
          />
        </div>
      )}

      <div className="sf-pager">
        <span className="sf-mono">{total === 0 ? "0 of 0" : `${pageStart}–${pageEnd} of ${total}`}</span>
        <div className="sf-actions">
          <button
            type="button"
            className="sf-btn"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Prev
          </button>
          <button type="button" className="sf-btn" disabled={pageEnd >= total} onClick={() => setOffset(offset + limit)}>
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title={`Delete ${schema}?`}
        description="This permanently removes the record and cannot be undone."
        confirmLabel="Delete"
        destructive
        busy={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
