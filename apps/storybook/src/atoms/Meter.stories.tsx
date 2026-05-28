import type { Meta, StoryObj } from "@storybook/react"
import { Meter } from "@schemaforge/react"

const meta: Meta<typeof Meter> = {
  title: "Atoms/Meter",
  component: Meter,
  args: { value: 72, max: 100 },
}
export default meta
type Story = StoryObj<typeof Meter>

export const Default: Story = {}
export const WithPercentLabel: Story = { args: { value: 65, max: 100, label: "65%" } }
export const Full: Story = { args: { value: 100, max: 100 } }
export const Empty: Story = { args: { value: 0, max: 100 } }
