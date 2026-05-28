// @schemaforge/client — schema normalization + annotation extraction.
//
// Pure functions, lifted from the generated admin's api-client.ts. These are
// the bit of "SchemaForge IP" every consuming UI needs and none should
// re-implement: raw FieldType enum -> normalized FieldMeta.

import type { FieldMeta, FieldResponse, RawFieldType, SchemaResponse } from "./types"

export function humanizeBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) {
    const v = n / 1024
    return v % 1 === 0 ? `${v} KB` : `${v.toFixed(1)} KB`
  }
  if (n < 1024 * 1024 * 1024) {
    const v = n / 1024 / 1024
    return v % 1 === 0 ? `${v} MB` : `${v.toFixed(1)} MB`
  }
  const v = n / 1024 / 1024 / 1024
  return v % 1 === 0 ? `${v} GB` : `${v.toFixed(2)} GB`
}

function annotationTag(a: unknown): string | undefined {
  if (a && typeof a === "object" && "annotation" in a) {
    const tag = (a as { annotation?: unknown }).annotation
    if (typeof tag === "string") return tag.toLowerCase()
  }
  return undefined
}

export function getDisplayField(annotations: unknown[]): string | undefined {
  for (const a of annotations) {
    if (annotationTag(a) === "display") {
      const field = (a as { field?: unknown }).field
      if (typeof field === "string") return field
    }
  }
  return undefined
}

export function getFieldWidget(annotations: unknown[]): string | undefined {
  for (const a of annotations) {
    if (annotationTag(a) === "widget") {
      const w = (a as { widget_type?: unknown }).widget_type
      if (typeof w === "string") return w
    }
  }
  return undefined
}

export function getFieldFormat(annotations: unknown[]): string | undefined {
  for (const a of annotations) {
    if (annotationTag(a) === "format") {
      const f = (a as { format_type?: unknown }).format_type
      if (typeof f === "string") return f
    }
  }
  return undefined
}

export function getFieldAccess(
  annotations: unknown[],
): { read?: string[]; write?: string[] } | undefined {
  for (const a of annotations) {
    if (annotationTag(a) === "fieldaccess") {
      const rawRead = (a as { read?: unknown }).read
      const rawWrite = (a as { write?: unknown }).write
      const read = Array.isArray(rawRead)
        ? (rawRead.filter((r) => typeof r === "string") as string[])
        : undefined
      const write = Array.isArray(rawWrite)
        ? (rawWrite.filter((r) => typeof r === "string") as string[])
        : undefined
      return { read, write }
    }
  }
  return undefined
}

export function isSystemSchema(schema: SchemaResponse): boolean {
  return (schema.annotations ?? []).some((a) => annotationTag(a) === "system")
}

export function toFieldMeta(f: FieldResponse): FieldMeta {
  const annotations = f.annotations ?? []
  const access = getFieldAccess(annotations)
  const base = {
    name: f.name,
    required: (f.modifiers ?? []).includes("required"),
    widget: getFieldWidget(annotations),
    format: getFieldFormat(annotations),
    accessRead: access?.read,
    accessWrite: access?.write,
  }
  const raw = f.field_type
  switch (raw.type) {
    case "Text":
      return { ...base, kind: "text" }
    case "RichText":
      return { ...base, kind: "rich_text" }
    case "Integer":
      return { ...base, kind: "integer" }
    case "Float":
      return { ...base, kind: "float" }
    case "Boolean":
      return { ...base, kind: "boolean" }
    case "DateTime":
      return { ...base, kind: "datetime" }
    case "Json":
      return { ...base, kind: "json" }
    case "Enum": {
      const variants = Array.isArray(raw.data) ? (raw.data as string[]) : []
      return { ...base, kind: "enum", enumVariants: variants }
    }
    case "Relation": {
      const data = raw.data as { target: string; cardinality: "One" | "Many" } | undefined
      const kind = data?.cardinality === "Many" ? "relation_many" : "relation_one"
      return { ...base, kind, relationTarget: data?.target }
    }
    case "Array": {
      const inner = raw.data as RawFieldType | undefined
      const element = inner
        ? toFieldMeta({ name: `${f.name}[]`, field_type: inner, modifiers: [] })
        : undefined
      return { ...base, kind: "array", arrayElement: element }
    }
    case "Composite": {
      const inner = raw.data as FieldResponse[] | undefined
      return { ...base, kind: "composite", subFields: (inner ?? []).map(toFieldMeta) }
    }
    case "File": {
      const data = raw.data as
        | {
            bucket: string
            max_size_bytes: number
            mime_allowlist: Array<{ kind: "exact" | "family"; value: string }>
            access: "presigned" | "proxied"
          }
        | undefined
      if (!data) return { ...base, kind: "file" }
      const mimeAllowlist = (data.mime_allowlist ?? []).map((m) =>
        m.kind === "family" ? `${m.value}/*` : m.value,
      )
      return {
        ...base,
        kind: "file",
        fileMeta: {
          bucket: data.bucket,
          maxSizeBytes: data.max_size_bytes,
          maxSizeHuman: humanizeBytes(data.max_size_bytes),
          mimeAllowlist,
          access: data.access,
        },
      }
    }
    default:
      return { ...base, kind: "unknown" }
  }
}

// ---------------------------------------------------------------------------
// Role gating (pure) — the @field_access enforcement, host-agnostic.
// ---------------------------------------------------------------------------

export function hasAnyRole(required: readonly string[], held: readonly string[]): boolean {
  if (required.length === 0) return true
  return required.some((r) => held.includes(r))
}

export function canReadField(field: FieldMeta, roles: readonly string[]): boolean {
  if (!field.accessRead || field.accessRead.length === 0) return true
  return hasAnyRole(field.accessRead, roles)
}

export function canWriteField(field: FieldMeta, roles: readonly string[]): boolean {
  if (!canReadField(field, roles)) return false
  if (!field.accessWrite || field.accessWrite.length === 0) return true
  return hasAnyRole(field.accessWrite, roles)
}
