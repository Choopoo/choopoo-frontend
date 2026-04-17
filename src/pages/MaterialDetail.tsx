import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PriceChart } from '../components/PriceChart'
import { SignalMap } from '../components/SignalMap'

/**
 * Drill page for a single material. Hero chart + Signal Map.
 */
export default function MaterialDetail() {
  const { code } = useParams<{ code: string }>()
  const { t } = useTranslation('materials')
  const tCommon = useTranslation().t
  if (!code) return null
  const spotCode = spotFor(code)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      <Link to="/?view=materials" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-ink-500 hover:text-ink-100">
        <ArrowLeft className="w-3.5 h-3.5" /> {tCommon('nav.materials')}
      </Link>
      <header>
        <h1 className="type-page-title">{code}</h1>
        <p className="type-page-sub">{t('cards.spot_chart')}</p>
      </header>

      <PriceChart code={spotCode} title={spotCode} />

      <SignalMap subjectCode={code} />
    </div>
  )
}

function spotFor(code: string): string {
  const map: Record<string, string> = {
    BRENT: 'BRENT_SPOT',
    CNY_USD: 'CNY_USD_SPOT',
    HDI: 'HDI_SPOT_CN',
    IPDI: 'IPDI_SPOT_CN',
    DBTDL: 'DBTDL_SPOT',
    PPG_2000: 'PPG2000_SPOT',
    BAC: 'BAC_SPOT',
    PHENOL: 'PHENOL_SPOT',
    TOLUENE: 'TOLUENE_SPOT',
  }
  // If user clicked an indicator code directly (e.g. TDI_TOLUENE_SPREAD), let
  // it pass through to PriceChart; the Signal Map drives off the *material*
  // form, so strip any common suffix.
  const materialForm = code.replace(/_SPOT(_EC|_NC|_SC|_CN)?$/, '').replace(/_TOLUENE_SPREAD$/, '')
  return map[materialForm] ?? (code.includes('_') ? code : `${code}_SPOT_EC`)
}
