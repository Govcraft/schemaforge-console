// @schemaforge/react — Meter atom.
//
// A horizontal progress meter (@widget("progress") / @widget("slider")). Generic:
// takes a value + max + optional display label, so it serves bounded scores,
// percentages, and KPI gauges alike. The fill width is clamped to [0, 100]%.

import { type ReactNode } from "react"

export type MeterProps = {
  value: number
  /** Upper bound of the scale (defaults to 100). */
  max?: number
  /** Text shown beside the bar and used as the accessible name. Defaults to the
   *  rounded percentage. */
  label?: string
  children?: ReactNode
}

export function Meter({ value, max = 100, label }: MeterProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  const text = label ?? `${Math.round(pct)}%`
  return (
    <span className="sf-meter" role="img" aria-label={text}>
      <span className="sf-meter-track">
        <span className="sf-meter-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="sf-meter-label">{text}</span>
    </span>
  )
}
