// @schemaforge/react — FieldValue: widget-aware read-only value renderer.
//
// One presentational component that turns a field value into the rich display
// its `@widget(...)` implies — a colored status badge (honoring `@enum_colors`),
// a progress/slider bar, a star rating, tag chips, mail/tel/external links, a
// color swatch, an image/avatar thumbnail, mono code/JSON — falling back to the
// shared `formatFieldValue` string for everything else (dates, money, arrays,
// booleans). Pure: (field, value) in, nodes out. No data fetch, no hooks.
//
// This is the single surface every read-only context renders through —
// FieldRenderer's read-only path and EntityTable cells both delegate here — so
// widget styling is defined once and showcased once (Storybook).

import { type ReactNode } from "react"
import { EMPTY_DISPLAY, formatFieldValue, type EnumColor, type FieldMeta } from "@schemaforge/client"

export type FieldValueProps = {
  field: FieldMeta
  value: unknown
}

const EMPTY = <span className="sf-muted">{EMPTY_DISPLAY}</span>

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ""
}

/** `closed_won` → `Closed Won` — humanize an enum token for badge display. */
function humanizeToken(token: string): string {
  return token
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function StatusBadge({ field, value }: { field: FieldMeta; value: string }): ReactNode {
  const color: EnumColor = field.enumColors?.[value] ?? "neutral"
  return <span className={`sf-badge sf-badge--${color}`}>{humanizeToken(value)}</span>
}

function CountBadge({ value }: { value: unknown }): ReactNode {
  return <span className="sf-badge sf-badge--neutral sf-badge--count">{String(value)}</span>
}

function toNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function ProgressBar({ field, value }: { field: FieldMeta; value: unknown }): ReactNode {
  const n = toNumber(value)
  if (n === null) return EMPTY
  // A percent-formatted fraction (≤1) scales to 0–100; everything else is
  // already on a 0–100 scale (the demo's progress/slider fields are bounded so).
  const raw = field.format === "percent" && Math.abs(n) <= 1 ? n * 100 : n
  const pct = Math.max(0, Math.min(100, raw))
  const label = field.format === "percent" ? formatFieldValue(value, field) : String(n)
  return (
    <span className="sf-meter" role="img" aria-label={`${label}`}>
      <span className="sf-meter-track">
        <span className="sf-meter-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="sf-meter-label">{label}</span>
    </span>
  )
}

const STAR_MAX = 5

function Rating({ value }: { value: unknown }): ReactNode {
  const n = toNumber(value)
  if (n === null) return EMPTY
  const filled = Math.max(0, Math.min(STAR_MAX, Math.round(n)))
  return (
    <span className="sf-stars" role="img" aria-label={`${filled} of ${STAR_MAX}`}>
      {Array.from({ length: STAR_MAX }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < filled ? "sf-star sf-star--on" : "sf-star"}>
          ★
        </span>
      ))}
    </span>
  )
}

function Tags({ value }: { value: unknown }): ReactNode {
  const items = Array.isArray(value) ? value : [value]
  const labels = items.map((v) => String(v)).filter((s) => s !== "")
  if (labels.length === 0) return EMPTY
  return (
    <span className="sf-chips">
      {labels.map((label, i) => (
        <span key={`${label}-${i}`} className="sf-chip">
          {label}
        </span>
      ))}
    </span>
  )
}

function truncateMiddle(text: string, max = 48): string {
  if (text.length <= max) return text
  const half = Math.floor((max - 1) / 2)
  return `${text.slice(0, half)}…${text.slice(-half)}`
}

function LinkValue({ value, kind }: { value: unknown; kind: "email" | "phone" | "url" }): ReactNode {
  const text = String(value)
  const href = kind === "email" ? `mailto:${text}` : kind === "phone" ? `tel:${text}` : text
  const external = kind === "url"
  return (
    <a
      className="sf-link"
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {external ? truncateMiddle(text) : text}
    </a>
  )
}

function ColorSwatch({ value }: { value: unknown }): ReactNode {
  const hex = String(value)
  return (
    <span className="sf-swatch-wrap">
      <span className="sf-swatch" style={{ background: hex }} aria-hidden="true" />
      <code className="sf-mono">{hex}</code>
    </span>
  )
}

function ImageThumb({ value, round }: { value: unknown; round: boolean }): ReactNode {
  const src = String(value)
  return <img className={round ? "sf-thumb sf-thumb--round" : "sf-thumb"} src={src} alt="" loading="lazy" />
}

function CodeValue({ value }: { value: unknown }): ReactNode {
  const text = typeof value === "string" ? value : safeStringify(value)
  return <code className="sf-code">{truncateMiddle(text, 64)}</code>
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/**
 * Render a field's value the way its `@widget` implies, falling back to the
 * shared string formatter. Returns the em-dash for empty values.
 */
export function FieldValue({ field, value }: FieldValueProps): ReactNode {
  if (isEmpty(value)) return EMPTY

  // `@enum_colors` implies a colored status badge even without `@widget`.
  if (field.widget === "status_badge" || (field.kind === "enum" && field.enumColors)) {
    return <StatusBadge field={field} value={String(value)} />
  }

  switch (field.widget) {
    case "count_badge":
      return <CountBadge value={value} />
    case "progress":
    case "slider":
      return <ProgressBar field={field} value={value} />
    case "rating":
      return <Rating value={value} />
    case "tags":
      return <Tags value={value} />
    case "email":
      return <LinkValue value={value} kind="email" />
    case "phone":
      return <LinkValue value={value} kind="phone" />
    case "url":
      return <LinkValue value={value} kind="url" />
    case "color":
      return <ColorSwatch value={value} />
    case "image":
      return <ImageThumb value={value} round={false} />
    case "avatar":
      return <ImageThumb value={value} round />
    case "json":
    case "code":
      return <CodeValue value={value} />
    // markdown / rich_text / file and every other widget render as the shared
    // formatted string (file → filename, dates → localized, arrays → joined).
    default:
      return <>{formatFieldValue(value, field)}</>
  }
}
