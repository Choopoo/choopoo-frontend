import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { api } from '../api/client'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { CrawlForm } from '../components/CrawlForm'
import { MOCK_RESULTS } from '../lib/mockData'
import { timeAgo } from '../lib/utils'

const MATERIALS = ['All', 'TDI', 'HDI', 'MDI', 'Toluene']

export default function Sources() {
  const [material, setMaterial] = useState('All')
  const q = useQuery({
    queryKey: ['results', { material, limit: 100 }],
    queryFn: () =>
      api.listResults({
        material: material === 'All' ? undefined : material,
        limit: 100,
      }),
    retry: false,
  })

  const rows = q.data && q.data.length > 0 ? q.data : MOCK_RESULTS
  const usingMock = !q.data || q.data.length === 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card
          title="Crawled Results"
          action={
            <div className="flex items-center gap-2">
              {usingMock && <Badge variant="neutral">Demo data</Badge>}
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="text-xs border border-ink-200 rounded-md px-2 py-1 bg-white"
              >
                {MATERIALS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-500 border-b border-ink-200">
                  <th className="text-left font-medium px-5 py-2">Source</th>
                  <th className="text-left font-medium px-5 py-2">Material</th>
                  <th className="text-left font-medium px-5 py-2">Title</th>
                  <th className="text-right font-medium px-5 py-2">Score</th>
                  <th className="text-right font-medium px-5 py-2">Crawled</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Badge variant="brand">{r.source_label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{r.material}</td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/results/${r.id}`}
                        className="text-ink-900 hover:text-brand-700 font-medium"
                      >
                        {r.title}
                      </Link>
                      <p className="text-xs text-ink-400 truncate max-w-md flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> {r.domain}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink-700">
                      {r.score.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-ink-500">
                      {timeAgo(r.crawled_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <CrawlForm />
    </div>
  )
}
