# Day 12 Polish — Design Spec

**Date:** 2026-04-18  
**Scope:** Sounds, error boundaries, mobile blocker, loading skeletons

---

## 1. Sounds (Web Audio API)

### Hook: `app/lib/hooks/use-sound.ts`

Exports two functions: `playChime()` and `playFoghorn()`. No audio files — synthesized via Web Audio API.

- **`playChime()`** — called on lesson pass. Three ascending notes C5→E5→G5, 80ms each, OscillatorNode (sine) + GainNode with exponential fade-out.
- **`playFoghorn()`** — called after badge mint tx confirmed. F2, 600ms, OscillatorNode (sawtooth) with slow attack and decay via GainNode envelope.

Both functions create `new AudioContext()` lazily inside the call (must be inside a user gesture handler to satisfy browser autoplay policy).

### Integration points

| Location | Function | Trigger |
|---|---|---|
| `app/components/lessons/CodeExerciseInner.tsx` | `playChime()` | Inside `onPass` callback, after validator returns true |
| `app/components/lessons/FinalLesson.tsx` | `playFoghorn()` | After `send()` resolves successfully, before `router.push()` |

---

## 2. Error Boundaries

### Component: `app/components/ErrorBoundary.tsx`

React class component (required for `componentDidCatch`). Props:
- `children: React.ReactNode`
- `fallback: React.ReactNode` — shown when error is caught

### Placement

| Wrap target | File | Fallback message |
|---|---|---|
| `<CodeExercise>` | `LessonClient.tsx` | "Редактор не загрузился — обнови страницу" |
| `<FinalLesson>` | `LessonClient.tsx` | "Ошибка кошелька — обнови страницу" |
| `<IslandMap>` | `page.tsx` | Empty `<section id="islands">` with brief error text |

Fallback UI: minimal dark card matching the site palette (`bg-[#0a0f18] border border-white/10 rounded-2xl p-6 text-slate-400 text-sm text-center`).

---

## 3. Mobile Blocker

### Component: `app/components/MobileBlocker.tsx`

Client component. On mount, checks `window.innerWidth < 768`. If true, renders a `fixed inset-0 z-50` overlay over all content.

Overlay design:
- Background: `bg-[#060d1a]`
- Content: anchor emoji `⚓`, heading "Desktop Only", subtext "Pirate Academy requires a desktop browser. Open this page on your laptop or PC."
- No close button — intentionally blocking

Added to `app/layout.tsx` inside `<Providers>`, before `{children}`.

Uses `useState(false)` + `useEffect` to avoid SSR mismatch (renders nothing on server).

---

## 4. Loading Skeletons

### IslandMap

`IslandMap.tsx` already uses `mounted` state to read localStorage. While `!mounted`, render two skeleton cards instead of real island cards:

```
<div className="animate-pulse rounded-2xl h-28 bg-white/5" />
<div className="animate-pulse rounded-2xl h-28 bg-white/5" />
```

### HeroSection

Already handles `mounted` correctly — CTA defaults to "Begin the Voyage →" which is the correct pre-hydration state. No skeleton needed.

### CodeExercise

Already has `loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-muted" />` in the `dynamic()` wrapper. No changes needed.

---

## Out of Scope

- Mobile-responsive layout (desktop-only is explicitly in MVP scope)
- Global error boundary (targeted boundaries are sufficient)
- Sound settings/mute toggle (YAGNI)
