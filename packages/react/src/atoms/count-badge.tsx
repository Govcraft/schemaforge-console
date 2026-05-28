// @schemaforge/react — CountBadge atom.
//
// A compact monospace count pill (@widget("count_badge")). Reusable wherever a
// small numeric badge belongs — story points, version numbers, unread counts.

import { type ReactNode } from "react"

export type CountBadgeProps = {
  value: ReactNode
}

export function CountBadge({ value }: CountBadgeProps) {
  return <span className="sf-badge sf-badge--neutral sf-badge--count">{value}</span>
}
