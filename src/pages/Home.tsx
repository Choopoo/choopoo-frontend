import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { v2 } from '../api/v2'
import { GoalCard } from '../components/GoalCard'
import { Card } from '../components/Card'

export default function Home() {
  const goalsQ = useQuery({ queryKey: ['v2:goals'], queryFn: v2.goalsList })
  const briefingQ = useQuery({ queryKey: ['v2:briefing'], queryFn: v2.briefing })

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">My Goals</h1>
        <p className="text-sm text-ink-500 mt-1">
          Pinned first. Each goal composes its own indicators and AI briefings.
        </p>
      </header>

      {briefingQ.data && briefingQ.data.length > 0 && (
        <Card
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Today's Briefing
            </span>
          }
        >
          <ul className="space-y-3">
            {briefingQ.data.slice(0, 3).map((b) => (
              <li key={b.id}>
                <Link to={`/insights/${b.id}`} className="block hover:bg-ink-50 -mx-3 px-3 py-2 rounded-md">
                  <p className="text-sm font-medium text-ink-900">{b.title}</p>
                  <p className="text-sm text-ink-700 line-clamp-2 mt-0.5">{b.body_md}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goalsQ.data?.map((g) => <GoalCard key={g.id} goal={g} />)}
        <Link
          to="/goals/new"
          className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-ink-200 rounded-lg text-ink-400 hover:border-brand-500 hover:text-brand-700 hover:bg-brand-50 transition"
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-sm font-medium">New goal</span>
          <span className="text-xs mt-0.5">or talk to the copilot</span>
        </Link>
      </div>

      {goalsQ.data && goalsQ.data.length === 0 && !briefingQ.data?.length && (
        <Card>
          <div className="text-center py-8">
            <p className="text-ink-700 font-medium">No goals yet.</p>
            <p className="text-sm text-ink-500 mt-1">
              Click <span className="font-mono text-brand-700">New goal</span> above, or chat with the
              <Link to="/copilot" className="text-brand-700 underline ml-1">copilot</Link>.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
