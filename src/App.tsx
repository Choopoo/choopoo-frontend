import { NavLink, Route, Routes, Link } from 'react-router-dom'
import { Activity, Database, LineChart, Radio, Sparkles, Target, LogOut } from 'lucide-react'
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
  { to: '/', label: 'Home', icon: Target, end: true },
  { to: '/materials', label: 'Materials', icon: LineChart },
  { to: '/copilot', label: 'Copilot', icon: Sparkles },
  { to: '/sources', label: 'Sources', icon: Database },
  { to: '/status', label: 'Status', icon: Activity },
]

export default function App() {
  const { me } = useAuth()
  return (
    <div className="min-h-full flex flex-col">
      {me && (
        <header className="border-b border-ink-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-semibold text-ink-900">
              <Radio className="w-5 h-5 text-brand-600" />
              <span>Choopoo</span>
              <span className="text-ink-400 text-sm font-normal">PU SME copilot</span>
            </Link>
            <nav className="flex items-center gap-1">
              {nav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-500 hover:text-ink-900 hover:bg-ink-100',
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3 text-sm">
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
      className="flex items-center gap-1 text-ink-500 hover:text-ink-900"
    >
      <LogOut className="w-3.5 h-3.5" />
      Logout
    </button>
  )
}
