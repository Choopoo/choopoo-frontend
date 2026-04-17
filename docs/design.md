# Design

"Trading desk for PU SMEs" — warm dark, dense numeric, Bloomberg-feel.

Update this file when you change a token, add/remove a role class, or
introduce a new design rule.

## Token hierarchy

Three tiers in `src/design/tokens.css`. Components reference **semantic**
or **component** tokens; never primitives.

```
tokens.css
├── Tier 1 · Primitives       (raw color/size/motion scales)
│    --color-neutral-*  --color-amber-*  --color-emerald-*  --color-rose-*
│    --color-warn-*     --color-sky-*
│    --font-family-sans / --font-family-mono
│    --font-size-10 … --font-size-60
│    --radius-sm … --radius-2xl
│    --duration-fast / base / slow    --ease-out
│
├── Tier 2 · Semantic         (intent aliases; the main component-facing layer)
│    Surface:  canvas / surface / raised / hover
│    Border:   line / line-strong / line-focus
│    Ink:      ink-50 (highest) → ink-500 (lowest)
│    Brand:    brand-50 / 100 / 500 / 600 / 700
│    Data:     up / up-soft / down / down-soft / warn / warn-soft / info / info-soft
│    Type:     sans / mono, display-sm / md / lg
│
└── Tier 3 · Component        (component-specific; expressed via utilities.css role classes)
```

## Hard rules (lint-enforced)

- **Every text element on canvas/surface/raised must hit WCAG AA — 4.5:1
  contrast.** `npm run lint:contrast` runs Playwright across every route
  and fails on any violation.
- **Page headers go through `<PageHeader>`** (`src/components/PageHeader.tsx`).
  Hand-rolling a page `<h1>` is forbidden — five duplicates of
  `text-xl font-semibold text-ink-50 tracking-tight` had to be removed
  on 2026-04-17.
- **Role classes live in `@layer components`** (`utilities.css`). If you
  add one outside a layer, Tailwind utilities (which sit in
  `@layer utilities`) lose the cascade and explicit `text-*` overrides
  silently fail — that's the bug the wordmark hit.

## Soft rules (taste, not lint)

- Numeric values use `font-mono` + `tabular-nums` (the `.num-*` classes).
- Hero values use `.type-display-*`; page titles use `.type-page-title`;
  card headers use `.type-section-title`.
- Caps + mono labels (`.label-meta`, `.label-meta-sm`) for secondary
  metadata — use sparingly so they retain meaning.
- Row primary identifier (the thing that names the row) gets
  `font-semibold text-ink-50`. `text-ink-100` regular weight reads as
  secondary even though the contrast ratio is fine — the lint won't
  catch this.

## Forbidden patterns (red flags)

- Raw hex colors in JSX or Tailwind arbitrary values
  (`text-[#abc]`, `bg-[#123]`).
- Light-mode ink classes (`text-ink-900`, `text-gray-*`, `text-black`)
  on the dark canvas.
- `border-ink-200` — use `border-line` / `.hairline`.
- `bg-white` — use `bg-surface` or `bg-raised`.
- `text-ink-500` on a colored chip background (gives ~4.35:1 on amber-50;
  use `text-ink-200` or `text-brand-500` instead).

## Adding a new token

1. New raw value → add a primitive in `Tier 1` of `tokens.css`.
2. Alias it through a semantic name in `Tier 2`.
3. If the usage repeats ≥ 3 times, add a role class inside
   `@layer components { ... }` in `utilities.css`.
4. Update this file's hard/soft/forbidden lists if the new token implies
   a rule.

## Reference

Original `src/design/README.md` content was migrated into this file.
That file is now a stub pointing here.
