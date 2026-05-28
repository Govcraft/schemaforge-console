import type { Meta, StoryObj } from "@storybook/react"
import { Thumbnail } from "@schemaforge/react"

const SAMPLE_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'>
       <rect width='72' height='72' fill='#ea580c'/>
       <text x='36' y='44' font-family='sans-serif' font-size='26' fill='white' text-anchor='middle'>SF</text>
     </svg>`,
  )

const meta: Meta<typeof Thumbnail> = {
  title: "Atoms/Thumbnail",
  component: Thumbnail,
  args: { src: SAMPLE_IMG, alt: "" },
}
export default meta
type Story = StoryObj<typeof Thumbnail>

export const Image: Story = {}
export const Avatar: Story = { args: { src: SAMPLE_IMG, round: true } }
