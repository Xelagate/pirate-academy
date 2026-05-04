# AI Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI onboarding modal to the homepage — AI asks 5 questions, assesses the student's level, and recommends a personalized starting point in the course.

**Architecture:** User visits homepage → if no onboarding data in localStorage → modal opens automatically → chat with AI (5 Q&A turns) → AI returns a structured recommendation → recommendation saved to localStorage → CTA button on homepage updated to point to recommended island/lesson.

**Tech Stack:** Next.js 16 App Router, `groq-sdk`, TypeScript, Tailwind CSS, localStorage.

> **AI Provider note:** Currently using Groq (`llama-3.1-8b-instant`) — free tier, fast, sufficient for onboarding Q&A. After the hackathon, migrate to Claude (`claude-haiku-4-5-20251001`) or Codex depending on which model offers the best quality/cost ratio at the time. The API route is isolated in `app/api/onboarding/route.ts` — swapping providers requires changing only that file and the env var.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/api/onboarding/route.ts` | POST endpoint — calls Groq, returns text response |
| Create | `app/lib/onboarding.ts` | localStorage read/write + recommendation parser |
| Create | `app/components/onboarding/OnboardingModal.tsx` | Chat UI modal — 5 questions flow |
| Modify | `app/page.tsx` | Mount modal for first-time visitors |
| Modify | `app/components/HeroSection.tsx` | Use onboarding result to personalize CTA |
| Create | `.env.local` | `GROQ_API_KEY=` (empty, user fills in) |

---

## Task 1: Install Groq SDK

**Files:**
- Modify: `package.json`
- Create: `.env.local`

- [ ] **Step 1: Install SDK**

```bash
cd /home/alex/claude/projects/solana/course && pnpm add groq-sdk
```

Expected output: `+ groq-sdk` added to dependencies.

- [ ] **Step 2: Create .env.local**

Create file `/home/alex/claude/projects/solana/course/.env.local`:
```
GROQ_API_KEY=
```

> User must fill in their Groq API key from console.groq.com before running the app.

- [ ] **Step 3: Verify .env.local is gitignored**

```bash
grep -q ".env.local" /home/alex/claude/projects/solana/course/.gitignore && echo "OK" || echo "ADD IT"
```

If output is `ADD IT`, run:
```bash
echo ".env.local" >> /home/alex/claude/projects/solana/course/.gitignore
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "feat: add groq-sdk dependency for AI onboarding"
```

---

## Task 2: Onboarding state helpers + recommendation parser

**Files:**
- Create: `app/lib/onboarding.ts`

- [ ] **Step 1: Create `app/lib/onboarding.ts`**

```ts
const KEY = "pirate-onboarding";

export interface OnboardingResult {
  startIsland: string;
  startLesson: string;
  level: "beginner" | "intermediate";
  message: string;
  completedAt: number;
}

export function getOnboardingResult(): OnboardingResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OnboardingResult) : null;
  } catch {
    return null;
  }
}

export function saveOnboardingResult(result: OnboardingResult): void {
  localStorage.setItem(KEY, JSON.stringify(result));
}

export function clearOnboarding(): void {
  localStorage.removeItem(KEY);
}

export function parseRecommendation(text: string): OnboardingResult | null {
  const match = text.match(/RECOMMENDATION:(\{[\s\S]*\})/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]) as {
      startIsland: string;
      startLesson: string;
      level: "beginner" | "intermediate";
      message: string;
    };
    return { ...parsed, completedAt: Date.now() };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/onboarding.ts
git commit -m "feat: add onboarding localStorage helpers + recommendation parser"
```

---

## Task 3: API route — onboarding chat

**Files:**
- Create: `app/api/onboarding/route.ts`

- [ ] **Step 1: Create `app/api/onboarding/route.ts`**

```ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

// AI Provider: Groq (llama-3.1-8b-instant) — free tier for hackathon demo.
// To migrate to Claude: replace Groq client with Anthropic client,
// change model to "claude-haiku-4-5-20251001", rename GROQ_API_KEY → ANTHROPIC_API_KEY.
// To migrate to Codex: use OpenAI client with model "codex-mini-latest".
// Only this file needs to change — the rest of the app is provider-agnostic.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a friendly guide for Pirate Academy — an interactive Solana developer course.
Your job: ask the student exactly 5 questions to assess their level, one at a time.
After receiving the answer to the 5th question, output ONLY the recommendation JSON on a new line starting with "RECOMMENDATION:" followed by the JSON — no other text after it.

