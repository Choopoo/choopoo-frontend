import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

const variants = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  err: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-ink-100 text-ink-700 border-ink-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
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
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
