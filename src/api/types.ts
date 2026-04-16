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
  status: 'ok' | 'degraded' | 'down'
  services: {
    kafka: boolean
    redis: boolean
    postgres: boolean
  }
  throughput?: {
    crawl_rate_per_min: number
    process_rate_per_min: number
  }
}

export type PricePoint = {
  date: string
  price: number
  source: string
}
