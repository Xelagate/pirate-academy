import type React from "react";

export interface LessonMeta {
  title: string;
  lessonId: string;
  initialCode: string;
  isMint?: boolean;
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

export type LessonModule = {
  meta: LessonMeta;
  default: React.ComponentType<Record<string, never>>;
};

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
  "anchor-harbor": {
    title: "Anchor Harbor",
    emoji: "⚓",
    description: "Write real Anchor programs — declare your program, define instructions, build Accounts structs, and mint your graduation badge on devnet.",
    lessons: [
      { slot: "01", title: "Hoist the Program Flag",  lessonId: "anchor-harbor-1" },
      { slot: "02", title: "Name Your Instruction",   lessonId: "anchor-harbor-2" },
      { slot: "03", title: "Guard the Accounts",      lessonId: "anchor-harbor-3" },
      { slot: "04", title: "Call from the Shore",     lessonId: "anchor-harbor-4" },
      { slot: "05", title: "Drop Anchor",             lessonId: "anchor-harbor-5" },
    ],
  },
};

// Static strings required by Next.js/webpack bundler — no dynamic paths allowed.
export const lessonImporters: Record<
  string,
  Record<string, () => Promise<LessonModule>>
> = {
  "crab-forge": {
    "01": () => import("@/content/lessons/crab-forge/01-name.mdx") as unknown as Promise<LessonModule>,
    "02": () => import("@/content/lessons/crab-forge/02-doubloons.mdx") as unknown as Promise<LessonModule>,
    "03": () => import("@/content/lessons/crab-forge/03-visibility.mdx") as unknown as Promise<LessonModule>,
    "04": () => import("@/content/lessons/crab-forge/04-crew.mdx") as unknown as Promise<LessonModule>,
    "05": () => import("@/content/lessons/crab-forge/05-methods.mdx") as unknown as Promise<LessonModule>,
    "06": () => import("@/content/lessons/crab-forge/06-account.mdx") as unknown as Promise<LessonModule>,
    "07": () => import("@/content/lessons/crab-forge/07-bumps.mdx") as unknown as Promise<LessonModule>,
  },
  "anchor-harbor": {
    "01": () => import("@/content/lessons/anchor-harbor/01-declare.mdx") as unknown as Promise<LessonModule>,
    "02": () => import("@/content/lessons/anchor-harbor/02-instruction.mdx") as unknown as Promise<LessonModule>,
    "03": () => import("@/content/lessons/anchor-harbor/03-accounts.mdx") as unknown as Promise<LessonModule>,
    "04": () => import("@/content/lessons/anchor-harbor/04-client.mdx") as unknown as Promise<LessonModule>,
    "05": () => import("@/content/lessons/anchor-harbor/05-drop-anchor.mdx") as unknown as Promise<LessonModule>,
  },
};
