import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { api } from '../api/client'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { MOCK_RESULTS } from '../lib/mockData'
import { timeAgo } from '../lib/utils'

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const q = useQuery({
    queryKey: ['result', numericId],
    queryFn: () => api.getResult(numericId),
    retry: false,
    enabled: Number.isFinite(numericId),
  })

  const fallback = MOCK_RESULTS.find((r) => r.id === numericId)
  const result = q.data ?? fallback
  const usingMock = !q.data && !!fallback

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center text-ink-500">
        <p>Result not found.</p>
        <Link to="/sources" className="text-brand-600 hover:underline text-sm">
          ← Back to sources
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <Link
        to="/sources"
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sources
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="brand">{result.source_label}</Badge>
          <Badge variant="neutral">{result.material}</Badge>
          {usingMock && <Badge variant="neutral">Demo data</Badge>}
        </div>
        <h1 className="text-2xl font-semibold text-ink-900">{result.title}</h1>
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {result.domain}
        </a>
      </div>

      <Card title="AI Summary">
        <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line">{result.summary}</p>
      </Card>

      {result.recommendation && (
        <Card title="Recommendation">
          <p className="text-sm text-ink-900">{result.recommendation}</p>
        </Card>
      )}

      <Card title="Metadata">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-ink-500">Relevance score</dt>
            <dd className="font-mono text-ink-900">{result.score.toFixed(3)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Crawled</dt>
            <dd className="text-ink-700">{timeAgo(result.crawled_at)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-ink-500">Raw meta description</dt>
            <dd className="text-ink-700">{result.meta_description}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
