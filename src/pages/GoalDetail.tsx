import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpenText, Sparkles } from 'lucide-react'
import { v2 } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const goalId = Number(id)
  const goalQ = useQuery({ queryKey: ['v2:goal', goalId], queryFn: () => v2.goalDetail(goalId), enabled: Number.isFinite(goalId) })
  const insightsQ = useQuery({
    queryKey: ['v2:insights', goalId],
    queryFn: () => v2.insightsList(goalId),
    enabled: Number.isFinite(goalId),
  })

  if (goalQ.isLoading) return <p className="p-6 text-ink-400">Loading…</p>
  if (goalQ.isError) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-red-700 font-medium">{(goalQ.error as Error).message}</p>
        <Link to="/" className="text-sm text-brand-700 underline mt-3 inline-block">← Home</Link>
      </div>
    )
  }
  const goal = goalQ.data!

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{goal.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="brand">{goal.lens}</Badge>
            {goal.horizon_days && <Badge>{goal.horizon_days}d horizon</Badge>}
            {goal.pinned && <Badge variant="warn">Pinned</Badge>}
          </div>
        </div>
      </header>

      <Card title={`Indicators (${goal.indicators.length})`}>
        {goal.indicators.length === 0 ? (
          <p className="text-sm text-ink-500">
            No indicators linked yet. Use the{' '}
            <Link to="/copilot" className="text-brand-700 underline">copilot</Link> to add one.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {goal.indicators.map((link) => (
              <li key={link.id} className="py-2 flex items-baseline justify-between">
                <Link
                  to={`/materials/${encodeURIComponent(link.indicator_code)}`}
                  className="font-mono text-sm text-ink-900 hover:text-brand-700"
                >
                  {link.indicator_code}
                </Link>
                <span className="flex items-center gap-2">
                  <Badge variant="neutral">{link.indicator_kind}</Badge>
                  <Badge variant={link.role === 'primary' ? 'brand' : 'neutral'}>{link.role}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Insights for this goal
          </span>
        }
      >
        {insightsQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {insightsQ.data && insightsQ.data.length === 0 && (
          <p className="text-sm text-ink-500 flex items-center gap-2">
            <BookOpenText className="w-4 h-4" />
            No insights yet — the AI services emit briefings + alerts as data arrives.
          </p>
        )}
        {insightsQ.data && insightsQ.data.length > 0 && (
          <ul className="divide-y divide-ink-100">
            {insightsQ.data.map((i) => (
              <li key={i.id} className="py-3">
                <Link to={`/insights/${i.id}`} className="block hover:bg-ink-50 -mx-3 px-3 py-1 rounded-md">
                  <p className="text-sm font-semibold text-ink-900">{i.title}</p>
                  <p className="text-sm text-ink-700 line-clamp-2 mt-0.5">{i.body_md}</p>
                  <p className="text-xs text-ink-400 mt-1">{i.kind} · {i.created_at}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
