import { useTranslation } from 'react-i18next'
import { normalizeLocale } from './index'

/**
 * Pick a Chinese-vs-English field from a row that has both, falling back
 * cleanly. Use for DB-sourced bilingual columns (catalog name/name_cn,
 * description/description_cn, label/label_cn).
 *
 *   const display = useLocalizedField(indicator, 'name')   // → name_cn under zh, else name, else code
 */
export function useLocalizedField<
  R extends Record<string, unknown>,
  K extends string & keyof R,
>(row: R | null | undefined, base: K, fallback?: keyof R): string {
  const { i18n } = useTranslation()
  if (!row) return ''
  const locale = normalizeLocale(i18n.language)
  const cnKey = `${base}_cn` as keyof R
  if (locale === 'zh-CN') {
    const cn = row[cnKey]
    if (typeof cn === 'string' && cn) return cn
  }
  const main = row[base]
  if (typeof main === 'string' && main) return main
  if (fallback) {
    const fb = row[fallback]
    if (typeof fb === 'string' && fb) return fb
  }
  return ''
}
