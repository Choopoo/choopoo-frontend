import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, LogOut, Plus, Sparkles, LineChart, Database, Activity, Target, Box, Globe2 } from 'lucide-react'
import { v2 } from '../api/v2'
import { useAuth } from '../auth'
import { cn } from '../lib/utils'

type Cmd = {
  id: string
  label: string
  hint?: string
  icon: typeof ArrowRight
  group: 'navigate' | 'goal' | 'material' | 'insight' | 'action'
  run: () => void | Promise<void>
}

/**
 * Global ⌘K (Ctrl-K on windows/linux) command palette.
 *
 * Sources commands from three places:
 *   1. Fixed navigation + action verbs (logout, new goal, ask copilot, …)
 *   2. Tenant goals (title match)
 *   3. Tenant materials + enabled-indicator codes
 *   4. Insights (title match)
 *
 * Keyboard-only: ↑↓ navigate, ↵ fire, Esc close.
 * When open, input is focused and body scroll is locked.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nav = useNavigate()
  const { logout } = useAuth()

  // Open/close via ⌘K / Ctrl-K; close via Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setOpen((v) => !v)
        setQ('')
        setCursor(0)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [open])

  // Load search corpus only when open to avoid waste when user isn't using it.
  const goalsQ = useQuery({ queryKey: ['v2:goals'], queryFn: v2.goalsList, enabled: open })
  const matsQ = useQuery({ queryKey: ['v2:me:materials'], queryFn: v2.meMaterials, enabled: open })
  const insightsQ = useQuery({ queryKey: ['v2:insights'], queryFn: () => v2.insightsList(), enabled: open })

  const commands: Cmd[] = useMemo(() => {
    const nav_ = (path: string) => () => { setOpen(false); nav(path) }
    const fixed: Cmd[] = [
      { id: 'nav:desk', label: 'Go to Desk', icon: Target, group: 'navigate', run: nav_('/') },
      { id: 'nav:ask', label: 'Open Copilot', icon: Sparkles, group: 'navigate', run: nav_('/copilot') },
      { id: 'nav:materials', label: 'Materials portfolio', icon: LineChart, group: 'navigate', run: nav_('/?view=materials') },
      { id: 'nav:products', label: 'Products · sell lens', icon: Box, group: 'navigate', run: nav_('/products') },
      { id: 'nav:macro', label: 'Macro · crude / FX / PMI', icon: Globe2, group: 'navigate', run: nav_('/macro') },
      { id: 'nav:sources', label: 'Sources / audit', icon: Database, group: 'navigate', run: nav_('/sources') },
      { id: 'nav:status', label: 'Pipeline status', icon: Activity, group: 'navigate', run: nav_('/status') },
      { id: 'action:new-goal', label: 'Create new goal', hint: 'opens the 2-step wizard', icon: Plus, group: 'action', run: nav_('/goals/new') },
      { id: 'action:ask-copilot', label: 'Ask the copilot', hint: '→ /copilot', icon: Sparkles, group: 'action', run: nav_('/copilot') },
      { id: 'action:logout', label: 'Logout', icon: LogOut, group: 'action', run: async () => { setOpen(false); await logout(); nav('/login') } },
    ]
    const goals: Cmd[] = (goalsQ.data ?? []).map((g) => ({
      id: `goal:${g.id}`,
      label: g.title,
      hint: `goal · ${g.lens}`,
      icon: Target,
      group: 'goal',
      run: nav_(`/goals/${g.id}`),
    }))
    const mats: Cmd[] = (matsQ.data ?? []).map((m) => ({
      id: `mat:${m.source}:${m.id}`,
      label: m.code,
      hint: `material · ${m.nickname || m.name}`,
      icon: LineChart,
      group: 'material',
      run: nav_(`/materials/${m.code}`),
    }))
    const insights: Cmd[] = (insightsQ.data ?? []).slice(0, 50).map((i) => ({
      id: `ins:${i.id}`,
      label: i.title,
      hint: `insight · ${i.kind}`,
      icon: Sparkles,
      group: 'insight',
      run: nav_(`/insights/${i.id}`),
    }))
    return [...fixed, ...goals, ...mats, ...insights]
  }, [goalsQ.data, matsQ.data, insightsQ.data, nav, logout])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return commands
    return commands.filter((c) =>
      c.label.toLowerCase().includes(needle) || (c.hint ?? '').toLowerCase().includes(needle),
    )
  }, [commands, q])

  // Keep cursor in-range after filter.
  useEffect(() => { if (cursor >= filtered.length) setCursor(0) }, [filtered.length, cursor])

  if (!open) return null

  const groups: Array<{ key: Cmd['group']; title: string }> = [
    { key: 'action', title: 'Actions' },
    { key: 'navigate', title: 'Navigate' },
    { key: 'goal', title: 'Goals' },
    { key: 'material', title: 'Materials' },
    { key: 'insight', title: 'Insights' },
  ]

  // Flatten to indices so ↑↓ works across groups and renders stay consistent.
  const flat: Cmd[] = []
  for (const g of groups) {
    for (const c of filtered) if (c.group === g.key) flat.push(c)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); flat[cursor]?.run() }
  }

  let idx = 0
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-canvas/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-xl bg-surface border border-line-strong rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
          <Search className="w-4 h-4 text-ink-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setCursor(0) }}
            onKeyDown={onKey}
            placeholder="Search goals, materials, or type a command…"
            className="flex-1 bg-transparent text-sm text-ink-50 placeholder:text-ink-500 outline-none font-mono"
          />
          <kbd className="label-meta-sm px-1.5 py-0.5 border border-line rounded">esc</kbd>
        </div>
        <div className="max-h-[55vh] overflow-y-auto">
          {flat.length === 0 ? (
            <div className="px-4 py-8 text-center text-ink-500 font-mono text-sm">no matches</div>
          ) : (
            groups.map((g) => {
              const items = filtered.filter((c) => c.group === g.key)
              if (items.length === 0) return null
              return (
                <section key={g.key} className="py-1.5">
                  <p className="label-meta-sm px-4 py-1">{g.title}</p>
                  <ul>
                    {items.map((c) => {
                      const myIdx = idx++
                      const Icon = c.icon
                      return (
                        <li key={c.id}>
                          <button
                            onMouseEnter={() => setCursor(myIdx)}
                            onClick={() => c.run()}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition',
                              cursor === myIdx ? 'bg-hover text-ink-50' : 'text-ink-100 hover:bg-raised',
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
                            <span className="flex-1 truncate">{c.label}</span>
                            {c.hint && <span className="text-[11px] font-mono text-ink-500 truncate max-w-[40%]">{c.hint}</span>}
                            {cursor === myIdx && <ArrowRight className="w-3 h-3 text-brand-500 flex-shrink-0" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })
          )}
        </div>
        <footer className="flex items-center justify-between px-4 py-2 border-t border-line text-[10px] font-mono text-ink-500 uppercase tracking-wider">
          <span>{flat.length} result{flat.length === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-2">
            <kbd className="px-1 border border-line rounded">↑↓</kbd> nav
            <kbd className="px-1 border border-line rounded">↵</kbd> go
          </span>
        </footer>
      </div>
    </div>
  )
}
