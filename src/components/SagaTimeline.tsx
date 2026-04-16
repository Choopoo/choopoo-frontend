import { Check, X, Loader2, Bot } from 'lucide-react'
import type { WorkflowRun } from '../api/v2'
import { cn } from '../lib/utils'

/**
 * Horizontal step timeline for a saga run. Each numbered step in `steps_log`
 * becomes a node; the final node is the terminal state (succeeded/failed).
 */
export function SagaTimeline({ run }: { run: WorkflowRun }) {
  const steps = deriveSteps(run)
  return (
    <div className="flex items-start gap-0 text-xs font-mono">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start">
          <div className="flex flex-col items-center min-w-[7rem]">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center border-2 transition',
                s.state === 'ok' && 'border-up bg-up-soft text-up',
                s.state === 'error' && 'border-down bg-down-soft text-down',
                s.state === 'running' && 'border-brand-500 bg-brand-50 text-brand-500',
                s.state === 'pending' && 'border-line bg-raised text-ink-500',
              )}
            >
              {s.state === 'ok' && <Check className="w-3.5 h-3.5" />}
              {s.state === 'error' && <X className="w-3.5 h-3.5" />}
              {s.state === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {s.state === 'pending' && <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className="mt-2 text-center">
              <p className={cn('text-[11px] font-medium', s.state === 'ok' ? 'text-ink-100' : 'text-ink-400')}>
                {s.label}
              </p>
              {s.detail && <p className="text-[10px] text-ink-500 mt-0.5">{s.detail}</p>}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'w-10 h-px mt-3.5',
                steps[i + 1].state !== 'pending' ? 'bg-up/60' : 'bg-line',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

type Node = { label: string; detail?: string; state: 'ok' | 'error' | 'running' | 'pending' }

function deriveSteps(run: WorkflowRun): Node[] {
  const nodes: Node[] = [
    { label: 'Receive event', state: 'ok', detail: 'goal.created.v1' },
  ]

  // One "extract + actions" node per entity step in steps_log that had an entity.
  const entitySteps = run.steps_log?.filter((s) => s.entity) ?? []
  for (const s of entitySteps) {
    const verb = (s.actions ?? []).some((a) => 'create_private_material' in a)
      ? 'Create private'
      : 'Enable catalog'
    nodes.push({
      label: `${verb} ${s.entity?.code}`,
      state: s.status === 'ok' ? 'ok' : s.status === 'error' ? 'error' : 'running',
      detail: s.actions?.length ? `${s.actions.length} action${s.actions.length > 1 ? 's' : ''}` : undefined,
    })
  }

  // Briefing node (last step if present).
  const briefStep = run.steps_log?.find((s) => s.briefing)
  nodes.push({
    label: 'Compose briefing',
    state: briefStep?.briefing === 'created' ? 'ok' : run.state === 'running' ? 'running' : 'pending',
    detail: briefStep?.briefing === 'created' ? 'with evidence' : undefined,
  })

  // Final state node.
  if (run.state === 'succeeded') {
    nodes.push({ label: 'Complete', state: 'ok', detail: 'goal populated' })
  } else if (run.state === 'failed') {
    nodes.push({ label: 'Failed', state: 'error', detail: run.error ?? undefined })
  } else {
    nodes.push({ label: run.state, state: 'running' })
  }
  return nodes
}
