import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, AlertTriangle, X, ChevronRight, Link2, ExternalLink } from 'lucide-react'
import { v2, type SubjectAspect } from '../api/v2'
import { Card } from './Card'
import { cn } from '../lib/utils'

/**
 * Signal Map for a subject (a raw material code like "TDI").
 *
 * Core idea: aspects are *information axes*, not URLs. Each proposed aspect
 * carries an induction chain + example events so the owner can audit the
 * reasoning, not just the verdict. Prevents LLM-hallucinated "trust me" signals.
 *
 * Layout:
 *   - Active chips (currently driving the subject's insights)
 *   - Candidate chips (proposed but not yet approved)
 *   - Drawer opens when a chip is clicked: shows the induction chain +
 *     example events + provider count + an evidence-verified badge.
 */
export function SignalMap({ subjectCode }: { subjectCode: string }) {
  const q = useQuery({
    queryKey: ['v2:subject:aspects', subjectCode],
    queryFn: () => v2.subjectAspects(subjectCode, 'all'),
    enabled: Boolean(subjectCode),
  })
  const qc = useQueryClient()
  const [openId, setOpenId] = useState<number | null>(null)

  const mut = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      v2.toggleSubjectAspect(subjectCode, id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['v2:subject:aspects', subjectCode] }),
  })

  const rows = q.data ?? []
  const active = rows.filter((r) => r.status === 'active')
  const candidates = rows.filter((r) => r.status === 'candidate')
  const rejected = rows.filter((r) => r.status === 'rejected')
  const selected = openId ? rows.find((r) => r.aspect_id === openId) ?? null : null

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Signal map · <span className="text-ink-100">{subjectCode}</span>
        </span>
      }
      action={
        <span className="label-meta-sm">
          {active.length} active · {candidates.length} candidate
        </span>
      }
    >
      {q.isLoading && <p className="text-xs text-ink-500 font-mono">loading…</p>}
      {rows.length === 0 && !q.isLoading && (
        <p className="text-sm text-ink-500">
          No aspects ranked yet for <span className="font-mono">{subjectCode}</span>. Ask the
          copilot: <code className="text-brand-500">propose aspects for {subjectCode}</code>.
        </p>
      )}

      {active.length > 0 && (
        <div>
          <p className="label-meta-sm mb-2">Active · driving insights</p>
          <ul className="flex flex-wrap gap-2">
            {active.map((a) => (
              <AspectChip key={a.aspect_id} aspect={a} active selected={openId === a.aspect_id} onClick={() => setOpenId(a.aspect_id)} />
            ))}
          </ul>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="mt-4">
          <p className="label-meta-sm mb-2">Candidate · click a chip to review the chain, then activate</p>
          <ul className="flex flex-wrap gap-2">
            {candidates.map((a) => (
              <AspectChip key={a.aspect_id} aspect={a} active={false} selected={openId === a.aspect_id} onClick={() => setOpenId(a.aspect_id)} />
            ))}
          </ul>
        </div>
      )}

      {rejected.length > 0 && (
        <details className="mt-4">
          <summary className="label-meta-sm cursor-pointer">{rejected.length} rejected (click to show)</summary>
          <ul className="flex flex-wrap gap-2 mt-2">
            {rejected.map((a) => (
              <li key={a.aspect_id} className="chip opacity-60 line-through">{a.aspect_code}</li>
            ))}
          </ul>
        </details>
      )}

      {selected && <AspectDrawer aspect={selected} onClose={() => setOpenId(null)} onToggle={(active) => mut.mutate({ id: selected.aspect_id, active })} pending={mut.isPending} />}
    </Card>
  )
}

function AspectChip({ aspect, active, selected, onClick }: { aspect: SubjectAspect; active: boolean; selected: boolean; onClick: () => void }) {
  const score = aspect.score ?? 0
  const verified = aspect.evidence_verified
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'chip transition cursor-pointer',
          active ? 'chip-brand' : 'chip',
          selected && 'ring-1 ring-brand-500',
        )}
        title={`score ${score.toFixed(2)} · ${aspect.relevance_rationale ?? ''}`}
      >
        {verified && <CheckCircle2 className="w-3 h-3 text-up" />}
        {!verified && active && <AlertTriangle className="w-3 h-3 text-warn" />}
        {aspect.aspect_code}
        <span className="text-ink-500 ml-1">{score.toFixed(2)}</span>
      </button>
    </li>
  )
}

