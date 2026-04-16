import { useQuery } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import { api } from '../api/client'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { BriefingCard } from '../components/BriefingCard'
import { CostChainCard } from '../components/CostChainCard'
import { PriceChart } from '../components/PriceChart'
import { SupplyEventsCard } from '../components/SupplyEventsCard'
import {
  MOCK_COST_CHAIN,
  MOCK_PRICE_SERIES,
  MOCK_RESULTS,
  MOCK_SUPPLY_EVENTS,
} from '../lib/mockData'
import { formatPct, formatPrice } from '../lib/utils'

export default function Dashboard() {
  const statusQ = useQuery({
    queryKey: ['status'],
    queryFn: api.status,
    retry: false,
  })
  const resultsQ = useQuery({
    queryKey: ['results', { material: 'TDI', limit: 20 }],
    queryFn: () => api.listResults({ material: 'TDI', limit: 20 }),
    retry: false,
  })

  const liveResults = resultsQ.data && resultsQ.data.length > 0
  const results = liveResults ? resultsQ.data! : MOCK_RESULTS
  const topBriefing = results[0]
  const pipelineOk = statusQ.data?.status === 'ok'

  const current = MOCK_PRICE_SERIES[MOCK_PRICE_SERIES.length - 1].price
  const prev = MOCK_PRICE_SERIES[MOCK_PRICE_SERIES.length - 2].price
  const change = current - prev
  const changePct = (change / prev) * 100

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">TDI Price Intelligence</h1>
          <p className="text-sm text-ink-500 mt-1">
            Automated daily briefing — replaces ~2 hours of manual research
          </p>
        </div>
        <Badge variant={pipelineOk ? 'ok' : statusQ.isLoading ? 'neutral' : 'warn'}>
          {pipelineOk ? 'Pipeline OK' : statusQ.isLoading ? 'Checking…' : 'Using demo data'}
        </Badge>
      </div>

      <Card>
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-xs text-ink-500 uppercase tracking-wide">
            TDI East China Spot · 生意社
          </p>
          <span className="text-xs text-ink-400">as of today</span>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-semibold text-ink-900">{formatPrice(current)}</span>
          <span className="text-lg text-ink-500">/ton</span>
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              change >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {change >= 0 ? '+' : ''}{change} ({formatPct(changePct)})
          </span>
        </div>
        <div className="mt-4">
          <PriceChart data={MOCK_PRICE_SERIES} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CostChainCard data={MOCK_COST_CHAIN} />
        <div className="lg:col-span-2">
          {topBriefing && (
            <BriefingCard
              summary={topBriefing.summary}
              recommendation={topBriefing.recommendation}
              source={topBriefing.source_label}
            />
          )}
        </div>
      </div>

      <SupplyEventsCard events={MOCK_SUPPLY_EVENTS} />
    </div>
  )
}
