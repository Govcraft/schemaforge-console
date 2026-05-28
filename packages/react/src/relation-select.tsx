// @schemaforge/react — RelationSelect: the one data-bound molecule.
//
// Split intentionally: the *data* is the headless `useRelationOptions` hook
// (in hooks.ts); this component is the default presentation over it. A host
// that wants a fancy async combobox can call useRelationOptions and render its
// own — the hook is the reusable part, this is a sane default.

import { useRelationOptions } from "./hooks"

export type RelationSelectProps = {
  targetSchema: string
  value: string | null
  onChange: (id: string | null) => void
  id?: string
  className?: string
}

export function RelationSelect({ targetSchema, value, onChange, id, className }: RelationSelectProps) {
  const { data: options, isLoading } = useRelationOptions(targetSchema)
  return (
    <select
      id={id}
      className={className ?? "sf-select"}
      value={value ?? ""}
      disabled={isLoading}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{isLoading ? "Loading…" : "— none —"}</option>
      {(options ?? []).map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
