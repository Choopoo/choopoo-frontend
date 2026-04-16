import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { v2 } from '../api/v2'
import { useAuth } from '../auth'

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
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-md bg-white border border-ink-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">C</span>
          <h1 className="text-xl font-semibold text-ink-900">Choopoo</h1>
        </div>
        <p className="text-sm text-ink-500 mb-6">Procurement & GTM copilot for PU SMEs</p>

        {!devLink ? (
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="text-xs text-ink-500">Work email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@your-org.com"
                className="mt-1 w-full border border-ink-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              Magic link generated. In production we'd email it to you; for the demo, click verify.
            </div>
            <button
              onClick={verifyDev}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-700"
            >
              Continue as {email}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-ink-400 text-center break-all">link: {devLink}</p>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
