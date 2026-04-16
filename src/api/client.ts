import type {
  PageResult,
  CrawlRequest,
  CrawlResponse,
  PipelineStatus,
} from './types'

const BASE = import.meta.env.VITE_API_BASE || ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  submitCrawl(body: CrawlRequest) {
    return request<CrawlResponse>('/api/crawl', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  listResults(params: { material?: string; domain?: string; limit?: number } = {}) {
    const qs = new URLSearchParams()
    if (params.material) qs.set('material', params.material)
    if (params.domain) qs.set('domain', params.domain)
    if (params.limit) qs.set('limit', String(params.limit))
    const suffix = qs.toString() ? `?${qs}` : ''
    return request<PageResult[]>(`/api/results${suffix}`)
  },
  getResult(id: number) {
    return request<PageResult>(`/api/results/${id}`)
  },
  status() {
    return request<PipelineStatus>('/api/status')
  },
  health() {
    return request<{ status: string }>('/health')
  },
}
