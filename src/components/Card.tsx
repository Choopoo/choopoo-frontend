import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'bg-white border border-ink-200 rounded-lg shadow-sm',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between px-5 py-3 border-b border-ink-200">
          <h2 className="text-sm font-semibold text-ink-700">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
