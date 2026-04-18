# Landing + Map + Progress Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scaffold home page with a full Pirate Academy landing + island map with progress gating, framer-motion animations, and crew name personalisation.

**Architecture:** `app/page.tsx` becomes a server component with two client children — `HeroSection` (wallet + progress state) and `IslandMap` (framer-motion cards + gating logic). Static reward section lives inline in the server component.

**Tech Stack:** Next.js 16 App Router, framer-motion, Tailwind v4, @solana/kit Codama client, localStorage progress helpers.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | modify | add framer-motion |
| `app/lib/progress.ts` | modify | add `isIslandComplete()` + `nextLesson()` |
| `app/components/IslandMap.tsx` | **create** | island cards, gating, framer-motion stagger + unlock anim |
| `app/components/HeroSection.tsx` | **create** | hero bg, CTA, returning-user state, Captain name fetch |
| `app/page.tsx` | **rewrite** | server component: HeroSection + RewardSection + IslandMap |
| `app/layout.tsx` | modify | update metadata title + description |

---

### Task 1: Install framer-motion + extend progress.ts

**Files:**
- Modify: `package.json` (via pnpm)
- Modify: `app/lib/progress.ts`

- [ ] **Step 1: Install framer-motion**

```bash
cd /home/alex/claude/course && pnpm add framer-motion
```

Expected: `+ framer-motion X.X.X` in output, no errors.

- [ ] **Step 2: Add isIslandComplete + nextLesson to progress.ts**

Replace the entire `app/lib/progress.ts` with:

```ts
import { ISLANDS } from "./lessons";

const KEY = "pirate-progress";
const ISLAND_ORDER = ["crab-forge", "anchor-harbor"] as const;

function getCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markComplete(lessonId: string): void {
  const completed = getCompleted();
  if (!completed.includes(lessonId)) {
    localStorage.setItem(KEY, JSON.stringify([...completed, lessonId]));
  }
}

export function isComplete(lessonId: string): boolean {
  return getCompleted().includes(lessonId);
}

export function completedCount(lessonIds: string[]): number {
  const completed = getCompleted();
  return lessonIds.filter((id) => completed.includes(id)).length;
}

export function isIslandComplete(islandSlug: string): boolean {
  const island = ISLANDS[islandSlug];
  if (!island) return false;
  return completedCount(island.lessons.map((l) => l.lessonId)) === island.lessons.length;
}

export function nextLesson(): { island: string; slot: string; title: string } | null {
  for (const slug of ISLAND_ORDER) {
    const island = ISLANDS[slug];
    if (!island) continue;
    for (const lesson of island.lessons) {
      if (!isComplete(lesson.lessonId)) {
        return { island: slug, slot: lesson.slot, title: lesson.title };
      }
    }
  }
  return null;
}
```

- [ ] **Step 3: Verify build still passes**

```bash
cd /home/alex/claude/course && pnpm build 2>&1 | tail -5
```

Expected: `✓ Compiled successfully` or similar, no type errors.

- [ ] **Step 4: Commit**

```bash
cd /home/alex/claude/course && git add package.json pnpm-lock.yaml app/lib/progress.ts && git commit -m "feat: install framer-motion + add isIslandComplete/nextLesson helpers"
```

---

### Task 2: Create IslandMap.tsx

