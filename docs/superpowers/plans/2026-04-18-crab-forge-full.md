# Crab Forge — Full Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Island 1 "Crab Forge" — 7 Rust lessons with dynamic routing, lesson index page, and localStorage progress tracking.

**Architecture:** Static import map in `lib/lessons.ts` satisfies Next.js bundler constraints; server components load MDX + pass serialized meta to a client `LessonClient` component that owns CodeExercise, progress, and Prev/Next nav. Island index page reads progress client-side via `useEffect`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui (Card, Button), `@monaco-editor/react` (already installed), `@next/mdx` (already configured), localStorage.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/lib/lessons.ts` | Static import map + island metadata |
| Create | `app/lib/progress.ts` | localStorage read/write helpers |
| Create | `app/content/lessons/crab-forge/02-doubloons.mdx` | Lesson 2 content |
| Create | `app/content/lessons/crab-forge/03-visibility.mdx` | Lesson 3 content |
| Create | `app/content/lessons/crab-forge/04-crew.mdx` | Lesson 4 content |
| Create | `app/content/lessons/crab-forge/05-methods.mdx` | Lesson 5 content |
| Create | `app/content/lessons/crab-forge/06-account.mdx` | Lesson 6 content |
| Create | `app/content/lessons/crab-forge/07-bumps.mdx` | Lesson 7 content |
| Create | `app/components/lessons/LessonClient.tsx` | Client: CodeExercise + progress + nav |
| Create | `app/island/[island]/[lesson]/page.tsx` | Server: dynamic lesson page |
| Create | `app/island/[island]/page.tsx` | Island index with progress cards |

---

## Task 1: Data layer — lessons metadata + import map

**Files:**
- Create: `app/lib/lessons.ts`

- [ ] **Step 1: Create `app/lib/lessons.ts`**

```ts
export interface LessonMeta {
  title: string;
  lessonId: string;
  initialCode: string;
}

export interface LessonEntry {
  slot: string;
  title: string;
  lessonId: string;
}

export interface IslandData {
  title: string;
  emoji: string;
  description: string;
  lessons: LessonEntry[];
}

export const ISLANDS: Record<string, IslandData> = {
  "crab-forge": {
    title: "Crab Forge",
    emoji: "🦀",
    description: "Master Rust fundamentals — structs, types, visibility, collections, methods, and Anchor account attributes.",
    lessons: [
      { slot: "01", title: "Name Your Pirate",      lessonId: "crab-forge-1" },
      { slot: "02", title: "Count the Doubloons",   lessonId: "crab-forge-2" },
      { slot: "03", title: "Make It Public",         lessonId: "crab-forge-3" },
      { slot: "04", title: "Assemble Your Crew",     lessonId: "crab-forge-4" },
      { slot: "05", title: "Teach a Trick",          lessonId: "crab-forge-5" },
      { slot: "06", title: "Mark It On-Chain",       lessonId: "crab-forge-6" },
      { slot: "07", title: "Claim Your Bump",        lessonId: "crab-forge-7" },
    ],
  },
};

// Static strings required by Next.js/webpack bundler — no dynamic paths allowed.
export const lessonImporters: Record<
  string,
  Record<string, () => Promise<{ meta: LessonMeta; default: React.ComponentType }>>
