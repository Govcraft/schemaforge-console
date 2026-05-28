// @schemaforge/react — EntityCard: a single entity as a compact card MOLECULE.
//
// A headline (the @display field, linked to the detail page) over a short list
// of summary fields, each drawn by the shared FieldValue molecule so a card
// renders the same badges/bars/links a table cell does. Presentational and
// FieldMeta-driven; the caller curates + caps the summary fields (the
// KanbanBoard organism uses listColumns for this). Read access is enforced
// internally (useForgeRoles + canReadField) so an @field_access-gated field
// never leaks onto a card. Reusable beyond kanban — dashboards, galleries,
// search results.

import { canReadField, type EntityRow, type FieldMeta } from "@schemaforge/client"
import { useForgeNav, useForgeRoles } from "./context"
import { FieldValue } from "./field-value"

export type EntityCardClasses = {
  card?: string
  title?: string
  fields?: string
  row?: string
  key?: string
  value?: string
}

export type EntityCardProps = {
  row: EntityRow
  /** The field rendered as the card headline. */
  titleField: FieldMeta
  /** Summary fields shown under the headline. The caller curates and caps these;
   *  the headline field and any unreadable field are dropped here. */
  fields: FieldMeta[]
  /** Detail href; when set, the headline links to it. */
  href?: string
  classes?: EntityCardClasses
}

function shortId(id: string): string {
  if (id.length <= 18) return id
  return id.slice(0, 8) + "…" + id.slice(-6)
}

export function EntityCard({ row, titleField, fields, href, classes }: EntityCardProps) {
  const { Link } = useForgeNav()
  const roles = useForgeRoles()

  const titleValue = row[titleField.name]
  const title =
    titleValue === null || titleValue === undefined || titleValue === ""
      ? shortId(row.id)
      : String(titleValue)

  const summary = fields.filter((f) => f.name !== titleField.name && canReadField(f, roles))

  return (
    <article className={classes?.card ?? "sf-card"}>
      <div className={classes?.title ?? "sf-card-title"}>
        {href ? <Link to={href}>{title}</Link> : <span>{title}</span>}
      </div>
      {summary.length > 0 ? (
        <dl className={classes?.fields ?? "sf-card-fields"}>
          {summary.map((f) => (
            <div key={f.name} className={classes?.row ?? "sf-card-field"}>
              <dt className={classes?.key ?? "sf-card-key"}>{f.name}</dt>
              <dd className={classes?.value ?? "sf-card-val"}>
                <FieldValue field={f} value={row[f.name]} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  )
}
