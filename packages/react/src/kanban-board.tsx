// @schemaforge/react — KanbanBoard: presentational organism.
//
// The rendering surface the DSL's `@kanban_column` + `@dashboard(layout:"kanban")`
// imply. PURE presentational, like EntityTable: takes fields + rows + a detail
// href builder, no data fetch / react-query / router import (links come from
// context). It composes the KanbanColumn molecule (one per enum variant, headed
// by a StatusBadge tinted from `@enum_colors`) and the EntityCard molecule
// (one per row). Grouping and card-field curation are delegated to pure helpers
// in @schemaforge/client (kanbanGroups, listColumns) so the organism is just
// wiring.

import {
  findKanbanField,
  kanbanGroups,
  listColumns,
  type EntityRow,
  type FieldMeta,
} from "@schemaforge/client"
import { EntityCard, type EntityCardClasses } from "./entity-card"
import { KanbanColumn, type KanbanColumnClasses } from "./kanban-column"

const DEFAULT_CARD_FIELD_LIMIT = 3

export type KanbanBoardClasses = {
  board?: string
  column?: KanbanColumnClasses
  card?: EntityCardClasses
}

export type KanbanBoardProps = {
  schema: string
  /** The schema's full field set; the board picks the grouping column, the
   *  card headline, and the card summary fields out of it. */
  fields: FieldMeta[]
  rows: EntityRow[]
  /** Build the detail-page href for a row id (used as each card's headline link). */
  detailHref: (id: string) => string
  /** The schema's `@display` field — the card headline and the curation seed. */
  displayField?: string
  /** Field to group columns by. Defaults to the `@kanban_column` field (else the
   *  first enum field). */
  columnField?: FieldMeta
  /** Max summary fields per card (default 3). */
  cardFieldLimit?: number
  classes?: KanbanBoardClasses
}

/** The headline field: the @display field if present, else the first text
 *  field, else the first field. */
function pickTitleField(fields: FieldMeta[], displayField?: string): FieldMeta | undefined {
  if (displayField) {
    const named = fields.find((f) => f.name === displayField)
    if (named) return named
  }
  return fields.find((f) => f.kind === "text") ?? fields[0]
}

export function KanbanBoard({
  schema,
  fields,
  rows,
  detailHref,
  displayField,
  columnField,
  cardFieldLimit = DEFAULT_CARD_FIELD_LIMIT,
  classes,
}: KanbanBoardProps) {
  const column = columnField ?? findKanbanField(fields)
  const titleField = pickTitleField(fields, displayField)

  // A board needs both a column to group by and a headline to label cards.
  if (!column || !titleField) {
    return (
      <div className="sf-empty">
        {schema} has no enum field to use as a kanban column.
      </div>
    )
  }

  // Card summary fields: reuse the list-column curation (drops heavy/media kinds
  // and caps), then remove the headline and grouping fields (already shown) and
  // cap to the per-card limit.
  const cardFields = listColumns(fields, { displayField })
    .map((c) => c.field)
    .filter((f) => f.name !== titleField.name && f.name !== column.name)
    .slice(0, cardFieldLimit)

  const groups = kanbanGroups(rows, column)

  return (
    <div className={classes?.board ?? "sf-kanban"}>
      {groups.map((g) => (
        <KanbanColumn
          key={g.key || "__uncategorized"}
          label={g.label}
          color={g.color}
          count={g.rows.length}
          classes={classes?.column}
        >
          {g.rows.map((row) => (
            <EntityCard
              key={row.id}
              row={row}
              titleField={titleField}
              fields={cardFields}
              href={detailHref(row.id)}
              classes={classes?.card}
            />
          ))}
        </KanbanColumn>
      ))}
    </div>
  )
}
