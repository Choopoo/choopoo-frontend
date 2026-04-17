import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, ShoppingCart, Globe2, GitMerge, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { v2, type CatalogIndicator, type Goal } from '../api/v2'
import { Card } from '../components/Card'
import { cn } from '../lib/utils'
import { useLocalizedField } from '../i18n/useLocalizedField'
import { useEnumLabel } from '../i18n/useEnumLabel'

const LENS_CODES = ['buy', 'sell', 'macro', 'mixed'] as const
const LENS_ICONS = { buy: ShoppingCart, sell: ShoppingBag, macro: Globe2, mixed: GitMerge }

export default function GoalNew() {
  const nav = useNavigate()
  const qc = useQueryClient()
  const { t } = useTranslation('goals')
  const tCommon = useTranslation().t
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [lens, setLens] = useState<Goal['lens']>('buy')
  const [horizon, setHorizon] = useState<string>('90')
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null)
  const [pickedIds, setPickedIds] = useState<Set<number>>(new Set())
  const lensLabel = useEnumLabel('lens', lens)

  const indicatorsQ = useQuery({
    queryKey: ['v2:catalog:indicators'],
    queryFn: v2.catalogIndicators,
    enabled: step === 2,
  })

  const createMut = useMutation({
    mutationFn: (input: { title: string; lens: Goal['lens']; horizon_days?: number }) => v2.goalCreate(input),
    onSuccess: ({ id }) => {
      setCreatedGoalId(id)
      setStep(2)
    },
  })

  const linkMut = useMutation({
    mutationFn: ({ goalId, indicatorId }: { goalId: number; indicatorId: number }) =>
      v2.goalAddIndicator(goalId, { indicator_kind: 'catalog', indicator_id: indicatorId, role: 'driver' }),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createMut.mutate({
      title: title.trim(),
      lens,
      horizon_days: horizon ? Number(horizon) : undefined,
    })
  }

  const togglePick = (id: number) => {
    setPickedIds((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const finish = async () => {
    if (createdGoalId == null) return
    for (const id of pickedIds) {
      await linkMut.mutateAsync({ goalId: createdGoalId, indicatorId: id })
    }
    qc.invalidateQueries({ queryKey: ['v2:goals'] })
    nav(`/goals/${createdGoalId}`)
  }

  const suggestedIndicators = (indicatorsQ.data ?? []).filter((i) => filterByLens(i, lens)).slice(0, 12)

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
      <header>
        <h1 className="type-page-title">{t('wizard.title')}</h1>
        <p className="type-page-sub">
          {t('wizard.step', {
            current: step,
            total: 2,
            label: step === 1 ? t('wizard.step_label_name') : t('wizard.step_label_pick'),
          })}
        </p>
      </header>

      {step === 1 && (
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-meta block mb-1.5">{t('wizard.title_label')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('wizard.title_placeholder')}
                className="input-base"
                autoFocus
              />
            </div>
            <div>
              <label className="label-meta block mb-2">{t('wizard.lens_label')}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {LENS_CODES.map((code) => (
                  <LensOption key={code} code={code} active={lens === code} onClick={() => setLens(code)} />
                ))}
              </div>
            </div>
            <div>
              <label className="label-meta block mb-1.5">{t('wizard.horizon_label')}</label>
              <input
                type="number"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                min={7}
                max={730}
                className="input-base input-mono w-32"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-line">
              <Link to="/" className="text-xs font-mono uppercase tracking-wider text-ink-500 hover:text-ink-100">
                {tCommon('actions.cancel')}
              </Link>
              <button type="submit" disabled={!title.trim() || createMut.isPending} className="btn-base btn-primary">
                {createMut.isPending ? t('wizard.creating') : tCommon('actions.continue')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {createMut.isError && (
              <p className="text-xs text-down font-mono">{(createMut.error as Error).message}</p>
            )}
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              {t('wizard.suggested_for', { lens: lensLabel })}
            </span>
          }
          action={
            <button onClick={finish} disabled={linkMut.isPending} className="btn-base btn-primary">
              {t('wizard.done_picked', { count: pickedIds.size })}
            </button>
          }
        >
          {indicatorsQ.isLoading && <p className="text-sm text-ink-500 font-mono">{tCommon('states.loading')}</p>}
          {indicatorsQ.isError && (
            <p className="text-sm text-down font-mono">{(indicatorsQ.error as Error).message}</p>
          )}
          {indicatorsQ.data && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedIndicators.map((ind) => (
                <IndicatorOption
                  key={ind.id}
                  ind={ind}
                  picked={pickedIds.has(ind.id)}
                  onClick={() => togglePick(ind.id)}
                />
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink-500 border-t border-line pt-3">
            {t('wizard.dont_see')}{' '}
            <Link to="/copilot" className="text-brand-500 underline">
              {tCommon('footer.ask_copilot_to')}
            </Link>{' '}
            {t('wizard.ask_copilot_to_add_private')}
          </p>
        </Card>
      )}
    </div>
  )
}

function LensOption({ code, active, onClick }: { code: typeof LENS_CODES[number]; active: boolean; onClick: () => void }) {
  const Icon = LENS_ICONS[code]
  const label = useEnumLabel('lens', code)
  const hint = useEnumLabel('lens_hint', code)
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 p-3 border rounded-md text-left transition',
        active ? 'border-brand-500 bg-brand-50/40' : 'border-line bg-surface hover:border-line-strong hover:bg-raised',
      )}
    >
      <span className={cn('flex items-center gap-1.5 text-sm font-medium', active ? 'text-brand-500' : 'text-ink-100')}>
        <Icon className="w-4 h-4" /> {label}
      </span>
      <span className="text-xs text-ink-400">{hint}</span>
    </button>
  )
}

function IndicatorOption({ ind, picked, onClick }: { ind: CatalogIndicator; picked: boolean; onClick: () => void }) {
  const displayName = useLocalizedField(ind, 'name') || ind.code
  const description = useLocalizedField(ind, 'description')
  const kindLabel = useEnumLabel('indicator_kind', ind.kind)
  const showCodeChip = displayName !== ind.code
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left p-3 border rounded-md transition',
          picked ? 'border-brand-500 bg-brand-50/40' : 'border-line bg-surface hover:border-line-strong hover:bg-raised',
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className={cn('text-sm font-medium truncate', picked ? 'text-brand-500' : 'text-ink-50')}>
              {displayName}
            </span>
            {showCodeChip && (
              <span className="font-mono text-[10px] text-ink-500 flex-shrink-0">{ind.code}</span>
            )}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 flex-shrink-0">
            {kindLabel}
          </span>
        </div>
        {description && (
          <p className="text-xs text-ink-400 mt-1 line-clamp-2">{description}</p>
        )}
      </button>
    </li>
  )
}

function filterByLens(ind: CatalogIndicator, lens: Goal['lens']): boolean {
  if (lens === 'mixed') return true
  if (lens === 'buy') return ['price', 'spread', 'supply', 'derived'].includes(ind.kind)
  if (lens === 'sell') return ind.kind === 'demand'
  if (lens === 'macro') return ['macro', 'regulatory'].includes(ind.kind)
  return true
}
