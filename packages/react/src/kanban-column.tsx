// @schemaforge/react — KanbanColumn: one labeled column MOLECULE.
//
// A header (the column's StatusBadge + a CountBadge of its size) over a
// vertical, scrollable stack of cards. Generic and entity-agnostic: it takes a
// label, color, count and children, so it works for a kanban column, a simple
// queue, or any "labeled list of things". The KanbanBoard organism renders one
// per enum variant; the board owns grouping, the column owns presentation.

import { type ReactNode } from "react"
import { type EnumColor } from "@schemaforge/client"
import { CountBadge, StatusBadge } from "./atoms"

export type KanbanColumnClasses = {
  column?: string
  head?: string
  body?: string
  empty?: string
}

export type KanbanColumnProps = {
  /** Column heading (typically the humanized enum variant). */
  label: ReactNode
  /** Semantic color for the heading badge (defaults to neutral). */
  color?: EnumColor
  /** Number of items in the column (rendered as a count badge). */
  count: number
  /** The cards (or any content) for this column. */
  children?: ReactNode
  /** Placeholder shown in the body when the column is empty. */
  emptyLabel?: string
  classes?: KanbanColumnClasses
}

export function KanbanColumn({
  label,
  color = "neutral",
  count,
  children,
  emptyLabel = "Empty",
  classes,
}: KanbanColumnProps) {
  return (
    <section className={classes?.column ?? "sf-kanban-col"}>
      <header className={classes?.head ?? "sf-kanban-col-head"}>
        <StatusBadge label={label} color={color} />
        <CountBadge
          value={
            <>
              {count}
              <span className="sf-sr-only"> items</span>
            </>
          }
        />
      </header>
      <div className={classes?.body ?? "sf-kanban-col-body"}>
        {count === 0 ? (
          <p className={classes?.empty ?? "sf-kanban-empty"}>{emptyLabel}</p>
        ) : (
          children
        )}
      </div>
    </section>
  )
}
