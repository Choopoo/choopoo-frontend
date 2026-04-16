import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

const variants = {
  ok: 'bg-up-soft text-up border-up/30',
  warn: 'bg-warn-soft text-warn border-warn/30',
  err: 'bg-down-soft text-down border-down/30',
  neutral: 'bg-raised text-ink-400 border-line',
  brand: 'bg-brand-50 text-brand-500 border-brand-500/30',
}

export function Badge({
  variant = 'neutral',
  children,
  className,
}: {
  variant?: keyof typeof variants
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-medium border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
