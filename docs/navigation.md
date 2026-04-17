# Navigation

Where things live in `choopoo-frontend/`. Update this file when you add a
route or move a top-level `src/` directory.

## Routes

| Path | Page component | Purpose |
|---|---|---|
| `/` | `pages/Home.tsx` | "Desk" — goals, briefings, ticker, autopilot summary |
| `/?view=materials` | `pages/Home.tsx` | same page, materials filter |
| `/login` | `pages/Login.tsx` | magic-link request + verify landing |
| `/goals/new` | `pages/GoalNew.tsx` | 2-step goal-creation wizard |
| `/goals/:id` | `pages/GoalDetail.tsx` | goal drill — chart + indicators + saga timeline |
| `/insights/:id` | `pages/InsightDetail.tsx` | insight body + evidence list |
| `/materials` | `pages/Materials.tsx` | enabled materials grid + composite indicators |
| `/materials/:code` | `pages/MaterialDetail.tsx` | price chart + signal map for a material |
| `/products` | `pages/Products.tsx` | finished-product list |
| `/macro` | `pages/Macro.tsx` | macro series + regulatory feed |
| `/copilot` | `pages/Copilot.tsx` | conversational copilot chat |
| `/sources` | `pages/Sources.tsx` | crawl queue + adapters |
| `/status` | `pages/Status.tsx` | pipeline health (kafka/redis/postgres) |

Top-nav and `⌘K` palette in `App.tsx` + `components/CommandPalette.tsx`.

## Top-level src tree

| Path | Purpose |
|---|---|
| `src/api/` | typed clients — `v2.ts` (cookie-auth, modern) and `client.ts` (legacy v1) |
| `src/components/` | reusable UI — `Card`, `PageHeader`, `Sparkline`, `PriceChart`, `SagaTimeline`, `SignalMap`, `Markdown`, `CommandPalette`, `AvatarMenu` |
| `src/pages/` | one file per route (see table above) |
| `src/design/` | `tokens.css` (3-tier design tokens), `utilities.css` (role classes inside `@layer components`), stub `README.md` pointing to `docs/design.md` |
| `src/lib/` | small helpers — `cn()`, time formatters |
| `src/hooks/` | shared hooks — `useAuth` |
| `src/i18n/` | i18n config + `locales/{en,zh-CN}/*.json` + `useLocalizedField`, `useEnumLabel` hooks |

## API base + auth

Gateway at `http://localhost:8081`. Cookie-auth via `choopoo_session`
(httpOnly, set by `/auth/verify?token=…`). Service-to-service callers use
the `X-Service-Secret` + `X-Org-Id` header path instead — see backend
`services/gateway/tenant.go`.

`src/api/v2.ts` is the only canonical client. `src/api/client.ts` (v1) is
legacy-only — don't add new endpoints there.
