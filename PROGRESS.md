# Pirate Academy — Progress

**Plan:** `/home/alex/.claude/plans/imperative-noodling-haven.md`
**Deadline:** 2026-04-30 (Colosseum hackathon)

## Current Status: Day 4

## ✅ Day 1 — Scaffold
- `create-solana-dapp@4.8.4` template `nextjs-anchor` deployed
- `cargo test`: 4/4 green (vault program, LiteSVM)
- `pnpm dev`: Next.js 16.0.10 responds 200 on localhost:3000
- Git initialized by scaffold
- **Note:** template puts Next.js at root `app/` (not `web/app/` as in plan) — adjust all `web/` paths accordingly

## ✅ Day 2 — Anchor Program
- [x] Rename `vault` → `pirate-academy` program
- [x] `state.rs` — `PirateProfile` struct (`authority`, `joined_slot`, `badges_minted`, `bump`, `crew_name`)
- [x] `errors.rs` — `PirateError` (`BadCrewName`, `AlreadyGraduated`)
- [x] `instructions/register_pirate.rs` — seeds `[b"pirate", authority]`, validates name 1–24 ASCII
- [x] `cargo test` green: 3/3 (register_pirate happy path + empty name rejection + test_id)

## ✅ Day 3 — mpl-core CPI
- [x] `instructions/mint_badge.rs` with mpl-core CPI (CreateV2CpiBuilder)
- [x] mpl_core.so fixture in `tests/fixtures/`, `Anchor.toml` uses `cargo test`
- [x] `cargo test` green: 5/5 (register×2, mint_badge happy path + wrong authority, test_id)
- **Note:** mpl-core 0.11.2 feature flag is `anchor`, not `cpi`

## ✅ Day 4 — Devnet Deploy
- [x] Program deployed to devnet: `9pHeiuDFexs5HQSmsNbzxhYR1mWW223oeNwFEsz5XWiW`
- [x] `declare_id!` + `Anchor.toml` updated to match actual deploy address
- [x] `anchor idl upgrade` — IDL on-chain (both instructions)
- [x] Codama codegen → `app/generated/pirate-academy/` (@solana/kit typed client)
- [x] `scripts/smoke.ts` prints Explorer link — confirmed on devnet
- **Note:** mpl-core feature = `anchor`; use `getRegisterPirateInstructionAsync` (not sync); use `getSignatureFromTransaction` before `sendAndConfirm`; `@solana-program/system` for SOL transfers

## ✅ Day 5 — Wallet + Vertical Slice
- [x] `WalletProvider.tsx` already existed from scaffold (Wallet Standard, auto-connect, Phantom/Backpack/Solflare)
- [x] `MintBadgeButton` — register+mint in one tx if new, mint-only if profile exists; `app/components/mint-badge-button.tsx`
- [x] `/dev` page renders `MintBadgeButton` + wallet header; 200 confirmed
- **Note:** `useSendTransaction` collects `TransactionSigner` refs from instruction accounts automatically (no extra config needed)

## ✅ Day 6 — MDX + Monaco ⚠️ HIGH RISK
- [x] `@next/mdx` + `@monaco-editor/react` installed (4.7.0 / 16.2.4)
- [x] `next.config.ts` + `mdx-components.tsx` configured; `mdx.d.ts` types added
- [x] `app/lib/validators/rust.ts` — regex validators for all 7 Crab Forge lessons
- [x] `CodeExercise.tsx` — Monaco `ssr:false` via `next/dynamic`, Pass/Fail feedback
- [x] `app/content/lessons/crab-forge/01-name.mdx` — first lesson with `meta` export
- [x] `/dev/lesson` page renders MDX + CodeExercise; `pnpm build` green
- **Note:** `next/dynamic` with `ssr:false` requires `"use client"` in App Router; `scripts/` excluded from tsconfig to prevent pre-existing type errors from blocking build

## ✅ Days 7–8 — Crab Forge (7 lessons)
- [x] `app/lib/lessons.ts` — island metadata + static MDX import map (`LessonModule` type, no `as never`)
- [x] `app/lib/progress.ts` — localStorage helpers: `markComplete`, `isComplete`, `completedCount`
- [x] MDX lessons 02–07 with pirate-themed content matching existing validators
- [x] `LessonClient.tsx` — CodeExercise + `onPass → markComplete` + Prev/Next nav, amber CTA on last lesson
- [x] `/island/[island]/[lesson]` — SSG lesson page: breadcrumb, progress bar, MDX prose, LessonClient
- [x] `/island/[island]` — island index: per-lesson completion cards, overall progress bar
- **Note:** amber (#F59E0B) accent for completed state; soft nav (Next always visible, highlighted on pass)
## ⬜ Days 9–10 — Anchor Harbor (5 lessons) + `/badge`
## ⬜ Day 11 — Landing + Map + Progress Gating ⚠️ HIGH RISK
## ⬜ Day 12 — Polish (sounds, error boundaries, loading)
## ⬜ Day 13 — Vercel deploy + cross-browser test
## ⬜ Day 14 — Demo video + Colosseum submission
