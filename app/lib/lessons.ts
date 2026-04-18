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