**Files:**
- Create: `app/components/IslandMap.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ISLANDS } from "@/lib/lessons";
import { completedCount, isIslandComplete } from "@/lib/progress";

const COMING_SOON = [
  { slug: "docker-depths", emoji: "🐳", title: "Docker Depths" },
  { slug: "sol-summit", emoji: "☀️", title: "Sol Summit" },
  { slug: "jito-ghost", emoji: "🤫", title: "Jito Ghost Ship" },
];

const ISLAND_META: Record<string, {
  image: string;
  color: "amber" | "sky";
  label: string;
  why: string;
}> = {
  "crab-forge": {
    image: "/art/crab-forge.png",
    color: "amber",
    label: "ISLAND 1 · RUST",
    why: "Rust is the language every Solana program is written in",
  },
  "anchor-harbor": {
    image: "/art/anchor-harbor.png",
    color: "sky",
    label: "ISLAND 2 · ANCHOR",
    why: "Anchor is the framework every Solana developer uses",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function IslandMap() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [crabComplete, setCrabComplete] = useState(false);

  useEffect(() => {
    const p: Record<string, number> = {};
    for (const [slug, island] of Object.entries(ISLANDS)) {
      p[slug] = completedCount(island.lessons.map((l) => l.lessonId));
    }
    setProgress(p);
    setCrabComplete(isIslandComplete("crab-forge"));
  }, []);

  const anchorLocked = !crabComplete;

  return (
    <section id="islands" className="py-20 px-6 max-w-3xl mx-auto">
      <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-2 uppercase">
        Archipelago
      </p>
      <h2 className="text-3xl font-black text-white mb-12">Choose your island</h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 mb-8"
      >
        <motion.div variants={cardVariant}>
          <IslandCard
            slug="crab-forge"
            locked={false}
            done={progress["crab-forge"] ?? 0}
            total={ISLANDS["crab-forge"].lessons.length}
          />
        </motion.div>

        <motion.div variants={cardVariant} layout>
          <IslandCard
            slug="anchor-harbor"
            locked={anchorLocked}
            done={progress["anchor-harbor"] ?? 0}
            total={ISLANDS["anchor-harbor"].lessons.length}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {COMING_SOON.map(({ slug, emoji, title }) => (
          <div
            key={slug}
            className="border border-dashed border-white/[0.06] rounded-xl p-5 text-center opacity-40"
          >
            <div className="text-2xl mb-2">{emoji}</div>
            <p className="text-xs font-bold text-slate-500">{title}</p>
            <p className="text-[10px] text-slate-700 mt-1">Coming soon</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IslandCard({
  slug,
  locked,
  done,
  total,
}: {
  slug: string;
  locked: boolean;
  done: number;
  total: number;
}) {
  const island = ISLANDS[slug];
  const meta = ISLAND_META[slug];
  const pct = total > 0 ? (done / total) * 100 : 0;
  const firstLesson = island.lessons[0];
  const isAmber = meta.color === "amber";

  const inner = (
    <div
      className={[
        "relative flex overflow-hidden rounded-2xl border h-28 transition-all duration-300",
        locked
          ? "border-white/[0.05] bg-[#0a0f18] cursor-not-allowed opacity-55 grayscale-[0.4]"
          : isAmber
          ? "border-amber-500/20 bg-gradient-to-r from-[#0f1e2e] to-[#0a1628] shadow-[0_0_30px_rgba(245,158,11,0.08)] hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:-translate-y-0.5"
          : "border-sky-500/20 bg-gradient-to-r from-[#0a1a2e] to-[#060d1a] shadow-[0_0_30px_rgba(56,189,248,0.08)] hover:shadow-[0_0_40px_rgba(56,189,248,0.15)] hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div
        className="w-32 flex-shrink-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${meta.image}')`,
          maskImage:
            "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
        }}
      />

      <div className="flex flex-1 items-center justify-between px-6">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold tracking-[2px] mb-1 ${
              locked ? "text-slate-600" : isAmber ? "text-amber-500" : "text-sky-400"
            }`}
          >
            {meta.label}
          </p>
          <p className="text-lg font-black text-white mb-1">
            {island.emoji} {island.title}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{meta.why}</p>
        </div>

        <div className="flex-shrink-0 ml-4 text-right">
          <AnimatePresence mode="wait">
            {locked ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-slate-500 font-semibold whitespace-nowrap"
              >
                🔒 Clear Island 1 first
              </motion.div>
            ) : (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-1 bg-white/10 rounded-full mb-1.5 ml-auto">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAmber ? "bg-amber-500" : "bg-sky-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {done} / {total}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  if (locked) return inner;
  return (
    <Link href={`/island/${slug}/${firstLesson.slot}`}>{inner}</Link>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/alex/claude/course && pnpm build 2>&1 | grep -E "error|Error|✓" | head -20
```

Expected: no TypeScript errors mentioning `IslandMap`.

- [ ] **Step 3: Commit**

```bash
cd /home/alex/claude/course && git add app/components/IslandMap.tsx && git commit -m "feat: IslandMap component with framer-motion stagger + progress gating"
```

