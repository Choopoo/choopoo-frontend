import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Quote, LineChart } from 'lucide-react'
import { v2 } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Markdown } from '../components/Markdown'

export default function InsightDetail() {
  const { id } = useParams<{ id: string }>()
  const num = Number(id)
  const q = useQuery({
    queryKey: ['v2:insight', num],
    queryFn: () => v2.insightDetail(num),
    enabled: Number.isFinite(num),
  })

  if (q.isLoading) return <p className="p-6 text-ink-500 font-mono text-sm">loading…</p>
  if (q.isError) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-down font-mono">{(q.error as Error).message}</p>
        <Link to="/" className="text-sm text-brand-500 underline mt-3 inline-block">← desk</Link>
      </div>
    )
  }
  const ins = q.data!
  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-ink-500 hover:text-ink-100">
        <ArrowLeft className="w-3.5 h-3.5" /> Desk
      </Link>
      <header>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="brand">{ins.kind}</Badge>
          {ins.ai_model && <Badge>{ins.ai_model}</Badge>}
        </div>
        <h1 className="text-xl font-semibold text-ink-50 tracking-tight">{ins.title}</h1>
      </header>
      <Card padded={false}>
        <div className="p-5">
          <Markdown>{ins.body_md}</Markdown>
        </div>
      </Card>
      <Card title={`Evidence · ${ins.evidence.length}`} padded={false}>
        {ins.evidence.length === 0 && <p className="p-5 text-sm text-ink-500">No evidence cited.</p>}
        <ul className="divide-y divide-line">
          {ins.evidence.map((e) => (
            <li key={e.id} className="px-5 py-4">
              {e.evidence_kind === 'page' && (
                <div>
                  <a
                    href={e.page_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-500/80"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {e.page_title || e.page_url}
                  </a>
                  {e.excerpt && (
                    <blockquote className="mt-2 text-sm text-ink-200 border-l-2 border-brand-700 pl-3 italic flex gap-1">
                      <Quote className="w-3 h-3 text-ink-500 mt-1 flex-shrink-0" />
                      {e.excerpt}
                    </blockquote>
                  )}
                </div>
              )}
              {(e.evidence_kind === 'catalog_indicator' || e.evidence_kind === 'tenant_indicator') && (
                <div className="flex items-baseline justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-mono text-ink-100">
                    <LineChart className="w-3.5 h-3.5 text-brand-500" />
                    {e.indicator_code}
                  </span>
                  <span className="text-xs font-mono text-ink-500 tnum">{e.reading_ts || ''}</span>
                </div>
              )}
              <p className="text-[10px] font-mono text-ink-500 mt-2 uppercase tracking-wider">weight {e.weight}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
