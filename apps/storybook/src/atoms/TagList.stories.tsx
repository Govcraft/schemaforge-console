import type { Meta, StoryObj } from "@storybook/react-vite"
import { TagList } from "@schemaforge/react"

const meta: Meta<typeof TagList> = {
  title: "Atoms/TagList",
  component: TagList,
  args: { items: ["urgent", "backend", "q3"] },
}
export default meta
type Story = StoryObj<typeof TagList>

export const Default: Story = {}
export const Many: Story = {
  args: { items: ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta"] },
}
