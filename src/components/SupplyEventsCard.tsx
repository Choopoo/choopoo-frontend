import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from './Card'

type Event = {
  id: number
  severity: 'ok' | 'warn' | 'err'
  plant: string
  event: string
  since: string
}

const iconFor = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  err: XCircle,
}
const colorFor = {
  ok: 'text-emerald-600',
  warn: 'text-amber-600',
  err: 'text-red-600',
}

export function SupplyEventsCard({ events }: { events: Event[] }) {
  return (
    <Card title="Supply Events">
      <ul className="space-y-3">
        {events.map((e) => {
          const Icon = iconFor[e.severity]
          return (
            <li key={e.id} className="flex items-start gap-3">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorFor[e.severity]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900">{e.plant}</p>
                <p className="text-xs text-ink-500">{e.event}</p>
                <p className="text-xs text-ink-400 mt-0.5">Since {e.since}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