> = {
  "crab-forge": {
    "01": () => import("@/content/lessons/crab-forge/01-name.mdx") as never,
    "02": () => import("@/content/lessons/crab-forge/02-doubloons.mdx") as never,
    "03": () => import("@/content/lessons/crab-forge/03-visibility.mdx") as never,
    "04": () => import("@/content/lessons/crab-forge/04-crew.mdx") as never,
    "05": () => import("@/content/lessons/crab-forge/05-methods.mdx") as never,
    "06": () => import("@/content/lessons/crab-forge/06-account.mdx") as never,
    "07": () => import("@/content/lessons/crab-forge/07-bumps.mdx") as never,
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/lessons.ts
git commit -m "feat: add lesson metadata + static import map"
```

---

## Task 2: Progress helpers

**Files:**
- Create: `app/lib/progress.ts`

- [ ] **Step 1: Create `app/lib/progress.ts`**

```ts
const KEY = "pirate-progress";

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
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/progress.ts
git commit -m "feat: localStorage progress helpers"
```

---

## Task 3: MDX lessons 02–07

**Files:**
- Create: `app/content/lessons/crab-forge/02-doubloons.mdx`
- Create: `app/content/lessons/crab-forge/03-visibility.mdx`
- Create: `app/content/lessons/crab-forge/04-crew.mdx`
- Create: `app/content/lessons/crab-forge/05-methods.mdx`
- Create: `app/content/lessons/crab-forge/06-account.mdx`
- Create: `app/content/lessons/crab-forge/07-bumps.mdx`

- [ ] **Step 1: Create `02-doubloons.mdx`**

```mdx
export const meta = {
  title: "Count the Doubloons",
  lessonId: "crab-forge-2",
  initialCode: `struct Treasure {\n    doubloons: ___,\n}`,
};

## Lesson 2 — Unsigned Integers

Every pirate counts their gold. Rust has fixed-size integer types — you pick the size and whether negative numbers are allowed.

```rust
struct Treasure {
    doubloons: u64,
}
```

`u64` is an **unsigned 64-bit integer** — it holds 0 to 18,446,744,073,709,551,615. Enough for any treasure haul.

> **In Solana terms:** lamports are stored as `u64`. One SOL = 1,000,000,000 lamports.

Fill in the blank: what type should `doubloons` be?
```

- [ ] **Step 2: Create `03-visibility.mdx`**

```mdx
export const meta = {
  title: "Make It Public",
  lessonId: "crab-forge-3",
  initialCode: `struct Chest {\n    gold: u64,\n    map: String,\n}`,
};

## Lesson 3 — Visibility

By default, everything in Rust is **private** — other modules can't see it. Add `pub` to make items public.

```rust
pub struct Chest {
    pub gold: u64,
    pub map: String,
}
```

You need `pub` on the **struct itself** and on **each field** you want to expose. That's three `pub` keywords here.

> **In Solana terms:** Anchor account structs and their fields must be `pub` so the program and clients can read and write them.

Add `pub` in the right places — the checker counts at least 3.
```

- [ ] **Step 3: Create `04-crew.mdx`**

```mdx
export const meta = {
  title: "Assemble Your Crew",
  lessonId: "crab-forge-4",
  initialCode: `struct Ship {\n    pirates: ___,\n}`,
};

## Lesson 4 — Vec Collections

A ship needs a crew. Rust's `Vec<T>` is a growable, heap-allocated list of items of type `T`.

```rust
struct Ship {
    pirates: Vec<Pirate>,
}
```

`Vec<Pirate>` means "a list of Pirate values". You can push, pop, and iterate over it.

> **In Solana terms:** on-chain accounts use fixed-size arrays (`[T; N]`) instead of `Vec` to keep account size predictable. But `Vec` is everywhere in off-chain code and instruction arguments.

Fill in the blank: use `Vec<Pirate>` for the crew.
```

- [ ] **Step 4: Create `05-methods.mdx`**

```mdx
export const meta = {
  title: "Teach a Trick",
  lessonId: "crab-forge-5",
  initialCode: `impl Pirate {\n    pub fn hoist(___) -> String {\n        String::from("Arrr!")\n    }\n}`,
};

## Lesson 5 — Methods

An `impl` block attaches methods to a type. The first parameter tells Rust how the method relates to the instance.

```rust
impl Pirate {
    pub fn hoist(&self) -> String {
        String::from("Arrr!")
    }
}
```

`&self` **borrows** the instance — the pirate isn't moved or consumed. Use `&mut self` when you need to modify it, and no `self` at all for associated functions (like constructors).

> **In Solana terms:** Anchor instruction handlers are effectively `impl` methods on a context struct.

Fill in the blank: add `&self` as the first parameter.
```

- [ ] **Step 5: Create `06-account.mdx`**

```mdx
export const meta = {
  title: "Mark It On-Chain",
  lessonId: "crab-forge-6",
  initialCode: `___\npub struct PirateProfile {\n    pub authority: Pubkey,\n    pub crew_name: String,\n}`,
};

## Lesson 6 — The #[account] Attribute

Anchor needs to know which structs live in Solana accounts. The `#[account]` attribute macro marks them.

```rust
#[account]
pub struct PirateProfile {
    pub authority: Pubkey,
    pub crew_name: String,
}
```

Under the hood `#[account]` derives `AnchorSerialize`, `AnchorDeserialize`, and adds an 8-byte discriminator — a fingerprint Anchor uses to verify it's reading the right account type.

> **In Solana terms:** every account your program owns needs `#[account]` on its state struct.

Fill in the blank: add the `#[account]` attribute above the struct.
```

- [ ] **Step 6: Create `07-bumps.mdx`**

```mdx
export const meta = {
  title: "Claim Your Bump",
  lessonId: "crab-forge-7",
  initialCode: `#[account]\n#[derive(_______)]\npub struct PirateProfile {\n    pub authority: Pubkey,\n    #[max_len(24)]\n    pub crew_name: String,\n    pub bump: ___,\n}`,
};

## Lesson 7 — InitSpace & the Bump Seed

Two final pieces complete a real Anchor account struct.

```rust
#[account]
#[derive(InitSpace)]
pub struct PirateProfile {
    pub authority: Pubkey,
    #[max_len(24)]
    pub crew_name: String,
    pub bump: u8,
}
```

**`InitSpace`** calculates the account's byte size at compile time — no manual `8 + 32 + 4 + 24 + 1` arithmetic.

**`bump: u8`** stores the canonical bump seed (0–255) for this PDA. Saving it avoids re-deriving the bump on every instruction call.

> **In Solana terms:** this is the exact struct from the `pirate-academy` program deployed on devnet. You've just learned how it was built.

Fill in the blank: add `InitSpace` to `#[derive(...)]` and use `u8` for the bump field.
```

- [ ] **Step 7: Verify MDX files exist**

```bash
ls app/content/lessons/crab-forge/
```
Expected: `01-name.mdx  02-doubloons.mdx  03-visibility.mdx  04-crew.mdx  05-methods.mdx  06-account.mdx  07-bumps.mdx`

- [ ] **Step 8: Commit**

```bash
git add app/content/lessons/crab-forge/
git commit -m "feat: add Crab Forge lessons 2-7 MDX content"
```

---

## Task 4: LessonClient — interactive shell (client component)

**Files:**
- Create: `app/components/lessons/LessonClient.tsx`

- [ ] **Step 1: Create `app/components/lessons/LessonClient.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CodeExercise } from "@/components/lessons/CodeExercise";
import { markComplete, isComplete } from "@/lib/progress";
import type { LessonMeta } from "@/lib/lessons";

interface Props {
  meta: LessonMeta;
  islandSlug: string;
  lessonNumber: number;
  totalLessons: number;
  prevSlot: string | null;
  nextSlot: string | null;
}

export function LessonClient({
  meta,
  islandSlug,
  lessonNumber,
  totalLessons,
  prevSlot,
  nextSlot,
}: Props) {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    setPassed(isComplete(meta.lessonId));
  }, [meta.lessonId]);

  function handlePass() {
    markComplete(meta.lessonId);
    setPassed(true);
  }

  const isLast = lessonNumber === totalLessons;

  return (
    <div className="flex flex-col gap-6">
      <CodeExercise
        lessonId={meta.lessonId}
        initialCode={meta.initialCode}
        onPass={handlePass}
      />

      <div className="flex items-center justify-between border-t border-border pt-4">
        {prevSlot ? (
          <Link
            href={`/island/${islandSlug}/${prevSlot}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            ← Previous
          </Link>
        ) : (
          <Link
            href={`/island/${islandSlug}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            ← Island Map
          </Link>
        )}

        {isLast ? (
          passed ? (
            <Link
              href={`/island/${islandSlug}`}
              className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              🏴‍☠️ Complete Island!
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">
              Pass the exercise to complete the island
            </span>
          )
        ) : nextSlot ? (
          <Link
            href={`/island/${islandSlug}/${nextSlot}`}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90 ${
              passed
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            Next →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/lessons/LessonClient.tsx
git commit -m "feat: LessonClient with progress tracking and Prev/Next nav"
```

---

## Task 5: Dynamic lesson page

**Files:**
- Create: `app/island/[island]/[lesson]/page.tsx`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p app/island/\[island\]/\[lesson\]
```

- [ ] **Step 2: Create `app/island/[island]/[lesson]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { ISLANDS, lessonImporters } from "@/lib/lessons";
import { LessonClient } from "@/components/lessons/LessonClient";

interface Params {
  params: Promise<{ island: string; lesson: string }>;
}

export async function generateStaticParams() {
  return Object.entries(ISLANDS).flatMap(([island, data]) =>
    data.lessons.map((l) => ({ island, lesson: l.slot }))
  );
}

export async function generateMetadata({ params }: Params) {
  const { island, lesson } = await params;
  const islandData = ISLANDS[island];
  const entry = islandData?.lessons.find((l) => l.slot === lesson);
  return { title: entry ? `${entry.title} · Pirate Academy` : "Pirate Academy" };
}

export default async function LessonPage({ params }: Params) {
  const { island, lesson } = await params;
  const islandData = ISLANDS[island];
  const importer = lessonImporters[island]?.[lesson];
  if (!islandData || !importer) notFound();

  const mod = await importer();
  const { meta } = mod;
  const MDXContent = mod.default;

  const lessonIndex = islandData.lessons.findIndex((l) => l.slot === lesson);
  const prevLesson = islandData.lessons[lessonIndex - 1] ?? null;
  const nextLesson = islandData.lessons[lessonIndex + 1] ?? null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <a href={`/island/${island}`} className="hover:text-foreground transition-colors">
          {islandData.emoji} {islandData.title}
        </a>
        <span>·</span>
        <span>
          Lesson {lessonIndex + 1} of {islandData.lessons.length}
        </span>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${((lessonIndex + 1) / islandData.lessons.length) * 100}%` }}
        />
      </div>

      <h1 className="mb-8 text-3xl font-black tracking-tight">{meta.title}</h1>

      <div className="prose prose-invert mb-8 max-w-none">
        <MDXContent />
      </div>

      <LessonClient
        meta={meta}
        islandSlug={island}
        lessonNumber={lessonIndex + 1}
        totalLessons={islandData.lessons.length}
        prevSlot={prevLesson?.slot ?? null}
        nextSlot={nextLesson?.slot ?? null}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify build still compiles**

```bash
cd /home/alex/claude/course && pnpm build 2>&1 | tail -30
```
Expected: no TypeScript errors, routes `island/[island]/[lesson]` appears in build output.

- [ ] **Step 4: Commit**

```bash
git add app/island/
git commit -m "feat: dynamic lesson page /island/[island]/[lesson]"
```

---

## Task 6: Island index page

**Files:**
- Create: `app/island/[island]/page.tsx`

- [ ] **Step 1: Create `app/island/[island]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ISLANDS } from "@/lib/lessons";
import { IslandIndex } from "@/components/lessons/IslandIndex";

interface Params {
  params: Promise<{ island: string }>;
}

export async function generateStaticParams() {
  return Object.keys(ISLANDS).map((island) => ({ island }));
}

export async function generateMetadata({ params }: Params) {
  const { island } = await params;
  const data = ISLANDS[island];
  return { title: data ? `${data.title} · Pirate Academy` : "Pirate Academy" };
}

export default async function IslandPage({ params }: Params) {
  const { island } = await params;
  const islandData = ISLANDS[island];
  if (!islandData) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to map
      </Link>
      <div className="mb-8">
        <p className="text-4xl mb-2">{islandData.emoji}</p>
        <h1 className="text-3xl font-black tracking-tight mb-2">{islandData.title}</h1>
        <p className="text-muted-foreground">{islandData.description}</p>
      </div>
      <IslandIndex islandSlug={island} islandData={islandData} />
    </div>
  );
}
```

- [ ] **Step 2: Create `app/components/lessons/IslandIndex.tsx`**

This is a client component so it can read localStorage for progress.

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { completedCount, isComplete } from "@/lib/progress";
import type { IslandData } from "@/lib/lessons";

interface Props {
  islandSlug: string;
  islandData: IslandData;
}

export function IslandIndex({ islandSlug, islandData }: Props) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    setDone(completedCount(islandData.lessons.map((l) => l.lessonId)));
  }, [islandData.lessons]);

  const total = islandData.lessons.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          {done}/{total} lessons complete
        </span>
        {done === total && (
          <span className="text-sm font-bold text-amber-500">🏴‍☠️ Island cleared!</span>
        )}
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      <div className="grid gap-3">
        {islandData.lessons.map((lesson, i) => (
          <LessonCard
            key={lesson.slot}
            slot={lesson.slot}
            title={lesson.title}
            number={i + 1}
            lessonId={lesson.lessonId}
            islandSlug={islandSlug}
          />
        ))}
      </div>
    </div>
  );
}

