import { notFound } from "next/navigation";
import { ISLANDS, lessonImporters } from "@/lib/lessons";
import { LessonClient } from "@/components/lessons/LessonClient";

interface Params {
  params: Promise<{ island: string; lesson: string }>;
}

export async function generateStaticParams() {
  return Object.entries(ISLANDS).flatMap(([island, data]) =>
    data.lessons.map((l) => ({ island, lesson: l.slot }))
  );
}

export async function generateMetadata({ params }: Params) {
  const { island, lesson } = await params;
  const islandData = ISLANDS[island];
  const entry = islandData?.lessons.find((l) => l.slot === lesson);
  return { title: entry ? `${entry.title} · Pirate Academy` : "Pirate Academy" };
}

export default async function LessonPage({ params }: Params) {
  const { island, lesson } = await params;
  const islandData = ISLANDS[island];
  const importer = lessonImporters[island]?.[lesson];
  if (!islandData || !importer) notFound();

  const mod = await importer();
  const { meta } = mod;
  const MDXContent = mod.default;

  const lessonIndex = islandData.lessons.findIndex((l) => l.slot === lesson);
  const prevLesson = islandData.lessons[lessonIndex - 1] ?? null;
  const nextLesson = islandData.lessons[lessonIndex + 1] ?? null;

  return (
    <div className="relative min-h-screen" style={{ background: "#060d1a" }}>
      {island === "crab-forge" && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/art/crab_island.png')", opacity: 0.13 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,13,26,0.2) 0%, rgba(6,13,26,0.7) 60%, #060d1a 100%)" }} />
        </>
      )}
      {island === "anchor-harbor" && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/art/anchor-island.png')", opacity: 0.13 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,13,26,0.2) 0%, rgba(6,13,26,0.7) 60%, #060d1a 100%)" }} />
        </>
      )}
    <div className="relative z-10 mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 overflow-hidden rounded-2xl border border-amber-500/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/art/${island}.png`}
          alt={islandData.title}
          className="w-full object-cover"
          style={{ maxHeight: "200px", objectPosition: "center 30%" }}
        />
      </div>

      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <a
          href={`/island/${island}`}
          className="transition-colors hover:text-foreground"
        >
          {islandData.emoji} {islandData.title}
        </a>
        <span>·</span>
        <span>
          Lesson {lessonIndex + 1} of {islandData.lessons.length}
        </span>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{
            width: `${((lessonIndex + 1) / islandData.lessons.length) * 100}%`,
          }}
        />
      </div>

      <h1 className="mb-8 text-3xl font-black tracking-tight">{meta.title}</h1>

      <div className="prose prose-invert mb-8 max-w-none">
        <MDXContent />
      </div>

      <LessonClient
        meta={meta}
        islandSlug={island}
        lessonNumber={lessonIndex + 1}
        totalLessons={islandData.lessons.length}
        prevSlot={prevLesson?.slot ?? null}
        nextSlot={nextLesson?.slot ?? null}
      />
    </div>
    </div>
  );
}
