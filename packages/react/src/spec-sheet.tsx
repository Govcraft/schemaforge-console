// @schemaforge/react — SpecSheet: read-only entity detail organism.
//
// Presentational, but enforces read access internally (useForgeRoles +
// canReadField) so a field gated by @field_access never leaks into a detail
// view. Renders a definition list — semantic, screen-reader friendly — with
// each value drawn by the shared FieldRenderer in read-only mode.

import {
  canReadField,
  relationDisplay,
  type EntityRow,
  type FieldMeta,
} from "@schemaforge/client"
import { useForgeRoles } from "./context"
import { FieldRenderer } from "./field-renderer"

export type SpecSheetClasses = {
  list?: string
  row?: string
  key?: string
  value?: string
}

export type SpecSheetProps = {
  /** Candidate fields (e.g. the schema's full set); unreadable ones are dropped. */
  fields: FieldMeta[]
  data: EntityRow
  classes?: SpecSheetClasses
}

export function SpecSheet({ fields, data, classes }: SpecSheetProps) {
  const roles = useForgeRoles()
  const visible = fields.filter((f) => canReadField(f, roles))
  return (
    <dl className={classes?.list ?? "sf-spec"}>
      {visible.map((f) => {
        const value = data[f.name]
        const empty = value === null || value === undefined || value === ""
        return (
          <div key={f.name} className={classes?.row ?? "sf-spec-row"}>
            <dt className={classes?.key ?? "sf-spec-key"}>
              {f.name}
              {f.required ? <span className="sf-req" aria-hidden="true"> *</span> : null}
            </dt>
            <dd className={classes?.value ?? "sf-spec-val"}>
              {empty ? (
                <span className="sf-muted">— empty</span>
              ) : (
                <FieldRenderer field={f} value={value} display={relationDisplay(data, f)} readOnly />
              )}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
