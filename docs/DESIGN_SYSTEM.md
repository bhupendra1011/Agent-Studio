# Agent Studio — design system

Canonical reference for typography, color, theming, motion, and where UI code lives. Use this when adding pages, components, or shadcn primitives.

## Stack (relevant to UI)

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Tailwind CSS** v4 — `@import "tailwindcss"`, `@theme inline` in `app/globals.css`
- **Theming**: `next-themes` + `ThemeProvider` (`components/theme-provider.tsx`), `class` strategy, dark via `.dark` on the document
- **Icons**: `lucide-react`
- **Class merging**: `cn()` from `lib/utils.ts` (clsx + tailwind-merge)
- **UI kit**: shadcn (registry style **base-nova** in `components.json`), primitives often built on **@base-ui/react**; not every screen uses only shadcn components

## Typography

| Role | How to use |
|------|------------|
| Body / UI | Default — `font-sans` maps to **Outfit** (`--font-outfit` from `app/layout.tsx`) |
| Headings / brand titles | Add **`font-heading`** — **Syne** (`--font-syne`) |
| Code / mono | Use Tailwind `font-mono` — **Geist Mono** (`--font-geist-mono`) |

## Color — two layers

### 1. Semantic tokens (shadcn-compatible)

CSS variables: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, `card`, `popover`, `destructive`, `sidebar-*`, `chart-*`, etc.

**Use for:** forms, layout shells, and components that should track the global UI theme with minimal custom CSS.

**In Tailwind:** e.g. `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`.

**Semantic primary and focus ring** (`--primary`, `--primary-foreground`, `--ring` in `app/globals.css`) use the same **teal hue** as `--studio-teal` so default shadcn controls (buttons, inputs, menus) feel on-brand in light and dark.

### 2. Brand tokens — Agent Studio

Defined in `:root` and `.dark` in `app/globals.css`:

| Token | Role |
|-------|------|
| `--studio-teal`, `--studio-teal-dim` | Primary accent |
| `--studio-mauve`, `--studio-mauve-dim` | Secondary accent |
| `--studio-ink`, `--studio-ink-muted` | Primary / secondary text on marketing surfaces |
| `--studio-surface`, `--studio-surface-muted` | Panels and fills |
| `--studio-border` | Hairlines and outlines |

**Use for:** marketing pages, hero, branded headers, and flows that should match the teal/mauve story in both light and dark.

**In JSX:** `text-[var(--studio-ink)]`, `bg-[var(--studio-surface-muted)]`, `border-[var(--studio-border)]`, etc.

**Do not** hardcode hex/RGB for theme surfaces if a token exists.

## Radius and shadcn theme bridge

- Global radius: `--radius` (see `globals.css`); Tailwind exposes `rounded-lg`, `rounded-md`, etc. via `@theme inline`.
- shadcn token imports: `@import "shadcn/tailwind.css"` — keep new primitives aligned with existing CSS variables.

## Motion

- **Reveal / stagger:** `studio-reveal`, `studio-reveal-d1` … `studio-reveal-d5`; section variants `studio-section-reveal`, `studio-section-reveal-d1` …
- **Decorative:** `studio-float-soft`, `studio-pulse-glow`, `studio-flow-dash`, `studio-bar-dance`, `studio-packet-move` (with delay classes where defined)

`@media (prefers-reduced-motion: reduce)` in `globals.css` disables these — prefer these classes over ad-hoc infinite animations when possible.

## `components/ui/` inventory

Install new primitives with **`npx shadcn@latest add <name>`** from the app root (see `components.json`). Current files:

| File | Notes |
|------|--------|
| `avatar.tsx` | Base UI avatar; `AvatarFallback`, `AvatarImage`, `AvatarGroup`, … |
| `badge.tsx` | Variants via CVA |
| `button.tsx` | Base UI button; `render` + `nativeButton={false}` for `Link` |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Menus, radio groups (e.g. theme switcher) |
| `input.tsx` | Text inputs |
| `label.tsx` | Client label primitive |
| `scroll-area.tsx` | Scrollable regions |
| `separator.tsx` | Horizontal / vertical rules |
| `sheet.tsx` | Slide-over panels |

## File placement

| Location | Purpose |
|----------|---------|
| `components/ui/` | Shared primitives from the shadcn CLI only — see inventory above. |
| `components/*.tsx` | Feature and domain components (marketing, dashboard, auth helpers). |
| `app/` | Routes, layouts, loading/error UI — compose components here; avoid huge inline JSX when a component is reusable. |

## Adding features — checklist

1. **Server by default** — use Client Components only when you need hooks, browser APIs, or client-only libraries; add `"use client"` at the top.
2. **Colors** — brand surfaces with `--studio-*`; generic UI with semantic Tailwind classes.
3. **New control** — if it’s reusable and generic, add via shadcn into `components/ui/`; if it’s product-specific, put it under `components/`.
4. **Links as buttons** — `Button` supports `render={<Link href="…" />}` and `nativeButton={false}` (see `marketing-header.tsx`).
5. **Accessibility** — preserve focus rings (`focus-visible:ring-*`), labels on inputs, and `aria-*` where applicable.

## shadcn / components.json

Aliases (see `components.json`): `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, `@/lib/utils` (`cn`).

After adding components, run lint and fix any import paths to match these aliases.
