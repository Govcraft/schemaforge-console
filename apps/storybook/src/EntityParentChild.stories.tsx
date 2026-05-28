import type { Meta, StoryObj } from "@storybook/react"
import type { EntityRow, FieldMeta } from "@schemaforge/client"
import { ChildCollectionSection, EntityForm, EntityParentChild, SpecSheet } from "@schemaforge/react"

// An illustrative master-detail: an Order with LineItem and Shipment children.
// Each child schema has a relation_one("order") that findChildRelations would
// discover; here we drive the presentational organism with canned data.

const orderFields: FieldMeta[] = [
  { name: "reference", kind: "text", required: true },
  { name: "customer", kind: "text", required: true },
  { name: "status", kind: "enum", required: true, enumVariants: ["open", "paid", "shipped"] },
  { name: "total", kind: "float", required: false, format: "currency" },
]
const orderData: EntityRow = {
  id: "order_01hzx",
  reference: "PO-4471",
  customer: "Wile E. Coyote",
  status: "paid",
  total: 308.97,
}

const lineItemFields: FieldMeta[] = [
  { name: "sku", kind: "text", required: true },
  { name: "qty", kind: "integer", required: true },
  { name: "unit_price", kind: "float", required: true, format: "currency" },
]
const lineItemRows: EntityRow[] = [
  { id: "li_01", sku: "ANV-001", qty: 2, unit_price: 49.99, __permissions: { update: true, delete: true } },
  { id: "li_02", sku: "RKT-204", qty: 1, unit_price: 129, __permissions: { update: true, delete: false } },
  { id: "li_03", sku: "MAG-880", qty: 3, unit_price: 26.33, __permissions: { update: false, delete: false } },
]

const shipmentFields: FieldMeta[] = [
  { name: "carrier", kind: "text", required: true },
  { name: "tracking", kind: "text", required: false },
  { name: "shipped_at", kind: "datetime", required: false },
]
const shipmentRows: EntityRow[] = [
  { id: "ship_01", carrier: "ACME Freight", tracking: "1Z9990", shipped_at: "2026-05-20T14:00:00Z", __permissions: { update: true, delete: false } },
]

const meta: Meta<typeof EntityParentChild> = {
  title: "Organisms/EntityParentChild",
  component: EntityParentChild,
}
export default meta
type Story = StoryObj<typeof EntityParentChild>

const parentArgs = {
  parentSchema: "Order",
  parentId: orderData.id,
  parent: <SpecSheet fields={orderFields} data={orderData} />,
}

// The same shell, but the parent slot holds an EntityForm instead of a
// SpecSheet — the child collections sit beneath the editable parent.
const childSections = (
  <>
    <ChildCollectionSection
      schema="LineItem"
      fields={lineItemFields}
      rows={lineItemRows}
      permissions={{ create: true }}
      detailHref={(id) => `/LineItem/${id}`}
      createHref="/LineItem/new?order=order_01hzx"
      renderRowActions={(_row, perms) => (perms?.update ? <a href="#edit">Edit</a> : null)}
    />
    <ChildCollectionSection
      schema="Shipment"
      fields={shipmentFields}
      rows={shipmentRows}
      permissions={{ create: true }}
      detailHref={(id) => `/Shipment/${id}`}
      createHref="/Shipment/new?order=order_01hzx"
    />
  </>
)

export const Default: Story = {
  args: parentArgs,
  render: (args) => (
    <EntityParentChild {...args}>
      <ChildCollectionSection
        schema="LineItem"
        fields={lineItemFields}
        rows={lineItemRows}
        permissions={{ create: true }}
        detailHref={(id) => `/LineItem/${id}`}
        createHref="/LineItem/new?order=order_01hzx"
        renderRowActions={(_row, perms) => (perms?.update ? <a href="#edit">Edit</a> : null)}
      />
      <ChildCollectionSection
        schema="Shipment"
        fields={shipmentFields}
        rows={shipmentRows}
        permissions={{ create: true }}
        detailHref={(id) => `/Shipment/${id}`}
        createHref="/Shipment/new?order=order_01hzx"
      />
    </EntityParentChild>
  ),
}

export const EmptyChild: Story = {
  args: parentArgs,
  render: (args) => (
    <EntityParentChild {...args}>
      <ChildCollectionSection
        schema="LineItem"
        fields={lineItemFields}
        rows={[]}
        permissions={{ create: true }}
        detailHref={(id) => `/LineItem/${id}`}
        createHref="/LineItem/new?order=order_01hzx"
      />
    </EntityParentChild>
  ),
}

export const LoadingChild: Story = {
  args: parentArgs,
  render: (args) => (
    <EntityParentChild {...args}>
      <ChildCollectionSection schema="LineItem" fields={lineItemFields} rows={[]} loading detailHref={(id) => `/LineItem/${id}`} />
    </EntityParentChild>
  ),
}

export const ChildError: Story = {
  args: parentArgs,
  render: (args) => (
    <EntityParentChild {...args}>
      <ChildCollectionSection
        schema="LineItem"
        fields={lineItemFields}
        rows={[]}
        error="Failed to load related records."
        detailHref={(id) => `/LineItem/${id}`}
      />
    </EntityParentChild>
  ),
}

// The parent slot holds an EntityForm: edit the parent in place with its child
// collections still visible below (the PayloadCMS master-detail edit pattern).
export const EditingParent: Story = {
  args: {
    ...parentArgs,
    detailsLabel: "Edit",
    parent: (
      <EntityForm
        fields={orderFields}
        initialValues={orderData}
        submitLabel="Save"
        onSubmit={(values) => console.log("save order", values)}
        onCancel={() => console.log("cancel")}
      />
    ),
  },
  render: (args) => <EntityParentChild {...args}>{childSections}</EntityParentChild>,
}

// No schema-level create permission → the "Add" affordance is withheld.
export const NoCreatePermission: Story = {
  args: parentArgs,
  render: (args) => (
    <EntityParentChild {...args}>
      <ChildCollectionSection
        schema="LineItem"
        fields={lineItemFields}
        rows={lineItemRows}
        permissions={{ create: false }}
        detailHref={(id) => `/LineItem/${id}`}
        createHref="/LineItem/new?order=order_01hzx"
      />
    </EntityParentChild>
  ),
}
