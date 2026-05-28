// @schemaforge/client — wire shapes + normalized view model.
//
// Lifted verbatim (shapes) from the generated admin's api-client.ts so this is
// an *extraction*, not a redesign. Nothing here imports React, a router, or a
// query library — that absence is the whole point of the package boundary.

// ---------------------------------------------------------------------------
// Raw wire shapes (mirror schema-forge-acton::routes::{schemas,entities})
// ---------------------------------------------------------------------------

export type RawFieldType = { type: string; data?: unknown }

export type FieldResponse = {
  name: string
  field_type: RawFieldType
  modifiers: string[]
  annotations?: unknown[]
}

export type SchemaPermissions = { create: boolean }
export type EntityPermissions = { update: boolean; delete: boolean }

export type SchemaResponse = {
  id: string
  name: string
  fields: FieldResponse[]
  annotations: unknown[]
  permissions?: SchemaPermissions
}

export type ListSchemasResponse = { schemas: SchemaResponse[]; count: number }

export type EntityEnvelope = {
  id: string
  schema: string
  fields: Record<string, unknown>
  permissions?: EntityPermissions
}

export type ListEntitiesEnvelope = {
  entities: EntityEnvelope[]
  count: number
  total_count?: number
  permissions?: SchemaPermissions
}

// ---------------------------------------------------------------------------
// Normalized view model (the contract every UI component consumes)
// ---------------------------------------------------------------------------

export type FieldKind =
  | "text"
  | "rich_text"
  | "integer"
  | "float"
  | "boolean"
  | "datetime"
  | "enum"
  | "json"
  | "relation_one"
  | "relation_many"
  | "array"
  | "composite"
  | "file"
  | "unknown"

export type FileMeta = {
  bucket: string
  maxSizeBytes: number
  maxSizeHuman: string
  mimeAllowlist: string[]
  access: "presigned" | "proxied"
}

/** `@list(...)` rendering hint: `primary` = headline cell, `column` = force
 *  inclusion, `hidden` = suppress an otherwise-shown field. */
export type ListHint = "primary" | "column" | "hidden"

/** Closed `@enum_colors` palette — mirrors `EnumColor` in schema-forge-core.
 *  Maps each token to a semantic badge color. */
export type EnumColor =
  | "neutral"
  | "gray"
  | "red"
  | "amber"
  | "green"
  | "blue"
  | "purple"
  | "violet"
  | "teal"
  | "rose"

export type FieldMeta = {
  name: string
  kind: FieldKind
  required: boolean
  enumVariants?: string[]
  relationTarget?: string
  arrayElement?: FieldMeta
  subFields?: FieldMeta[]
  fileMeta?: FileMeta
  widget?: string
  format?: string
  accessRead?: string[]
  accessWrite?: string[]
  /** `@kanban_column` — this enum field is the kanban grouping column. */
  kanbanColumn?: boolean
  /** `@list(primary|column|hidden)` — list-view rendering hint. */
  listHint?: ListHint
  /** `@enum_colors` — maps each enum variant to a semantic badge color. */
  enumColors?: Record<string, EnumColor>
}

/** A flattened entity row; `__permissions` carries the server's Cedar decision. */
export type EntityRow = Record<string, unknown> & {
  id: string
  __permissions?: EntityPermissions
}

export type ListEntitiesParams = {
  limit?: number
  offset?: number
  sort?: string
  filters?: Record<string, string>
}

export type ListEntitiesResult = {
  rows: EntityRow[]
  count: number
  permissions?: SchemaPermissions
}

/** `@dashboard(...)` schema-level config. `layout: "kanban"` makes a board the
 *  primary list view; `groupBy` names the column field (else the @kanban_column
 *  field is used). */
export type DashboardConfig = {
  widgets: string[]
  layout?: string
  groupBy?: string
  sortDefault?: string
}

export type SchemaView = {
  schema: SchemaResponse
  fields: FieldMeta[]
  displayField?: string
  dashboard?: DashboardConfig
}

// ---------------------------------------------------------------------------
// Principal / tenancy (GET /auth/me) — needed by both consoles for chrome.
// ---------------------------------------------------------------------------

export type TenantRef = { schema: string; entity_id: string }
export type ActiveTenant = { tenant_type: string; tenant_id: string }
export type MeResponse = {
  user_id: string
  email: string
  display_name: string | null
  roles: string[]
  tenant_chain: TenantRef[]
  active_tenant: ActiveTenant | null
  active_tenant_header: string
}
