import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Bot, User, Wrench } from 'lucide-react'
import { v2, type CopilotResponse } from '../api/v2'

type Turn =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; tool_calls: CopilotResponse['tool_calls'] }

const SUGGESTIONS = [
  'goal:Track TDI cost lens=buy horizon=90',
  'search:material:TDI',
  'enable:material:1 nickname=主原料 TDI',
  'compose:TDI_TOLUENE_SPREAD_CUSTOM:CNY/ton:{"op":"subtract","left":{"indicator_code":"TDI_SPOT_EC"},"right":{"indicator_code":"TOLUENE_SPOT"}}',
]

export default function Copilot() {
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const qc = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const mut = useMutation({
    mutationFn: (msg: string) => v2.copilotConverse(msg),
    onSuccess: (resp, msg) => {
      setTurns((t) => [...t, { role: 'user', text: msg }, { role: 'assistant', text: resp.text, tool_calls: resp.tool_calls }])
      // Invalidate lists so the user sees newly created entities.
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
    <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      <header className="mb-3">
        <h1 className="text-2xl font-semibold text-ink-900">Copilot</h1>
        <p className="text-sm text-ink-500">
          Compose goals, materials, and indicators conversationally. Stub mode is active when{' '}
          <code>ANTHROPIC_API_KEY</code> is unset — try a structured command from the suggestions below.
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white border border-ink-200 rounded-lg p-4 space-y-4">
        {turns.length === 0 && (
          <div className="text-center text-ink-400 text-sm py-8">No messages yet.</div>
        )}
        {turns.map((t, i) =>
          t.role === 'user' ? (
            <div key={i} className="flex items-start gap-3 justify-end">
              <div className="flex-1 text-right">
                <div className="inline-block max-w-[80%] bg-brand-50 border border-brand-100 px-3 py-2 rounded-lg text-sm text-ink-900">
                  {t.text}
                </div>
              </div>
              <User className="w-6 h-6 text-ink-400 mt-1" />
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-brand-600 mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="inline-block bg-ink-100 px-3 py-2 rounded-lg text-sm text-ink-900 whitespace-pre-line">
                  {t.text}
                </div>
                {t.tool_calls && t.tool_calls.length > 0 && (
                  <div className="space-y-1">
                    {t.tool_calls.map((tc, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-ink-500 font-mono">
                        <Wrench className="w-3.5 h-3.5 mt-0.5 text-ink-400 flex-shrink-0" />
                        <div>
                          <div>{tc.name}({JSON.stringify(tc.input)})</div>
                          {tc.result !== undefined && (
                            <div className="text-emerald-600">→ {JSON.stringify(tc.result)}</div>
                          )}
                          {tc.error && <div className="text-red-600">→ error: {tc.error}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
        )}
        {mut.isPending && (
          <div className="flex items-center gap-3 text-ink-400 text-sm">
            <Bot className="w-6 h-6 text-brand-600" />
            <span>Thinking…</span>
          </div>
        )}
        {mut.isError && (
          <div className="text-sm text-red-600">{(mut.error as Error).message}</div>
        )}
      </div>

      <div className="mt-3 mb-2 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="text-xs font-mono bg-ink-100 text-ink-700 px-2 py-1 rounded-md hover:bg-ink-200"
          >
            {s.length > 50 ? s.slice(0, 47) + '…' : s}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the copilot or run a stub command…"
          className="flex-1 border border-ink-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          disabled={mut.isPending}
        />
        <button
          type="submit"
          disabled={mut.isPending || !input.trim()}
          className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  )
}
