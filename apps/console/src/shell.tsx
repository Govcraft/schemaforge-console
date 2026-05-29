// The console's application frame: a dark "ink" sidebar (brand + schema nav),
// a topbar (breadcrumbs, schema-catalog jump, tenant switcher, sign-out), and
// light/dark theming. This is host chrome — it lives in the console app, not in
// @schemaforge/react; a customer app brings its own shell and reuses the
// organisms inside it.
import { useEffect, useState, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  Building2,
  ChevronRight,
  Contact,
  Database,
  FileText,
  Folder,
  Hash,
  Layers,
  ListTree,
  Moon,
  Search,
  Sun,
  Tag,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react"
import { isSystemSchema } from "@schemaforge/client"
import { StatusBadge, useSchemas } from "@schemaforge/react"
import { client, session } from "./forge"

const PLATFORM_ADMIN_ROLE = "platform_admin"
const THEME_KEY = "schemaforge.theme"
type Theme = "light" | "dark"

function readTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === "dark" || stored === "light") return stored
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))]
}

// The signed-in principal (display name, tenancy). One query key so the topbar
// pill and the tenant switcher share a single request.
function useMe() {
  return useQuery({
    queryKey: ["auth", "me", session.activeTenant()],
    queryFn: () => client.me(),
  })
}

// ---- Schema → icon -------------------------------------------------------
const ICON_BY_NAME: Record<string, LucideIcon> = {
  Company: Building2,
  Organization: Building2,
  Department: Building2,
  Contact: Contact,
  Employee: Contact,
  User: Users,
  Deal: Target,
  Opportunity: Target,
  Document: FileText,
  Comment: FileText,
  Project: Folder,
  Task: ListTree,
  Milestone: Hash,
  Activity: Activity,
  Tag: Tag,
}
function pickIcon(name: string): LucideIcon {
  const exact = ICON_BY_NAME[name]
  if (exact) return exact
  const l = name.toLowerCase()
  if (l.includes("user") || l.includes("person")) return Users
  if (l.includes("doc") || l.includes("file")) return FileText
  if (l.includes("event") || l.includes("activity")) return Activity
  if (l.includes("project") || l.includes("folder")) return Folder
  if (l.includes("tag") || l.includes("label")) return Tag
  return Database
}

// ---- Sidebar -------------------------------------------------------------
function Sidebar() {
  const location = useLocation()
  const { data: schemas } = useSchemas()
  const app = (schemas ?? []).filter((s) => !isSystemSchema(s))
  const isActive = (p: string) => location.pathname === p || location.pathname.startsWith(p + "/")

  return (
    <aside className="sf-rail">
      <div className="sf-rail-head">
        <span className="sf-rail-brand" aria-hidden="true">
          SF
        </span>
        <span className="sf-rail-title">SchemaForge</span>
      </div>

      <div className="sf-rail-section grow">
        <div className="sf-rail-label">
          <span>Entities</span>
          <span className="sf-mono">{app.length}</span>
        </div>
        {app.map((s) => {
          const to = `/${encodeURIComponent(s.name)}`
          const Icon = pickIcon(s.name)
          return (
            <Link key={s.name} to={to} className={"sf-rail-link" + (isActive(to) ? " active" : "")}>
              <Icon size={14} />
              <span>{s.name}</span>
            </Link>
          )
        })}
        {app.length === 0 ? <div className="sf-rail-label">No schemas yet.</div> : null}
      </div>

      <dl className="sf-rail-foot">
        <div className="sf-rail-foot-line">
          <dt>API</dt>
          <dd>/api/v1/forge</dd>
        </div>
      </dl>
    </aside>
  )
}

// ---- Tenant switcher -----------------------------------------------------
function shortTenantId(id: string): string {
  const tail = id.includes("_") ? id.slice(id.lastIndexOf("_") + 1) : id
  return tail.length > 10 ? tail.slice(0, 8) + "…" : tail
}

