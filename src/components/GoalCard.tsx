import { Link } from 'react-router-dom'
import { ShoppingBag, ShoppingCart, Globe2, GitMerge } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Goal } from '../api/v2'
import { cn } from '../lib/utils'
import { useEnumLabel } from '../i18n/useEnumLabel'

const lensConf: Record<Goal['lens'], { icon: typeof ShoppingCart; tint: string }> = {
  buy:   { icon: ShoppingCart, tint: 'text-warn' },
  sell:  { icon: ShoppingBag,  tint: 'text-up' },
  macro: { icon: Globe2,       tint: 'text-info' },
  mixed: { icon: GitMerge,     tint: 'text-brand-500' },
}

export function GoalCard({ goal }: { goal: Goal }) {
  const { t } = useTranslation()
  const { icon: Icon, tint } = lensConf[goal.lens]
  const label = useEnumLabel('lens', goal.lens)
  return (
    <Link
      to={`/goals/${goal.id}`}
      className={cn(
        'group relative block bg-surface border border-line rounded-lg p-4 hover:border-brand-700 hover:bg-raised transition',
        goal.pinned && 'border-l-2 border-l-brand-500',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`flex items-center gap-1.5 text-[10px] font-mono tracking-widest ${tint}`}>
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        {goal.horizon_days != null && (
          <span className="text-[10px] font-mono text-ink-500 tnum">
            {t('units.days_short', { count: goal.horizon_days })}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-ink-100 leading-snug line-clamp-2 group-hover:text-ink-50">
        {goal.title}
      </h3>
      {goal.description && (
        <p className="text-xs text-ink-400 mt-1.5 line-clamp-2">{goal.description}</p>
      )}
    </Link>
  )
}
