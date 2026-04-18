"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CodeExercise } from "@/components/lessons/CodeExercise";
import { FinalLesson } from "@/components/lessons/FinalLesson";
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
      {meta.isMint ? (
        <FinalLesson lessonId={meta.lessonId} />
      ) : (
        <CodeExercise
          lessonId={meta.lessonId}
          initialCode={meta.initialCode}
          onPass={handlePass}
        />
      )}

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
