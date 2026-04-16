import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from './Card'
import { formatPrice } from '../lib/utils'

type CostChain = {
  brent_usd: number
  toluene_cny: number
  tdi_spot_cny: number
  spread: number
  spread_trend: 'widening' | 'narrowing' | 'flat'
}

export function CostChainCard({ data }: { data: CostChain }) {
  const TrendIcon = data.spread_trend === 'widening' ? ArrowUpRight : ArrowDownRight
  const trendColor =
    data.spread_trend === 'widening' ? 'text-emerald-600' : 'text-red-600'

  return (
    <Card title="Cost Chain">
      <dl className="space-y-3">
        <Row label="Brent crude" value={`$${data.brent_usd.toFixed(1)}`} unit="/bbl" />
        <Row label="Toluene" value={formatPrice(data.toluene_cny)} unit="/ton" />
        <Row label="TDI spot" value={formatPrice(data.tdi_spot_cny)} unit="/ton" emphasis />
        <div className="h-px bg-ink-200 my-2" />
        <div className="flex items-baseline justify-between">
          <dt className="text-xs text-ink-500">TDI – Toluene spread</dt>
          <dd className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            {formatPrice(data.spread)} <span className="text-ink-400 font-normal">/ton</span>
          </dd>
        </div>
        <p className="text-xs text-ink-400 capitalize">Trend: {data.spread_trend}</p>
      </dl>
    </Card>
  )
}

function Row({
  label,
  value,
  unit,
  emphasis,
}: {
  label: string
  value: string
  unit: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className={emphasis ? 'text-sm font-semibold text-ink-900' : 'text-sm text-ink-700'}>
        {value} <span className="text-ink-400 font-normal">{unit}</span>
      </dd>
    </div>
  )
}
