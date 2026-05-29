import type { Meta, StoryObj } from "@storybook/react-vite"
import type { EnumColor } from "@schemaforge/client"
import { StatusBadge } from "@schemaforge/react"

const meta: Meta<typeof StatusBadge> = {
  title: "Atoms/StatusBadge",
  component: StatusBadge,
  args: { label: "Negotiation", color: "purple" },
}
export default meta
type Story = StoryObj<typeof StatusBadge>

export const Default: Story = {}

const PALETTE: EnumColor[] = [
  "neutral",
  "gray",
  "red",
  "amber",
  "green",
  "blue",
  "purple",
  "violet",
  "teal",
  "rose",
]

export const Palette: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 520 }}>
      {PALETTE.map((c) => (
        <StatusBadge key={c} label={c} color={c} />
      ))}
    </div>
  ),
}
