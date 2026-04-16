# IA simplification — Two-tab + ⌘K

**Status:** approved 2026-04-16 · owner-only persona.

## Problem

Current top nav has 5 tabs: Desk · Materials · Copilot · Sources · Status. Three
of them (Materials, Sources, Status) are derived views or admin surfaces that
the business-owner persona opens rarely (monthly, not daily). They compete
visually with the two surfaces that matter every morning (Desk, Copilot).

## Decision

Flatten to **two tabs + ⌘K command palette + avatar menu for admin**.

```
Top bar:  [Choopoo] · [Desk] · [Ask]                ⌘K · {avatar}
```

- **Desk** = goals grid + today's briefing + ticker strip. Supports `?view=materials`
  query for the cross-goal material portfolio without a separate route tab.
- **Ask** = fullscreen copilot (was "Copilot").
- **⌘K** (or Ctrl-K) = command palette. Fuzzy-search goals/materials/insights
  + verb actions: `new goal`, `ask copilot`, `open materials`, `open sources`,
  `open status`, `logout`. Escape hatch for everything.
- **Avatar menu** = pipeline status, sources (audit), logout. Low-frequency
  admin surfaces that used to compete for nav space.

## Why two tabs, not one

Ask (copilot) is conceptually different from everything else — the *authoring*
surface versus the *consumption* surface. Keeping it as its own tab makes it
obvious that the copilot is a first-class way to interact, not a hidden feature.

Desk is the consumption home — all surfaces a business owner reads every morning.

## Desk `?view=` modes

| Query | Shows |
|---|---|
| `/` (no param) | Default: ticker + briefing + goals grid |
| `/?view=materials` | Ticker + materials tiles + composite indicators |

Switched via a local toggle at the top of Desk. Not a separate route. URL is
shareable/bookmarkable.

## Command palette scope

| Category | Example | Target |
|---|---|---|
| Navigate | `desk`, `ask`, `sources`, `status` | route change |
| Goals | Type goal title → ↵ | `/goals/:id` |
| Materials | Type material code → ↵ | `/materials/:code` (for now redirects to Desk materials view filtered to that code) |
| Insights | Type insight title → ↵ | `/insights/:id` |
| Verbs | `new goal`, `ask copilot`, `logout` | action |

Keyboard: ⌘K / Ctrl-K opens. ↑↓ navigate. Enter fires. Esc closes.

Backed by existing v2 API (`goalsList`, `meMaterials`, `insightsList`,
`catalogMaterials` for material-code lookup).

## Avatar menu scope

Click opens dropdown with:
- `audit@…` (current email, read-only)
- Pipeline Status → `/status`
- Sources / audit → `/sources`
- Logout → `v2.logout()`

## Routes (no deletions)

All existing routes remain functional:
- `/materials` → Materials page (still reachable via ⌘K, just not in top nav)
- `/sources` → Sources (via avatar menu)
- `/status` → Status (via avatar menu)

No URL breaks. Users with bookmarks or old links still work. This is purely a
nav-visibility change.

## Non-goals

- Mission-mode UI (Iteration 4) — deferred; requires usage data.
- Feed-style zero-tab (Iteration 5) — deferred; fits a review tool, not a daily desk.
- Deleting Materials page code — kept for direct URL access + future use.
- Status/Sources redesign — they inherit the dark palette but aren't polished.

## Acceptance criteria

1. Top nav shows exactly two tabs (`Desk`, `Ask`) on every authenticated route.
2. ⌘K opens a modal with fuzzy search across goals + materials + insights +
   navigation verbs. ↑↓ navigates; Enter fires; Esc closes. Typing "logout"
   finds the logout command.
3. Avatar click opens a dropdown with Status, Sources, Logout.
4. Desk with `?view=materials` renders the materials-portfolio layout without
   a route change.
5. All existing URLs still resolve; no 404s introduced.
6. Playwright pass: user can reach every prior feature in ≤ 3 actions (click/
   keystroke) from Desk.

## Files modified

- `src/App.tsx` — nav trimmed; avatar dropdown added.
- `src/pages/Home.tsx` — view-mode toggle + materials branch.
- `src/components/CommandPalette.tsx` — new, global ⌘K handler.
- `src/components/AvatarMenu.tsx` — new, click-dropdown.

## Verification

1. Playwright: navigate to `/`, screenshot top nav → assert 2 tabs.
2. Playwright: press Meta+K, type "status", press Enter → land on `/status`.
3. Playwright: click avatar → dropdown shows Logout; click → redirected to `/login`.
4. Playwright: `/?view=materials` renders tiles; switching back doesn't reload.
5. Manual UX audit captured in a follow-up Playwright sweep of all paths.
