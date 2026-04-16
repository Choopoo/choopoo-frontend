import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

export function Card({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section className={cn('bg-surface border border-line rounded-lg', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between px-5 py-3 border-b border-line">
          <h2 className="type-section-title">{title}</h2>
          {action}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}
