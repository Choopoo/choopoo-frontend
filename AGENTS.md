# AGENTS.md — choopoo-frontend

Hi. You're an agent. Read this file first; it points at the rest.

## What this app is

React 19 + Vite + TanStack Query + Tailwind v4. UI for a multi-tenant
procurement / market-intel copilot for Chinese PU SMEs. Talks to the Go
gateway at `:8081` via cookie-auth. "Trading desk for PU SMEs" warm-dark
aesthetic — Bloomberg-feel, not Notion-feel.

## Read before editing

- [`docs/navigation.md`](docs/navigation.md) — where things live (routes, src tree).
- [`docs/conventions.md`](docs/conventions.md) — TS/React/Tailwind rules.
- [`docs/design.md`](docs/design.md) — design tokens, header rules, forbidden patterns.
- [`docs/decisions.md`](docs/decisions.md) — dated log of non-obvious choices. Append-only.

`src/design/README.md` is now a stub that points to `docs/design.md`. Don't
edit it.

## Dev loop

```bash
# from choopoo-infra/
docker compose -f docker-compose.local.yml up -d frontend gateway

# magic-link login (dev mode returns the link in the response)
curl -s localhost:8081/auth/magic-link \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@demo.choopoo.cn"}' | jq -r .dev_link
# → open that URL in the browser to set the session cookie
```

Frontend serves from nginx in Docker (no source-volume mount) — every
source change requires `docker compose build frontend && up -d frontend`.

## Maintenance contract

After every code change, ask these five yes/no questions keyed to what you
touched. If yes, update the named file before declaring done.

1. Touched `src/design/tokens.css` or `src/design/utilities.css`?
   → update `docs/design.md` (rules, not values).
2. Added or renamed a route, or moved a top-level `src/` directory?
   → update `docs/navigation.md`.
3. Made a non-trivial reversible choice (library, data shape, auth flow,
   CSS cascade order, …)?
   → append a dated bullet to `docs/decisions.md`. Append-only — never
   edit old entries; supersede with a new one.
4. Introduced a long-lived convention (file naming, error handling,
   query-key shape, …)?
   → update `docs/conventions.md`.
5. Touched a user-facing JSX literal, an enum label, or a backend column
   that surfaces in the UI?
   → ensure the string lives in `src/i18n/locales/en/<ns>.json` AND
   `src/i18n/locales/zh-CN/<ns>.json` — never inline. New DB columns
   that hold user-facing prose need both `name`/`name_cn` (or
   equivalent `_cn` suffix) populated by a backfill migration.

You don't need to re-read every doc on every edit — only the one keyed to
the file-type you touched. That's what makes this contract cheap enough
to actually follow.

## Sanity-check before declaring done

- `npm run build` — TypeScript clean.
- `npm run lint:contrast` — every page passes WCAG AA on the dark canvas.
  This catches the class of bug that the docs are designed to prevent
  (see `docs/decisions.md` 2026-04-17 for the worked example).

## What this file is NOT

- Not a tutorial. If a doc tells you _how_ to do something, link to it
  here; don't duplicate it.
- Not a changelog. That's `git log` and `docs/decisions.md`.
- Not a freeform notebook. Stay under ~150 lines.
