import { Link, useNavigate, useParams } from "react-router-dom"
import { EntityForm, useEntity, useEntityMutations, useSchema, type EntityRow } from "@schemaforge/react"

// Stable empty object so EntityForm's initial-value effect doesn't re-seed (and
// wipe input) on every render of the "new" form.
const EMPTY: Record<string, unknown> = {}

// One page backs both /:schema/new and /:schema/:id/edit.
export function EntityEditPage() {
  const { schema, id } = useParams<{ schema: string; id?: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const meta = useSchema(schema)
  const existing = useEntity(schema, id)
  const { create, update } = useEntityMutations(schema)

  if (!schema) return null
  if (meta.isLoading || (!isNew && existing.isLoading))
    return <main className="sf-page"><p className="sf-empty">Loading…</p></main>
  if (meta.error)
    return <main className="sf-page"><p className="sf-error">Failed to load {schema}.</p></main>

  const initial: Record<string, unknown> = isNew ? EMPTY : ((existing.data as EntityRow | undefined) ?? EMPTY)
  const submitting = create.isPending || update.isPending
  const submitError = (create.error ?? update.error)?.message ?? null

  function onSubmit(values: Record<string, unknown>) {
    const goToDetail = (e: EntityRow) => navigate(`/${encodeURIComponent(schema!)}/${encodeURIComponent(e.id)}`)
    if (isNew) create.mutate(values, { onSuccess: goToDetail })
    else update.mutate({ id: id!, body: values }, { onSuccess: goToDetail })
  }

  return (
    <main className="sf-page">
      <p>
        <Link to={isNew ? `/${encodeURIComponent(schema)}` : `/${encodeURIComponent(schema)}/${encodeURIComponent(id!)}`}>
          ← Back
        </Link>
      </p>
      <h1>{isNew ? `New ${schema}` : `Edit ${schema}`}</h1>
      <EntityForm
        fields={meta.data?.fields ?? []}
        initialValues={initial}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        submitting={submitting}
        error={submitError}
        submitLabel={isNew ? "Create" : "Save"}
      />
    </main>
  )
}
