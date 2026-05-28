// @schemaforge/react — InlineCode atom.
//
// Monospace inline code chip (@widget("code") / inline @widget("json")). The
// caller is responsible for stringifying/truncating the content it passes.

import { type ReactNode } from "react"

export type InlineCodeProps = {
  children: ReactNode
}

export function InlineCode({ children }: InlineCodeProps) {
  return <code className="sf-code">{children}</code>
}
