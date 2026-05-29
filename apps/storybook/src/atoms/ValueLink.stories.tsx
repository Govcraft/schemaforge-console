import type { Meta, StoryObj } from "@storybook/react-vite"
import { ValueLink } from "@schemaforge/react"

const meta: Meta<typeof ValueLink> = {
  title: "Atoms/ValueLink",
  component: ValueLink,
}
export default meta
type Story = StoryObj<typeof ValueLink>

export const Email: Story = { args: { kind: "email", value: "ops@example.gov" } }
export const Phone: Story = { args: { kind: "phone", value: "+1 202 555 0142" } }
export const Url: Story = {
  args: { kind: "url", value: "https://example.gov/programs/2026", children: "example.gov/programs/2026" },
}
