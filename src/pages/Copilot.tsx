import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Wrench, ChevronRight } from 'lucide-react'
import { v2, type CopilotResponse } from '../api/v2'

type Turn =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; tool_calls: CopilotResponse['tool_calls'] }

const SUGGESTIONS = [
  'goal:Track TDI cost lens=buy horizon=90',
  'search:material:TDI',
  'enable:material:1 nickname=主原料 TDI',
  'compose:MY_TDI_TOLUENE:CNY/ton:{"op":"subtract","left":{"indicator_code":"TDI_SPOT_EC"},"right":{"indicator_code":"TOLUENE_SPOT"}}',
]

export default function Copilot() {
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const qc = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const mut = useMutation({
    mutationFn: (msg: string) => v2.copilotConverse(msg),
    onSuccess: (resp, msg) => {
      setTurns((t) => [
        ...t,
        { role: 'user', text: msg },
        { role: 'assistant', text: resp.text, tool_calls: resp.tool_calls },
      ])
      qc.invalidateQueries({ queryKey: ['v2:goals'] })
      qc.invalidateQueries({ queryKey: ['v2:me:materials'] })
      qc.invalidateQueries({ queryKey: ['v2:me:indicators'] })
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [turns, mut.isPending])

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const msg = input.trim()
    if (!msg) return
    setInput('')
    mut.mutate(msg)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-ink-50 tracking-tight">Copilot</h1>
        <p className="text-xs font-mono text-ink-500 mt-1 uppercase tracking-wider">
          stub mode when <span className="text-brand-500">ANTHROPIC_API_KEY</span> unset · every tool call hits gateway with your org_id
        </p>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-canvas border border-line rounded-lg p-4 font-mono text-xs"
      >
        {turns.length === 0 && (
          <div className="text-center text-ink-500 py-8 font-mono">
            <p className="text-[11px] uppercase tracking-widest">awaiting input</p>
            <p className="mt-1">try one of the suggestions below ↓</p>
          </div>
        )}
        {turns.map((t, i) =>
          t.role === 'user' ? (
            <div key={i} className="my-3 flex items-start gap-2">
              <span className="text-brand-500 select-none flex-shrink-0">▸</span>
              <span className="text-ink-50 break-all">{t.text}</span>
            </div>
          ) : (
            <div key={i} className="my-3 pl-5 space-y-2 border-l border-line">
              <pre className="text-ink-100 whitespace-pre-wrap break-words">{t.text}</pre>
              {t.tool_calls && t.tool_calls.length > 0 && (
                <div className="space-y-1 pt-1">
                  {t.tool_calls.map((tc, j) => (
                    <div key={j} className="flex items-start gap-2 text-ink-400">
                      <Wrench className="w-3 h-3 mt-0.5 text-ink-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1 break-all">
                        <div>
                          <span className="text-brand-500">{tc.name}</span>
                          <span className="text-ink-500">(</span>
                          <span className="text-ink-200">{JSON.stringify(tc.input)}</span>
                          <span className="text-ink-500">)</span>
                        </div>
                        {tc.result !== undefined && (
                          <div className="text-up">→ {JSON.stringify(tc.result)}</div>
                        )}
                        {tc.error && <div className="text-down">→ {tc.error}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
        {mut.isPending && (
          <div className="my-3 flex items-center gap-2 text-ink-400">
            <span className="text-brand-500 animate-pulse">▸</span>
            <span>thinking…</span>
          </div>
        )}
        {mut.isError && (
          <div className="my-3 text-down">error: {(mut.error as Error).message}</div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="text-[10px] font-mono bg-surface hover:bg-raised border border-line text-ink-400 hover:text-ink-100 px-2 py-1 rounded-md max-w-full truncate"
            title={s}
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2 items-center bg-canvas border border-line focus-within:border-brand-500 rounded-md px-3">
        <ChevronRight className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask or run a stub command…"
          className="flex-1 bg-transparent py-2.5 text-sm font-mono text-ink-50 placeholder:text-ink-500 outline-none"
          disabled={mut.isPending}
        />
        <button
          type="submit"
          disabled={mut.isPending || !input.trim()}
          className="flex items-center gap-1 bg-brand-600 text-canvas text-[11px] font-mono uppercase tracking-wider font-semibold px-3 py-1.5 my-1.5 rounded-md hover:bg-brand-500 disabled:opacity-40"
        >
          <Send className="w-3 h-3" />
          Send
        </button>
      </form>
    </div>
  )
}
