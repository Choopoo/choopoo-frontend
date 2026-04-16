import { Link } from 'react-router-dom'
import { Pin, ShoppingBag, ShoppingCart, Globe2, GitMerge } from 'lucide-react'
import type { Goal } from '../api/v2'
import { Badge } from './Badge'

const lensLabel: Record<Goal['lens'], { label: string; icon: typeof Pin; color: string }> = {
  buy: { label: 'Buy', icon: ShoppingCart, color: 'text-amber-600' },
  sell: { label: 'Sell', icon: ShoppingBag, color: 'text-emerald-600' },
  macro: { label: 'Macro', icon: Globe2, color: 'text-blue-600' },
  mixed: { label: 'Mixed', icon: GitMerge, color: 'text-brand-600' },
}

export function GoalCard({ goal }: { goal: Goal }) {
  const { label, icon: Icon, color } = lensLabel[goal.lens]
  return (
    <Link
      to={`/goals/${goal.id}`}
      className="block bg-white border border-ink-200 rounded-lg p-5 hover:border-brand-300 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
          <Icon className="w-4 h-4" />
          {label}
        </span>
        {goal.pinned && (
          <Pin className="w-3.5 h-3.5 text-brand-600 fill-brand-200" />
        )}
      </div>
      <h3 className="text-sm font-semibold text-ink-900 leading-snug line-clamp-2">{goal.title}</h3>
      {goal.description && (
        <p className="text-xs text-ink-500 mt-1.5 line-clamp-2">{goal.description}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        {goal.horizon_days && (
          <Badge variant="neutral">{goal.horizon_days}d horizon</Badge>
        )}
      </div>
    </Link>
  )
}
