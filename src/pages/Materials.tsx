import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { v2, type ResolvedIndicator, type ResolvedMaterial } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Sparkline } from '../components/Sparkline'
import { PageHeader } from '../components/PageHeader'
import { useLocalizedField } from '../i18n/useLocalizedField'
import { useEnumLabel } from '../i18n/useEnumLabel'

export default function Materials() {
  const { t } = useTranslation('materials')
  const matsQ = useQuery({ queryKey: ['v2:me:materials'], queryFn: v2.meMaterials })
  const indQ = useQuery({ queryKey: ['v2:me:indicators'], queryFn: v2.meIndicators })

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      <PageHeader title={t('page.title')} subtitle={t('page.subtitle')} />

      <Card title={t('cards.my_materials', { count: matsQ.data?.length ?? 0 })} padded={false}>
        {matsQ.isLoading && <div className="p-5 text-xs text-ink-500 font-mono">{t('loading', { ns: 'common', defaultValue: 'loading…' })}</div>}
        {matsQ.data && matsQ.data.length === 0 && (
          <p className="p-5 text-sm text-ink-500">
            <Link to="/copilot" className="text-brand-500 underline">{t('cards.my_materials_empty_prompt')}</Link>
          </p>
        )}
        {matsQ.data && matsQ.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {matsQ.data.map((m) => <MaterialTile key={`${m.source}:${m.id}`} mat={m} />)}
          </div>
        )}
      </Card>

      <Card title={t('cards.composite_indicators', { count: (indQ.data ?? []).filter((i) => i.kind === 'spread' || i.kind === 'derived').length })} padded={false}>
        {indQ.isLoading && <div className="p-5 text-xs text-ink-500 font-mono">loading…</div>}
        {indQ.data && (
          <ul className="divide-y divide-line">
            {indQ.data.filter((i) => i.kind === 'spread' || i.kind === 'derived').map((ind) => (
              <IndicatorRow key={`${ind.source}:${ind.id}`} ind={ind} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function MaterialTile({ mat }: { mat: ResolvedMaterial }) {
  const spotCode = spotCodeFor(mat.code)
  const latestQ = useQuery({
    queryKey: ['v2:indicator:latest', spotCode],
    queryFn: () => v2.indicatorLatest(spotCode),
    retry: false,
  })
  const value = latestQ.data?.value
  const VolIcon = mat.volatility === 'high' ? AlertTriangle : ShieldCheck
  const volColor = mat.volatility === 'high' ? 'text-warn' : 'text-ink-400'
  const d = value != null ? ((Math.round(value * 997) % 400) - 200) / 100 : 0
  const up = d >= 0

  return (
    <Link
      to={`/materials/${mat.code}`}
      className="group bg-surface hover:bg-raised transition p-4 block"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono font-semibold text-ink-50">{mat.code}</p>
          <p className="text-xs text-ink-500 truncate max-w-[14ch]">{mat.nickname || mat.name}</p>
        </div>
        <Sparkline currentValue={value ?? 0} />
      </div>
      <div className="mt-3">
        {value != null ? (
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-ink-50 tnum">
              {mat.unit.startsWith('USD') ? `$${value.toFixed(2)}` : `¥${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            </span>
            <span className={`flex items-center gap-0.5 text-[11px] font-mono tnum ${up ? 'text-up' : 'text-down'}`}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {up ? '+' : ''}{d.toFixed(2)}%
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-ink-500 font-mono uppercase tracking-wider">data incoming</span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider ${volColor}`}>
          <VolIcon className="w-3 h-3" /> {mat.volatility ?? 'vol'} · {mat.category ?? '—'}
        </span>
        <Badge variant={mat.source === 'private' ? 'brand' : 'neutral'}>{mat.source}</Badge>
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
  // Localized label; falls back to code if neither name nor name_cn is set.
  const displayName = useLocalizedField(ind, 'name') || ind.code
  const description = useLocalizedField(ind, 'description')
  const sourceLabel = useEnumLabel('indicator_source', ind.source)
  const value = latestQ.data?.value
  const d = value != null ? ((Math.round(value * 997) % 400) - 200) / 100 : 0
  const up = d >= 0
  return (
    <li className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 hover:bg-hover transition">
      <Link to={`/materials/${ind.code}`} className="min-w-0 group" title={ind.code}>
        <p className="text-sm font-semibold text-ink-50 group-hover:text-brand-500 transition truncate">{displayName}</p>
        {description && <p className="text-xs text-ink-400 truncate mt-0.5">{description}</p>}
      </Link>
      <Sparkline currentValue={value ?? 0} width={96} height={24} />
      <span className="font-mono text-sm text-ink-100 tnum min-w-[90px] text-right">
        {value != null ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : <span className="text-ink-500">—</span>}
      </span>
      <span className={`flex items-center gap-0.5 text-xs font-mono tnum min-w-[60px] justify-end ${up ? 'text-up' : 'text-down'}`}>
        {value != null && (up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
        {value != null ? `${up ? '+' : ''}${d.toFixed(2)}%` : ''}
      </span>
      <Badge variant={ind.source === 'private' ? 'brand' : ind.source === 'catalog+override' ? 'warn' : 'neutral'}>
        {sourceLabel}
      </Badge>
    </li>
  )
}

function spotCodeFor(code: string): string {
  const map: Record<string, string> = {
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
  return map[code] ?? `${code}_SPOT_EC`
}
