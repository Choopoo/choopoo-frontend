import { NavLink, Route, Routes, Link } from 'react-router-dom'
import { Activity, Sparkles, Target, Command } from 'lucide-react'
import { useAuth, RequireAuth } from './auth'
import Login from './pages/Login'
import Home from './pages/Home'
import GoalNew from './pages/GoalNew'
import GoalDetail from './pages/GoalDetail'
import Materials from './pages/Materials'
import Copilot from './pages/Copilot'
import InsightDetail from './pages/InsightDetail'
import Products from './pages/Products'
import Macro from './pages/Macro'
import Sources from './pages/Sources'
import Status from './pages/Status'
import { CommandPalette } from './components/CommandPalette'
import { AvatarMenu } from './components/AvatarMenu'
import { cn } from './lib/utils'

const nav = [
  { to: '/', label: 'Desk', icon: Target, end: true },
  { to: '/copilot', label: 'Ask', icon: Sparkles },
]

export default function App() {
  const { me } = useAuth()
  return (
    <div className="min-h-full flex flex-col bg-canvas">
      {me && (
        <header className="border-b border-line bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 label-meta text-brand-500">
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
            <div className="ml-auto flex items-center gap-3">
              <KbdHint />
              <AvatarMenu />
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
          <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
          <Route path="/macro" element={<RequireAuth><Macro /></RequireAuth>} />
          <Route path="/copilot" element={<RequireAuth><Copilot /></RequireAuth>} />
          <Route path="/insights/:id" element={<RequireAuth><InsightDetail /></RequireAuth>} />
          <Route path="/sources" element={<RequireAuth><Sources /></RequireAuth>} />
          <Route path="/status" element={<RequireAuth><Status /></RequireAuth>} />
        </Routes>
      </main>
      {me && <CommandPalette />}
    </div>
  )
}

function KbdHint() {
  // Small affordance so users learn the shortcut exists. Clicking it fakes a
  // ⌘K keypress so mouse users can open the palette.
  const press = () => {
    const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true })
    window.dispatchEvent(evt)
  }
  return (
    <button
      onClick={press}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-line hover:border-line-strong hover:bg-hover text-ink-400 hover:text-ink-100 transition"
      title="Open command palette"
    >
      <Command className="w-3 h-3" />
      <span className="label-meta-sm text-ink-400">K</span>
    </button>
  )
}
