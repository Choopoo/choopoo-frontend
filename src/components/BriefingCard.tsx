import { Sparkles } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Badge'
import { Markdown } from './Markdown'

export function BriefingCard({
  summary,
  recommendation,
  source,
}: {
  summary: string
  recommendation?: string | null
  source?: string
}) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          Daily Briefing
        </span>
      }
      action={source ? <Badge variant="brand">{source}</Badge> : undefined}
    >
      <Markdown>{summary}</Markdown>
      {recommendation && (
        <div className="mt-4 pt-3 border-t border-line">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-1">Recommendation</p>
          <p className="text-sm text-ink-100">{recommendation}</p>
        </div>
      )}
    </Card>
  )
}
