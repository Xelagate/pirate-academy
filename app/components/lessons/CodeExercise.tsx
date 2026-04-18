"use client";

import dynamic from "next/dynamic";

export const CodeExercise = dynamic(
  () =>
    import("./CodeExerciseInner").then((m) => ({ default: m.CodeExerciseInner })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);
