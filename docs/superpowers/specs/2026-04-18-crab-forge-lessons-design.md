# Crab Forge — Days 7–8 Design

## Goal

Complete Island 1 "Crab Forge": 7 interactive Rust lessons with dynamic routing,
progress tracking, and smooth navigation. Output: a fully playable island.

## Routes

| Path | Purpose |
|------|---------|
| `/island/crab-forge` | Lesson index — grid of 7 cards with progress indicators |
| `/island/crab-forge/[lesson]` | Individual lesson (MDX + Monaco exercise) |

Both pages are statically generated (`generateStaticParams`).

## Data Layer

`app/lib/lessons.ts` — single source of truth:
- Static import map `Record<island, Record<slot, () => Promise<module>>>` (required by Next.js bundler)
- `LESSON_META` array per island: `{ slot, title, lessonId }` for index rendering without loading MDX

`app/lib/progress.ts` — localStorage wrapper:
- `markComplete(lessonId)` — called on Pass
- `isComplete(lessonId): boolean`
- `completedCount(island): number`

## MDX Lessons (6 new files)

All follow `01-name.mdx` pattern: `export const meta`, pirate-themed explanation, code example, fill-the-blank task.

| File | Concept | Blank | Validator key |
|------|---------|-------|---------------|
| `02-doubloons.mdx` | Unsigned integers | `doubloons: ___` → `u64` | crab-forge-2 |
| `03-visibility.mdx` | `pub` keyword | add 3× `pub` | crab-forge-3 |
| `04-crew.mdx` | `Vec<T>` collections | `pirates: ___` → `Vec<Pirate>` | crab-forge-4 |
| `05-methods.mdx` | `impl` + `&self` | `fn hoist(___)` → `&self` | crab-forge-5 |
| `06-account.mdx` | `#[account]` attribute | add `#[account]` | crab-forge-6 |
| `07-bumps.mdx` | `InitSpace` + `bump: u8` | derive + field | crab-forge-7 |

## Lesson Page Layout

```
[Breadcrumb: Crab Forge · Lesson N of 7]  [progress bar]
<h1>{title}</h1>
<MDX prose>
<CodeExercise lessonId initialCode />
[Prev]                               [Next →]
```

On Pass: `markComplete(lessonId)` → Next button unlocks (no hard gating yet, soft highlight).
On lesson 7 Pass: "Complete Island!" CTA → links to `/island/crab-forge` with all 7 green.

## Island Index Layout

Grid of 7 lesson cards (title + number + ✓ checkmark if complete).
Progress bar: "N/7 lessons complete".
Header: pirate emoji + "Crab Forge" + short blurb.

## Styling Decisions

- Dark theme (already shadcn dark), amber/gold accent for correct answers
- `prose-invert` for MDX (already works in `/dev/lesson`)
- `Card` component from shadcn for lesson cards
- No framer-motion yet (Day 12 polish)

## Out of Scope (this sprint)

- Hard progress gating (unlock next only after pass) — Day 11
- Sound effects — Day 12
- Anchor Harbor lessons — Days 9–10
