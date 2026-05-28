// @schemaforge/client — display formatters (pure).
//
// One place that turns a raw field value into a human display string, honoring
// @format(...) first, then @widget, then the field's native kind. Lifted from
// the generated admin's formatters so the console renders dates, arrays, money,
// and booleans the way operators expect — not as ISO strings and raw JSON.
// Pure and dependency-free; safe to import anywhere.

import type { FieldMeta } from "./types"

/** The hints a formatter needs — a structural subset of FieldMeta, so callers
 *  can pass a whole FieldMeta or a lightweight literal. */
export type DisplayHints = Pick<FieldMeta, "kind" | "widget" | "format">

export const EMPTY_DISPLAY = "—"

const dateFmt = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" })
const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})
const relativeFmt =
  typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl
    ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
    : null

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value !== "string" || value === "") return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

function formatRelative(value: unknown): string {
  const d = parseDate(value)
  if (!d) return EMPTY_DISPLAY
  if (!relativeFmt) return dateTimeFmt.format(d)
  const diffMs = d.getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  if (abs < minute) return relativeFmt.format(Math.round(diffMs / 1000), "second")
  if (abs < hour) return relativeFmt.format(Math.round(diffMs / minute), "minute")
  if (abs < day) return relativeFmt.format(Math.round(diffMs / hour), "hour")
  if (abs < week) return relativeFmt.format(Math.round(diffMs / day), "day")
  if (abs < month) return relativeFmt.format(Math.round(diffMs / week), "week")
  if (abs < year) return relativeFmt.format(Math.round(diffMs / month), "month")
  return relativeFmt.format(Math.round(diffMs / year), "year")
}

function formatBytes(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return EMPTY_DISPLAY
  const units = ["B", "KB", "MB", "GB", "TB", "PB"]
  let v = Math.abs(n)
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i += 1
  }
  return `${n < 0 ? "-" : ""}${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDuration(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return EMPTY_DISPLAY
  const total = Math.round(Math.abs(n))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (x: number) => x.toString().padStart(2, "0")
  return h > 0 ? `${n < 0 ? "-" : ""}${h}:${pad(m)}:${pad(s)}` : `${n < 0 ? "-" : ""}${m}:${pad(s)}`
}

function formatCurrency(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return EMPTY_DISPLAY
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n)
}

function formatPercent(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return EMPTY_DISPLAY
  // Values in [-1, 1] are treated as fractions; others as pre-scaled percents.
  const scaled = Math.abs(n) <= 1 ? n : n / 100
  return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 2 }).format(scaled)
}

function formatFile(value: unknown): string {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    const key = typeof obj.key === "string" ? obj.key : null
    if (key) {
      const idx = key.lastIndexOf("/")
      return idx >= 0 ? key.slice(idx + 1) : key
    }
    if (typeof obj.status === "string") return obj.status
  }
  return EMPTY_DISPLAY
}

/**
 * Produce a plain display string for a field value. Returns EMPTY_DISPLAY ("—")
 * for nullish/empty values. @format wins, then @widget, then native kind.
 */
export function formatFieldValue(value: unknown, hints: DisplayHints): string {
  if (value === null || value === undefined || value === "") return EMPTY_DISPLAY

  // file fields are objects, not scalars — handle before the array/object guards.
  if (hints.kind === "file") return formatFile(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return EMPTY_DISPLAY
    return value.map((v) => String(v)).join(", ")
  }

  // 1. Explicit @format wins.
  switch (hints.format) {
    case "currency":
      return formatCurrency(value)
    case "percent":
      return formatPercent(value)
    case "bytes":
      return formatBytes(value)
    case "duration":
      return formatDuration(value)
    case "relative":
      return formatRelative(value)
    case "date": {
      const d = parseDate(value)
      return d ? dateFmt.format(d) : String(value)
    }
    case "datetime": {
      const d = parseDate(value)
      return d ? dateTimeFmt.format(d) : String(value)
    }
  }

  // 2. Native kind fallback.
  switch (hints.kind) {
    case "boolean":
      return value ? "Yes" : "No"
    case "datetime": {
      const d = parseDate(value)
      return d ? dateTimeFmt.format(d) : String(value)
    }
    case "integer":
    case "float":
      return new Intl.NumberFormat().format(Number(value))
    case "json": {
      if (typeof value === "string") return value
      try {
        return JSON.stringify(value)
      } catch {
        return String(value)
      }
    }
    default:
      return String(value)
  }
}
