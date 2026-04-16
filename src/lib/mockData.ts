// Demo fixtures. Used when backend is unreachable or for empty-state previews.
import type { PageResult, PricePoint } from '../api/types'

export const MOCK_PRICE_SERIES: PricePoint[] = (() => {
  const out: PricePoint[] = []
  const today = new Date('2026-04-16')
  let p = 15500
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    p += (Math.random() - 0.45) * 180
    out.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(p),
      source: '生意社',
    })
  }
  return out
})()

export const MOCK_COST_CHAIN = {
  brent_usd: 78.2,
  toluene_cny: 7200,
  tdi_spot_cny: 15800,
  spread: 3100,
  spread_trend: 'widening' as const,
}

export const MOCK_SUPPLY_EVENTS = [
  {
    id: 1,
    severity: 'warn' as const,
    plant: 'Wanhua Fujian Phase 1',
    event: 'Scheduled maintenance, 12 days remaining',
    since: '2026-04-04',
  },
  {
    id: 2,
    severity: 'ok' as const,
    plant: 'Covestro Shanghai',
    event: 'Operating normally',
    since: '2026-04-16',
  },
  {
    id: 3,
    severity: 'ok' as const,
    plant: 'BASF Chongqing',
    event: 'Full capacity, no guidance change',
    since: '2026-04-15',
  },
]

export const MOCK_RESULTS: PageResult[] = [
  {
    id: 1,
    url: 'https://www.100ppi.com/sf2/detail-20260416-tdi.html',
    domain: '100ppi.com',
    title: 'TDI华东现货价格小幅上行',
    meta_description: 'TDI华东主流成交价15,800元/吨,较昨日上涨120元',
    score: 0.88,
    crawled_at: '2026-04-16T08:15:00Z',
    material: 'TDI',
    source_label: '生意社',
    summary:
      'TDI华东现货价格温和上行,主流报价15,800元/吨(+120元,+0.8%)。万华福建一期检修持续中,预计剩余12天。下游软泡工厂按需采购为主。',
    recommendation: '维持正常采购节奏,关注万华检修结束后放量情况',
  },
  {
    id: 2,
    url: 'https://www.baiinfo.com/news/tdi-20260416',
    domain: 'baiinfo.com',
    title: '百川盈孚:TDI周度报告',
    meta_description: '本周TDI市场窄幅整理,均价15,750元/吨',
    score: 0.82,
    crawled_at: '2026-04-16T07:58:00Z',
    material: 'TDI',
    source_label: '百川盈孚',
    summary:
      '本周TDI市场窄幅整理。东北亚出口订单同比持平。甲苯-TDI价差走扩至3,100元/吨,处于5年均值上沿。',
    recommendation: '价差走扩,关注上游甲苯回落对TDI利润的支撑',
  },
  {
    id: 3,
    url: 'https://www.oilchem.net/tdi/2026-04-16.html',
    domain: 'oilchem.net',
    title: '隆众资讯:TDI市场日评',
    meta_description: 'TDI市场延续偏强运行',
    score: 0.79,
    crawled_at: '2026-04-16T06:30:00Z',
    material: 'TDI',
    source_label: '隆众资讯',
    summary:
      'TDI市场延续偏强运行,华东现货参考15,700-15,900元/吨。装置开工率维持在78%。',
    recommendation: '短期内价格重心上移,建议观望等待回调',
  },
]
