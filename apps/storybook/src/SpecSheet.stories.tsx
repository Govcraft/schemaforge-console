import type { Meta, StoryObj } from "@storybook/react"
import { SpecSheet } from "@schemaforge/react"
import { widgetFields, widgetRows } from "./mock-client"

const meta: Meta<typeof SpecSheet> = {
  title: "Organisms/SpecSheet",
  component: SpecSheet,
}
export default meta
type Story = StoryObj<typeof SpecSheet>

export const Default: Story = { args: { fields: widgetFields, data: widgetRows[0] } }

// Row 2 has null price + category — exercises the "— empty" rendering.
export const WithEmpties: Story = { args: { fields: widgetFields, data: widgetRows[2] } }
