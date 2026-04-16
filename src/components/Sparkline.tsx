import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

/**
 * Minimal Recharts area-line for a tile glyph.
 *
 * Pass `points` as a list of numeric values (most recent last). If omitted but
 * `currentValue` is given, a plausible 30-point series is synthesised so the
 * glyph lands visually — this is for the v1 visual pass; replace with real
 * series data when /api/v2/indicators/:code/series lands.
 */
export function Sparkline({
  points,
  currentValue,
  width = 96,
  height = 28,
}: {
  points?: number[]
  currentValue?: number
  width?: number | string
  height?: number
}) {
  const data = useMemo(() => {
    const arr = points && points.length > 1 ? points : synth(currentValue ?? 1)
    return arr.map((v, i) => ({ i, v }))
  }, [points, currentValue])

  const first = data[0]?.v ?? 0
  const last = data[data.length - 1]?.v ?? 0
  const trendingUp = last >= first
  const stroke = trendingUp ? 'var(--color-up)' : 'var(--color-down)'

  return (
    <div style={{ width, height }} className="opacity-90">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${trendingUp ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.4}
            fill={`url(#spark-${trendingUp ? 'up' : 'dn'})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Deterministic per-value pseudo-random walk so the glyph is stable across re-renders.
function synth(curr: number): number[] {
  const n = 28
  const seed = Math.abs(Math.round(curr * 1000)) % 1000 + 1
  const out: number[] = []
  let acc = curr * 0.94
  let s = seed
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280
    const noise = (s / 233280 - 0.5) * (curr * 0.015)
    acc += noise + (curr - acc) * 0.08
    out.push(acc)
  }
  out[out.length - 1] = curr
  return out
}
