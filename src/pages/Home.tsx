import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { v2 } from '../api/v2'
import { GoalCard } from '../components/GoalCard'
import { TickerStrip } from '../components/TickerStrip'
import { Markdown } from '../components/Markdown'
import { Card } from '../components/Card'

export default function Home() {
  const goalsQ = useQuery({ queryKey: ['v2:goals'], queryFn: v2.goalsList })
  const briefingQ = useQuery({ queryKey: ['v2:briefing'], queryFn: v2.briefing })
  const matsQ = useQuery({ queryKey: ['v2:me:materials'], queryFn: v2.meMaterials })

  return (
    <>
      <TickerStrip materials={matsQ.data ?? []} />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <header className="flex items-baseline justify-between">
          <div>
            <h1 className="type-page-title">Desk</h1>
            <p className="type-page-sub">pinned first · autopilot runs on every new goal</p>
          </div>
          <Link to="/goals/new" className="btn-base btn-primary">
            <Plus className="w-3.5 h-3.5" />
            New goal
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals grid: 2/3 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalsQ.data?.map((g) => <GoalCard key={g.id} goal={g} />)}
              <Link
                to="/goals/new"
                className="flex flex-col items-center justify-center min-h-[110px] border border-dashed border-line rounded-lg text-ink-500 hover:border-brand-700 hover:text-brand-500 hover:bg-surface/50 transition"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-xs font-mono uppercase tracking-wider">New goal</span>
              </Link>
            </div>
          </div>

          {/* Briefing column: 1/3 */}
          <div>
            <Card title="Today's Briefing" padded={false}>
              {briefingQ.isLoading && (
                <div className="p-5 text-xs text-ink-500 font-mono">loading…</div>
              )}
              {briefingQ.data && briefingQ.data.length === 0 && (
                <div className="p-5 text-xs text-ink-500">
                  No briefings yet. They'll appear as the autopilot and summariser ingest sources.
                </div>
              )}
              {briefingQ.data && briefingQ.data.length > 0 && (
                <ul className="divide-y divide-line">
                  {briefingQ.data.slice(0, 4).map((b) => (
                    <li key={b.id}>
                      <Link
                        to={`/insights/${b.id}`}
                        className="block px-5 py-4 hover:bg-hover transition"
                      >
                        <p className="text-sm font-semibold text-ink-100 leading-snug">{b.title}</p>
                        <div className="mt-1 text-xs line-clamp-3">
                          <Markdown>{b.body_md}</Markdown>
                        </div>
                        <p className="text-[10px] font-mono text-ink-500 uppercase tracking-wider mt-2">
                          {b.kind} · {b.ai_model ?? 'rule-based'}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
