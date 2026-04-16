import { useQuery } from '@tanstack/react-query'
import { TrendingDown, TrendingUp, Box, ShoppingBag } from 'lucide-react'
import { v2 } from '../api/v2'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'

// Curated seed demand signals until Taobao/1688 ingestion is real.
// Deterministic pseudo-values so the visual lands.
const DEMAND_DATA = [
  { region: 'CN-EC 华东', furniture_export_yoy: +3.8, auto_prod_yoy: +1.2, construction_pmi: 51.6 },
  { region: 'CN-NC 华北', furniture_export_yoy: -1.4, auto_prod_yoy: +0.3, construction_pmi: 49.8 },
  { region: 'CN-SC 华南', furniture_export_yoy: +6.1, auto_prod_yoy: +2.9, construction_pmi: 52.1 },
]

/**
 * Sell-lens landing — what the tenant can make + what downstream demand looks
 * like. Pulls finished products from the catalog and pairs them with seeded
 * regional demand data (real Taobao/1688 ingestion deferred to post-demo).
 */
export default function Products() {
  const productsQ = useQuery({ queryKey: ['v2:catalog:products'], queryFn: v2.catalogProducts })
  const products = productsQ.data ?? []

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      <header>
        <h1 className="type-page-title">Products</h1>
        <p className="type-page-sub">
          Sell lens · finished products you make + where demand is heading
        </p>
      </header>

      <Card title={`Finished products · ${products.length}`} padded={false}>
        {productsQ.isLoading && <div className="p-5 text-xs text-ink-500 font-mono">loading…</div>}
        {products.length === 0 && !productsQ.isLoading && (
          <p className="p-5 text-sm text-ink-500">Catalog is empty.</p>
        )}
        {products.length > 0 && (
          <ul className="divide-y divide-line">
            {products.map((p) => (
              <li key={p.id} className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-5 py-3 hover:bg-hover transition">
                <Box className="w-4 h-4 text-brand-500" />
                <div className="min-w-0">
                  <p className="font-mono text-sm text-ink-100">{p.code}</p>
                  <p className="text-xs text-ink-400 truncate">
                    {p.name_cn ? `${p.name_cn} · ` : ''}{p.name}
                  </p>
                </div>
                <Badge variant="neutral">{p.default_region_code ?? 'CN-EC'}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Regional demand signals · seeded" padded={false}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line">
          {DEMAND_DATA.map((d) => <DemandTile key={d.region} data={d} />)}
        </div>
      </Card>

      <Card title="Demand commentary">
        <ul className="text-sm text-ink-200 space-y-2">
          <li className="flex items-start gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-500 mt-1 flex-shrink-0" />
            <span>Furniture export YoY is positive in EC + SC → wood-coating hardeners (TDI-75) should see steady pull through Q2.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-500 mt-1 flex-shrink-0" />
            <span>Auto production softening in NC — aliphatic refinish demand is the marginal question; watch HDI_TDI_RATIO for margin signal.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-500 mt-1 flex-shrink-0" />
            <span>Construction PMI &gt; 50 in EC + SC supports 1K moisture-cure PU adhesive volume; NC under 50 suggests modest deceleration.</span>
          </li>
        </ul>
        <p className="mt-4 text-[11px] font-mono text-ink-500 border-t border-line pt-3">
          Commentary is rule-based. Replace with forecaster/event-extractor output
          once demand scrapers land post-demo.
        </p>
      </Card>
    </div>
  )
}

function DemandTile({ data }: { data: typeof DEMAND_DATA[number] }) {
  const pos = data.construction_pmi >= 50
  return (
    <div className="bg-surface p-4">
      <p className="font-mono text-sm text-ink-50 font-semibold">{data.region}</p>
      <div className="mt-3 space-y-2">
        <Row label="Construction PMI" value={data.construction_pmi.toFixed(1)} positive={pos} delta={data.construction_pmi - 50} unit="idx" />
        <Row label="Furniture export YoY" value={`${data.furniture_export_yoy >= 0 ? '+' : ''}${data.furniture_export_yoy.toFixed(1)}%`} positive={data.furniture_export_yoy >= 0} delta={data.furniture_export_yoy} unit="%" />
        <Row label="Auto prod YoY" value={`${data.auto_prod_yoy >= 0 ? '+' : ''}${data.auto_prod_yoy.toFixed(1)}%`} positive={data.auto_prod_yoy >= 0} delta={data.auto_prod_yoy} unit="%" />
      </div>
    </div>
  )
}

function Row({ label, value, positive }: { label: string; value: string; positive: boolean; delta: number; unit: string }) {
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <div className="flex items-baseline justify-between text-xs">
      <span className="label-meta-sm">{label}</span>
      <span className={`flex items-center gap-1 font-mono tnum ${positive ? 'num-up' : 'num-down'}`}>
        <Icon className="w-3 h-3" /> {value}
      </span>
    </div>
  )
}
