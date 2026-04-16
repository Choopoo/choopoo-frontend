import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { api } from '../api/client'
import { Card } from './Card'

const SOURCES = ['生意社', '百川盈孚', '隆众资讯', 'Other']
const MATERIALS = ['TDI', 'HDI', 'MDI', 'Toluene']

export function CrawlForm() {
  const [urls, setUrls] = useState('')
  const [material, setMaterial] = useState('TDI')
  const [source, setSource] = useState(SOURCES[0])
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: api.submitCrawl,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['results'] })
      setUrls('')
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const list = urls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean)
    if (list.length === 0) return
    mutation.mutate({ urls: list, material, source_label: source })
  }

  return (
    <Card title="Submit Crawl Job">
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Paste URLs, one per line"
          rows={3}
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <div className="flex gap-3">
          <label className="flex-1">
            <span className="block text-xs text-ink-500 mb-1">Material</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full border border-ink-200 rounded-md px-2 py-1.5 text-sm bg-white"
            >
              {MATERIALS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="flex-1">
            <span className="block text-xs text-ink-500 mb-1">Source</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full border border-ink-200 rounded-md px-2 py-1.5 text-sm bg-white"
            >
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={mutation.isPending || !urls.trim()}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {mutation.isPending ? 'Submitting…' : 'Submit'}
        </button>
        {mutation.isError && (
          <p className="text-xs text-red-600">{(mutation.error as Error).message}</p>
        )}
        {mutation.isSuccess && (
          <p className="text-xs text-emerald-600">
            Accepted {mutation.data.accepted} URL(s), job {mutation.data.job_id}
          </p>
        )}
      </form>
    </Card>
  )
}
