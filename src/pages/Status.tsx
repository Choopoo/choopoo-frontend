import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'

export default function Status() {
  const { t } = useTranslation('status')
  const tCommon = useTranslation().t
  const q = useQuery({
    queryKey: ['status'],
    queryFn: api.status,
    refetchInterval: 10_000,
    retry: false,
  })

  const services = [
    { name: t('services.kafka'), state: q.data?.kafka },
    { name: t('services.redis'), state: q.data?.redis },
    { name: t('services.postgres'), state: q.data?.postgres },
  ]
  const allOk = q.data && services.every((s) => s.state === 'ok')
  const overallVariant = q.isError ? 'err' : allOk ? 'ok' : q.data ? 'warn' : 'neutral'
  const overallLabel = q.isError
    ? tCommon('states.down')
    : allOk
      ? tCommon('states.ok')
      : q.data
        ? tCommon('states.degraded')
        : tCommon('states.checking')

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
      <PageHeader
        title={t('page.title')}
        subtitle={t('page.subtitle')}
        actions={<Badge variant={overallVariant}>{overallLabel}</Badge>}
      />

      {q.isError && (
        <div className="rounded-md bg-warn-soft border border-warn/30 px-4 py-3 text-xs text-warn font-mono">
          {t('errors.cannot_reach_backend')}
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
  const { t } = useTranslation('status')
  const ok = state === 'ok'
  const Icon = ok ? CheckCircle2 : XCircle
  return (
    <div className="bg-surface border border-line rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{t('service_label', { defaultValue: 'Service' })}</p>
        <p className="text-lg font-semibold text-ink-50 mt-0.5">{name}</p>
        {state && !ok && <p className="text-xs text-down mt-1 truncate max-w-[200px] font-mono">{state}</p>}
      </div>
      <Icon className={`w-8 h-8 ${ok ? 'text-up' : 'text-down'}`} />
    </div>
  )
}
