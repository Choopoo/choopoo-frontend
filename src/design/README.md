# Choopoo design system

"Trading desk for PU SMEs" — warm dark. Designed for dense numeric workflows
(Bloomberg-feel, not Notion-feel).

## Token hierarchy

Three tiers; components should reference **semantic** tokens or **component**
tokens, never primitives.

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
└── Tier 3 · Component        (component-specific; currently expressed via utilities.css)
```

## Utility classes

`utilities.css` exposes role-based classes that compose the semantic tokens.
Prefer these over ad-hoc Tailwind combos when you see a pattern repeated 3+ times.

### Typography
- `.type-display-sm / -md / -lg` — hero prices, tabular-nums, warm white
- `.type-page-title` — top-of-page H1
- `.type-page-sub` — caption under a page title (mono uppercase)
- `.type-section-title` — card header label
- `.label-meta / .label-meta-sm` — caps/mono labels

### Numbers
- `.tnum` — tabular-nums feature
- `.num-data` — mono + ink-100 + tnum (default numeric style)
- `.num-data-strong` — ink-50 + semibold (for hero values)
- `.num-up / .num-down` — semantic color

### Buttons
- `.btn-base` — shared base (must be combined with one variant below)
- `.btn-primary` — amber bg / canvas fg (main CTA)
- `.btn-secondary` — raised bg / ink-100 fg
- `.btn-ghost` — transparent; appears on hover

### Inputs
- `.input-base` — canvas bg, line border, focus ring in brand
- `.input-mono` — add for numeric / code inputs

### Chips
- `.chip` — neutral pill
- `.chip-brand / -up / -down / -warn` — semantic variants

### Links
- `.link-brand` — underlined amber
- `.link-subtle` — ink-400 → ink-50 on hover

### Surfaces
- `.surface-canvas / .surface-base / .surface-raised`
- `.hairline / .hairline-strong`

## Tailwind integration

Tokens are defined inside `@theme` blocks in `tokens.css`, so every CSS var
becomes a Tailwind utility automatically:

- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`
- `--color-ink-100` → `text-ink-100`, etc.

Use Tailwind utilities for one-off layout/spacing; use the classes in
`utilities.css` for anything that recurs (buttons, inputs, labels, display
type, numeric states).

## Adding a new token

1. If it's a new raw value, add a primitive in the `Tier 1` section of
   `tokens.css`.
2. Alias it through a semantic name in `Tier 2`.
3. If the usage repeats ≥ 3 times across components, add a utility class in
   `utilities.css` that composes it.

## Red flags (avoid in components)

- Raw hex colors in JSX / Tailwind arbitrary values (`text-[#abc]`, `bg-[#123]`)
- Light-mode ink classes (`text-ink-900` still works as a legacy alias but
  prefer `text-ink-50` for high-contrast text on our dark canvas)
- `border-ink-200` (use `border-line` / `.hairline`)
- `bg-white` (use `bg-surface` or `bg-raised`)

## Example refactor

Before:
```tsx
<button className="flex items-center gap-2 bg-brand-600 text-canvas text-xs font-mono uppercase tracking-wider font-semibold px-4 py-2 rounded-md hover:bg-brand-500 transition disabled:opacity-40">
  Save
</button>
```

After:
```tsx
<button className="btn-base btn-primary">Save</button>
```
