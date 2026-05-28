// @schemaforge/react — TagList atom.
//
// A wrapping row of chips (@widget("tags") / any text[]). Generic: takes the
// items to render as chips. Reusable for labels, skills, categories, etc.

import { type ReactNode } from "react"

export type TagListProps = {
  items: ReactNode[]
}

export function TagList({ items }: TagListProps) {
  return (
    <span className="sf-chips">
      {items.map((item, i) => (
        <span key={i} className="sf-chip">
          {item}
        </span>
      ))}
    </span>
  )
}
