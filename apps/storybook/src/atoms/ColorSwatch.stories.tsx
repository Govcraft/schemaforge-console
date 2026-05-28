import type { Meta, StoryObj } from "@storybook/react"
import { ColorSwatch } from "@schemaforge/react"

const meta: Meta<typeof ColorSwatch> = {
  title: "Atoms/ColorSwatch",
  component: ColorSwatch,
  args: { value: "#10B981" },
}
export default meta
type Story = StoryObj<typeof ColorSwatch>

export const Default: Story = {}
export const Named: Story = { args: { value: "rebeccapurple" } }
