import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, ShoppingCart, Globe2, GitMerge, ArrowRight, Sparkles } from 'lucide-react'
import { v2, type CatalogIndicator, type Goal } from '../api/v2'
import { Card } from '../components/Card'
import { cn } from '../lib/utils'

const LENSES = [
  { code: 'buy' as const, label: 'Buy', icon: ShoppingCart, hint: 'Costs to procure raw materials' },
  { code: 'sell' as const, label: 'Sell', icon: ShoppingBag, hint: 'Demand for finished products' },
  { code: 'macro' as const, label: 'Macro', icon: Globe2, hint: 'Crude, FX, regulatory' },
  { code: 'mixed' as const, label: 'Mixed', icon: GitMerge, hint: 'Touches multiple lenses' },
]

export default function GoalNew() {
  const nav = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [lens, setLens] = useState<Goal['lens']>('buy')
  const [horizon, setHorizon] = useState<string>('90')
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null)
  const [pickedIds, setPickedIds] = useState<Set<number>>(new Set())

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
        <h1 className="type-page-title">New goal</h1>
        <p className="type-page-sub">
          step {step} of 2 — {step === 1 ? 'name your goal' : 'pick driver indicators'}
        </p>
      </header>

      {step === 1 && (
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-meta block mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cut TDI procurement cost 5% before Q4"
                className="input-base"
                autoFocus
              />
            </div>
            <div>
              <label className="label-meta block mb-2">Lens</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {LENSES.map(({ code, label, icon: Icon, hint }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLens(code)}
                    className={cn(
                      'flex flex-col items-start gap-1 p-3 border rounded-md text-left transition',
                      lens === code
                        ? 'border-brand-500 bg-brand-50/40'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-raised',
                    )}
                  >
                    <span className={cn(
                      'flex items-center gap-1.5 text-sm font-medium',
                      lens === code ? 'text-brand-500' : 'text-ink-100',
                    )}>
                      <Icon className="w-4 h-4" /> {label}
                    </span>
                    <span className="text-xs text-ink-400">{hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-meta block mb-1.5">Horizon (days)</label>
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
                Cancel
              </Link>
              <button type="submit" disabled={!title.trim() || createMut.isPending} className="btn-base btn-primary">
                {createMut.isPending ? 'Creating…' : 'Continue'}
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
              Suggested for "{lens}"
            </span>
          }
          action={
            <button onClick={finish} disabled={linkMut.isPending} className="btn-base btn-primary">
              Done · {pickedIds.size} picked
            </button>
          }
        >
          {indicatorsQ.isLoading && <p className="text-sm text-ink-500 font-mono">loading…</p>}
          {indicatorsQ.isError && (
            <p className="text-sm text-down font-mono">{(indicatorsQ.error as Error).message}</p>
          )}
          {indicatorsQ.data && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedIndicators.map((ind) => {
                const picked = pickedIds.has(ind.id)
                return (
                  <li key={ind.id}>
                    <button
                      onClick={() => togglePick(ind.id)}
                      className={cn(
                        'w-full text-left p-3 border rounded-md transition',
                        picked
                          ? 'border-brand-500 bg-brand-50/40'
                          : 'border-line bg-surface hover:border-line-strong hover:bg-raised',
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={cn(
                          'font-mono text-sm font-medium truncate',
                          picked ? 'text-brand-500' : 'text-ink-50',
                        )}>
                          {ind.code}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 flex-shrink-0">
                          {ind.kind}
                        </span>
                      </div>
                      {ind.description && (
                        <p className="text-xs text-ink-400 mt-1 line-clamp-2">{ind.description}</p>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink-500 border-t border-line pt-3">
            Don't see what you need?{' '}
            <Link to="/copilot" className="text-brand-500 underline">
              Ask the copilot
            </Link>{' '}
            to add a private one.
          </p>
        </Card>
      )}
    </div>
  )
}

function filterByLens(ind: CatalogIndicator, lens: Goal['lens']): boolean {
  if (lens === 'mixed') return true
  if (lens === 'buy') return ['price', 'spread', 'supply', 'derived'].includes(ind.kind)
  if (lens === 'sell') return ind.kind === 'demand'
  if (lens === 'macro') return ['macro', 'regulatory'].includes(ind.kind)
  return true
}
