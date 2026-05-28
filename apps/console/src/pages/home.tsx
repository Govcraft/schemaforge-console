import { Link } from "react-router-dom"
import { isSystemSchema } from "@schemaforge/client"
import { useSchemas } from "@schemaforge/react"

// Schema catalog — every schema the signed-in operator can read, fetched from
// /schemas at runtime. No codegen: add a schema to the backend, refresh, done.
export function HomePage() {
  const { data: schemas, isLoading, error } = useSchemas()

  if (isLoading) return <div className="sf-page"><p className="sf-empty">Loading schemas…</p></div>
  if (error)
    return (
      <div className="sf-page">
        <p className="sf-error">Failed to load schemas. <Link to="/login">Sign in</Link>?</p>
      </div>
    )

  const all = schemas ?? []
  const app = all.filter((s) => !isSystemSchema(s))
  const system = all.filter(isSystemSchema)

  return (
    <div className="sf-page">
      <div className="sf-page-head">
        <div>
          <div className="sf-eyebrow">Catalog</div>
          <h1>Schemas</h1>
          <p className="sf-page-sub"><span className="sf-mono">{all.length}</span> total</p>
        </div>
      </div>
      <Section title="Application" schemas={app} />
      <Section title="System" schemas={system} />
    </div>
  )
}

function Section({ title, schemas }: { title: string; schemas: { name: string; fields: unknown[] }[] }) {
  if (schemas.length === 0) return null
  return (
    <section>
      <h2 className="sf-eyebrow">{title}</h2>
      <ul className="sf-catalog">
        {schemas.map((s) => (
          <li key={s.name}>
            <Link to={`/${encodeURIComponent(s.name)}`}>
              {s.name} <span className="sf-muted">· {s.fields.length}F</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
