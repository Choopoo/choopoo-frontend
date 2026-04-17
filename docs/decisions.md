# Decisions

Append-only log of non-obvious choices. One dated bullet per entry.
Never edit old entries — if a decision is reversed, write a new one
that cites the prior ID.

---

## 2026-04-17 — Bilingual content + i18n architecture (react-i18next)

**Context.** User flagged that engineering codes like `IMPORT_PARITY_TDI`
were leaking into the UI as primary labels for the actual end user — a
Chinese PU SME owner. Audit found ~400–500 hardcoded English JSX strings
across 28 files, four catalog tables missing `_cn` columns, and no
locale awareness anywhere.

**Decision.**
1. Migrations 0014 + 0015 add `name`/`name_cn`/`description_cn` to
   `catalog_indicator_template`; `name_cn`/`description_cn` to
   `catalog_signal_aspect`; split `sources.label` into
   `label`/`label_cn`; add `users.locale` (en | zh-CN) with check
   constraint. Backfill all 30 indicators + 10 aspects + 7 sources
   with plain-prose Chinese + English.
2. Frontend i18n stack: `react-i18next` + nested-JSON namespaces
   (`common`, `auth`, `desk`, `goals`, `materials`, `copilot`,
   `insights`, `status`, `enums`). `i18next-browser-languagedetector`
   for first-load; `users.locale` overrides on `/me` refresh.
   `VITE_DEFAULT_LOCALE` env var locks a deploy to one locale.
3. Two cross-cutting hooks: `useLocalizedField(row, 'name')` for
   DB rows; `useEnumLabel('lens', 'buy')` for backend enum values.
4. `LocaleSwitcher` lives in `AvatarMenu` (also surfaced on the Login
   hero panel for pre-auth language choice). Persists via
   `PATCH /api/v2/me { locale }`.
5. Phase 3 backend AI fidelity is **best-effort** — one extra sentence
   in the copilot system prompt asking Claude to match the user's
   input language. Saga briefings + event-extractor templates stay
   English (accepted asymmetry; promote to strict if it bites).

**Consequences.** New AGENTS.md maintenance question (#5) covers
i18n coverage. New `docs/conventions.md` "i18n" + "Enum-label tables"
sections. The `lint:contrast` check is unchanged but now passes
under both locales. Build size grew ~70KB gz from i18n + JSON
catalogs — acceptable for the value.

**Alternatives rejected.** `react-intl` (heavier, ECMA-402 surface
not needed at this scale). `lingui` (compile-time guarantees + smaller
bundle but adds macro build step; ecosystem maturity beat
micro-optimization). ICU MessageFormat (overkill for 200 strings,
upgrade path open). URL-prefix routing (`/zh/...`) deferred — saved
preference + browser-detect cover the use case without restructuring
react-router.

---

## 2026-04-17 — Move typography role classes into `@layer components`

**Context.** The "CHOOPOO" wordmark in `App.tsx:32` had
`className="label-meta text-brand-500"` but rendered as ink-500 gray.
`utilities.css` defined `.label-meta { color: var(--color-ink-500); }`
outside any `@layer`. Unlayered styles beat all layered styles in CSS
cascade, so `.label-meta`'s color won over Tailwind's
`.text-brand-500{...}` (which sits in `@layer utilities`).

**Decision.** Wrap `.label-meta`, `.label-meta-sm`, `.type-page-title`,
`.type-page-sub`, `.type-section-title` in `@layer components { ... }`.
Tailwind's `@layer utilities` loads after components, so explicit
`text-*` utilities now win cleanly.

**Consequences.** Pages can selectively override role-class colors with
Tailwind utilities — no `!important` needed. Future role-class
additions must follow the same pattern; new rule in `docs/design.md`.

---

## 2026-04-17 — Bump `--color-ink-500` from neutral-400 to neutral-300

**Context.** `--color-ink-500: #5a6270` gave 3.18:1 contrast against
canvas — fails WCAG AA (4.5:1). Used by `.label-meta`,
`.label-meta-sm`, `.type-page-sub`, and the `.input-base` placeholder.
Audit at `/tmp/full_audit.py` confirmed the failure on every page.

**Decision.** `--color-ink-500: var(--color-neutral-300)` (`#8b93a1`).
New ratio: 5.74. Semantic name unchanged — every downstream call site
lifts automatically.

**Consequences.** Placeholders inside inputs are slightly brighter
(intended). The "0.95" correlation chip on amber-50 still landed at
4.35 (below 4.5) — fixed in the same commit by switching that span
from `text-ink-500` to `text-ink-200`.

---

## 2026-04-17 — Add `<PageHeader>` as the only sanctioned page-header path

**Context.** Five pages (`Materials`, `Status`, `Copilot`, `GoalDetail`,
`InsightDetail`) each hand-rolled
`text-xl font-semibold text-ink-50 tracking-tight` instead of using
`.type-page-title`. Same pixel result today, but any future token
change wouldn't propagate. Sources had no `<h1>` at all.

**Decision.** Added `src/components/PageHeader.tsx` wrapping the
canonical `<header><h1 type-page-title /><p type-page-sub /></header>`
pattern with optional `actions`. Migrated all five pages and added the
missing one for Sources.

**Consequences.** New rule in `docs/design.md`: hand-rolling a page
`<h1>` is forbidden. Future pages must import `<PageHeader>`.

---

## 2026-04-17 — Indicator codes in row layouts use `font-semibold text-ink-50`

**Context.** User flagged that `IMPORT_PARITY_TDI` was "not readable" on
the Materials and Home composite-indicators rows. The lint reported zero
contrast violations — and indeed `text-ink-100` (`#e8e3d7`) on
`bg-surface` (`#13151a`) is 15:1, AAA pass. The actual problem was
visual hierarchy: `font-mono text-sm` at weight 400 reads as secondary
text in a row dominated by bold values + colored badges on the right,
so the indicator name didn't pop as the row's headline.

**Decision.** In `IndicatorRow` (both `pages/Materials.tsx` and
`pages/Home.tsx`), use `font-mono text-sm font-semibold text-ink-50`
for the code, plus `group-hover:text-brand-500` to hint that it's a
link. Description bumps from `text-ink-500` to `text-ink-400` for
slightly more visual presence (still passes AA on surface).

**Consequences.** Aligns with the existing `MaterialTile` convention
(`font-mono font-semibold text-ink-50`). New soft rule in
`docs/design.md`: row primary identifiers (the thing that names the
row) get `font-semibold text-ink-50`. Reminder that the contrast lint
catches a math problem; it doesn't catch hierarchy problems — those
still need eyeballing.

---

## 2026-04-17 — Add `npm run lint:contrast`

**Context.** Two prior bugs (the cascade bug and the ink-500 contrast
bug) would not have been caught by grep-for-legacy-classes. They
required measuring computed color against the actual canvas at runtime.

**Decision.** `scripts/lint-contrast.py` runs Playwright headless
across every route, scrapes `getComputedStyle().color` for every
text-bearing element, computes WCAG ratio against the deepest
ancestor's background, fails on any element below 4.5. Wired as
`npm run lint:contrast`.

**Consequences.** This is the load-bearing check that makes
`docs/design.md` enforceable. CI integration deferred until post-demo;
run locally before committing CSS changes.
