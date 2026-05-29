import { useEffect, type ReactNode } from "react"
import type { Decorator, Preview } from "@storybook/react-vite"
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

// Mirror the console's theming exactly: the shell sets data-theme on <html> and
// the design system re-points its semantic tokens under [data-theme="dark"].
// Driving the SAME attribute here means a story renders pixel-for-pixel as it
// would inside the console — and the toolbar toggle matches the shell's toggle.
type Theme = "light" | "dark"

function StoryFrame({ theme, children }: { theme: Theme; children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    const prev = root.getAttribute("data-theme")
    root.setAttribute("data-theme", theme)
    return () => {
      if (prev === null) root.removeAttribute("data-theme")
      else root.setAttribute("data-theme", prev)
    }
  }, [theme])

  // The console renders content inside .sf-shell-main → .sf-page: the page sits
  // on --sf-color-bg with the sans family and generous padding. We reproduce
  // that surface (minus the rail/topbar host chrome, which is the app's, not
  // the package's) so components read like real console screens.
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "var(--sf-space-6)",
        background: "var(--sf-color-bg)",
        color: "var(--sf-color-fg)",
        fontFamily: "var(--sf-font-sans)",
        fontSize: "var(--sf-text-base)",
        lineHeight: "var(--sf-leading-base)",
      }}
    >
      {children}
    </div>
  )
}

const withForge: Decorator = (Story, context) => {
  const theme = (context.globals.theme as Theme) ?? "light"
  return (
    <QueryClientProvider client={queryClient}>
      <ForgeProvider client={client} nav={nav} roles={["admin"]}>
        <StoryFrame theme={theme}>
          <Story />
        </StoryFrame>
      </ForgeProvider>
    </QueryClientProvider>
  )
}

const preview: Preview = {
  decorators: [withForge],
  globalTypes: {
    theme: {
      description: "Console light/dark theme (sets data-theme on <html>)",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    // StoryFrame owns the page surface + padding (it IS the console main), so
    // take over the full canvas rather than letting Storybook add a gutter.
    layout: "fullscreen",
    controls: { expanded: true },
    // Our theme owns the page background (--sf-color-bg); disable the
    // backgrounds addon so its swatches don't fight the data-theme surface.
    backgrounds: { disabled: true },
  },
}

export default preview
