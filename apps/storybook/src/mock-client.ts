// A no-network ForgeClient for stories. Returns canned data so components can
// render in isolation without a running schemaforge backend.

import type {
  EntityRow,
  FieldMeta,
  ForgeClient,
  MeResponse,
  SchemaResponse,
  SchemaView,
} from "@schemaforge/client"

export const widgetFields: FieldMeta[] = [
  { name: "name", kind: "text", required: true },
  { name: "price", kind: "float", required: false, format: "currency" },
  { name: "status", kind: "enum", required: true, enumVariants: ["draft", "active", "retired"] },
  { name: "category", kind: "relation_one", required: false, relationTarget: "Category" },
]

export const widgetRows: EntityRow[] = [
  { id: "widget_01hzx", name: "Acme Anvil", price: 49.99, status: "active", category: "category_01a", __permissions: { update: true, delete: true } },
  { id: "widget_02hzy", name: "Rocket Skates", price: 129, status: "draft", category: "category_01b", __permissions: { update: true, delete: false } },
  { id: "widget_03hzz", name: "Giant Magnet", price: null, status: "retired", category: null, __permissions: { update: false, delete: false } },
]

const stub = (name: string): SchemaResponse => ({ id: `schema_${name}`, name, fields: [], annotations: [] })

export function createMockClient(): ForgeClient {
  return {
    async listSchemas() {
      return [stub("Widget"), stub("Category")]
    },
    async describeSchema(name) {
      const view: SchemaView = {
        schema: stub(name),
        fields: name === "Widget" ? widgetFields : [{ name: "label", kind: "text", required: true }],
        displayField: name === "Category" ? "label" : undefined,
      }
      return view
    },
    async listEntities(schema) {
      if (schema === "Category") {
        return {
          rows: [
            { id: "category_01a", label: "Hardware" },
            { id: "category_01b", label: "Footwear" },
          ],
          count: 2,
        }
      }
      return { rows: widgetRows, count: widgetRows.length, permissions: { create: true } }
    },
    async getEntity() {
      return widgetRows[0]
    },
    async createEntity() {
      return widgetRows[0]
    },
    async updateEntity() {
      return widgetRows[0]
    },
    async deleteEntity() {
      /* no-op */
    },
    async me(): Promise<MeResponse> {
      return {
        user_id: "user_demo",
        email: "demo@example.gov",
        display_name: "Demo Operator",
        roles: ["admin"],
        tenant_chain: [],
        active_tenant: null,
        active_tenant_header: "X-Active-Tenant",
      }
    },
  }
}
