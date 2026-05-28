import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import { session } from "../forge"

const LOGIN_PATH = "/api/v1/forge/auth/login"

// Minimal login: posts credentials, stashes token + roles via `session`, and
// routes home. Deliberately bypasses the api-client (no token yet) — mirrors
// the contract documented in site-guide.md.
export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(LOGIN_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error(res.status === 401 ? "Invalid credentials" : `Login failed (${res.status})`)
      const body = (await res.json()) as { token: string; roles?: string[] }
      session.signIn(body.token, body.roles ?? [])
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="sf-login">
      <h1>SchemaForge Console</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="username">Username</label>
        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error ? <p role="alert" className="sf-error">{error}</p> : null}
        <button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  )
}
