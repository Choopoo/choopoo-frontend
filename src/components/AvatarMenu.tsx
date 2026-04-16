import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Database, LogOut, User } from 'lucide-react'
import { useAuth } from '../auth'
import { cn } from '../lib/utils'

/**
 * Click-to-open dropdown for admin + low-frequency surfaces that used to
 * compete for top-nav space: Pipeline Status, Sources/audit, Logout.
 */
export function AvatarMenu() {
  const { me, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!me) return null
  const initial = me.email.slice(0, 1).toUpperCase()

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-md border transition',
          open ? 'bg-raised border-line-strong' : 'border-transparent hover:bg-hover',
        )}
      >
        <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-500 font-mono text-xs flex items-center justify-center font-semibold">
          {initial}
        </span>
        <span className="hidden sm:inline text-xs font-mono text-ink-400">{me.email}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-surface border border-line-strong rounded-md shadow-2xl overflow-hidden z-40">
          <div className="px-3 py-2 border-b border-line">
            <p className="text-xs text-ink-100 truncate">{me.email}</p>
            <p className="label-meta-sm mt-0.5">{me.role} · org {me.org_id}</p>
          </div>
          <ul className="py-1">
            <MenuItem icon={Activity} to="/status" onClick={() => setOpen(false)}>Pipeline status</MenuItem>
            <MenuItem icon={Database} to="/sources" onClick={() => setOpen(false)}>Sources · audit</MenuItem>
          </ul>
          <div className="border-t border-line py-1">
            <button
              onClick={async () => { setOpen(false); await logout(); nav('/login') }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-100 hover:bg-hover hover:text-ink-50 text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-ink-400" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  to,
  onClick,
  children,
}: {
  icon: typeof User
  to: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 text-sm text-ink-100 hover:bg-hover hover:text-ink-50"
      >
        <Icon className="w-3.5 h-3.5 text-ink-400" />
        {children}
      </Link>
    </li>
  )
}
