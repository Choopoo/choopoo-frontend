import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { v2, type Me } from './api/v2'

type AuthState = {
  me: Me | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await v2.me()
      setMe(data)
    } catch {
      setMe(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await v2.logout()
    setMe(null)
  }

  useEffect(() => {
    refresh()
  }, [])

  return <Ctx.Provider value={{ me, loading, refresh, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth used outside AuthProvider')
  return v
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { me, loading } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  useEffect(() => {
    if (!loading && !me) {
      nav('/login?next=' + encodeURIComponent(loc.pathname + loc.search), { replace: true })
    }
  }, [loading, me, loc.pathname, loc.search, nav])
  if (loading) {
    return <div className="p-12 text-center text-ink-400 text-sm">Loading…</div>
  }
  if (!me) return null
  return <>{children}</>
}
