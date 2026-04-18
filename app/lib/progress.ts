import { ISLANDS } from "./lessons";

const KEY = "pirate-progress";
const ISLAND_ORDER = Object.keys(ISLANDS);

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
