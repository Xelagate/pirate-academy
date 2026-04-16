# Pirate Academy — Progress

**Plan:** `/home/alex/.claude/plans/imperative-noodling-haven.md`
**Deadline:** 2026-04-30 (Colosseum hackathon)

## Current Status: Day 3

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

## ⬜ Day 3 — mpl-core CPI ⚠️ HIGH RISK
- [ ] `instructions/mint_badge.rs` with mpl-core CPI
- [ ] Dump mpl_core fixture, configure `Anchor.toml`
- [ ] `anchor test` green (2 specs)

## ⬜ Day 4 — Devnet Deploy
- [ ] Airdrop SOL, deploy program
- [ ] `anchor idl init`
- [ ] Codama codegen → `app/generated/`
- [ ] `scripts/smoke.ts` prints Explorer link

## ⬜ Day 5 — Wallet + Vertical Slice
- [ ] `WalletProvider.tsx` (Phantom + Backpack + Solflare)
- [ ] `MintBadgeButton` works on `/dev` page
- [ ] Sign → Explorer shows asset under wallet

## ⬜ Day 6 — MDX + Monaco ⚠️ HIGH RISK
- [ ] `@next/mdx` configured
- [ ] `CodeExercise.tsx` (Monaco, `ssr:false`)
- [ ] One lesson renders, Pass/Fail works

## ⬜ Days 7–8 — Crab Forge (7 lessons)
## ⬜ Days 9–10 — Anchor Harbor (5 lessons) + `/badge`
## ⬜ Day 11 — Landing + Map + Progress Gating ⚠️ HIGH RISK
## ⬜ Day 12 — Polish (sounds, error boundaries, loading)
## ⬜ Day 13 — Vercel deploy + cross-browser test
## ⬜ Day 14 — Demo video + Colosseum submission
