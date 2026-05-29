// @schemaforge/react — FieldRenderer: presentational kind→control dispatch.
//
// Extracted from the admin's field-renderer.tsx. Presentational: (field, value,
// onChange, readOnly, id). The only data-bound branch is `relation_one`, which
// delegates to <RelationSelect> (data via context) — kept composable so the
// rest stays pure. `id` is threaded to the primary control so the host can wire
// <label htmlFor> for SC 1.3.1 / 3.3.2.

import { type ReactNode } from "react"
import { type FieldMeta } from "@schemaforge/client"
import { RelationSelect } from "./relation-select"
import { FieldValue } from "./field-value"

export type FieldRendererProps = {
  field: FieldMeta
  value: unknown
  /** Read-only only: server-resolved relation label(s) (the `__display`
   *  sibling). Threaded to FieldValue so a detail/spec view shows the related
   *  record's `@display` value rather than its id. */
  display?: unknown
  onChange?: (next: unknown) => void
  readOnly?: boolean
  id?: string
}

function ReadOnly({ field, value, display }: { field: FieldMeta; value: unknown; display?: unknown }): ReactNode {
  if (value === null || value === undefined || value === "") return <span className="sf-muted">—</span>
  if (field.kind === "composite" && field.subFields) {
    const obj = (value ?? {}) as Record<string, unknown>
    return (
      <div className="sf-composite">
        {field.subFields.map((sub) => (
          <div key={sub.name}>
            <span className="sf-muted">{sub.name}</span>
            <ReadOnly field={sub} value={obj[sub.name]} />
          </div>
        ))}
      </div>
    )
  }
  // Everything else (scalars, arrays, datetimes, money, files, json, and the
  // widget-rich variants — badges, bars, chips, links, swatches) goes through
  // the shared FieldValue renderer so read-only display is identical in the
  // form, the spec sheet, and the table.
  return <FieldValue field={field} value={value} display={display} />
}

export function FieldRenderer({ field, value, display, onChange, readOnly, id }: FieldRendererProps): ReactNode {
  if (readOnly || !onChange) return <ReadOnly field={field} value={value} display={display} />

  const textareaWidget =
    field.widget === "richtext" || field.widget === "rich_text" || field.widget === "textarea"

  switch (field.kind) {
    case "boolean":
      return (
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      )
    case "integer":
    case "float":
      return (
        <input
          id={id}
          className="sf-input"
          type="number"
          value={(value as number | string) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )
    case "datetime":
      return (
        <input
          id={id}
          className="sf-input"
          type="datetime-local"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "enum":
      return (
        <select id={id} className="sf-select" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">— select —</option>
          {(field.enumVariants ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      )
    case "relation_one":
      return field.relationTarget ? (
        <RelationSelect
          id={id}
          targetSchema={field.relationTarget}
          value={(value as string) ?? null}
          onChange={onChange}
        />
      ) : null
    case "rich_text":
      return (
        <textarea id={id} className="sf-textarea" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )
    case "text":
      return textareaWidget ? (
        <textarea id={id} className="sf-textarea" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} className="sf-input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )
    case "json":
      return (
        <textarea
          id={id}
          className="sf-textarea"
          value={typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2)}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    default:
      // array / composite / file / unknown: fall back to a JSON textarea in the
      // spike. The real library keeps the recursive composite + file widgets.
      return (
        <textarea
          id={id}
          className="sf-textarea"
          value={typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2)}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}
