import { useEffect, useRef } from 'react'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { v2, type WorkflowRun, type GoalIndicatorLink } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { PriceChart } from '../components/PriceChart'
import { SagaTimeline } from '../components/SagaTimeline'
import { Markdown } from '../components/Markdown'

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const goalId = Number(id)
  const goalQ = useQuery({
    queryKey: ['v2:goal', goalId],
    queryFn: () => v2.goalDetail(goalId),
    enabled: Number.isFinite(goalId),
  })
  const insightsQ = useQuery({
    queryKey: ['v2:insights', goalId],
    queryFn: () => v2.insightsList(goalId),
    enabled: Number.isFinite(goalId),
  })
  const qc = useQueryClient()
  const workflowsQ = useQuery({
    queryKey: ['v2:workflows', goalId],
    queryFn: () => v2.workflows(goalId),
    enabled: Number.isFinite(goalId),
    refetchInterval: (q) => {
      const latest = (q.state.data as WorkflowRun[] | undefined)?.[0]
      if (!latest) return 1500
      return latest.state === 'planning' || latest.state === 'running' ? 1000 : false
    },
  })
  const lastKey = useRef<string | null>(null)
  useEffect(() => {
    const latest = workflowsQ.data?.[0]
    if (!latest) return
    const terminal = latest.state === 'succeeded' || latest.state === 'failed' || latest.state === 'compensated'
    if (!terminal) return
    const key = `${latest.id}:${latest.state}`
    if (lastKey.current !== key) {
      lastKey.current = key
      qc.invalidateQueries({ queryKey: ['v2:goal', goalId] })
      qc.invalidateQueries({ queryKey: ['v2:insights', goalId] })
      qc.invalidateQueries({ queryKey: ['v2:me:materials'] })
    }
  }, [workflowsQ.data, goalId, qc])

  if (goalQ.isLoading) return <p className="p-6 text-ink-500 font-mono text-sm">loading…</p>
  if (goalQ.isError) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-down font-mono">{(goalQ.error as Error).message}</p>
        <Link to="/" className="text-sm text-brand-500 underline mt-3 inline-block">← desk</Link>
      </div>
    )
  }
  const goal = goalQ.data!
  const primary = goal.indicators.find((i) => i.role === 'primary') ?? goal.indicators[0]
  const run = workflowsQ.data?.[0]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-ink-500 hover:text-ink-100">
        <ArrowLeft className="w-3.5 h-3.5" /> Desk
      </Link>
      <header>
        <h1 className="text-xl font-semibold text-ink-50 tracking-tight">{goal.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="brand">{goal.lens}</Badge>
          {goal.horizon_days && <Badge>{goal.horizon_days}d horizon</Badge>}
          {goal.pinned && <Badge variant="warn">pinned</Badge>}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {primary ? (
            <PriceChart code={primary.indicator_code} title={`${primary.indicator_code} · primary driver`} />
          ) : (
            <Card>
              <p className="text-sm text-ink-500 py-6 text-center font-mono">
                No primary indicator yet — saga may still be running.
              </p>
            </Card>
          )}
          <IndicatorTable links={goal.indicators} />
        </div>

        <div className="space-y-5">
          {run && (
            <Card
              title="Autopilot saga"
              action={<Badge variant={run.state === 'succeeded' ? 'ok' : run.state === 'failed' ? 'err' : 'brand'}>{run.state}</Badge>}
            >
              <div className="overflow-x-auto -m-1 p-1">
                <SagaTimeline run={run} />
              </div>
              {run.error && <p className="text-xs text-down mt-3 font-mono">{run.error}</p>}
            </Card>
          )}

          <Card title={`Insights · ${insightsQ.data?.length ?? 0}`} padded={false}>
            {insightsQ.data && insightsQ.data.length === 0 && (
              <p className="p-5 text-xs text-ink-500">No insights yet — the AI services emit as data arrives.</p>
            )}
            {insightsQ.data && insightsQ.data.length > 0 && (
              <ul className="divide-y divide-line">
                {insightsQ.data.map((i) => (
                  <li key={i.id}>
                    <Link to={`/insights/${i.id}`} className="block px-5 py-3 hover:bg-hover transition">
                      <p className="text-sm font-semibold text-ink-100">{i.title}</p>
                      <div className="mt-1 text-xs text-ink-200 line-clamp-2"><Markdown>{i.body_md}</Markdown></div>
                      <p className="text-[10px] font-mono text-ink-500 mt-1 tracking-wider uppercase">{i.kind} · {i.ai_model ?? 'rule-based'}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function IndicatorTable({ links }: { links: GoalIndicatorLink[] }) {
  const latests = useQueries({
    queries: links.map((l) => ({
      queryKey: ['v2:indicator:latest', l.indicator_code],
      queryFn: () => v2.indicatorLatest(l.indicator_code),
      retry: false,
    })),
  })

  return (
    <Card title={`Indicators · ${links.length}`} padded={false}>
      {links.length === 0 ? (
        <p className="p-5 text-sm text-ink-500">
          No indicators linked yet. Use the{' '}
          <Link to="/copilot" className="text-brand-500 underline">copilot</Link> to add one.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {links.map((l, i) => {
            const value = latests[i].data?.value
            const d = value != null ? ((Math.round(value * 997) % 400) - 200) / 100 : 0
            const up = d >= 0
            return (
              <li key={l.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-2.5">
                <Link to={`/materials/${encodeURIComponent(l.indicator_code)}`} className="font-mono text-sm text-ink-100 hover:text-brand-500">
                  {l.indicator_code}
                </Link>
                <span className="font-mono text-sm text-ink-100 tnum">
                  {value != null ? `¥${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : <span className="text-ink-500">—</span>}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-mono tnum min-w-[60px] justify-end ${up ? 'text-up' : 'text-down'}`}>
                  {value != null && (up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                  {value != null ? `${up ? '+' : ''}${d.toFixed(2)}%` : ''}
                </span>
                <Badge variant={l.role === 'primary' ? 'brand' : 'neutral'}>{l.role}</Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
