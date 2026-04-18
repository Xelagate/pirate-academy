import Lesson, { meta } from "@/content/lessons/crab-forge/01-name.mdx";
import { CodeExercise } from "@/components/lessons/CodeExercise";

export default function DevLessonPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Crab Forge · Lesson 1
      </p>
      <h1 className="mb-6 text-3xl font-black tracking-tight">{meta.title}</h1>

      <div className="prose prose-invert mb-8 max-w-none">
        <Lesson />
      </div>

      <CodeExercise lessonId={meta.lessonId} initialCode={meta.initialCode} />
    </div>
  );
}
