import { notFound } from "next/navigation";
import Link from "next/link";
import { ISLANDS } from "@/lib/lessons";
import { IslandIndex } from "@/components/lessons/IslandIndex";

interface Params {
  params: Promise<{ island: string }>;
}

export async function generateStaticParams() {
  return Object.keys(ISLANDS).map((island) => ({ island }));
}

export async function generateMetadata({ params }: Params) {
  const { island } = await params;
  const data = ISLANDS[island];
  return {
    title: data ? `${data.title} · Pirate Academy` : "Pirate Academy",
  };
}

export default async function IslandPage({ params }: Params) {
  const { island } = await params;
  const islandData = ISLANDS[island];
  if (!islandData) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to map
      </Link>

      <div className="mb-8">
        <p className="mb-2 text-4xl">{islandData.emoji}</p>
        <h1 className="mb-2 text-3xl font-black tracking-tight">
          {islandData.title}
        </h1>
        <p className="text-muted-foreground">{islandData.description}</p>
      </div>

      <IslandIndex islandSlug={island} islandData={islandData} />
    </div>
  );
}
