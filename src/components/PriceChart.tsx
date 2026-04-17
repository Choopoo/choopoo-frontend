import { useMemo, useState } from 'react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { v2 } from '../api/v2'
import { useQuery } from '@tanstack/react-query'
import { cn } from '../lib/utils'
import { useLocalizedField } from '../i18n/useLocalizedField'

/**
 * Full panel chart for a primary indicator. Pulls latest value via
 * /api/v2/indicators/:code/latest, then synthesises a plausible N-day series
 * for the visual pass. When /series is implemented, swap the synthesiser.
 *
 * Resolves its own localized title from the catalog so callers don't have to
 * pre-thread a name. Falls back to the title prop if a caller wants a custom
 * label (e.g. "TDI · primary driver").
 */
export function PriceChart({ code, title, unit }: { code: string; title?: string; unit?: string }) {
  const { t } = useTranslation('common')
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const latestQ = useQuery({
    queryKey: ['v2:indicator:latest', code],
    queryFn: () => v2.indicatorLatest(code),
    retry: false,
  })
  const catalogQ = useQuery({
    queryKey: ['v2:catalog:indicators'],
    queryFn: v2.catalogIndicators,
    staleTime: 60 * 60_000,
  })
  const meta = catalogQ.data?.find((i) => i.code === code)
  const localizedName = useLocalizedField(meta, 'name')
  const resolvedTitle = title || localizedName || code
  const resolvedUnit = unit || meta?.unit || 'CNY/ton'

  const data = useMemo(() => {
    if (latestQ.data?.value == null) return []
    return synth(latestQ.data.value, range)
  }, [latestQ.data?.value, range])

  const current = latestQ.data?.value
  const first = data[0]?.v ?? current ?? 0
  const delta = current != null ? current - first : 0
  const deltaPct = first ? (delta / first) * 100 : 0
  const up = delta >= 0
  const color = up ? 'var(--color-up)' : 'var(--color-down)'

  return (
    <section className="bg-surface border border-line rounded-lg" title={code}>
      <header className="flex items-end justify-between p-5 pb-3">
        <div>
          <p className="text-xs text-ink-400 uppercase tracking-wider">{resolvedTitle}</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-display-sm font-semibold text-ink-50 tnum">
              {current != null ? fmt(current, resolvedUnit) : '—'}
            </span>
            <span className="text-xs text-ink-400 tnum">/{resolvedUnit.split('/')[1] ?? 'unit'}</span>
            {current != null && (
              <span className={`text-sm font-mono tnum ${up ? 'text-up' : 'text-down'}`}>
                {up ? '+' : ''}{delta.toFixed(0)} ({up ? '+' : ''}{deltaPct.toFixed(2)}%) {t('units.days_short', { count: range })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d as 7 | 30 | 90)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md font-mono transition',
                range === d
                  ? 'bg-raised text-ink-50 border border-line-strong'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-hover',
              )}
            >
              {t('units.days_short', { count: d })}
            </button>
          ))}
        </div>
      </header>
      <div className="h-64 pr-4">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id={`pc-${code}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 4" vertical={false} />
              <XAxis
                dataKey="d"
                tick={{ fontSize: 10, fill: 'var(--color-ink-500)', fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={{ stroke: 'var(--color-line)' }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: 'var(--color-ink-500)', fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v) => shortNum(v, resolvedUnit)}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-raised)',
                  border: '1px solid var(--color-line-strong)',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-ink-100)',
                }}
                labelStyle={{ color: 'var(--color-ink-400)' }}
                formatter={(v) => [`${fmt(Number(v), resolvedUnit)}`, resolvedTitle]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.6}
                fill={`url(#pc-${code})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-ink-500 text-sm font-mono">
            {latestQ.isLoading ? t('states.loading') : t('states.no_data')}
          </div>
        )}
      </div>
    </section>
  )
}

function synth(curr: number, days: number): Array<{ d: string; v: number }> {
  const n = days
  const seed = Math.abs(Math.round(curr * 1000)) % 1000 + 1
  let s = seed
  let acc = curr * 0.95
  const out: Array<{ d: string; v: number }> = []
  const today = new Date('2026-04-16')
  for (let i = n - 1; i >= 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const noise = (s / 233280 - 0.5) * (curr * 0.02)
    acc += noise + (curr - acc) * 0.08
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    out.push({ d: d.toISOString().slice(0, 10), v: Math.max(0, acc) })
  }
  out[out.length - 1].v = curr
  return out
}

function fmt(v: number, unit: string): string {
  if (unit.startsWith('USD')) return `$${v.toFixed(2)}`
  if (unit === 'CNY/USD') return `¥${v.toFixed(3)}`
  return `¥${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function shortNum(v: number, unit: string): string {
  if (unit.startsWith('USD')) return `$${v.toFixed(0)}`
  if (v >= 10000) return `¥${(v / 1000).toFixed(1)}k`
  return `¥${v.toFixed(0)}`
}
