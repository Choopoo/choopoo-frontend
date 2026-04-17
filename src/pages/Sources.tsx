import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { CrawlForm } from '../components/CrawlForm'
import { PageHeader } from '../components/PageHeader'
import { timeAgo } from '../lib/utils'

const MATERIALS = ['All', 'TDI', 'HDI', 'MDI', 'Toluene']

export default function Sources() {
  const { t } = useTranslation('common')
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

  const rows = q.data ?? []

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      <PageHeader title={t('nav.sources')} subtitle={t('sources.subtitle', { defaultValue: 'crawl queue · adapters · rss feeds' })} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card
          title={t('sources.results_title', { count: rows.length, defaultValue: 'Crawled results · {{count}}' })}
          padded={false}
          action={
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="text-[11px] font-mono bg-canvas border border-line text-ink-100 rounded-md px-2 py-1 focus:outline-none focus:border-brand-500"
            >
              {MATERIALS.map((m) => <option key={m}>{m === 'All' ? t('sources.filter_all', { defaultValue: 'All' }) : m}</option>)}
            </select>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-line">
                  <th className="text-left font-medium px-5 py-2">{t('sources.col_source', { defaultValue: 'Source' })}</th>
                  <th className="text-left font-medium px-5 py-2">{t('sources.col_material', { defaultValue: 'Material' })}</th>
                  <th className="text-left font-medium px-5 py-2">{t('sources.col_title', { defaultValue: 'Title' })}</th>
                  <th className="text-right font-medium px-5 py-2">{t('sources.col_score', { defaultValue: 'Score' })}</th>
                  <th className="text-right font-medium px-5 py-2">{t('sources.col_crawled', { defaultValue: 'Crawled' })}</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-500 text-sm">
                      {t('sources.empty', { defaultValue: 'No v1 crawl results (org 0 sentinel). Submit a URL below.' })}
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-hover transition">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Badge variant="brand">{r.source_label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-200 font-mono text-xs">{r.material}</td>
                    <td className="px-5 py-3 min-w-[240px]">
                      <p className="text-ink-100 font-medium">{r.title}</p>
                      <p className="text-xs text-ink-500 truncate max-w-md flex items-center gap-1 font-mono mt-0.5">
                        <ExternalLink className="w-3 h-3" /> {r.domain}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink-100 tnum">
                      {r.score != null ? r.score.toFixed(2) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-xs font-mono text-ink-500 tnum">
                      {r.crawled_at ? timeAgo(r.crawled_at) : '—'}
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
    </div>
  )
}
