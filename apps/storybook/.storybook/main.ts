import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  // Storybook 9+ folds the former "essentials" (Controls, Actions, Viewport,
  // Backgrounds) into core, so Docs is the only addon left to declare. Controls
  // still drive the optional-prop "dials"; preview.tsx enables expanded controls.
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
}

export default config
