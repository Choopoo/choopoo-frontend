import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react'
import { v2, type ResolvedIndicator, type ResolvedMaterial } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { formatPrice } from '../lib/utils'

export default function Materials() {
  const matsQ = useQuery({ queryKey: ['v2:me:materials'], queryFn: v2.meMaterials })
  const indQ = useQuery({ queryKey: ['v2:me:indicators'], queryFn: v2.meIndicators })

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Materials</h1>
        <p className="text-sm text-ink-500 mt-1">
          What you're tracking on the buy side. Latest values resolved live by the composer.
        </p>
      </header>

      <Card title={`My materials (${matsQ.data?.length ?? 0})`}>
        {matsQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {matsQ.data && matsQ.data.length === 0 && (
          <p className="text-sm text-ink-500">
            None enabled yet. <Link to="/copilot" className="text-brand-700 underline">Ask the copilot</Link>{' '}
            "enable TDI" or browse the catalog.
          </p>
        )}
        {matsQ.data && matsQ.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matsQ.data.map((m) => <MaterialTile key={`${m.source}:${m.id}`} mat={m} />)}
          </div>
        )}
      </Card>

      <Card title={`Composite indicators (${(indQ.data ?? []).filter((i) => i.kind === 'spread' || i.kind === 'derived').length})`}>
        {indQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {indQ.data && (
          <ul className="divide-y divide-ink-100">
            {indQ.data
              .filter((i) => i.kind === 'spread' || i.kind === 'derived')
              .map((ind) => <IndicatorRow key={`${ind.source}:${ind.id}`} ind={ind} />)}
          </ul>
        )}
      </Card>
    </div>
  )
}

function MaterialTile({ mat }: { mat: ResolvedMaterial }) {
  // Each material has a default spot indicator we can resolve to surface a price.
  const spotCode = `${mat.code}_SPOT_EC`
  const latestQ = useQuery({
    queryKey: ['v2:indicator:latest', spotCode],
    queryFn: () => v2.indicatorLatest(spotCode),
    retry: false,
  })

  const VolIcon = mat.volatility === 'high' ? AlertTriangle : ShieldCheck
  const volColor = mat.volatility === 'high' ? 'text-amber-600' : 'text-emerald-600'

  return (
    <Link
      to={`/materials/${mat.code}`}
      className="block bg-white border border-ink-200 rounded-lg p-4 hover:border-brand-300 transition"
    >
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-mono font-semibold text-ink-900">{mat.code}</span>
        <Badge variant={mat.source === 'private' ? 'brand' : 'neutral'}>{mat.source}</Badge>
      </div>
      <p className="text-xs text-ink-500 truncate">{mat.nickname || mat.name}</p>
      <div className="mt-3">
        {latestQ.isLoading && <p className="text-xs text-ink-400">…</p>}
        {latestQ.data ? (
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-ink-900">
              {mat.unit.startsWith('USD') ? `$${latestQ.data.value}` : formatPrice(latestQ.data.value)}
            </span>
            <span className="text-xs text-ink-400">/{mat.unit.split('/')[1] || 'unit'}</span>
          </div>
        ) : (
          <p className="text-xs text-ink-400">no recent reading</p>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {mat.volatility && (
          <span className={`flex items-center gap-1 ${volColor}`}>
            <VolIcon className="w-3 h-3" /> {mat.volatility}
          </span>
        )}
        {mat.category && <span className="text-ink-400">· {mat.category}</span>}
      </div>
    </Link>
  )
}

function IndicatorRow({ ind }: { ind: ResolvedIndicator }) {
  const latestQ = useQuery({
    queryKey: ['v2:indicator:latest', ind.code],
    queryFn: () => v2.indicatorLatest(ind.code),
    retry: false,
  })
  return (
    <li className="py-2 flex items-baseline justify-between">
      <Link to={`/materials/${ind.code}`} className="flex-1">
        <span className="font-mono text-sm text-ink-900 hover:text-brand-700">{ind.code}</span>
        {ind.description && <p className="text-xs text-ink-500 mt-0.5">{ind.description}</p>}
      </Link>
      <span className="flex items-center gap-3">
        <Badge variant={ind.source === 'private' ? 'brand' : ind.source === 'catalog+override' ? 'warn' : 'neutral'}>
          {ind.source}
        </Badge>
        <span className="text-sm font-mono text-ink-900 min-w-[80px] text-right">
          {latestQ.data ? (
            <span className="flex items-center justify-end gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-ink-400" />
              {Number(latestQ.data.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          ) : latestQ.isLoading ? '…' : '—'}
        </span>
      </span>
    </li>
  )
}
