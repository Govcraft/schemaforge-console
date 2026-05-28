// @schemaforge/react — ValueLink atom.
//
// A typed value link: email → mailto:, phone → tel:, url → external link. The
// caller may pass `children` to show a different (e.g. truncated) label than the
// raw value while keeping the correct href.

import { type ReactNode } from "react"

export type ValueLinkKind = "email" | "phone" | "url"

export type ValueLinkProps = {
  kind: ValueLinkKind
  value: string
  children?: ReactNode
}

export function ValueLink({ kind, value, children }: ValueLinkProps) {
  const href = kind === "email" ? `mailto:${value}` : kind === "phone" ? `tel:${value}` : value
  const external = kind === "url"
  return (
    <a
      className="sf-link"
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {children ?? value}
    </a>
  )
}
