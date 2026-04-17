import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: Props) {
  return (
    <header className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="type-page-title">{title}</h1>
        {subtitle && <p className="type-page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </header>
  )
}