Ask these questions one at a time (adapt phrasing to match the user's language — Russian, Ukrainian, or English):
1. Have you written code before? If yes, which language(s)?
2. Have you worked with Rust or any systems programming language (C, C++, Go)?
3. What is your familiarity with blockchain? (never heard of it / know the concept / used wallets / built something)
4. What is your goal? (get a job in Web3 / build my own products / just understand how it works)
5. How many hours per week can you commit to learning?

After the 5th answer, output exactly this (replace values based on answers):
RECOMMENDATION:{"startIsland":"crab-forge","startLesson":"01","level":"beginner","message":"You will start at Island 1 — Crab Forge, where you learn Rust step by step."}

Routing rules:
- Complete beginner (no code) → startIsland: "crab-forge", startLesson: "01", level: "beginner"
- Knows JS/Python/other but not Rust → startIsland: "crab-forge", startLesson: "01", level: "beginner"
- Knows Rust basics → startIsland: "anchor-harbor", startLesson: "01", level: "intermediate"
- Knows Rust + used blockchain tools → startIsland: "anchor-harbor", startLesson: "01", level: "intermediate"

Available islands: "crab-forge" (7 lessons: 01-07), "anchor-harbor" (5 lessons: 01-05).
Keep responses short (2-4 sentences max). Use a light pirate theme. Always respond in the language the user writes in.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Message[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 500,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
  });

  const text = response.choices[0]?.message?.content ?? "";

  return NextResponse.json({ text });
}
```

- [ ] **Step 2: Verify the API key is set**

```bash
grep "GROQ_API_KEY" /home/alex/claude/projects/solana/course/.env.local
```

Expected: `GROQ_API_KEY=gsk_...` (non-empty value).

> If empty — ask the user to fill in `.env.local` with their key from console.groq.com before proceeding.

- [ ] **Step 3: Commit**

```bash
git add app/api/onboarding/route.ts
git commit -m "feat: add AI onboarding API route (Groq llama-3.1-8b-instant)"
```

---

## Task 4: OnboardingModal component

**Files:**
- Create: `app/components/onboarding/OnboardingModal.tsx`

- [ ] **Step 1: Create `app/components/onboarding/OnboardingModal.tsx`**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { saveOnboardingResult, parseRecommendation, type OnboardingResult } from "@/lib/onboarding";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  onComplete: (result: OnboardingResult) => void;
  onSkip: () => void;
}

export function OnboardingModal({ onComplete, onSkip }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<OnboardingResult | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void sendMessage(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(userText: string | null) {
    const next: Message[] = userText
      ? [...messages, { role: "user" as const, content: userText }]
      : messages;

    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { text: string };
      const assistantText: string = data.text ?? "";

      const rec = parseRecommendation(assistantText);
      const displayText = rec
        ? assistantText.replace(/RECOMMENDATION:\{[\s\S]*\}/, "").trim()
        : assistantText;

      setMessages([...next, { role: "assistant", content: displayText }]);

      if (rec) {
        saveOnboardingResult(rec);
        setRecommendation(rec);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || recommendation) return;
    void sendMessage(input.trim());
  }

  function handleStart() {
    if (recommendation) onComplete(recommendation);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#0d1829] border border-amber-500/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/10">
          <span className="text-amber-500 font-black text-sm tracking-[3px] uppercase">
            ⚓ Chart Your Course
          </span>
          <button
            onClick={onSkip}
            className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
          >
            Skip →
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[280px] max-h-[380px]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-amber-500 text-black font-medium"
                    : "bg-slate-800 text-slate-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-xl px-4 py-2 text-sm text-slate-500 animate-pulse">
                thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {recommendation && (
          <div className="px-5 py-4 border-t border-amber-500/10 bg-amber-500/5">
            <p className="text-xs text-amber-400 mb-3">{recommendation.message}</p>
            <button
              onClick={handleStart}
              className="w-full bg-amber-500 text-black font-black py-3 rounded-xl hover:bg-amber-400 transition-colors"
            >
              Begin the Voyage →
            </button>
          </div>
        )}

        {!recommendation && (
          <form
            onSubmit={handleSubmit}
            className="px-5 py-4 border-t border-amber-500/10 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Your answer..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-40"
            >
              →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/onboarding/OnboardingModal.tsx
git commit -m "feat: add OnboardingModal chat component"
```

