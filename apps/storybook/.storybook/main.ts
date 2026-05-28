import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  // Essentials brings Controls + Actions (the prop "dials" + callback logging),
  // Docs, viewport, etc. Without it every story is static — optional props can't
  // be exercised. preview.tsx already enables expanded controls.
  addons: ["@storybook/addon-essentials"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
}

export default config
