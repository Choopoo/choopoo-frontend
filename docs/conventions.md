# Conventions

TS / React / Tailwind rules for `choopoo-frontend`. Update when a new
long-lived convention is introduced.

## TypeScript

- Strict mode on (`tsconfig.json`); don't loosen it for one-off cases.
- Prefer `type` over `interface` for object shapes; reserve `interface`
  for things that get extended.
- Cookie-auth API surface lives in `src/api/v2.ts` with explicit response
  types co-located. Don't re-derive types in pages — import them.

## React

- Functional components only; one default export per file in `pages/`,
  named exports in `components/`.
- TanStack Query for any GET — query keys are arrays `['v2:resource', …id]`.
  Always namespace with `v2:` so the legacy `client.ts` keys don't collide.
- Mutations go through `useMutation` and call `qc.invalidateQueries` on
  success — don't refetch manually.

## Tailwind / CSS

- Use Tailwind utilities for layout/spacing. Use the role classes in
  `src/design/utilities.css` for repeating patterns (buttons, inputs,
  page headers).
- See `docs/design.md` for the full design rules (the load-bearing ones).
- Never write a page header by hand — import `<PageHeader>` from
  `src/components/PageHeader.tsx`.
- No raw hex in JSX or arbitrary `[Xpx]` Tailwind values — use tokens.

## File naming

- Components: `PascalCase.tsx`.
- Hooks: `useThing.ts`.
- Pages: `PascalCase.tsx` with a default export.
- Utility modules: `kebab-case.ts`.

## i18n

- Every user-facing JSX literal goes through `t()` from `react-i18next`.
  Pick the right namespace (`common`, `auth`, `desk`, `goals`,
  `materials`, `copilot`, `insights`, `status`, `enums`).
- Add the same key to BOTH `locales/en/<ns>.json` AND `locales/zh-CN/<ns>.json`.
  Missing keys fall back to English; missing in en too falls back to the
  raw key — both are bugs.
- DB-sourced bilingual columns (`name`/`name_cn`,
  `description`/`description_cn`, `label`/`label_cn`) → display via
  `useLocalizedField(row, 'name')`. Don't conditional on `i18n.language`
  in components.
- Backend enum values (lens, kind, role, status, aspect_code, …) →
  display via `useEnumLabel('lens', 'buy')`. Backed by
  `locales/<lang>/enums.json`.
- Number formatting: pass `i18n.language` to `Number.toLocaleString` —
  never hardcode `'en-US'`. Currency: `¥` for CNY values, `$` for USD,
  no thousands separator hardcoding.
- Pluralization uses `{{count}}` interpolation. Chinese has no plural
  rule, so the `_plural` suffix is rarely needed.
- The `LocaleSwitcher` in `AvatarMenu` calls `i18n.changeLanguage` and
  persists via `PATCH /api/v2/me { locale }`. The user's saved
  `users.locale` wins over browser-detect on every `/me` refresh.

## Enum-label tables

When you add a new enum value (new lens, new aspect_code, new
insight_kind, …), add the label to `locales/en/enums.json` and
`locales/zh-CN/enums.json` under the matching category. The
`useEnumLabel` helper falls back to the raw enum value, so unmigrated
values just look unstyled — they don't break.
