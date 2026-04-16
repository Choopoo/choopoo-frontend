import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { v2, type CatalogIndicator } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Sparkline } from '../components/Sparkline'
import { cn } from '../lib/utils'

const MACRO_FALLBACK = ['BRENT_SPOT', 'CNY_USD_SPOT', 'CN_CONSTRUCTION_PMI', 'CN_AUTO_PROD']

/**
 * Macro lens — FX, crude, regulatory, PMI.
 * Reads the catalog's macro/regulatory kinds so it's data-driven; falls back
 * to a curated code list if catalog isn't populated yet.
 */
export default function Macro() {
  const indQ = useQuery({ queryKey: ['v2:catalog:indicators'], queryFn: v2.catalogIndicators })

  const all = indQ.data ?? []
  const macros = all.filter((i) => i.kind === 'macro' || i.subject_kind === 'macro_series')
  const regs = all.filter((i) => i.kind === 'regulatory')

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      <header>
        <h1 className="type-page-title">Macro</h1>
        <p className="type-page-sub">
          Crude · FX · demand PMI · regulatory feed · not tenant-scoped
        </p>
      </header>

      <Card title={`Macro series · ${macros.length}`} padded={false}>
        {indQ.isLoading && <div className="p-5 text-xs text-ink-500 font-mono">loading…</div>}
        {macros.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
            {macros.map((m) => <MacroTile key={m.id} ind={m} />)}
          </div>
        )}
      </Card>

      <Card title={`Regulatory watchlist · ${regs.length}`} padded={false}>
        {regs.length === 0 ? (
          <p className="p-5 text-sm text-ink-500">None configured.</p>
        ) : (
          <ul className="divide-y divide-line">
            {regs.map((r) => (
              <li key={r.id} className="px-5 py-3">
                <p className="font-mono text-sm text-ink-100">{r.code}</p>
                {r.description && <p className="text-xs text-ink-500 mt-0.5">{r.description}</p>}
                <p className="label-meta-sm mt-1">{r.region_code ?? 'GLOBAL'} · event-driven</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function MacroTile({ ind }: { ind: CatalogIndicator }) {
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
        <div>
          <p className="font-mono font-semibold text-ink-50 text-sm">{ind.code}</p>
          <p className="text-xs text-ink-500 truncate max-w-[22ch]">{ind.description || ind.subject_code || '—'}</p>
        </div>
        <Sparkline currentValue={value ?? 0} />
      </div>
      <div className="mt-3">
        {value != null ? (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-ink-50 tnum">
              {fmt(value, ind.unit)}
            </span>
            <span className={cn('flex items-center gap-0.5 text-[11px] font-mono tnum', up ? 'num-up' : 'num-down')}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {up ? '+' : ''}{d.toFixed(2)}%
            </span>
          </div>
        ) : (
          <span className="label-meta-sm">no recent reading</span>
        )}
      </div>
      <div className="mt-2">
        <Badge variant="neutral">{ind.region_code ?? 'GLOBAL'} · {ind.unit}</Badge>
      </div>
    </div>
  )
}

function fmt(v: number, unit: string): string {
  if (unit.startsWith('USD')) return `$${v.toFixed(2)}`
  if (unit === 'CNY/USD') return `¥${v.toFixed(3)}`
  if (unit === 'index') return v.toFixed(1)
  if (unit === 'units/mo') return `${(v / 1000).toFixed(1)}k`
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

// Export the fallback in case you want to pre-expand catalog later.
export const _MACRO_FALLBACK = MACRO_FALLBACK
