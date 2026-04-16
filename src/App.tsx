import { NavLink, Route, Routes } from 'react-router-dom'
import { Activity, Database, LineChart, Radio } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Sources from './pages/Sources'
import ResultDetail from './pages/ResultDetail'
import Status from './pages/Status'
import { cn } from './lib/utils'

const nav = [
  { to: '/', label: 'Dashboard', icon: LineChart, end: true },
  { to: '/sources', label: 'Sources', icon: Database },
  { to: '/status', label: 'Status', icon: Activity },
]

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-ink-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-8">
          <div className="flex items-center gap-2 font-semibold text-ink-900">
            <Radio className="w-5 h-5 text-brand-600" />
            <span>Choopoo</span>
            <span className="text-ink-400 text-sm font-normal">TDI Price Intelligence</span>
          </div>
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
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/results/:id" element={<ResultDetail />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </main>
    </div>
  )
}
