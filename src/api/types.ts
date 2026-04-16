export type PageResult = {
  id: number
  url: string
  domain: string
  title: string
  meta_description: string
  score: number
  crawled_at: string
  material: string
  source_label: string
  summary: string
  recommendation: string
}

export type CrawlRequest = {
  urls: string[]
  material: string
  source_label: string
}

export type CrawlResponse = {
  job_id: string
  accepted: number
}

export type PipelineStatus = {
  kafka: string
  redis: string
  postgres: string
}

export type PricePoint = {
  date: string
  price: number
  source: string
}
