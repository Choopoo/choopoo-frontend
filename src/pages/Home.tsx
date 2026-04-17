import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Plus, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { v2, type ResolvedIndicator, type ResolvedMaterial } from '../api/v2'
import { GoalCard } from '../components/GoalCard'
import { TickerStrip } from '../components/TickerStrip'
import { Markdown } from '../components/Markdown'
import { Card } from '../components/Card'
import { Sparkline } from '../components/Sparkline'
import { cn } from '../lib/utils'
import { useLocalizedField } from '../i18n/useLocalizedField'
import { useEnumLabel } from '../i18n/useEnumLabel'

/**
 * Desk is the single consumption surface. Supports two view modes via
 * `?view=` query param so the cross-goal materials portfolio doesn't need
 * its own top-nav tab.
 */
export default function Home() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'materials' ? 'materials' : 'goals'

  const goalsQ = useQuery({ queryKey: ['v2:goals'], queryFn: v2.goalsList })
  const briefingQ = useQuery({ queryKey: ['v2:briefing'], queryFn: v2.briefing })
  const matsQ = useQuery({ queryKey: ['v2:me:materials'], queryFn: v2.meMaterials })
  const indQ = useQuery({ queryKey: ['v2:me:indicators'], queryFn: v2.meIndicators, enabled: view === 'materials' })

  const setView = (v: 'goals' | 'materials') => {
    if (v === 'goals') {
      params.delete('view')
    } else {
      params.set('view', 'materials')
    }
    setParams(params, { replace: true })
  }

  const { t } = useTranslation('desk')
  const tCommon = useTranslation().t
  return (
    <>
      <TickerStrip materials={matsQ.data ?? []} />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <header className="flex items-baseline justify-between">
          <div>
            <h1 className="type-page-title">{t('page.title')}</h1>
            <p className="type-page-sub">
              {view === 'goals'
                ? t('page.subtitle')
                : t('page.subtitle_materials', { defaultValue: 'cross-goal material portfolio · live values from the composer' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onChange={setView} />
            <Link to="/goals/new" className="btn-base btn-primary">
              <Plus className="w-3.5 h-3.5" />
              {tCommon('actions.new_goal')}
            </Link>
          </div>
        </header>

        {view === 'goals' ? (
          <GoalsView goals={goalsQ.data ?? []} briefings={briefingQ.data ?? []} loading={briefingQ.isLoading} />
        ) : (
          <MaterialsView materials={matsQ.data ?? []} indicators={indQ.data ?? []} />
        )}
      </div>
    </>
  )
}

function ViewToggle({ view, onChange }: { view: 'goals' | 'materials'; onChange: (v: 'goals' | 'materials') => void }) {
  const { t } = useTranslation('desk')
  return (
    <div className="flex border border-line rounded-md overflow-hidden" role="tablist">
      <ToggleBtn active={view === 'goals'} onClick={() => onChange('goals')}>{t('tabs.goals')}</ToggleBtn>
      <ToggleBtn active={view === 'materials'} onClick={() => onChange('materials')}>{t('tabs.materials')}</ToggleBtn>
    </div>
  )
}
function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        'label-meta-sm px-3 py-1 transition',
        active ? 'bg-raised text-ink-50' : 'text-ink-400 hover:text-ink-100 hover:bg-hover',
      )}
    >
      {children}
    </button>
  )
}

