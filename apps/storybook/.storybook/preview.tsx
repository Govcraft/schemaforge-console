import { type ReactNode } from "react"
import type { Decorator, Preview } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ForgeProvider, type ForgeLinkProps, type ForgeNav } from "@schemaforge/react"
import { createMockClient } from "../src/mock-client"
import "./preview.css"

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const client = createMockClient()

// In Storybook, links are inert anchors and navigate is a no-op.
function StoryLink({ to, children, className }: ForgeLinkProps): ReactNode {
  return (
    <a href={to} className={className} onClick={(e) => e.preventDefault()}>
      {children}
    </a>
  )
}
const nav: ForgeNav = { Link: StoryLink, navigate: () => {} }

const withForge: Decorator = (Story) => (
  <QueryClientProvider client={queryClient}>
    <ForgeProvider client={client} nav={nav} roles={["admin"]}>
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    </ForgeProvider>
  </QueryClientProvider>
)

const preview: Preview = {
  decorators: [withForge],
  parameters: { controls: { expanded: true } },
}

export default preview
