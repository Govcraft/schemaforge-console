// @schemaforge/react — presentational atoms.
//
// The lowest layer of the component hierarchy: single-purpose, FieldMeta-agnostic
// primitives that mirror the DSL's @widget vocabulary. Molecules (FieldValue) and
// organisms (EntityTable, future KanbanBoard, KPI tiles) compose these rather
// than re-implementing badges/bars/chips inline.

export * from "./status-badge"
export * from "./count-badge"
export * from "./meter"
export * from "./star-rating"
export * from "./tag-list"
export * from "./value-link"
export * from "./color-swatch"
export * from "./thumbnail"
export * from "./inline-code"