function TenantControl() {
  const { data: me } = useMe()
  const isPlatformAdmin = session.roles().includes(PLATFORM_ADMIN_ROLE)
  const chain = me?.tenant_chain ?? []
  const active = me?.active_tenant ?? null

  // Platform admins are never tenant-scoped server-side — show a badge, not a
  // picker, so we don't imply a constraint that doesn't exist.
  if (isPlatformAdmin) {
    return <StatusBadge color="amber" label="Operating as: platform_admin" />
  }

  function switchTo(value: string) {
    const sep = value.indexOf(":")
    if (sep <= 0) return
    session.setActiveTenant(value.slice(0, sep), value.slice(sep + 1))
    // Hard-reload so no prior-tenant data lingers in the query cache. Use the
    // Vite base (mount point) so we land on the console root, not the origin.
    window.location.assign(import.meta.env.BASE_URL)
  }

  if (chain.length >= 2) {
    const current = active ? `${active.tenant_type}:${active.tenant_id}` : ""
    return (
      <label className="sf-tenant">
        <Building2 size={14} aria-hidden="true" />
        <span className="sf-sr-only">Active tenant</span>
        <select value={current} onChange={(e) => switchTo(e.target.value)} aria-label="Switch active tenant">
          {current === "" ? <option value="">Select tenant…</option> : null}
          {chain.map((t) => (
            <option key={`${t.schema}:${t.entity_id}`} value={`${t.schema}:${t.entity_id}`}>
              {t.schema}: {shortTenantId(t.entity_id)}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (active) {
    return (
      <StatusBadge
        color="neutral"
        title={`${active.tenant_type}:${active.tenant_id}`}
        label={
          <>
            <Building2 size={14} aria-hidden="true" />
            <span>
              {active.tenant_type}: {shortTenantId(active.tenant_id)}
            </span>
          </>
        }
      />
    )
  }
  return null
}

// ---- Topbar --------------------------------------------------------------
const CRUMB_LABELS: Record<string, string> = { new: "New", edit: "Edit" }

function humanizeCrumb(seg: string): string {
  let decoded = seg
  try {
    decoded = decodeURIComponent(seg)
  } catch {
    /* keep raw */
  }
  if (CRUMB_LABELS[decoded.toLowerCase()]) return CRUMB_LABELS[decoded.toLowerCase()]
  // Long TypeID-ish segments (schema_01k…) → compact tail.
  if (decoded.includes("_") && decoded.length > 14) return shortTenantId(decoded)
  return decoded
}

function Topbar({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const location = useLocation()
  const { data: me } = useMe()
  const who = me?.display_name || me?.email || "user"

  const segs = location.pathname.split("/").filter(Boolean)
  const crumbs =
    segs.length === 0
      ? [{ label: "Catalog", href: "/" }]
      : [{ label: "Catalog", href: "/" }].concat(
          segs.map((seg, i) => ({ label: humanizeCrumb(seg), href: "/" + segs.slice(0, i + 1).join("/") })),
        )

  function signOut() {
    session.signOut()
    // Mount-relative: BASE_URL ends with "/", so this is /console/login.
    window.location.assign(`${import.meta.env.BASE_URL}login`)
  }

  return (
    <header className="sf-topbar">
      <nav className="sf-crumbs" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <li key={c.href}>
                {i > 0 ? <ChevronRight size={12} className="sep" aria-hidden="true" /> : null}
                {isLast ? (
                  <span className="now" aria-current="page">
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.href}>{c.label}</Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <Link to="/" className="sf-topbar-search" aria-label="Open schema catalog">
        <Search size={14} aria-hidden="true" />
        <span className="grow" aria-hidden="true">
          Schema catalog
        </span>
      </Link>

      <TenantControl />

      <button
        type="button"
        className="sf-icon-btn"
        onClick={onToggleTheme}
        aria-pressed={theme === "dark"}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
      </button>

      <button type="button" className="sf-topbar-user" onClick={signOut} aria-label={`Sign out ${who}`}>
        <span className="sf-avatar" aria-hidden="true">
          {who.slice(0, 2).toUpperCase()}
        </span>
        <span aria-hidden="true">{who}</span>
        <span className="sf-sr-only">— sign out</span>
      </button>
    </header>
  )
}

// ---- Shell ---------------------------------------------------------------
export function AppShell({ children }: { children: ReactNode }) {
  const [theme, toggleTheme] = useTheme()
  return (
    <div className="sf-shell">
      <a href="#sf-main" className="sf-skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <Topbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="sf-shell-main" id="sf-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}

// Keep Layers imported for a future Admin section; referenced to satisfy
// noUnusedLocals until that section lands.
void Layers
