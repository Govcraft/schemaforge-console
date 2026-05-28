// Host integration: binds the framework-agnostic @schemaforge/client to this
// app's session model (sessionStorage) and this app's router (react-router).
// A different host (Next.js, cookies) would swap exactly this file.

import { type ReactNode } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { createForgeClient } from "@schemaforge/client"
import { ForgeProvider, type ForgeLinkProps, type ForgeNav } from "@schemaforge/react"

const TOKEN_KEY = "schemaforge.token"
const ROLES_KEY = "schemaforge.roles"
const TENANT_KEY = "schemaforge.active_tenant"

export const session = {
  token: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  roles: (): string[] => {
    try {
      const raw = sessionStorage.getItem(ROLES_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter((r): r is string => typeof r === "string") : []
    } catch {
      return []
    }
  },
  activeTenant: (): string | null => sessionStorage.getItem(TENANT_KEY),
  signIn(token: string, roles: string[]): void {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(ROLES_KEY, JSON.stringify(roles))
  },
  signOut(): void {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(ROLES_KEY)
    sessionStorage.removeItem(TENANT_KEY)
  },
}

export const client = createForgeClient({
  getToken: () => session.token(),
  getActiveTenant: () => session.activeTenant(),
  // Refresh-and-retry is a follow-up; for now a 401 surfaces and the host
  // bounces to /login via the ForgeUnauthorizedError boundary (TODO).
  onUnauthorized: async () => null,
})

function ConsoleLink({ to, children, className, ...rest }: ForgeLinkProps) {
  return (
    <RouterLink to={to} className={className} {...rest}>
      {children}
    </RouterLink>
  )
}

/** Wraps the app subtree with client + nav + roles injection. Must render
 *  inside <BrowserRouter> because the nav adapter uses useNavigate. */
export function ForgeRoot({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const nav: ForgeNav = { Link: ConsoleLink, navigate: (to) => navigate(to) }
  return (
    <ForgeProvider client={client} nav={nav} roles={session.roles()}>
      {children}
    </ForgeProvider>
  )
}
