// v2 API client — cookie-based auth (credentials: 'include').
const BASE = import.meta.env.VITE_API_BASE || ''

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch {}
    const e = new Error(msg) as Error & { status: number }
    e.status = res.status
    throw e
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type Me = { user_id: number; org_id: number; email: string; role: string }

export type Goal = {
  id: number
  user_id: number | null
  title: string
  lens: 'buy' | 'sell' | 'macro' | 'mixed'
  horizon_days: number | null
  pinned: boolean
  description: string | null
  created_at: string
}

export type GoalIndicatorLink = {
  id: number
  indicator_kind: 'catalog' | 'tenant'
  indicator_id: number
  indicator_code: string
  role: 'primary' | 'driver' | 'context'
}

export type GoalDetail = Goal & { indicators: GoalIndicatorLink[] }

export type CatalogMaterial = {
  id: number
  code: string
  name: string
  name_cn: string | null
  unit: string
  category: string | null
  volatility: string | null
  supply_risk: string | null
}

export type CatalogIndicator = {
  id: number
  code: string
  kind: string
  subject_kind: string
  subject_code: string | null
  region_code: string | null
  unit: string
  cadence_minutes: number
  source_id: number | null
  formula_json: unknown
  description: string | null
}

export type ResolvedMaterial = {
  source: 'catalog' | 'private'
  id: number
  code: string
  name: string
  nickname: string | null
  unit: string
  category: string | null
  volatility?: string | null
  supply_risk?: string | null
}

export type ResolvedIndicator = {
  source: 'catalog' | 'catalog+override' | 'private'
  id: number
  code: string
  kind: string
  subject_kind: string
  subject_code: string | null
  region_code: string | null
  unit: string
  cadence_minutes: number
  formula_json: unknown
  description: string | null
}

export type Insight = {
  id: number
  goal_id: number | null
  kind: 'briefing' | 'alert' | 'forecast' | 'event' | 'recommendation'
  title: string
  body_md: string
  ai_model: string | null
  created_at: string
}

export type Evidence = {
  id: number
  evidence_kind: 'page' | 'catalog_indicator' | 'tenant_indicator'
  page_id?: number
  page_url?: string
  page_title?: string
  catalog_indicator_id?: number
  tenant_indicator_id?: number
  indicator_code?: string
  reading_ts?: string
  weight: number
  excerpt?: string
}

export type InsightDetail = Insight & { evidence: Evidence[] }

export type CopilotResponse = {
  text: string
  tool_calls: Array<{ name: string; input: Record<string, unknown>; result?: unknown; error?: string }>
}

export const v2 = {
  // auth
  me: () => req<Me>('GET', '/api/v2/me'),
  requestMagicLink: (email: string) =>
    fetch(`${BASE}/auth/magic-link`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json() as Promise<{ sent: boolean; dev_link?: string; expires_in: number }>),
  logout: () =>
    fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' }).then((r) => r.json()),

  // goals
  goalsList: () => req<Goal[]>('GET', '/api/v2/goals'),
  goalCreate: (g: { title: string; lens: string; horizon_days?: number; description?: string; pinned?: boolean }) =>
    req<{ id: number }>('POST', '/api/v2/goals', g),
  goalDetail: (id: number) => req<GoalDetail>('GET', `/api/v2/goals/${id}`),
  goalDelete: (id: number) => req<{ deleted: boolean }>('DELETE', `/api/v2/goals/${id}`),
  goalAddIndicator: (
    goalId: number,
    body: { indicator_kind: 'catalog' | 'tenant'; indicator_id: number; role?: string },
  ) => req<{ id: number }>('POST', `/api/v2/goals/${goalId}/indicators`, body),

  // catalog
  catalogMaterials: () => req<CatalogMaterial[]>('GET', '/api/v2/catalog/materials'),
  catalogIndicators: () => req<CatalogIndicator[]>('GET', '/api/v2/catalog/indicators'),

  // tenant overlay
  enableMaterial: (catalog_raw_material_id: number, nickname?: string) =>
    req('POST', '/api/v2/tenant/materials/enable', { catalog_raw_material_id, nickname }),
  enableIndicator: (catalog_indicator_template_id: number, role?: string) =>
    req('POST', '/api/v2/tenant/indicators/enable', { catalog_indicator_template_id, role }),
  meMaterials: () => req<ResolvedMaterial[]>('GET', '/api/v2/me/materials'),
  meIndicators: () => req<ResolvedIndicator[]>('GET', '/api/v2/me/indicators'),

  // composer
  indicatorLatest: (code: string) =>
    req<{ code: string; value: number; ts: string }>('GET', `/api/v2/indicators/${code}/latest`),
  seedReading: (code: string, value: number, ts?: string) =>
    req('POST', '/api/v2/test/indicator/reading', { code, value, ts }),

  // insights
  insightsList: (goalId?: number) =>
    req<Insight[]>('GET', goalId ? `/api/v2/insights?goal_id=${goalId}` : '/api/v2/insights'),
  insightDetail: (id: number) => req<InsightDetail>('GET', `/api/v2/insights/${id}`),
  briefing: () => req<Insight[]>('GET', '/api/v2/me/briefing'),
  insightCreate: (i: {
    goal_id?: number
    kind: string
    title: string
    body_md: string
    ai_model?: string
    evidence?: Array<{
      kind: 'page' | 'catalog_indicator' | 'tenant_indicator'
      page_id?: number
      catalog_indicator_id?: number
      tenant_indicator_id?: number
      reading_ts?: string
      weight?: number
      excerpt?: string
    }>
  }) => req<{ id: number }>('POST', '/api/v2/insights', i),

  // copilot
  copilotConverse: (message: string, history?: unknown[]) =>
    req<CopilotResponse>('POST', '/api/v2/copilot/converse', { message, history }),

  // saga observability
  workflows: (goalId?: number) =>
    req<WorkflowRun[]>('GET', goalId ? `/api/v2/workflows?goal_id=${goalId}` : '/api/v2/workflows'),
}

export type WorkflowRun = {
  id: number
  kind: string
  subject_ref: { goal_id?: number; title?: string } | null
  plan: { entities?: Array<{ code: string; kind: string }> } | null
  state: 'planning' | 'running' | 'succeeded' | 'failed' | 'compensating' | 'compensated'
  current_step: number
  steps_log: Array<{
    n?: number
    entity?: { code: string; kind: string }
    status?: string
    actions?: Array<Record<string, unknown>>
    briefing?: string
    error?: string
  }>
  error: string | null
  started_at: string
  completed_at: string | null
}
