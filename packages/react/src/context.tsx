// @schemaforge/react — dependency injection for client + navigation.
//
// DECISION (router injection): the current admin components import
// `react-router-dom` (Link, useNavigate, useParams) directly. A customer on
// Next.js / TanStack Router can't use those. So navigation is injected: the
// host supplies a Link component and a navigate fn; components consume them
// via context and never import a router.
//
// Two providers, composed: ForgeClientProvider (data) + ForgeNavProvider (nav).

import { createContext, useContext, type ComponentType, type ReactNode } from "react"
import type { ForgeClient } from "@schemaforge/client"

// --- client -----------------------------------------------------------------

const ClientCtx = createContext<ForgeClient | null>(null)

export function ForgeClientProvider({
  client,
  children,
}: {
  client: ForgeClient
  children: ReactNode
}) {
  return <ClientCtx.Provider value={client}>{children}</ClientCtx.Provider>
}

export function useForgeClient(): ForgeClient {
  const c = useContext(ClientCtx)
  if (!c) throw new Error("useForgeClient: wrap your tree in <ForgeClientProvider>")
  return c
}

// --- navigation --------------------------------------------------------------

/** The minimal nav surface a component needs. The host adapts its router to
 *  this shape: react-router's <Link>, Next's <Link>, or a plain <a>. */
export type ForgeLinkProps = {
  to: string
  children: ReactNode
  className?: string
  "aria-current"?: "page" | undefined
}

export type ForgeNav = {
  /** Renders an in-app link. Host maps `to` to its router's href prop. */
  Link: ComponentType<ForgeLinkProps>
  /** Imperative navigation (e.g. after a successful mutation). */
  navigate: (to: string) => void
}

const NavCtx = createContext<ForgeNav | null>(null)

export function ForgeNavProvider({ nav, children }: { nav: ForgeNav; children: ReactNode }) {
  return <NavCtx.Provider value={nav}>{children}</NavCtx.Provider>
}

export function useForgeNav(): ForgeNav {
  const n = useContext(NavCtx)
  if (!n) throw new Error("useForgeNav: wrap your tree in <ForgeNavProvider>")
  return n
}

/** The current user's roles, for @field_access gating. Injected (not read from
 *  sessionStorage) so an SSR host can seed it from its own session. */
const RolesCtx = createContext<readonly string[]>([])
export function ForgeRolesProvider({ roles, children }: { roles: readonly string[]; children: ReactNode }) {
  return <RolesCtx.Provider value={roles}>{children}</RolesCtx.Provider>
}
export function useForgeRoles(): readonly string[] {
  return useContext(RolesCtx)
}

/** Convenience composing all three. Hosts can also use them individually. */
export function ForgeProvider({
  client,
  nav,
  roles,
  children,
}: {
  client: ForgeClient
  nav: ForgeNav
  roles: readonly string[]
  children: ReactNode
}) {
  return (
    <ForgeClientProvider client={client}>
      <ForgeNavProvider nav={nav}>
        <ForgeRolesProvider roles={roles}>{children}</ForgeRolesProvider>
      </ForgeNavProvider>
    </ForgeClientProvider>
  )
}
