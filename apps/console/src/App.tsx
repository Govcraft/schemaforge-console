import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ForgeRoot } from "./forge"
import { HomePage } from "./pages/home"
import { LoginPage } from "./pages/login"
import { EntityListPage } from "./pages/entity-list"
import { EntityDetailPage } from "./pages/entity-detail"
import { EntityEditPage } from "./pages/entity-edit"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ForgeRoot>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/:schema" element={<EntityListPage />} />
            <Route path="/:schema/new" element={<EntityEditPage />} />
            <Route path="/:schema/:id" element={<EntityDetailPage />} />
            <Route path="/:schema/:id/edit" element={<EntityEditPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ForgeRoot>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
