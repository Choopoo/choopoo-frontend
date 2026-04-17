import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, ArrowRight, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { v2 } from '../api/v2'
import { useAuth } from '../auth'
import { LocaleSwitcher } from '../components/LocaleSwitcher'

const DEMO_TICKER = [
  { code: 'TDI_SPOT_EC',   value: 15820, delta: +0.72 },
  { code: 'MDI_SPOT_EC',   value: 14867, delta: +0.18 },
  { code: 'HDI_SPOT_CN',   value: 42500, delta: -0.45 },
  { code: 'TOLUENE_SPOT',  value: 7330,  delta: +1.12 },
  { code: 'BRENT_SPOT',    value: 78.2,  delta: -0.8,  unit: 'USD/bbl' },
  { code: 'CNY_USD_SPOT',  value: 7.28,  delta: +0.05, unit: 'CNY/USD' },
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
  const { t, i18n } = useTranslation('auth')
  const tCommon = useTranslation().t

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm tracking-widest text-brand-500 uppercase">
              <Activity className="w-4 h-4" />
              {tCommon('app_name')}
            </div>
            <LocaleSwitcher />
          </div>
          <h1 className="mt-8 text-display-sm font-semibold text-ink-50 tracking-tight leading-tight max-w-md">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-ink-400 text-sm max-w-md leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <ul className="mt-10 space-y-2.5 text-sm max-w-md">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-start gap-2 text-ink-200">
                <span className="text-brand-500 font-mono mt-0.5">·</span>
                <span>{t(`value_props.${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Demo ticker tape pinned bottom */}
        <div className="relative border-t border-line bg-surface/60 py-3 overflow-hidden">
          <div className="flex gap-8 px-12 font-mono text-xs whitespace-nowrap">
            {DEMO_TICKER.map((d) => (
              <div key={d.code} className="flex items-baseline gap-2">
                <span className="text-ink-400">{d.code}</span>
                <span className="text-ink-100 tnum">
                  {d.unit === 'USD/bbl' ? `$${d.value}` : d.unit === 'CNY/USD' ? `¥${d.value}` : `¥${d.value.toLocaleString(i18n.language)}`}
                </span>
                <span className={`flex items-center gap-0.5 tnum ${d.delta >= 0 ? 'text-up' : 'text-down'}`}>
                  {d.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {d.delta >= 0 ? '+' : ''}{d.delta.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 font-mono tracking-widest text-brand-500 uppercase text-sm">
              <Activity className="w-4 h-4" />
              {tCommon('app_name')}
            </div>
            <LocaleSwitcher />
          </div>
          <h2 className="text-lg font-semibold text-ink-50">{t('form.title')}</h2>
          <p className="text-xs font-mono text-ink-500 mt-1 uppercase tracking-wider">
            {t('form.subtitle')}
          </p>

          {!devLink ? (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <label className="block">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{t('form.email_label')}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('form.email_placeholder')}
                  className="input-base input-mono mt-1.5"
                />
              </label>
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="btn-base btn-primary w-full"
              >
                <Mail className="w-3.5 h-3.5" />
                {sending ? t('form.sending') : t('form.send_button')}
              </button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-md bg-up-soft border border-up/30 px-4 py-3 text-xs text-up font-mono">
                {t('form.magic_link_generated')}
              </div>
              <button onClick={verifyDev} className="btn-base btn-primary w-full">
                {t('form.continue_as', { email })}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] font-mono text-ink-500 break-all">{t('form.dev_link_prefix')} {devLink}</p>
            </div>
          )}
          {error && <p className="mt-3 text-xs text-down font-mono">{error}</p>}

          <p className="mt-10 text-[11px] font-mono text-ink-500 leading-relaxed">
            {t('footer')}
          </p>
        </div>
      </div>
    </div>
  )
}