---

## Task 5: Wire modal into homepage + personalize HeroSection CTA

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/components/HeroSection.tsx`

- [ ] **Step 1: Update `app/page.tsx`**

Replace the entire file content:

```tsx
"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { IslandMap } from "@/components/IslandMap";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { getOnboardingResult, type OnboardingResult } from "@/lib/onboarding";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    const result = getOnboardingResult();
    if (result) {
      setOnboardingResult(result);
    } else {
      setShowOnboarding(true);
    }
  }, []);

  function handleOnboardingComplete(result: OnboardingResult) {
    setOnboardingResult(result);
    setShowOnboarding(false);
    router.push(`/island/${result.startIsland}/${result.startLesson}`);
  }

  function handleOnboardingSkip() {
    setShowOnboarding(false);
  }

  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      <HeroSection onboardingResult={onboardingResult} />
      <RewardSection />
      <ErrorBoundary
        fallback={
          <section id="islands" className="py-20 px-6 max-w-3xl mx-auto">
            <ErrorFallback message="Не удалось загрузить карту — обнови страницу" />
          </section>
        }
      >
        <IslandMap />
      </ErrorBoundary>
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

- [ ] **Step 2: Update `app/components/HeroSection.tsx`**

Add import at the top of the file (after existing imports):

```tsx
import type { OnboardingResult } from "@/lib/onboarding";
```

Replace the function signature:

```tsx
export function HeroSection() {
```

With:

```tsx
interface HeroProps {
  onboardingResult?: OnboardingResult | null;
}

export function HeroSection({ onboardingResult }: HeroProps) {
```

Replace the CTA logic:

```tsx
  const hasStarted = mounted && totalDone > 0;
  const ctaHref = hasStarted
    ? next
      ? `/island/${next.island}/${next.slot}`
      : "/badge"
    : "#islands";
  const ctaLabel = hasStarted ? "Continue Voyage →" : "Begin the Voyage →";
  const isReturning = hasStarted;
```

With:

```tsx
  const hasStarted = mounted && totalDone > 0;
  const recommended = onboardingResult && !hasStarted
    ? `/island/${onboardingResult.startIsland}/${onboardingResult.startLesson}`
    : null;
  const ctaHref = hasStarted
    ? next ? `/island/${next.island}/${next.slot}` : "/badge"
    : recommended ?? "#islands";
  const ctaLabel = hasStarted ? "Continue Voyage →" : "Begin the Voyage →";
  const isReturning = hasStarted;
```

- [ ] **Step 3: Start dev server and verify**

```bash
cd /home/alex/claude/projects/solana/course && pnpm dev
```

Open `http://localhost:3000`. Expected:
- Onboarding modal appears automatically for first-time visitor
- AI asks first question in pirate style
- User types answer → next question appears
- After 5 questions → recommendation with "Begin the Voyage →" button
- Clicking navigates to the recommended island/lesson
- Refreshing — modal does NOT appear again
- Clearing localStorage and refreshing — modal appears again

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/components/HeroSection.tsx
git commit -m "feat: wire AI onboarding modal into homepage with personalized CTA"
```

---

## Self-Review

**Spec coverage:**
- ✅ AI onboarding modal opens for first-time visitors
- ✅ AI asks 5 questions one at a time
- ✅ Recommendation based on level (beginner → crab-forge/01, intermediate → anchor-harbor/01)
- ✅ Result saved to localStorage — modal doesn't re-appear
- ✅ Homepage CTA updated to point to recommended start
- ✅ Skip option for users who don't want onboarding
- ✅ Provider swap documented — only `route.ts` needs to change

**Not in scope (Plan 2):**
- AI tutor inside lesson pages
- Company portal / B2B
- Streaming responses