---

### Task 3: Create HeroSection.tsx

**Files:**
- Create: `app/components/HeroSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet/context";
import { useSolanaClient } from "@/lib/solana-client-context";
import { WalletButton } from "@/components/wallet-button";
import { completedCount, nextLesson } from "@/lib/progress";
import { findProfilePda, fetchMaybePirateProfile } from "@/generated/pirate-academy";
import { ISLANDS } from "@/lib/lessons";

const ALL_LESSON_IDS = Object.values(ISLANDS).flatMap((i) =>
  i.lessons.map((l) => l.lessonId)
);

export function HeroSection() {
  const { signer } = useWallet();
  const client = useSolanaClient();

  const [crewName, setCrewName] = useState<string | null>(null);
  const [next, setNext] = useState<{ island: string; slot: string; title: string } | null>(null);
  const [totalDone, setTotalDone] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Read progress from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setMounted(true);
    setNext(nextLesson());
    setTotalDone(completedCount(ALL_LESSON_IDS));
  }, []);

  // Fetch crew name from PDA when wallet connects
  useEffect(() => {
    if (!signer) {
      setCrewName(null);
      return;
    }
    let cancelled = false;
    async function fetchCrewName() {
      if (!signer) return;
      try {
        const [profileAddress] = await findProfilePda({ authority: signer.address });
        const profile = await fetchMaybePirateProfile(client.rpc, profileAddress);
        if (!cancelled && profile.exists) setCrewName(profile.data.crewName);
      } catch {
        // silent — profile may not exist yet
      }
    }
    void fetchCrewName();
    return () => {
      cancelled = true;
    };
  }, [signer, client]);

  const hasStarted = mounted && totalDone > 0;
  const ctaHref = hasStarted
    ? next
      ? `/island/${next.island}/${next.slot}`
      : "/badge"
    : "#islands";
  const ctaLabel = hasStarted ? "Continue Voyage →" : "Begin the Voyage →";
  const isReturning = hasStarted;

  const eyebrow = crewName
    ? `Welcome back, Captain ${crewName}`
    : "Solana onboarding, reimagined";

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* hero.png background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/art/hero.png')", opacity: 0.18 }}
      />
      {/* gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.08) 0%, transparent 60%), linear-gradient(to bottom, rgba(6,13,26,0.3) 0%, rgba(6,13,26,0) 40%, rgba(6,13,26,0.95) 75%, #060d1a 100%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-5 border-b border-amber-500/10">
        <span className="text-amber-500 font-black text-sm tracking-[3px] uppercase">
          ⚓ Pirate Academy
        </span>
        <WalletButton />
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-16">
        <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-5 uppercase">
          {eyebrow}
        </p>
        <h1
          className="text-7xl md:text-8xl font-black leading-none mb-6 select-none"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Pirate
          <br />
          Academy
        </h1>
        <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-10">
          Write real Rust. Deploy real Anchor programs.
          <br />
          Mint your proof on Solana devnet.
        </p>

        <a
          href={ctaHref}
          className={[
            "inline-block px-10 py-4 rounded-2xl font-black text-lg transition-all",
            isReturning
              ? "bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_40px_rgba(56,189,248,0.4)]"
              : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-pulse",
          ].join(" ")}
        >
          {ctaLabel}
        </a>

        {hasStarted && next && (
          <p className="mt-3 text-sm text-slate-600">
            ↳ {next.title} · {ISLANDS[next.island]?.title}
          </p>
        )}
      </div>

      {/* Scroll hint */}
      <div className="relative z-10 text-center pb-8 text-slate-700 text-[10px] tracking-[3px] animate-bounce">
        ▼ &nbsp; CHOOSE YOUR ISLAND &nbsp; ▼
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/alex/claude/course && pnpm build 2>&1 | grep -E "error|Error|✓" | head -20
```

Expected: no TypeScript errors mentioning `HeroSection`.

- [ ] **Step 3: Commit**

```bash
cd /home/alex/claude/course && git add app/components/HeroSection.tsx && git commit -m "feat: HeroSection with hero.png bg, returning-user CTA, Captain name fetch"
```

---

### Task 4: Rewrite page.tsx + update layout.tsx

