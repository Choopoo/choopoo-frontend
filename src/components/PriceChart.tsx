import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PricePoint } from '../api/types'
import { cn } from '../lib/utils'

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '365d', days: 365 },
]

export function PriceChart({ data }: { data: PricePoint[] }) {
  const [range, setRange] = useState(30)
  const filtered = useMemo(() => data.slice(-range), [data, range])

  return (
    <div>
      <div className="flex items-center gap-1 mb-3">
        {RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setRange(r.days)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-md transition',
              range === r.days
                ? 'bg-brand-100 text-brand-700 font-medium'
                : 'text-ink-500 hover:bg-ink-100',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => v.slice(5)}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `¥${(v / 1000).toFixed(1)}k`}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#64748b' }}
              formatter={(v) => [`¥${Number(v).toLocaleString()}/ton`, 'TDI Spot']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
