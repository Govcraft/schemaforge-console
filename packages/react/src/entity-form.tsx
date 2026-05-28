// @schemaforge/react — EntityForm: create/edit organism.
//
// Owns its field-value state (seeded from initialValues; re-seeds when async
// prefill arrives). Backs both "new" (empty initial) and "edit" (prefilled).
//
// DECISION (access gating in the organism): read-denied fields are omitted;
// readable-but-write-denied fields render read-only (so the operator sees the
// value but can't change it) and are excluded from the submitted payload. The
// host can't forget either rule.
//
// DECISION (submit coercion): the form returns values typed as the wire expects
// — json/array/composite/file fields JSON.parse out of their textarea string,
// datetime normalizes to ISO-8601. Numbers/booleans/relations already arrive
// typed from FieldRenderer.

import { type FormEvent, useEffect, useId, useState } from "react"
import {
  canReadField,
  canWriteField,
  type FieldMeta,
} from "@schemaforge/client"
import { useForgeRoles } from "./context"
import { FieldRenderer } from "./field-renderer"

export type EntityFormClasses = {
  form?: string
  row?: string
  label?: string
  field?: string
  actions?: string
}

export type EntityFormProps = {
  /** Candidate fields; read-denied dropped, write-denied shown read-only. */
  fields: FieldMeta[]
  initialValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void
  onCancel?: () => void
  submitting?: boolean
  error?: string | null
  submitLabel?: string
  classes?: EntityFormClasses
}

const JSON_KINDS = new Set<FieldMeta["kind"]>(["json", "array", "composite", "file", "unknown"])

function coerceForSubmit(fields: FieldMeta[], values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    let v = values[f.name]
    if (typeof v === "string") {
      const s = v.trim()
      if (JSON_KINDS.has(f.kind)) {
        if (s === "") {
          v = null
        } else {
          try {
            v = JSON.parse(v)
          } catch {
            // Leave the raw string; the backend validates and reports.
          }
        }
      } else if (f.kind === "datetime" && s !== "") {
        const d = new Date(v)
        if (!Number.isNaN(d.getTime())) v = d.toISOString()
      }
    }
    out[f.name] = v
  }
  return out
}

export function EntityForm({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
  submitLabel = "Save",
  classes,
}: EntityFormProps) {
  const roles = useForgeRoles()
  const formId = useId()
  const readable = fields.filter((f) => canReadField(f, roles))
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {})

  useEffect(() => {
    setValues(initialValues ?? {})
  }, [initialValues])

  function setField(name: string, next: unknown) {
    setValues((prev) => ({ ...prev, [name]: next }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const writable = readable.filter((f) => canWriteField(f, roles))
    onSubmit(coerceForSubmit(writable, values))
  }

  return (
    <form className={classes?.form ?? "sf-form"} onSubmit={handleSubmit}>
      {readable.map((f) => {
        const id = `${formId}-${f.name}`
        const writable = canWriteField(f, roles)
        return (
          <div key={f.name} className={classes?.row ?? "sf-form-row"}>
            <label htmlFor={id} className={classes?.label ?? "sf-form-label"}>
              {f.name}
              {f.required ? <span className="sf-req" aria-hidden="true"> *</span> : null}
            </label>
            <div className={classes?.field ?? "sf-form-field"}>
              <FieldRenderer
                id={id}
                field={f}
                value={values[f.name]}
                onChange={writable ? (next) => setField(f.name, next) : undefined}
                readOnly={!writable}
              />
              {!writable ? <span className="sf-muted sf-mono"> (read-only)</span> : null}
            </div>
          </div>
        )
      })}
      {error ? (
        <p role="alert" className="sf-error">
          {error}
        </p>
      ) : null}
      <div className={classes?.actions ?? "sf-form-actions"}>
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