**Files:**
- Rewrite: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Rewrite app/page.tsx**

```tsx
import { HeroSection } from "@/components/HeroSection";
import { IslandMap } from "@/components/IslandMap";

export const metadata = {
  title: "Pirate Academy · Learn Solana",
  description:
    "Write real Rust. Deploy real Anchor programs. Mint your proof on Solana devnet.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <HeroSection />
      <RewardSection />
      <IslandMap />
    </div>
  );
}

function RewardSection() {
  return (
    <section className="py-20 px-6 text-center border-y border-amber-500/10">
      <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-6 uppercase">
        Your Reward
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/badge.png"
        alt="Graduation Badge NFT"
        className="mx-auto mb-6 w-44 h-44 object-contain rounded-2xl"
      />
      <h2 className="text-2xl font-black text-white mb-3">
        Graduate of Pirate Academy
      </h2>
      <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
        Complete both islands. Mint your graduation NFT on Solana devnet — your
        proof of work, on-chain forever.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Update app/layout.tsx metadata**

In `app/layout.tsx`, replace the `metadata` export:

```tsx
export const metadata: Metadata = {
  title: "Pirate Academy · Learn Solana",
  description: "Write real Rust. Deploy real Anchor programs. Mint your proof on Solana devnet.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};
```

- [ ] **Step 3: Full build**

```bash
cd /home/alex/claude/course && pnpm build 2>&1 | tail -15
```

Expected: `✓ Compiled successfully`, same number of static pages as before (21+), no errors.

- [ ] **Step 4: Start dev server and verify visually**

```bash
cd /home/alex/claude/course && pnpm dev
```

Open `http://localhost:3000` and verify:
- Dark background (`#060d1a`)
- `hero.png` faintly visible behind hero text
- Title "Pirate Academy" with gradient
- "Begin the Voyage →" amber pulsing button
- Scroll down → `badge.png` in reward section
- Scroll down → Island cards appear with stagger animation
- Anchor Harbor card is greyed out with lock message
- 3 coming-soon cards below

- [ ] **Step 5: Test returning-user state in browser**

Open DevTools → Console, run:
```js
localStorage.setItem("pirate-progress", JSON.stringify(["crab-forge-1","crab-forge-2"]))
```
Reload. Verify:
- CTA changes to "Continue Voyage →" (blue)
- Below CTA: "↳ Make It Public · Crab Forge" (lesson 3)

- [ ] **Step 6: Test unlock animation**

In DevTools Console:
```js
localStorage.setItem("pirate-progress", JSON.stringify(["crab-forge-1","crab-forge-2","crab-forge-3","crab-forge-4","crab-forge-5","crab-forge-6","crab-forge-7"]))
```
Reload. Verify:
- Anchor Harbor card is fully coloured (blue glow)
- Lock badge gone, progress bar shows `0 / 5`

- [ ] **Step 7: Commit**

```bash
cd /home/alex/claude/course && git add app/page.tsx app/layout.tsx && git commit -m "feat: rewrite home page — hero + reward + island map (Day 11)"
```

---

### Task 5: Final cleanup

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: Mark Day 11 complete in PROGRESS.md**

Add to `PROGRESS.md` after the Days 9–10 block:

```markdown
## ✅ Day 11 — Landing + Map + Progress Gating
- [x] `framer-motion` installed
- [x] `isIslandComplete()` + `nextLesson()` added to `progress.ts`
- [x] `IslandMap.tsx` — stagger entry animation, level-select cards, Anchor Harbor locked until Crab Forge complete
- [x] `HeroSection.tsx` — hero.png bg, CTA, returning-user "Continue Voyage", Captain [crew_name] when wallet+profile
- [x] `app/page.tsx` rewritten — server component: HeroSection + RewardSection (badge.png) + IslandMap
- [x] `pnpm build` green, 21 static pages
- **Note:** `animate-pulse` on Tailwind v4 works out of the box; framer-motion `AnimatePresence mode="wait"` handles lock→progress transition
```

- [ ] **Step 2: Commit**

```bash
cd /home/alex/claude/course && git add PROGRESS.md && git commit -m "chore: mark Day 11 complete in PROGRESS.md"
```
