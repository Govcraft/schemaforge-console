import { Link } from "react-router-dom"
import { isSystemSchema } from "@schemaforge/client"
import { useSchemas } from "@schemaforge/react"

// Schema catalog — every schema the signed-in operator can read, fetched from
// /schemas at runtime. No codegen: add a schema to the backend, refresh, done.
export function HomePage() {
  const { data: schemas, isLoading, error } = useSchemas()

  if (isLoading) return <main className="sf-page"><p className="sf-empty">Loading schemas…</p></main>
  if (error)
    return (
      <main className="sf-page">
        <p className="sf-error">Failed to load schemas. <Link to="/login">Sign in</Link>?</p>
      </main>
    )

  const all = schemas ?? []
  const app = all.filter((s) => !isSystemSchema(s))
  const system = all.filter(isSystemSchema)

  return (
    <main className="sf-page">
      <h1>Catalog</h1>
      <p className="sf-muted">{all.length} schemas</p>
      <Section title="Application" schemas={app} />
      <Section title="System" schemas={system} />
    </main>
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
