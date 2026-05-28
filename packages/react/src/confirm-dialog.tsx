// @schemaforge/react — ConfirmDialog: accessible confirmation modal.
//
// Built on the native <dialog> element, which provides a focus trap, Esc-to-
// cancel, and the top layer for free — replacing window.confirm (which blocks
// the event loop and can't be styled or themed). Presentational and
// controlled: the host owns `open` and the confirm/cancel handlers.

import { useEffect, useId, useRef, type ReactNode } from "react"

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="sf-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      // Native cancel (Esc / backdrop) routes to onCancel instead of closing
      // imperatively, keeping the host's `open` the source of truth.
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <h2 id={titleId} className="sf-dialog-title">
        {title}
      </h2>
      {description ? (
        <div id={descId} className="sf-dialog-body">
          {description}
        </div>
      ) : null}
      <div className="sf-dialog-actions">
        <button type="button" className="sf-btn" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={destructive ? "sf-btn sf-btn-danger" : "sf-btn"}
          onClick={onConfirm}
          disabled={busy}
          autoFocus
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
