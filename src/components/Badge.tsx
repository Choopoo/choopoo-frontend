import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

// Thin wrapper that delegates to the design-system `.chip*` utility classes.
// Keeps the same API as before so no component-level churn.
const variantClass: Record<string, string> = {
  ok: 'chip-up',
  warn: 'chip-warn',
  err: 'chip-down',
  neutral: 'chip',
  brand: 'chip-brand',
}

export function Badge({
  variant = 'neutral',
  children,
  className,
}: {
  variant?: keyof typeof variantClass
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('chip', variantClass[variant], className)}>
      {children}
    </span>
  )
}
