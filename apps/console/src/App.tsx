import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Toaster } from "sonner"
import { ForgeRoot, session } from "./forge"
import { AppShell } from "./shell"
import { HomePage } from "./pages/home"
import { LoginPage } from "./pages/login"
import { EntityListPage } from "./pages/entity-list"
import { EntityDetailPage } from "./pages/entity-detail"
import { EntityEditPage } from "./pages/entity-edit"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

// Auth gate + chrome. Signed-out renders only /login; signed-in renders every
// route inside the persistent AppShell. Subscribes to location so it flips on
// the navigate("/") that follows a successful sign-in.
function Routed() {
  useLocation()
  const authed = Boolean(session.token())

  if (!authed) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/:schema" element={<EntityListPage />} />
        <Route path="/:schema/new" element={<EntityEditPage />} />
        <Route path="/:schema/:id" element={<EntityDetailPage />} />
        <Route path="/:schema/:id/edit" element={<EntityEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* basename derives from Vite's base (/console/) so all router paths are
          relative to the mount point; trailing slash trimmed per RR contract. */}
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ForgeRoot>
          <Routed />
        </ForgeRoot>
      </BrowserRouter>
      {/* Neutral (non-tinted) toasts — sonner's colored variants fall under
          WCAG 1.4.3 AA. sonner announces via aria-live (polite) by default. */}
      <Toaster position="bottom-right" closeButton />
    </QueryClientProvider>
  )
}
