import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, ArrowRight, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { v2 } from '../api/v2'
import { useAuth } from '../auth'

const DEMO_TICKER = [
  { code: 'TDI_SPOT_EC',   value: 15820, delta: +0.72 },
  { code: 'MDI_SPOT_EC',   value: 14867, delta: +0.18 },
  { code: 'HDI_SPOT_CN',   value: 42500, delta: -0.45 },
  { code: 'TOLUENE_SPOT',  value: 7330,  delta: +1.12 },
  { code: 'BRENT_SPOT',    value: 78.2,  delta: -0.8,  unit: 'USD/bbl' },
  { code: 'CNY_USD_SPOT',  value: 7.28,  delta: +0.05, unit: 'CNY/USD' },
]

const VALUE_PROPS = [
  'Replaces 2 hours of morning tab-switching across 生意社, 百川, 隆众',
  'Autopilot populates goals from plain English — no forms, no admin CRUD',
  'Every AI briefing traceable to source articles + time-series readings',
  'Multi-tenant: your goals, materials, formulas are private by default',
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const { refresh } = useAuth()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      const resp = await v2.requestMagicLink(email.trim())
      if (resp.dev_link) setDevLink(resp.dev_link)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const verifyDev = async () => {
    if (!devLink) return
    try {
      await fetch(devLink, { credentials: 'include' })
      await refresh()
      nav(next, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
      {/* Left hero panel */}
      <div className="relative bg-canvas overflow-hidden hidden lg:flex flex-col justify-between border-r border-line">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="relative p-12">
          <div className="flex items-center gap-2 font-mono text-sm tracking-widest text-brand-500 uppercase">
            <Activity className="w-4 h-4" />
            Choopoo
          </div>
          <h1 className="mt-8 text-display-sm font-semibold text-ink-50 tracking-tight leading-tight max-w-md">
            A trading desk for the PU procurement manager.
          </h1>
          <p className="mt-4 text-ink-400 text-sm max-w-md leading-relaxed">
            Prices, spreads, supply events, demand signals — consolidated, traceable, and
            self-composing. Built for a 60K t/y hardener SME that still runs on tab-switching at 7am.
          </p>

          <ul className="mt-10 space-y-2.5 text-sm max-w-md">
            {VALUE_PROPS.map((v) => (
              <li key={v} className="flex items-start gap-2 text-ink-200">
                <span className="text-brand-500 font-mono mt-0.5">·</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Demo ticker tape pinned bottom */}
        <div className="relative border-t border-line bg-surface/60 py-3 overflow-hidden">
          <div className="flex gap-8 px-12 font-mono text-xs whitespace-nowrap">
            {DEMO_TICKER.map((t) => (
              <div key={t.code} className="flex items-baseline gap-2">
                <span className="text-ink-400">{t.code}</span>
                <span className="text-ink-100 tnum">
                  {t.unit === 'USD/bbl' ? `$${t.value}` : t.unit === 'CNY/USD' ? `¥${t.value}` : `¥${t.value.toLocaleString()}`}
                </span>
                <span className={`flex items-center gap-0.5 tnum ${t.delta >= 0 ? 'text-up' : 'text-down'}`}>
                  {t.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {t.delta >= 0 ? '+' : ''}{t.delta.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 font-mono tracking-widest text-brand-500 uppercase text-sm">
            <Activity className="w-4 h-4" />
            Choopoo
          </div>
          <h2 className="text-lg font-semibold text-ink-50">Sign in</h2>
          <p className="text-xs font-mono text-ink-500 mt-1 uppercase tracking-wider">
            passwordless · magic link to your inbox
          </p>

          {!devLink ? (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <label className="block">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Work email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@your-org.com"
                  className="input-base input-mono mt-1.5"
                />
              </label>
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="btn-base btn-primary w-full"
              >
                <Mail className="w-3.5 h-3.5" />
                {sending ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-md bg-up-soft border border-up/30 px-4 py-3 text-xs text-up font-mono">
                Magic link generated. Production would email it; for the demo, click continue.
              </div>
              <button onClick={verifyDev} className="btn-base btn-primary w-full">
                Continue as {email}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] font-mono text-ink-500 break-all">link: {devLink}</p>
            </div>
          )}
          {error && <p className="mt-3 text-xs text-down font-mono">{error}</p>}

          <p className="mt-10 text-[11px] font-mono text-ink-500 leading-relaxed">
            First user of an email domain provisions the org automatically.
            Subsequent users join as analysts.
          </p>
        </div>
      </div>
    </div>
  )
}
