import type { Meta, StoryObj } from "@storybook/react"
import { ErrorBlock } from "@schemaforge/react"

const meta: Meta<typeof ErrorBlock> = {
  title: "Primitives/ErrorBlock",
  component: ErrorBlock,
  args: { onRetry: () => console.log("retry") },
}
export default meta
type Story = StoryObj<typeof ErrorBlock>

export const WithRetry: Story = {
  args: {
    title: "Failed to load records",
    error: new Error("Forge API 503: upstream unavailable"),
  },
}

export const NoRetry: Story = {
  args: {
    title: "Record not found",
    error: new Error("Forge API 404: no Milestone with that id"),
    onRetry: undefined,
  },
}

export const TitleOnly: Story = {
  args: { title: "Something went wrong" },
}
