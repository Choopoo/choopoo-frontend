import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Quote, LineChart } from 'lucide-react'
import { v2 } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'

export default function InsightDetail() {
  const { id } = useParams<{ id: string }>()
  const num = Number(id)
  const q = useQuery({
    queryKey: ['v2:insight', num],
    queryFn: () => v2.insightDetail(num),
    enabled: Number.isFinite(num),
  })

  if (q.isLoading) return <p className="p-6 text-ink-400">Loading…</p>
  if (q.isError) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-red-700 font-medium">{(q.error as Error).message}</p>
        <Link to="/" className="text-sm text-brand-700 underline mt-3 inline-block">← Home</Link>
      </div>
    )
  }
  const ins = q.data!
  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="brand">{ins.kind}</Badge>
          {ins.ai_model && <Badge variant="neutral">{ins.ai_model}</Badge>}
        </div>
        <h1 className="text-2xl font-semibold text-ink-900">{ins.title}</h1>
      </header>
      <Card>
        <p className="text-sm leading-relaxed text-ink-800 whitespace-pre-line">{ins.body_md}</p>
      </Card>
      <Card title={`Evidence (${ins.evidence.length})`}>
        {ins.evidence.length === 0 && <p className="text-sm text-ink-500">No evidence cited.</p>}
        <ul className="divide-y divide-ink-100">
          {ins.evidence.map((e) => (
            <li key={e.id} className="py-3">
              {e.evidence_kind === 'page' && (
                <div>
                  <a
                    href={e.page_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {e.page_title || e.page_url}
                  </a>
                  {e.excerpt && (
                    <blockquote className="mt-1 text-sm text-ink-700 border-l-2 border-ink-200 pl-3 italic flex gap-1">
                      <Quote className="w-3 h-3 text-ink-400 mt-1 flex-shrink-0" />
                      {e.excerpt}
                    </blockquote>
                  )}
                </div>
              )}
              {(e.evidence_kind === 'catalog_indicator' || e.evidence_kind === 'tenant_indicator') && (
                <div className="flex items-baseline justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-mono text-ink-900">
                    <LineChart className="w-3.5 h-3.5 text-brand-600" />
                    {e.indicator_code}
                  </span>
                  <span className="text-xs text-ink-500">{e.reading_ts || ''}</span>
                </div>
              )}
              <p className="text-xs text-ink-400 mt-1">weight {e.weight}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