function GoalsView({ goals, briefings, loading }: { goals: ReturnType<typeof v2.goalsList> extends Promise<infer T> ? T : never; briefings: Awaited<ReturnType<typeof v2.briefing>>; loading: boolean }) {
  const { t } = useTranslation('desk')
  const tCommon = useTranslation().t
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
          <Link
            to="/goals/new"
            className="flex flex-col items-center justify-center min-h-[110px] border border-dashed border-line rounded-lg text-ink-500 hover:border-brand-700 hover:text-brand-500 hover:bg-surface/50 transition"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="label-meta-sm">{tCommon('actions.new_goal')}</span>
          </Link>
        </div>
        {goals.length === 0 && (
          <p className="mt-4 text-sm text-ink-500">
            {t('empty.no_goals', { defaultValue: 'No goals yet — click New goal above or open the command palette (⌘K).' })}
          </p>
        )}
      </div>
      <div>
        <Card title={t('cards.todays_briefing')} padded={false}>
          {loading && <div className="p-5 text-xs text-ink-500 font-mono">{tCommon('states.loading')}</div>}
          {briefings.length === 0 && !loading && (
            <div className="p-5 text-xs text-ink-500">{t('cards.todays_briefing_empty')}</div>
          )}
          {briefings.length > 0 && (
            <ul className="divide-y divide-line">
              {briefings.slice(0, 4).map((b) => (
                <BriefingItem key={b.id} briefing={b} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function BriefingItem({ briefing: b }: { briefing: Awaited<ReturnType<typeof v2.briefing>>[number] }) {
  const kindLabel = useEnumLabel('insight_kind', b.kind)
  return (
    <li>
      <Link to={`/insights/${b.id}`} className="block px-5 py-4 hover:bg-hover transition">
        <p className="text-sm font-semibold text-ink-100 leading-snug">{b.title}</p>
        <div className="mt-1 text-xs line-clamp-3"><Markdown>{b.body_md}</Markdown></div>
        <p className="label-meta-sm mt-2">{kindLabel} · {b.ai_model ?? 'rule-based'}</p>
      </Link>
    </li>
  )
}

function MaterialsView({ materials, indicators }: { materials: ResolvedMaterial[]; indicators: ResolvedIndicator[] }) {
  const { t } = useTranslation('desk')
  const composites = indicators.filter((i) => i.kind === 'spread' || i.kind === 'derived')
  return (
    <div className="space-y-6">
      <Card title={t('cards.my_materials', { count: materials.length })} padded={false}>
        {materials.length === 0 && (
          <p className="p-5 text-sm text-ink-500">{t('cards.my_materials_empty_prompt')}</p>
        )}
        {materials.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {materials.map((m) => <MaterialTile key={`${m.source}:${m.id}`} mat={m} />)}
          </div>
        )}
      </Card>
      <Card title={t('cards.composite_indicators', { count: composites.length })} padded={false}>
        {composites.length === 0 ? (
          <p className="p-5 text-sm text-ink-500">{t('cards.composite_indicators_empty_prompt')}</p>
        ) : (
          <ul className="divide-y divide-line">
            {composites.map((ind) => <IndicatorRow key={`${ind.source}:${ind.id}`} ind={ind} />)}
          </ul>
        )}
      </Card>
    </div>
  )
}

function MaterialTile({ mat }: { mat: ResolvedMaterial }) {
  const { i18n } = useTranslation()
  const tCommon = useTranslation().t
  const volLabel = useEnumLabel('volatility', mat.volatility ?? '')
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
    <Link to={`/materials/${mat.code}`} className="group bg-surface hover:bg-raised transition p-4 block">
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
              {mat.unit.startsWith('USD') ? `$${value.toFixed(2)}` : `¥${value.toLocaleString(i18n.language, { maximumFractionDigits: 0 })}`}
            </span>
            <span className={cn('flex items-center gap-0.5 text-[11px] font-mono tnum', up ? 'num-up' : 'num-down')}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {up ? '+' : ''}{d.toFixed(2)}%
            </span>
          </div>
        ) : (
          <span className="label-meta-sm">{tCommon('states.data_incoming')}</span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={cn('label-meta-sm flex items-center gap-1', volColor)}>
          <VolIcon className="w-3 h-3" /> {volLabel || mat.volatility || '—'} · {mat.category ?? '—'}
        </span>
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
  const displayName = useLocalizedField(ind, 'name') || ind.code
  const description = useLocalizedField(ind, 'description')
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
      <span className="num-data-strong text-sm min-w-[90px] text-right">
        {value != null ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : <span className="text-ink-500">—</span>}
      </span>
      <span className={cn('flex items-center gap-0.5 text-xs font-mono tnum min-w-[60px] justify-end', up ? 'num-up' : 'num-down')}>
        {value != null && (up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
        {value != null ? `${up ? '+' : ''}${d.toFixed(2)}%` : ''}
      </span>
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
