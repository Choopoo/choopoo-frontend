import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { v2 } from '../api/v2'
import { normalizeLocale } from '../i18n'
import { cn } from '../lib/utils'

// Replace any standalone catalog code that contains an underscore (so engineering
// names like TDI_SPOT_EC, IMPORT_PARITY_TDI, supply_event get swapped for their
// localized human name) with the user-facing label. Short commodity tickers like
// TDI / MDI / HDI are left alone — they're industry-standard and substituting
// them ("Cut TDI 二异氰酸酯 procurement cost 5%") would butcher the prose.
const CODE_PATTERN = /\b[A-Z][A-Z0-9_]*_[A-Z0-9_]+\b/g

export function Markdown({ children, className }: { children: string; className?: string }) {
  const { i18n } = useTranslation()
  const isZh = normalizeLocale(i18n.language) === 'zh-CN'

  // Both queries are shared via TanStack Query cache — cheap when other
  // components on the page already fetched them.
  const indicatorsQ = useQuery({
    queryKey: ['v2:catalog:indicators'],
    queryFn: v2.catalogIndicators,
    staleTime: 60 * 60_000,
  })
  const aspectsQ = useQuery({
    queryKey: ['v2:aspects'],
    queryFn: v2.aspectsList,
    staleTime: 60 * 60_000,
  })

  const localized = useMemo(() => {
    const map = new Map<string, string>()
    for (const ind of indicatorsQ.data ?? []) {
      if (!ind.code.includes('_')) continue
      const label = (isZh && ind.name_cn) || ind.name
      if (label) map.set(ind.code, label)
    }
    for (const a of aspectsQ.data ?? []) {
      if (!a.code.includes('_')) continue
      const label = (isZh && a.name_cn) || a.name
      if (label) map.set(a.code, label)
    }
    if (map.size === 0) return children
    return children.replace(CODE_PATTERN, (m) => map.get(m) ?? m)
  }, [children, indicatorsQ.data, aspectsQ.data, isZh])

  return (
    <div className={cn('prose-terminal', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{localized}</ReactMarkdown>
    </div>
  )
}
