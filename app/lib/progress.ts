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
