import { useTranslation } from 'react-i18next'

/**
 * Resolve a backend enum value into its localized display label.
 *
 *   useEnumLabel('lens', 'buy')          // → 'Buy' or '采购'
 *   useEnumLabel('insight_kind', 'event') // → 'Event' or '事件'
 *
 * Backed by the `enums` namespace with shape:
 *   { lens: { buy: 'Buy', sell: 'Sell', ... }, ... }
 *
 * Falls back to the raw enum value if no translation exists.
 */
export function useEnumLabel(category: string, value: string | null | undefined): string {
  const { t } = useTranslation('enums')
  if (!value) return ''
  return t(`${category}.${value}`, { defaultValue: value })
}
