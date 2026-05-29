import type { Meta, StoryObj } from "@storybook/react-vite"
import { KanbanColumn } from "@schemaforge/react"

// KanbanColumn is the generic lane the board stacks cards into: a StatusBadge +
// CountBadge header over a scrollable body. It's entity-agnostic — anything can
// be a child — so these stories use plain placeholder cards.

const meta: Meta<typeof KanbanColumn> = {
  title: "Molecules/KanbanColumn",
  component: KanbanColumn,
  args: { label: "Negotiation", color: "purple", count: 3 },
}
export default meta
type Story = StoryObj<typeof KanbanColumn>

function Card({ title }: { title: string }) {
  return (
    <article className="sf-card">
      <div className="sf-card-title">{title}</div>
    </article>
  )
}

export const Default: Story = {
  render: (args) => (
    <KanbanColumn {...args}>
      <Card title="Acme — Platform License" />
      <Card title="Globex — Renewal" />
      <Card title="Initech — Pilot" />
    </KanbanColumn>
  ),
}

// A column with no items shows its empty placeholder, not a blank lane.
export const Empty: Story = {
  args: { label: "Closed Lost", color: "red", count: 0 },
}
