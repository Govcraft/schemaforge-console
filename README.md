# SchemaForge Console

A schema-agnostic **web ops console** for [SchemaForge](https://github.com/Govcraft/schemaforge), plus the reusable packages it is built from. The console introspects a running `schemaforge serve` instance over `/api/v1/forge/*` at runtime and renders any schema the authenticated operator can read — no per-deployment codegen.

The same packages power both this console and customer-built admin/back-office UIs. Restyle by retheming, not forking.

## Layout

```
packages/
  client/    @schemaforge/client   framework-agnostic wire client + schema normalization (no React/router)
  react/     @schemaforge/react    headless hooks + presentational components (router-agnostic, token-themed)
apps/
  console/   the standalone ops console (Vite + React + react-router)
  storybook/ the component showcase / docs
```

## Why packages, not codegen

The ops console is generic by nature — it interprets `/schemas` at runtime. Shipping it as versioned packages (rather than copying source into every deployment) means a single security patch reaches every operator via a version bump, and customers reuse the exact same accessible, schema-driven components in their own apps. Accessibility (WCAG/Section 508) lives in the components, so consumers inherit conformance instead of rebuilding it.

## Develop

```bash
pnpm install
pnpm build:packages        # build @schemaforge/client + @schemaforge/react
pnpm dev                   # run the console against a local schemaforge serve
pnpm storybook             # run the component showcase
pnpm typecheck             # typecheck the whole workspace
```

Point the console at a backend with `VITE_FORGE_UPSTREAM` (defaults to `http://localhost:3000`).

## License

Dual-licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or [MIT license](LICENSE-MIT) at your option.