function AspectDrawer({ aspect, onClose, onToggle, pending }: {
  aspect: SubjectAspect
  onClose: () => void
  onToggle: (active: boolean) => void
  pending: boolean
}) {
  const chain = aspect.induction_chain ?? []
  const examples = aspect.example_events ?? []

  return (
    <div className="mt-5 border-t border-line pt-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-ink-50 font-semibold">{aspect.aspect_code}</span>
            <span className="chip">{aspect.axis}</span>
            {aspect.evidence_verified ? (
              <span className="chip-up chip">
                <CheckCircle2 className="w-3 h-3" /> verified
              </span>
            ) : (
              <span className="chip-warn chip">
                <AlertTriangle className="w-3 h-3" /> unverified
              </span>
            )}
          </div>
          <p className="text-sm text-ink-200 leading-relaxed max-w-3xl">{aspect.relevance_rationale}</p>
        </div>
        <button onClick={onClose} className="text-ink-400 hover:text-ink-100 p-1 -m-1" aria-label="close">
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <section>
          <p className="label-meta-sm mb-2 flex items-center gap-1.5">
            <Link2 className="w-3 h-3" /> Induction chain
          </p>
          {chain.length === 0 ? (
            <p className="text-xs text-ink-500">No chain recorded.</p>
          ) : (
            <ol className="space-y-1.5 text-sm">
              {chain.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-raised border border-line flex items-center justify-center text-[10px] font-mono text-ink-400">{s.step ?? i + 1}</span>
                  <div className="flex-1">
                    {s.cause && <span className="text-ink-400 font-mono text-[10px] uppercase tracking-wider">cause · </span>}
                    {s.effect && <span className="text-ink-400 font-mono text-[10px] uppercase tracking-wider">effect · </span>}
                    {s.fact && <span className="text-ink-400 font-mono text-[10px] uppercase tracking-wider">fact · </span>}
                    <span className="text-ink-100">{s.cause ?? s.effect ?? s.fact ?? ''}</span>
                  </div>
                  {i < chain.length - 1 && <ChevronRight className="w-3 h-3 text-ink-500 mt-1.5 flex-shrink-0" />}
                </li>
              ))}
            </ol>
          )}
        </section>
        <section>
          <p className="label-meta-sm mb-2">Example events</p>
          {examples.length === 0 ? (
            <p className="text-xs text-ink-500">No example events cited.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {examples.map((e, i) => (
                <li key={i} className="border-l-2 border-line pl-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink-400">{e.date ?? '?'}</span>
                    {e.verified ? (
                      <span className="chip-up chip"><CheckCircle2 className="w-3 h-3" /> verified</span>
                    ) : (
                      <span className="chip-warn chip"><AlertTriangle className="w-3 h-3" /> unverified</span>
                    )}
                  </div>
                  <p className="text-ink-100 mt-0.5">{e.event}</p>
                  {e.observed_impact && <p className="text-xs text-ink-400 mt-0.5 italic">→ {e.observed_impact}</p>}
                  {e.source_url && (
                    <a href={e.source_url} target="_blank" rel="noreferrer" className="text-[11px] link-brand mt-1 inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> source
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-3 text-xs font-mono tnum text-ink-500">
          {aspect.score != null && <span>score {aspect.score.toFixed(2)}</span>}
          {aspect.relevance_r != null && <span>· rel {aspect.relevance_r.toFixed(2)}</span>}
          {aspect.diversity_bonus != null && <span>· div {aspect.diversity_bonus.toFixed(2)}</span>}
          <span>· {aspect.provider_count} provider{aspect.provider_count === 1 ? '' : 's'}</span>
        </div>
        {aspect.status === 'active' ? (
          <button onClick={() => onToggle(false)} disabled={pending} className="btn-base btn-secondary">
            Demote to candidate
          </button>
        ) : (
          <button onClick={() => onToggle(true)} disabled={pending} className="btn-base btn-primary">
            Activate for {aspect.subject_code}
          </button>
        )}
      </footer>
    </div>
  )
}
