import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../api/client'
import { Badge } from '../components/Badge'

export default function Status() {
  const q = useQuery({
    queryKey: ['status'],
    queryFn: api.status,
    refetchInterval: 10_000,
    retry: false,
  })

  const services = [
    { name: 'Kafka', state: q.data?.kafka },
    { name: 'Redis', state: q.data?.redis },
    { name: 'Postgres', state: q.data?.postgres },
  ]
  const allOk = q.data && services.every((s) => s.state === 'ok')
  const overallVariant = q.isError ? 'err' : allOk ? 'ok' : q.data ? 'warn' : 'neutral'
  const overallLabel = q.isError ? 'DOWN' : allOk ? 'OK' : q.data ? 'DEGRADED' : 'CHECKING'

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-50 tracking-tight">Pipeline Status</h1>
          <p className="text-xs font-mono text-ink-500 mt-1 uppercase tracking-wider">
            refreshes every 10s · gateway → kafka/redis/postgres
          </p>
        </div>
        <Badge variant={overallVariant}>{overallLabel}</Badge>
      </div>

      {q.isError && (
        <div className="rounded-md bg-warn-soft border border-warn/30 px-4 py-3 text-xs text-warn font-mono">
          Cannot reach backend gateway. Check <code className="text-warn">docker-compose</code> is running.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {services.map((s) => (
          <ServiceTile key={s.name} name={s.name} state={s.state} />
        ))}
      </div>
    </div>
  )
}

function ServiceTile({ name, state }: { name: string; state: string | undefined }) {
  const ok = state === 'ok'
  const Icon = ok ? CheckCircle2 : XCircle
  return (
    <div className="bg-surface border border-line rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Service</p>
        <p className="text-lg font-semibold text-ink-50 mt-0.5">{name}</p>
        {state && !ok && <p className="text-xs text-down mt-1 truncate max-w-[200px] font-mono">{state}</p>}
      </div>
      <Icon className={`w-8 h-8 ${ok ? 'text-up' : 'text-down'}`} />
    </div>
  )
}
