import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../api/client'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'

export default function Status() {
  const q = useQuery({
    queryKey: ['status'],
    queryFn: api.status,
    refetchInterval: 10_000,
    retry: false,
  })

  const services = q.data?.services ?? { kafka: false, redis: false, postgres: false }
  const overall = q.data?.status ?? 'down'
  const overallVariant =
    overall === 'ok' ? 'ok' : overall === 'degraded' ? 'warn' : 'err'

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Pipeline Status</h1>
        <Badge variant={overallVariant}>{overall.toUpperCase()}</Badge>
      </div>

      {q.isError && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Cannot reach backend gateway. Check <code>docker-compose</code> is running and{' '}
          <code>VITE_API_BASE</code> is set correctly.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ServiceTile name="Kafka" healthy={services.kafka} />
        <ServiceTile name="Redis" healthy={services.redis} />
        <ServiceTile name="Postgres" healthy={services.postgres} />
      </div>

      {q.data?.throughput && (
        <Card title="Throughput">
          <dl className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-xs text-ink-500">Crawl rate</dt>
              <dd className="text-2xl font-semibold text-ink-900">
                {q.data.throughput.crawl_rate_per_min}
                <span className="text-sm text-ink-400 ml-1">/min</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Processing rate</dt>
              <dd className="text-2xl font-semibold text-ink-900">
                {q.data.throughput.process_rate_per_min}
                <span className="text-sm text-ink-400 ml-1">/min</span>
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  )
}

function ServiceTile({ name, healthy }: { name: string; healthy: boolean }) {
  const Icon = healthy ? CheckCircle2 : XCircle
  return (
    <div className="bg-white border border-ink-200 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-ink-500">Service</p>
        <p className="text-lg font-semibold text-ink-900">{name}</p>
      </div>
      <Icon className={`w-8 h-8 ${healthy ? 'text-emerald-500' : 'text-red-500'}`} />
    </div>
  )
}
