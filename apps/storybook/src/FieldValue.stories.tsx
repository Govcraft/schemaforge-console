import type { Meta, StoryObj } from "@storybook/react"
import type { EnumColor, FieldMeta } from "@schemaforge/client"
import { FieldValue } from "@schemaforge/react"

// FieldValue is the read-only renderer behind every cell and spec-sheet row. It
// dispatches on a field's `@widget(...)` / `@format(...)` to produce the rich
// display the DSL implies. These stories are the visual contract for the whole
// grammar vocabulary — one entry per @widget variant, per @format variant, and
// the full @enum_colors palette — so a grammar addition that isn't rendered
// here is visibly missing.

const meta: Meta<typeof FieldValue> = {
  title: "Showcase/FieldValue",
  component: FieldValue,
}
export default meta
type Story = StoryObj<typeof FieldValue>

// A tiny offline image so the image/avatar widgets render without a network.
const SAMPLE_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'>
       <rect width='72' height='72' fill='#ea580c'/>
       <text x='36' y='44' font-family='sans-serif' font-size='26' fill='white' text-anchor='middle'>SF</text>
     </svg>`,
  )

type Spec = { label: string; note: string; field: FieldMeta; value: unknown }

function Gallery({ specs }: { specs: Spec[] }) {
  return (
    <div style={{ maxWidth: 760 }}>
      <table className="sf-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th style={{ width: 150 }}>widget / format</th>
            <th style={{ width: 230 }}>rendered</th>
            <th>DSL</th>
          </tr>
        </thead>
        <tbody>
          {specs.map((s, i) => (
            <tr key={`${s.label}-${i}`}>
              <td className="sf-mono" style={{ fontSize: 12 }}>{s.label}</td>
              <td>
                <FieldValue field={s.field} value={s.value} />
              </td>
              <td className="sf-muted" style={{ fontSize: 12 }}>{s.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// All 17 @widget variants
// ---------------------------------------------------------------------------

const DEAL_STAGE_COLORS: Record<string, EnumColor> = {
  prospecting: "gray",
  qualification: "blue",
  proposal: "amber",
  negotiation: "purple",
  closed_won: "green",
  closed_lost: "red",
}

const WIDGET_SPECS: Spec[] = [
  {
    label: "status_badge",
    note: `enum @widget("status_badge") @enum_colors(...)`,
    field: { name: "stage", kind: "enum", required: true, widget: "status_badge", enumColors: DEAL_STAGE_COLORS },
    value: "negotiation",
  },
  {
    label: "status_badge",
    note: `enum @widget("status_badge") — no colors → neutral`,
    field: { name: "status", kind: "enum", required: false, widget: "status_badge" },
    value: "active",
  },
  {
    label: "count_badge",
    note: `integer @widget("count_badge")`,
    field: { name: "story_points", kind: "integer", required: false, widget: "count_badge" },
    value: 8,
  },
  {
    label: "progress",
    note: `integer(0..100) @widget("progress")`,
    field: { name: "lead_score", kind: "integer", required: false, widget: "progress" },
    value: 72,
  },
  {
    label: "progress + percent",
    note: `integer @widget("progress") @format("percent")`,
    field: { name: "probability", kind: "integer", required: false, widget: "progress", format: "percent" },
    value: 65,
  },
  {
    label: "slider",
    note: `integer(0..100) @widget("slider")`,
    field: { name: "health_score", kind: "integer", required: false, widget: "slider" },
    value: 80,
  },
  {
    label: "rating",
    note: `integer(1..5) @widget("rating")`,
    field: { name: "satisfaction", kind: "integer", required: false, widget: "rating" },
    value: 4,
  },
  {
    label: "tags",
    note: `text[] @widget("tags")`,
    field: { name: "tags", kind: "array", required: false, widget: "tags" },
    value: ["urgent", "backend", "q3"],
  },
  {
    label: "email",
    note: `text @widget("email") → mailto:`,
    field: { name: "billing_email", kind: "text", required: false, widget: "email" },
    value: "ops@example.gov",
  },
  {
    label: "phone",
    note: `text @widget("phone") → tel:`,
    field: { name: "phone", kind: "text", required: false, widget: "phone" },
    value: "+1 202 555 0142",
  },
  {
    label: "url",
    note: `text @widget("url") → external link (truncated)`,
    field: { name: "website", kind: "text", required: false, widget: "url" },
    value: "https://example.gov/programs/2026/very/long/path/that/truncates",
  },
  {
    label: "color",
    note: `text @widget("color") → swatch + hex`,
    field: { name: "accent_color", kind: "text", required: false, widget: "color" },
    value: "#10B981",
  },
  {
    label: "image",
    note: `text @widget("image") → thumbnail`,
    field: { name: "logo_url", kind: "text", required: false, widget: "image" },
    value: SAMPLE_IMG,
  },
  {
    label: "avatar",
    note: `file @widget("avatar") → round thumbnail`,
    field: { name: "photo", kind: "file", required: false, widget: "avatar" },
    value: SAMPLE_IMG,
  },
  {
    label: "json",
    note: `json @widget("json") → inline mono`,
    field: { name: "settings", kind: "json", required: false, widget: "json" },
    value: { plan: "enterprise", seats: 50 },
  },
  {
    label: "code",
    note: `text @widget("code") → mono`,
    field: { name: "code", kind: "text", required: false, widget: "code" },
    value: "PRJ-2026-014",
  },
  {
    label: "markdown",
    note: `richtext @widget("markdown") → text`,
    field: { name: "description", kind: "rich_text", required: false, widget: "markdown" },
    value: "## Notes\nShip the **Q3** milestone.",
  },
  {
    label: "rich_text",
    note: `richtext @widget("rich_text") → text`,
    field: { name: "notes", kind: "rich_text", required: false, widget: "rich_text" },
    value: "Follow up after the demo.",
  },
  {
    label: "file",
    note: `file @widget("file") → filename + state`,
    field: { name: "attachment", kind: "file", required: false, widget: "file" },
    value: { key: "documents/q3-report.pdf", status: "available" },
  },
]

export const AllWidgets: Story = {
  render: () => <Gallery specs={WIDGET_SPECS} />,
}

// ---------------------------------------------------------------------------
// All 7 @format variants
// ---------------------------------------------------------------------------

const FORMAT_SPECS: Spec[] = [
  {
    label: "currency",
    note: `float @format("currency")`,
    field: { name: "value", kind: "float", required: false, format: "currency" },
    value: 49999.5,
  },
  {
    label: "percent",
    note: `float @format("percent") — fraction ≤1 scales`,
    field: { name: "rate", kind: "float", required: false, format: "percent" },
    value: 0.732,
  },
  {
    label: "bytes",
    note: `integer @format("bytes")`,
    field: { name: "storage_quota", kind: "integer", required: false, format: "bytes" },
    value: 1_572_864,
  },
  {
    label: "duration",
    note: `integer(seconds) @format("duration")`,
    field: { name: "duration_minutes", kind: "integer", required: false, format: "duration" },
    value: 3725,
  },
  {
    label: "relative",
    note: `datetime @format("relative")`,
    field: { name: "last_contacted", kind: "datetime", required: false, format: "relative" },
    value: "2026-05-20T09:30:00Z",
  },
  {
    label: "date",
    note: `datetime @format("date") — calendar date, no time`,
    field: { name: "due_date", kind: "datetime", required: false, format: "date" },
    value: "2026-02-28T00:00:00Z",
  },
  {
    label: "datetime",
    note: `datetime @format("datetime") — absolute date + time`,
    field: { name: "occurred_at", kind: "datetime", required: false, format: "datetime" },
    value: "2026-02-28T14:05:00Z",
  },
]

export const AllFormats: Story = {
  render: () => <Gallery specs={FORMAT_SPECS} />,
}

// ---------------------------------------------------------------------------
// The full @enum_colors palette
// ---------------------------------------------------------------------------

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

export const EnumColorPalette: Story = {
  name: "EnumColors palette",
  render: () => {
    const field: FieldMeta = {
      name: "tone",
      kind: "enum",
      required: false,
      widget: "status_badge",
      enumColors: Object.fromEntries(PALETTE.map((c) => [c, c])) as Record<string, EnumColor>,
    }
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 520 }}>
        {PALETTE.map((c) => (
          <FieldValue key={c} field={field} value={c} />
        ))}
      </div>
    )
  },
}

// Arg-driven single story so the Controls panel can exercise one badge.
export const StatusBadge: Story = {
  args: {
    field: { name: "stage", kind: "enum", required: true, widget: "status_badge", enumColors: DEAL_STAGE_COLORS },
    value: "closed_won",
  },
}
