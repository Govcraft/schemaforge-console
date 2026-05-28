import type { Meta, StoryObj } from "@storybook/react"
import { StarRating } from "@schemaforge/react"

const meta: Meta<typeof StarRating> = {
  title: "Atoms/StarRating",
  component: StarRating,
  args: { value: 4 },
}
export default meta
type Story = StoryObj<typeof StarRating>

export const Default: Story = {}
export const Empty: Story = { args: { value: 0 } }
export const Full: Story = { args: { value: 5 } }
