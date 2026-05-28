import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "@tanstack/react-query",
    "@schemaforge/client",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic"
  },
})
