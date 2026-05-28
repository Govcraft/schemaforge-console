import type { Meta, StoryObj } from "@storybook/react"
import { InlineCode } from "@schemaforge/react"

const meta: Meta<typeof InlineCode> = {
  title: "Atoms/InlineCode",
  component: InlineCode,
  args: { children: "PRJ-2026-014" },
}
export default meta
type Story = StoryObj<typeof InlineCode>

export const Code: Story = {}
export const Json: Story = { args: { children: `{"plan":"enterprise","seats":50}` } }
