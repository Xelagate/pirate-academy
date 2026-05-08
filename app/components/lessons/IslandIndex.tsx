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
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all ${
        complete
          ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
          : "border-white/6 bg-white/3 hover:border-white/12 hover:bg-white/6"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black transition-all ${
          complete
            ? "bg-amber-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.5)]"
            : "border border-white/10 bg-white/5 text-slate-400 group-hover:border-amber-500/40 group-hover:text-amber-400"
        }`}
      >
        {complete ? "✓" : number}
      </div>
      <span className={`font-semibold ${complete ? "text-amber-100" : "text-slate-300"}`}>
        {title}
      </span>
      <span className="ml-auto text-slate-600 transition-all group-hover:text-slate-400">
        {complete ? <span className="text-xs font-bold text-amber-500">Done ✓</span> : "→"}
      </span>
    </Link>
  );
}
