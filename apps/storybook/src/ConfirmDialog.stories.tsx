import type { Meta, StoryObj } from "@storybook/react-vite"
import { ConfirmDialog } from "@schemaforge/react"

// Controlled on `open`; renders in the native <dialog> top layer over the
// canvas. Handlers are logged in these stories.
const meta: Meta<typeof ConfirmDialog> = {
  title: "Primitives/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: true,
    onConfirm: () => console.log("confirm"),
    onCancel: () => console.log("cancel"),
  },
}
export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Destructive: Story = {
  args: {
    title: "Delete Milestone?",
    description: "This permanently removes the record and cannot be undone.",
    confirmLabel: "Delete",
    destructive: true,
  },
}

export const Neutral: Story = {
  args: {
    title: "Publish changes?",
    description: "The updated record becomes visible to all tenant members.",
    confirmLabel: "Publish",
  },
}

export const Busy: Story = {
  args: {
    title: "Delete Milestone?",
    description: "Deleting…",
    confirmLabel: "Delete",
    destructive: true,
    busy: true,
  },
}
