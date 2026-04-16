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
  const overallLabel = q.isError
    ? 'DOWN'
    : allOk
      ? 'OK'
      : q.data
        ? 'DEGRADED'
        : 'CHECKING'

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Pipeline Status</h1>
        <Badge variant={overallVariant}>{overallLabel}</Badge>
      </div>

      {q.isError && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Cannot reach backend gateway. Check <code>docker-compose</code> is running and{' '}
          <code>VITE_API_BASE</code> is set correctly.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    <div className="bg-white border border-ink-200 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-ink-500">Service</p>
        <p className="text-lg font-semibold text-ink-900">{name}</p>
        {state && !ok && <p className="text-xs text-red-600 mt-1 truncate max-w-[200px]">{state}</p>}
      </div>
      <Icon className={`w-8 h-8 ${ok ? 'text-emerald-500' : 'text-red-400'}`} />
    </div>
  )
}
