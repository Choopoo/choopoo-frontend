# choopoo-frontend

React 19 + Vite + TypeScript + Tailwind v4 dashboard for the Choopoo TDI Price Intelligence Platform.

## Screens

- `/` Dashboard — hero spot price, 7/30/90/365-day chart, cost chain (Brent → toluene → TDI spread), AI briefing, supply events
- `/sources` Crawled results table with filters + crawl submission form
- `/results/:id` Single result detail with AI summary + recommendation
- `/status` Pipeline health (Kafka, Redis, Postgres) + throughput

## Local dev

```bash
npm install
npm run dev
# http://localhost:3000
```

Set `VITE_API_BASE=http://localhost:8081` to point at the backend gateway. When the backend is unreachable, the dashboard falls back to demo fixtures from `src/lib/mockData.ts` so the UI is always presentable.

## Full stack

Run all services (frontend + backend + Kafka/Redis/Postgres) via [choopoo-infra](https://github.com/Choopoo/choopoo-infra):

```bash
cd ../choopoo-infra
docker-compose -f docker-compose.local.yml up --build
```
