import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// `schemaforge serve` upstream — proxied in dev so the browser talks to the
// same origin and avoids CORS. Override with VITE_FORGE_UPSTREAM.
const upstream = process.env.VITE_FORGE_UPSTREAM ?? "http://localhost:3000"

export default defineConfig({
  // The console is served under /console by `schemaforge serve` (same-origin,
  // behind a public-path prefix so the static SPA loads pre-auth). Building
  // with this base makes asset URLs absolute under /console/...; the router
  // reads the same value from import.meta.env.BASE_URL for its basename.
  base: "/console/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/v1": { target: upstream, changeOrigin: true },
    },
  },
})
