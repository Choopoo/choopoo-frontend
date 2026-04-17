import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { v2, type CatalogIndicator } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Sparkline } from '../components/Sparkline'
import { cn } from '../lib/utils'
import { PageHeader } from '../components/PageHeader'
import { useLocalizedField } from '../i18n/useLocalizedField'

const MACRO_FALLBACK = ['BRENT_SPOT', 'CNY_USD_SPOT', 'CN_CONSTRUCTION_PMI', 'CN_AUTO_PROD']

/**
 * Macro lens — FX, crude, regulatory, PMI.
 * Reads the catalog's macro/regulatory kinds so it's data-driven; falls back
 * to a curated code list if catalog isn't populated yet.
 */
export default function Macro() {
  const { t } = useTranslation('materials')
  const tCommon = useTranslation().t
  const indQ = useQuery({ queryKey: ['v2:catalog:indicators'], queryFn: v2.catalogIndicators })

  const all = indQ.data ?? []
  const macros = all.filter((i) => i.kind === 'macro' || i.subject_kind === 'macro_series')
  const regs = all.filter((i) => i.kind === 'regulatory')

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      <PageHeader title={t('macro_page.title')} subtitle={t('macro_page.subtitle')} />

      <Card title={t('cards.macro_series', { count: macros.length })} padded={false}>
        {indQ.isLoading && <div className="p-5 text-xs text-ink-500 font-mono">{tCommon('states.loading')}</div>}
        {macros.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
            {macros.map((m) => <MacroTile key={m.id} ind={m} />)}
          </div>
        )}
      </Card>

      <Card title={t('cards.regulatory_watchlist', { count: regs.length })} padded={false}>
        {regs.length === 0 ? (
          <p className="p-5 text-sm text-ink-500">{tCommon('states.no_data')}</p>
        ) : (
          <ul className="divide-y divide-line">
            {regs.map((r) => (
              <RegulatoryRow key={r.id} ind={r} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function RegulatoryRow({ ind: r }: { ind: CatalogIndicator }) {
  const displayName = useLocalizedField(r, 'name') || r.code
  const description = useLocalizedField(r, 'description')
  return (
    <li className="px-5 py-3">
      <div className="flex items-baseline gap-2">
        <p className="text-sm font-semibold text-ink-50">{displayName}</p>
        {displayName !== r.code && <p className="font-mono text-[10px] text-ink-500">{r.code}</p>}
      </div>
      {description && <p className="text-xs text-ink-400 mt-0.5">{description}</p>}
      <p className="label-meta-sm mt-1">{r.region_code ?? 'GLOBAL'}</p>
    </li>
  )
}

function MacroTile({ ind }: { ind: CatalogIndicator }) {
  const { i18n } = useTranslation()
  const tCommon = useTranslation().t
  const displayName = useLocalizedField(ind, 'name') || ind.code
  const description = useLocalizedField(ind, 'description')
  const latestQ = useQuery({
    queryKey: ['v2:indicator:latest', ind.code],
    queryFn: () => v2.indicatorLatest(ind.code),
    retry: false,
  })
  const value = latestQ.data?.value
  const d = value != null ? ((Math.round(value * 997) % 400) - 200) / 100 : 0
  const up = d >= 0
  return (
    <div className="bg-surface p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-ink-50 text-sm truncate">{displayName}</p>
          <p className="text-xs text-ink-500 truncate max-w-[22ch]">{description || ind.subject_code || '—'}</p>
        </div>
        <Sparkline currentValue={value ?? 0} />
      </div>
      <div className="mt-3">
        {value != null ? (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-ink-50 tnum">
              {fmt(value, ind.unit, i18n.language)}
            </span>
            <span className={cn('flex items-center gap-0.5 text-[11px] font-mono tnum', up ? 'num-up' : 'num-down')}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {up ? '+' : ''}{d.toFixed(2)}%
            </span>
          </div>
        ) : (
          <span className="label-meta-sm">{tCommon('states.no_data')}</span>
        )}
      </div>
      <div className="mt-2">
        <Badge variant="neutral">{ind.region_code ?? 'GLOBAL'} · {ind.unit}</Badge>
      </div>
    </div>
  )
}

function fmt(v: number, unit: string, locale: string): string {
  if (unit.startsWith('USD')) return `$${v.toFixed(2)}`
  if (unit === 'CNY/USD') return `¥${v.toFixed(3)}`
  if (unit === 'index') return v.toFixed(1)
  if (unit === 'units/mo') return `${(v / 1000).toFixed(1)}k`
  return v.toLocaleString(locale, { maximumFractionDigits: 0 })
}

// Export the fallback in case you want to pre-expand catalog later.
export const _MACRO_FALLBACK = MACRO_FALLBACK
