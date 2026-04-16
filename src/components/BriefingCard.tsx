import { Sparkles } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Badge'

export function BriefingCard({
  summary,
  recommendation,
  source,
}: {
  summary: string
  recommendation: string
  source: string
}) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          AI Daily Briefing
        </span>
      }
      action={<Badge variant="brand">{source}</Badge>}
    >
      <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line">{summary}</p>
      {recommendation && (
        <div className="mt-4 pt-4 border-t border-ink-200">
          <p className="text-xs font-medium text-ink-500 mb-1">Recommendation</p>
          <p className="text-sm text-ink-900">{recommendation}</p>
        </div>
      )}
    </Card>
  )
}
