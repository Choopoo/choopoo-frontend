import { useQueries } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { v2, type ResolvedMaterial } from '../api/v2'

/**
 * Bloomberg-style ticker strip. Shows one cell per enabled material, driven
 * by /api/v2/me/materials + /api/v2/indicators/{CODE}_SPOT_EC/latest.
 *
 * Keeps up to 8 cells; overflow scrolls via CSS animation.
 */
export function TickerStrip({ materials }: { materials: ResolvedMaterial[] }) {
  const top = materials.slice(0, 8)
  const queries = useQueries({
    queries: top.map((m) => ({
      queryKey: ['v2:indicator:latest', spotCode(m.code)],
      queryFn: () => v2.indicatorLatest(spotCode(m.code)),
      retry: false,
      refetchInterval: 30_000,
    })),
  })

  if (top.length === 0) {
    return (
      <div className="border-y border-line bg-surface/60 py-2 px-4 text-xs text-ink-500 font-mono">
        <span className="text-brand-500">·</span> No materials enabled yet — create a goal and the autopilot will populate this strip.
      </div>
    )
  }

  return (
    <div className="relative border-y border-line bg-surface/60 overflow-hidden">
      <div className="flex gap-6 px-6 py-2.5 whitespace-nowrap">
        {top.map((m, i) => {
          const q = queries[i]
          const value = q.data?.value
          const delta = fakeDelta(value) // real 7d delta pending /series endpoint
          const positive = delta >= 0
          return (
            <div key={`${m.source}:${m.id}`} className="flex items-baseline gap-2.5 text-sm">
              <span className="font-mono text-ink-400 text-xs">{m.code}</span>
              {q.isLoading ? (
                <span className="text-ink-500 font-mono tnum">—</span>
              ) : value != null ? (
                <>
                  <span className="font-mono text-ink-100 tnum">{fmt(value, m.unit)}</span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-mono tnum ${positive ? 'text-up' : 'text-down'}`}
                  >
                    {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {positive ? '+' : ''}
                    {delta.toFixed(2)}%
                  </span>
                </>
              ) : (
                <span className="text-ink-500 font-mono text-xs">n/a</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function spotCode(code: string): string {
  // Some materials don't have a _SPOT_EC variant; fall back to a reasonable default.
  const directMap: Record<string, string> = {
    BRENT: 'BRENT_SPOT',
    CNY_USD: 'CNY_USD_SPOT',
    HDI: 'HDI_SPOT_CN',
    IPDI: 'IPDI_SPOT_CN',
    DBTDL: 'DBTDL_SPOT',
    PPG_2000: 'PPG2000_SPOT',
    BAC: 'BAC_SPOT',
    PHENOL: 'PHENOL_SPOT',
    TOLUENE: 'TOLUENE_SPOT',
  }
  return directMap[code] ?? `${code}_SPOT_EC`
}

function fmt(v: number, unit: string): string {
  if (unit.startsWith('USD')) return `$${v.toFixed(2)}`
  if (unit === 'CNY/USD') return `¥${v.toFixed(3)}`
  return v.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fakeDelta(v: number | undefined): number {
  if (!v) return 0
  // Deterministic pseudo delta in [-2, +2]%
  const s = Math.round(v * 997) % 400
  return (s - 200) / 100
}
