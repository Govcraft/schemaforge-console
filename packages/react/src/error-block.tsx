// @schemaforge/react — ErrorBlock: a retryable error panel.
//
// role="alert" so the failure is announced to assistive tech; an optional Retry
// button when the caller can re-run the failed query. Presentational.

import { type ReactNode } from "react"

export type ErrorBlockProps = {
  title: string
  error?: unknown
  onRetry?: () => void
  children?: ReactNode
}

function messageOf(error: unknown): string | null {
  if (!error) return null
  if (error instanceof Error) return error.message
  return String(error)
}

export function ErrorBlock({ title, error, onRetry, children }: ErrorBlockProps) {
  const detail = messageOf(error)
  return (
    <div className="sf-errorblock" role="alert">
      <h4 className="sf-errorblock-title">{title}</h4>
      {detail ? <p className="sf-errorblock-detail sf-mono">{detail}</p> : null}
      {children}
      {onRetry ? (
        <button type="button" className="sf-btn" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}
