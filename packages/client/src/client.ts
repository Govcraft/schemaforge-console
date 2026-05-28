// @schemaforge/client — the HTTP client, framework-agnostic and injectable.
//
// DECISION (auth/tenant injection): the current admin api-client reaches into
// `sessionStorage` directly and hard-codes the refresh-redirect. That cannot
// be reused by a customer app that authenticates with cookies, next-auth, or
// an SSR session. So the client takes its token + active-tenant from injected
// providers and surfaces auth failure as a typed error the *host* handles.
//
// The admin console wires sessionStorage providers; a Next.js app wires its
// own. Same client, same wire logic, different host integration.

import {
  getDisplayField,
  toFieldMeta,
} from "./field-meta"
import type {
  EntityEnvelope,
  EntityRow,
  ListEntitiesEnvelope,
  ListEntitiesParams,
  ListEntitiesResult,
  ListSchemasResponse,
  MeResponse,
  SchemaResponse,
  SchemaView,
} from "./types"

/** Synchronous accessors the host provides. Kept sync so the client can build
 *  headers without awaiting; the host caches its own session state. */
export type ForgeClientConfig = {
  /** Base URL of the schemaforge server, e.g. "" (same-origin) or "https://api…". */
  baseUrl?: string
  /** Current bearer token, or null when signed out. */
  getToken: () => string | null
  /** Current `<type>:<id>` active-tenant header value, or null. */
  getActiveTenant?: () => string | null
  /** Invoked once on a 401 the client could not satisfy. The host decides
   *  whether to refresh-and-retry, redirect to login, etc. Returning a fresh
   *  token tells the client to retry once; returning null means give up. */
  onUnauthorized?: () => Promise<string | null>
}

const FORGE_PREFIX = "/api/v1/forge"
export const ACTIVE_TENANT_HEADER = "X-Active-Tenant"

export class ForgeApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Forge API ${status}: ${body}`)
    this.name = "ForgeApiError"
  }
}
export class ForgeUnauthorizedError extends Error {
  constructor() {
    super("Forge API 401: unauthorized")
    this.name = "ForgeUnauthorizedError"
  }
}

export interface ForgeClient {
  listSchemas(): Promise<SchemaResponse[]>
  describeSchema(name: string): Promise<SchemaView>
  listEntities(schema: string, params?: ListEntitiesParams): Promise<ListEntitiesResult>
  getEntity(schema: string, id: string): Promise<EntityRow>
  createEntity(schema: string, body: Record<string, unknown>): Promise<EntityRow>
  updateEntity(schema: string, id: string, body: Record<string, unknown>): Promise<EntityRow>
  deleteEntity(schema: string, id: string): Promise<void>
  me(): Promise<MeResponse>
}

export function createForgeClient(config: ForgeClientConfig): ForgeClient {
  const base = config.baseUrl ?? ""

  function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...extra }
    const token = config.getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
    const tenant = config.getActiveTenant?.()
    if (tenant && !(ACTIVE_TENANT_HEADER in headers)) headers[ACTIVE_TENANT_HEADER] = tenant
    return headers
  }

  async function send(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${base}${path}`, { ...init, headers: buildHeaders(init?.headers as Record<string, string>) })
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let res = await send(path, init)
    if (res.status === 401 && config.onUnauthorized) {
      const refreshed = await config.onUnauthorized()
      if (refreshed) res = await send(path, init)
    }
    if (res.status === 401) throw new ForgeUnauthorizedError()
    if (!res.ok) throw new ForgeApiError(res.status, await res.text())
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }

  function flatten(env: EntityEnvelope): EntityRow {
    const flat: EntityRow = { id: env.id, ...env.fields } as EntityRow
    if (env.permissions !== undefined) flat.__permissions = env.permissions
    return flat
  }
  function wrap(body: Record<string, unknown>): { fields: Record<string, unknown> } {
    const { id: _id, ...fields } = body
    void _id
    return { fields }
  }

  return {
    async listSchemas() {
      const res = await request<ListSchemasResponse>(`${FORGE_PREFIX}/schemas`)
      return res.schemas
    },
    async describeSchema(name) {
      const schema = await request<SchemaResponse>(
        `${FORGE_PREFIX}/schemas/${encodeURIComponent(name)}`,
      )
      return { schema, fields: schema.fields.map(toFieldMeta), displayField: getDisplayField(schema.annotations) }
    },
    async listEntities(schema, params = { limit: 50 }) {
      const qs = new URLSearchParams()
      if (params.limit !== undefined) qs.set("limit", String(params.limit))
      if (params.offset !== undefined) qs.set("offset", String(params.offset))
      if (params.sort) qs.set("sort", params.sort)
      for (const [k, v] of Object.entries(params.filters ?? {})) if (v !== "") qs.set(k, v)
      const suffix = qs.toString() ? `?${qs}` : ""
      const env = await request<ListEntitiesEnvelope>(
        `${FORGE_PREFIX}/schemas/${encodeURIComponent(schema)}/entities${suffix}`,
      )
      return { rows: env.entities.map(flatten), count: env.total_count ?? env.count, permissions: env.permissions }
    },
    async getEntity(schema, id) {
      return flatten(
        await request<EntityEnvelope>(
          `${FORGE_PREFIX}/schemas/${encodeURIComponent(schema)}/entities/${encodeURIComponent(id)}`,
        ),
      )
    },
    async createEntity(schema, body) {
      return flatten(
        await request<EntityEnvelope>(`${FORGE_PREFIX}/schemas/${encodeURIComponent(schema)}/entities`, {
          method: "POST",
          body: JSON.stringify(wrap(body)),
        }),
      )
    },
    async updateEntity(schema, id, body) {
      return flatten(
        await request<EntityEnvelope>(
          `${FORGE_PREFIX}/schemas/${encodeURIComponent(schema)}/entities/${encodeURIComponent(id)}`,
          { method: "PATCH", body: JSON.stringify(wrap(body)) },
        ),
      )
    },
    async deleteEntity(schema, id) {
      await request<void>(
        `${FORGE_PREFIX}/schemas/${encodeURIComponent(schema)}/entities/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      )
    },
    async me() {
      return request<MeResponse>(`${FORGE_PREFIX}/auth/me`)
    },
  }
}
