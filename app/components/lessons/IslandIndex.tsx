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
          <span className="text-sm font-bold text-amber-500">
            🏴‍☠️ Island cleared!
          </span>
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
          complete ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground"
        }`}
      >
        {complete ? "✓" : number}
      </div>
      <span className="font-medium">{title}</span>
      {complete && (
        <span className="ml-auto text-xs font-semibold text-amber-500">
          Done
        </span>
      )}
    </Link>
  );
}
