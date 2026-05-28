// @schemaforge/react — FieldValue: widget-aware read-only value MOLECULE.
//
// FieldValue is the one place that interprets a field's `@widget(...)` /
// `@format(...)` / `@enum_colors` and value, then delegates rendering to the
// presentational ATOMS (StatusBadge, Meter, StarRating, …). It owns only the
// schema-aware decisions — enum-color lookup, percent scaling, token humanizing,
// truncation, the formatFieldValue string fallback — never the markup, so the
// atoms stay reusable on their own (a KPI tile, a kanban column header, a form
// in read mode). Pure: (field, value) in, nodes out.
//
// FieldRenderer's read-only path and EntityTable cells both delegate here.

import { type ReactNode } from "react"
import { EMPTY_DISPLAY, formatFieldValue, type FieldMeta } from "@schemaforge/client"
import {
  ColorSwatch,
  CountBadge,
  InlineCode,
  Meter,
  StarRating,
  StatusBadge,
  TagList,
  Thumbnail,
  ValueLink,
} from "./atoms"

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

function toNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function truncateMiddle(text: string, max = 48): string {
  if (text.length <= max) return text
  const half = Math.floor((max - 1) / 2)
  return `${text.slice(0, half)}…${text.slice(-half)}`
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function FieldValue({ field, value }: FieldValueProps): ReactNode {
  if (isEmpty(value)) return EMPTY

  // `@enum_colors` implies a colored status badge even without `@widget`.
  if (field.widget === "status_badge" || (field.kind === "enum" && field.enumColors)) {
    const token = String(value)
    return <StatusBadge label={humanizeToken(token)} color={field.enumColors?.[token]} />
  }

  switch (field.widget) {
    case "count_badge":
      return <CountBadge value={String(value)} />
    case "progress":
    case "slider": {
      const n = toNumber(value)
      if (n === null) return EMPTY
      // A percent-formatted fraction (≤1) scales to a 0–100 bar; the rest are
      // already on a 0–100 scale. The label shows the formatted percent or the
      // raw number.
      if (field.format === "percent") {
        const pct = Math.abs(n) <= 1 ? n * 100 : n
        return <Meter value={pct} max={100} label={formatFieldValue(value, field)} />
      }
      return <Meter value={n} max={100} label={String(n)} />
    }
    case "rating": {
      const n = toNumber(value)
      return n === null ? EMPTY : <StarRating value={n} />
    }
    case "tags": {
      const items = (Array.isArray(value) ? value : [value]).map((v) => String(v)).filter((s) => s !== "")
      return items.length === 0 ? EMPTY : <TagList items={items} />
    }
    case "email":
      return <ValueLink kind="email" value={String(value)} />
    case "phone":
      return <ValueLink kind="phone" value={String(value)} />
    case "url": {
      const text = String(value)
      return (
        <ValueLink kind="url" value={text}>
          {truncateMiddle(text)}
        </ValueLink>
      )
    }
    case "color":
      return <ColorSwatch value={String(value)} />
    case "image":
      return <Thumbnail src={String(value)} />
    case "avatar":
      return <Thumbnail src={String(value)} round />
    case "json":
    case "code":
      return <InlineCode>{truncateMiddle(typeof value === "string" ? value : safeStringify(value), 64)}</InlineCode>
    // markdown / rich_text / file and every other widget render as the shared
    // formatted string (file → filename, dates → localized, arrays → joined).
    default:
      return <>{formatFieldValue(value, field)}</>
  }
}
