# Landing + Map + Progress Gating — Design Spec

**Date:** 2026-04-18  
**Day:** 11 of 14 (Pirate Academy, Colosseum Hackathon)  
**Goal:** Minimum friction onboarding — user opens site → understands what it is → starts learning immediately, no wallet required to begin.

---

## Core Principle

> Wallet is NOT required to start lessons. Only the final mint requires wallet connection. This is the single biggest source of friction for new users and must be eliminated.

---

## Page Structure

Single page `/` — landing and map combined. Island pages already link back to `/` as "Back to map", confirming this was the original intent.

**Flow:**
```
/ (Hero) → scroll → (Reward Preview) → scroll → (Island Map) → click → /island/[island]/[lesson]
```

---

## Section 1 — Hero

**File:** `app/page.tsx` (full rewrite of scaffold)

- Background: `hero.png` at ~20% opacity over dark gradient (`#060d1a`)
- Radial gold glow overlay (subtle)
- Nav: `⚓ PIRATE ACADEMY` logo left, Devnet indicator + Connect Wallet right
- Eyebrow: `SOLANA ONBOARDING, REIMAGINED` (small caps, amber)
- Title: `Pirate Academy` — large, white gradient (`#fff → #94a3b8`)
- Subtitle: `Write real Rust. Deploy real Anchor programs. Mint your proof on devnet.`
- CTA button: `Begin the Voyage →` — amber, glowing pulse animation, scrolls to island section

**Returning user state** (localStorage has progress):
- CTA changes to `Continue Voyage →` (blue), links to first incomplete lesson across all unlocked islands (iterate Crab Forge lessons 01→07, then Anchor Harbor 01→05, return first where `isComplete(lessonId) === false`)
- Below button: `↳ Lesson 4 · Crab Forge` — label derived from the same first-incomplete lookup

**Connected wallet + existing profile state** (PDA fetched):
- Hero greeting: `Welcome back, Captain {crew_name}` replaces eyebrow text
- Inspired by CryptoZombies — user feels like a character, not a student

---

## Section 2 — Reward Preview

Between hero and island map. Shows the end goal before the user starts.

- `badge.png` centered, ~200px wide
- Heading: `Your Reward`
- Subtitle: `Complete both islands. Mint your graduation NFT on Solana devnet.`
- Thin amber divider above/below

---

## Section 3 — Island Map

**Component:** `app/components/IslandMap.tsx` (new, client component)

**Layout:**
- Section label: `ARCHIPELAGO` (small caps, amber)
- Section title: `Choose your island`
- 2 large island cards (vertical stack, max-width 600px centered)
- 3 small "coming soon" cards in a 3-column row below

**Island card (open):**
- Height ~100px, horizontal layout
- Left: island image (`crab-forge.png` / `anchor-harbor.png`), 120px wide, gradient fade to right
- Right body:
  - Island number + tech: `ISLAND 1 · RUST` (small caps, amber/blue)
  - Island name: `🦀 Crab Forge` (large, bold)
  - One-liner WHY: `Rust is the language every Solana program is written in` ← from CodeCombat
  - What you'll build: `Build your first on-chain account in Rust` ← from CryptoZombies
  - Progress bar + count: `3 / 7` (amber fill)
- Hover: `translateY(-2px)` + stronger shadow
- Click: navigate to first incomplete lesson (or lesson 01 if none)

**Anchor Harbor — locked state:**
- Same card layout but greyed out, `cursor: not-allowed`, `opacity: 0.55`, grayscale filter
- Lock badge: `🔒 Finish Lesson 7 in Crab Forge to unlock` ← specific, not just "LOCKED"
- No hover effect

**Anchor Harbor — unlocked state** (all 7 Crab Forge lessons complete):
- Full color restored, blue glow border
- framer-motion `layout` animation: lock badge fades out, card fades in at full opacity
- Progress bar shows `0 / 5`

**Coming soon cards (3):**
- Small, dashed border, 40% opacity
- 🐳 Docker Depths / ☀️ Sol Summit / 🤫 Jito Ghost Ship
- `Coming soon` label

**Framer-motion animations:**
- Island cards enter with `staggerChildren` (0.1s delay each), `y: 20 → 0`, `opacity: 0 → 1`
- Unlock transition: `AnimatePresence` on lock badge, `layout` on card container

---

## Progress Gating Logic

**File:** `app/lib/progress.ts` — add one helper:

```ts
export function isIslandComplete(islandSlug: string): boolean {
  const island = ISLANDS[islandSlug];
  if (!island) return false;
  return completedCount(island.lessons.map(l => l.lessonId)) === island.lessons.length;
}
```

Anchor Harbor is navigable only when `isIslandComplete('crab-forge') === true`.

---

## Wallet + Profile State

**New hook or inline in page:** fetch `PirateProfile` PDA when wallet is connected.

- Use existing `app/generated/pirate-academy/` Codama client
- PDA seeds: `[b"pirate", authority]` — already defined in `app/generated/pirate-academy/pdas/profile.ts`
- If account exists → extract `crew_name` → show in hero
- If account doesn't exist → normal hero state (no change)
- Fetch is fire-and-forget, no loading state needed in hero (just shows when ready)

---

## Files Changed / Created

| File | Action | Notes |
|------|--------|-------|
| `app/page.tsx` | Full rewrite | Remove scaffold, build hero + reward + map sections |
| `app/components/IslandMap.tsx` | New | Client component, framer-motion, reads progress |
| `app/lib/progress.ts` | Add `isIslandComplete()` | One function |
| `app/layout.tsx` | Update metadata | Title: "Pirate Academy · Learn Solana" |
| `package.json` | Add framer-motion | `pnpm add framer-motion` |

---

## Out of Scope (YAGNI)

- Split-panel code + visual result (CodeCombat-style) — Day 12+
- RPG mechanics, items, character upgrades
- Mobile layout
- Sound effects (Day 12)
- Real-time cargo build

---

## Verification

- `pnpm build` green, 21+ static pages
- `/` renders hero with `hero.png` background visible
- `badge.png` visible in reward section
- Island cards show `crab-forge.png` and `anchor-harbor.png`
- Anchor Harbor locked by default (no localStorage)
- Completing all 7 Crab Forge lessons in localStorage → Anchor Harbor unlocks with animation
- Returning user (progress in localStorage) → CTA shows "Continue Voyage →"
- Wallet connected + profile PDA exists → "Captain [crew_name]" shown in hero
