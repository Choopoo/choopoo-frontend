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

  const inputCls = 'input-base input-mono'

  return (
    <Card title="Submit crawl job">
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Paste URLs, one per line"
          rows={3}
          className={inputCls}
        />
        <div className="flex gap-3">
          <label className="flex-1">
            <span className="label-meta block mb-1">Material</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className={inputCls}
            >
              {MATERIALS.map((m) => <option key={m} className="bg-surface">{m}</option>)}
            </select>
          </label>
          <label className="flex-1">
            <span className="label-meta block mb-1">Source</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={inputCls}
            >
              {SOURCES.map((s) => <option key={s} className="bg-surface">{s}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" disabled={mutation.isPending || !urls.trim()} className="btn-base btn-primary w-full">
          <Plus className="w-3.5 h-3.5" />
          {mutation.isPending ? 'Submitting…' : 'Submit'}
        </button>
        {mutation.isError && (
          <p className="text-xs text-down font-mono">{(mutation.error as Error).message}</p>
        )}
        {mutation.isSuccess && (
          <p className="text-xs text-up font-mono">
            Accepted {mutation.data.accepted} URL · job {mutation.data.job_id.slice(0, 8)}
          </p>
        )}
      </form>
    </Card>
  )
}
