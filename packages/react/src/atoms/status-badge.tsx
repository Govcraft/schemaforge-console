// @schemaforge/react — StatusBadge atom.
//
// A pill badge tinted by a semantic @enum_colors token. Presentational and
// generic: it takes a label + color, not a FieldMeta, so molecules (FieldValue),
// kanban column headers, KPI tiles, and forms can all reuse it directly.

import { type ReactNode } from "react"
import { type EnumColor } from "@schemaforge/client"

export type StatusBadgeProps = {
  label: ReactNode
  /** Semantic color token (defaults to neutral). */
  color?: EnumColor
  /** Native tooltip (e.g. the full value when the label is truncated). */
  title?: string
}

export function StatusBadge({ label, color = "neutral", title }: StatusBadgeProps) {
  return (
    <span className={`sf-badge sf-badge--${color}`} title={title}>
      {label}
    </span>
  )
}