function LessonCard({
  slot,
  title,
  number,
  lessonId,
  islandSlug,
}: {
  slot: string;
  title: string;
  number: number;
  lessonId: string;
  islandSlug: string;
}) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setComplete(isComplete(lessonId));
  }, [lessonId]);

  return (
    <Link
      href={`/island/${islandSlug}/${slot}`}
      className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          complete
            ? "bg-amber-500 text-black"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {complete ? "✓" : number}
      </div>
      <span className="font-medium">{title}</span>
      {complete && (
        <span className="ml-auto text-xs text-amber-500 font-semibold">Done</span>
      )}
    </Link>
  );
}
```

- [ ] **Step 3: Full build check**

```bash
cd /home/alex/claude/course && pnpm build 2>&1 | tail -40
```
Expected: build succeeds, routes `island/[island]` and `island/[island]/[lesson]` in output, no type errors.

- [ ] **Step 4: Commit**

```bash
git add app/island/ app/components/lessons/IslandIndex.tsx
git commit -m "feat: island index page with progress indicators"
```

---

## Task 7: Smoke — manual dev check

**Files:** none (verification only)

- [ ] **Step 1: Start dev server and verify key routes**

```bash
cd /home/alex/claude/course && pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/island/crab-forge
```
Expected: `200`

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/island/crab-forge/01
```
Expected: `200`

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/island/crab-forge/07
```
Expected: `200`

- [ ] **Step 2: Kill dev server**

```bash
kill %1 2>/dev/null || pkill -f "next dev" || true
```

- [ ] **Step 3: Update PROGRESS.md**

Edit `/home/alex/claude/course/PROGRESS.md` — change `## ⬜ Days 7–8` to `## ✅ Days 7–8` and add bullet points:
```
## ✅ Days 7–8 — Crab Forge (7 lessons)
- [x] `app/lib/lessons.ts` — island metadata + static MDX import map
- [x] `app/lib/progress.ts` — localStorage progress helpers
- [x] MDX lessons 02–07 with pirate-themed content
- [x] `LessonClient.tsx` — CodeExercise + onPass → markComplete + Prev/Next nav
- [x] `/island/[island]/[lesson]` — dynamic lesson page with progress bar + breadcrumb
- [x] `/island/[island]` — island index with per-lesson completion cards
- **Note:** amber (#F59E0B) accent for completed state; no hard gating — soft highlight only
```

- [ ] **Step 4: Final commit**

```bash
git add PROGRESS.md
git commit -m "chore: mark Days 7-8 complete in PROGRESS.md"
```
