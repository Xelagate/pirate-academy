# Pirate Academy — Product Roadmap Design

**Date:** 2026-05-01  
**Status:** Approved  
**Scope:** Post-hackathon product evolution across 4 phases

---

## Context

Pirate Academy is a deployed Solana learning platform (course-eight-plum.vercel.app) with:
- 2 islands, 12 lessons, Monaco in-browser code editor
- mpl-core NFT badge minting on lesson completion
- Pirate theme with island map (card-based, to be replaced)
- Devnet program: `9pHeiuDFexs5HQSmsNbzxhYR1mWW223oeNwFEsz5XWiW`

**Competitive landscape:** Blueshift (Solana, free, NFT rewards), Rise In (Web3, XP gamification, NFT certs), Nuts Farm (TG learn-to-earn), Coob App (TG course builder).

**Differentiation:** No competitor combines ship progression + PvP battles + SBT employer credentials + B2B custom courses.

---

## Monetization Model

**Students: always free.** Revenue comes from three sources:

1. **B2B** — companies pay to commission branded courses
2. **Captain marketplace** — platform takes % of tutor session fees (Preply model)
3. **Sponsor prize pools** — partners pay to fund PvP tournament rewards

Paid student tier introduced only after the platform has established audience.

---

## Phase 1 — Business Foundation

**Goal:** First revenue, unique market positioning.

### SBT Badges
Non-transferable completion credentials. Add `non-transferable` flag to existing mpl-core mint. Technically ~1 day of work — program and minting flow already exist.

SBT = verifiable on-chain proof of skills. Cannot be bought, sold, or transferred — only earned. Employer sees a wallet → sees what courses the candidate completed. No competitor offers this.

### B2B Course Ordering
Landing page for companies: "Commission a branded course for your community." Companies specify topic → Pirate Academy builds the course → students get a limited-edition branded SBT item on completion.

Company incentive: their course brings educated users/developers into their ecosystem. They also self-promote to their audience → free distribution for the platform.

### Seasonal Collab Framework
Reusable campaign template: partner arrives → limited course runs for a season → students earn a time-limited SBT → season ends, item no longer available. Creates recurring partnership pipeline.

### Distribution Partnerships
MonkeDAO holders (Solana-native) and Pudgy Penguins holders (cross-chain, strong brand) get exclusive ship skin / pirate cosmetic for completing a course. No payment needed — exclusive NFT cosmetics are sufficient incentive. MonkeDAO is the priority as it's already Solana-native.

---

## Phase 2 — Gamification

**Goal:** Retention, visual progression, immersive atmosphere.

### Interactive Treasure Map
Replace card-based island list with a real pirate treasure map:
- Sea with animated waves, actual island art
- Clickable islands with names
- Completed islands: lit up, flag planted
- Locked islands: fog of war
- Future islands: "Скоро" label (no fog, no lock — just teaser)
- Ship animates sailing to the selected island on navigation

### Ship Progression
The ship is the central progress indicator:
- Starts as a broken sloop
- Upgrades: Sloop → Brigantine → Galleon
- Ship level determines which islands are accessible
- Visual transformation (sprite swap + animation) at each upgrade

### Resource Economy
Resources drop exclusively from completing lessons and exercises — no separate grinding.
- Resources used to upgrade the ship
- Types: Lumber (basic), Rope (intermediate), Gold (advanced)
- No separate farming mini-games — learning IS the resource loop

### Pirate Avatar
Customizable character whose appearance reflects earned items:
- Items earned from lesson completion (hat, coat, weapon, accessories)
- B2B course completions give branded items (company logo on coat, flag, etc.)
- SBT badges displayed as medals on the character
- Player chooses what to equip from earned inventory (RPG-style)

### Seamless Atmosphere
The platform must feel like a game, not a website:
- No hard page reloads — all navigation is animated transitions
- Monaco code editor = ship's cabin interior
- Completing a task triggers map animation (island lights up, resource drops) without leaving the island context
- Existing Web Audio (chime on pass, foghorn on mint) extended throughout
- "You have arrived on Rust Island" — immersive island entry moment

---

## Phase 3 — Community & Competition

**Goal:** Virality, retention loops, new audience segments.

### Introductory User Course
A non-developer course: how to use Solana as a regular user.
- Setting up a wallet
- Sending and receiving SOL
- Using a DEX (Jupiter)
- Putting funds into a lending protocol (Marinade, Kamino)

This is a much larger audience than developers. Protocols pay for this course as B2B (they need educated users). It serves as the entry point before developer islands.

### PvP Naval Battles
Quiz-style battles between players using questions from completed courses:
- Correct answer = cannon fires at opponent's ship
- First to sink the opponent wins
- **Cold-start solution:** async mode + AI opponent (bot with adjustable difficulty). Real-time matchmaking activates when user base grows
- Winners earn resources

**Wagering:** Players bet in-game resources on the outcome. No real money between players.

**Sponsor Prize Pools:** Partners (Solana Foundation, ecosystem projects) fund SOL prize pools for tournaments. Players compete for sponsor prizes — not gambling, structured as a competition with a sponsor award.

### Community Discussions
Discussion threads under each exercise (Stepik model). Students help each other. Reduces need for 1-on-1 tutor sessions for common questions.

### Expanded Partnerships
Seasonal collabs with crypto projects and companies:
- Project commissions a course during their token launch / product release
- Limited SBT drop tied to the season
- Recurring revenue cycle

---

## Phase 4 — Marketplace & Content Depth

**Goal:** Revenue diversification, content quality moat.

### "Call the Captain" Tutor Marketplace
On-demand tutoring accessible directly from any lesson:
- Student stuck on exercise → "Позвать Капитана" button
- Tutors listed with specializations, ratings, availability
- Session happens in a "cabin" (video/chat interface on-platform)
- Tutors can offer: programming only, language only, or both (programming taught in English with language support)
- Platform takes % of session fee

Language-combo tutors serve non-English speakers who need to read Solana docs — a large underserved market.

### Content Depth (Generation Python standard)
Expand each island from 5–7 lessons to full course depth:
- 15–30 exercises per topic
- Progressive difficulty within each topic (trivial → challenging)
- Short theory, heavy practice
- Auto-graded (Monaco + validators already in place)
- Certificate / SBT on island completion

---

## Architecture Notes

- SBT flag: mpl-core `transferable: false` on `CreateV2CpiBuilder`
- Interactive map: SVG or canvas-based, Framer Motion for ship travel animation
- PvP backend: initially stateless (async challenge stored on-chain or in DB), WebSocket layer added for real-time mode later
- Resource economy: can start as localStorage (like progress), migrate to on-chain when economy matures
- Tutor marketplace: separate Next.js route group, real-time via WebSockets or LiveKit

---

## Success Metrics

| Phase | Metric |
|-------|--------|
| 1 | First B2B contract signed |
| 2 | 30-day retention doubles vs baseline |
| 3 | Weekly active PvP battles > 100 |
| 4 | Captain marketplace GMV > $1k/month |
