import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { v2, type Locale } from '../api/v2'
import { useAuth } from '../auth'
import { normalizeLocale } from '../i18n'
import { cn } from '../lib/utils'

const OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'zh-CN', label: '中文' },
]

export function LocaleSwitcher({ onSelect }: { onSelect?: () => void }) {
  const { i18n } = useTranslation()
  const { refresh } = useAuth()
  const current = normalizeLocale(i18n.language)

  const choose = async (locale: Locale) => {
    if (locale === current) {
      onSelect?.()
      return
    }
    await i18n.changeLanguage(locale)
    try {
      await v2.meUpdate({ locale })
      // Re-fetch /me so other consumers see the new locale on the next render.
      await refresh()
    } catch {
      // If the user isn't logged in (Login page), the local change still takes effect.
    }
    onSelect?.()
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5">
      <Languages className="w-3.5 h-3.5 text-ink-400 mr-1" />
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => choose(opt.value)}
          className={cn(
            'px-2 py-0.5 rounded text-xs font-mono transition',
            current === opt.value
              ? 'bg-brand-50 text-brand-500'
              : 'text-ink-400 hover:text-ink-100 hover:bg-hover',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
