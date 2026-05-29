import type { Meta, StoryObj } from "@storybook/react-vite"
import { CountBadge } from "@schemaforge/react"

const meta: Meta<typeof CountBadge> = {
  title: "Atoms/CountBadge",
  component: CountBadge,
  args: { value: 8 },
}
export default meta
type Story = StoryObj<typeof CountBadge>

export const Default: Story = {}
export const Large: Story = { args: { value: 1280 } }
