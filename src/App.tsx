import { NavLink, Route, Routes, Link } from 'react-router-dom'
import { Activity, Database, LineChart, Sparkles, Target, LogOut } from 'lucide-react'
import { useAuth, RequireAuth } from './auth'
import Login from './pages/Login'
import Home from './pages/Home'
import GoalNew from './pages/GoalNew'
import GoalDetail from './pages/GoalDetail'
import Materials from './pages/Materials'
import Copilot from './pages/Copilot'
import InsightDetail from './pages/InsightDetail'
import Sources from './pages/Sources'
import Status from './pages/Status'
import { cn } from './lib/utils'

const nav = [
  { to: '/', label: 'Desk', icon: Target, end: true },
  { to: '/materials', label: 'Materials', icon: LineChart },
  { to: '/copilot', label: 'Copilot', icon: Sparkles },
  { to: '/sources', label: 'Sources', icon: Database },
  { to: '/status', label: 'Status', icon: Activity },
]

export default function App() {
  const { me } = useAuth()
  return (
    <div className="min-h-full flex flex-col bg-canvas">
      {me && (
        <header className="border-b border-line bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-mono tracking-widest text-brand-500 uppercase text-sm">
              <Activity className="w-4 h-4" />
              Choopoo
            </Link>
            <nav className="flex items-center gap-0.5">
              {nav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition',
                      isActive
                        ? 'text-brand-500 bg-brand-50/50'
                        : 'text-ink-400 hover:text-ink-100 hover:bg-hover',
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3 text-xs font-mono">
              <span className="text-ink-400">{me.email}</span>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/goals/new" element={<RequireAuth><GoalNew /></RequireAuth>} />
          <Route path="/goals/:id" element={<RequireAuth><GoalDetail /></RequireAuth>} />
          <Route path="/materials" element={<RequireAuth><Materials /></RequireAuth>} />
          <Route path="/materials/:code" element={<RequireAuth><Materials /></RequireAuth>} />
          <Route path="/copilot" element={<RequireAuth><Copilot /></RequireAuth>} />
          <Route path="/insights/:id" element={<RequireAuth><InsightDetail /></RequireAuth>} />
          <Route path="/sources" element={<RequireAuth><Sources /></RequireAuth>} />
          <Route path="/status" element={<RequireAuth><Status /></RequireAuth>} />
        </Routes>
      </main>
    </div>
  )
}

function LogoutButton() {
  const { logout } = useAuth()
  return (
    <button
      onClick={logout}
      className="flex items-center gap-1 text-ink-500 hover:text-ink-100 transition"
    >
      <LogOut className="w-3 h-3" />
      Logout
    </button>
  )
}
