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

  const bgImage = island === "crab-forge" ? "crab_island.png" : "anchor-island.png";

  return (
    <div className="relative min-h-screen" style={{ background: "#060d1a" }}>
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/art/${bgImage}')`, opacity: 0.13 }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,13,26,0.2) 0%, rgba(6,13,26,0.7) 60%, #060d1a 100%)" }} />

      {/* Nav */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-5 border-b border-amber-500/10 bg-[#060d1a]/60 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm font-medium group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Back to map
        </Link>
        <span className="text-amber-500 font-black text-sm tracking-[3px] uppercase">
          ⚓ Pirate Academy
        </span>
      </nav>

      {/* Island hero banner */}
      <div className="relative z-10 w-full overflow-hidden" style={{ maxHeight: "260px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/art/${island}.png`}
          alt={islandData.title}
          className="w-full object-cover"
          style={{ maxHeight: "260px", objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #060d1a 100%)" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 pb-12 -mt-6">
        <div className="mb-8">
          <p className="mb-2 text-4xl">{islandData.emoji}</p>
          <h1 className="mb-2 text-3xl font-black tracking-tight">
            {islandData.title}
          </h1>
          <p className="text-muted-foreground">{islandData.description}</p>
        </div>

        <IslandIndex islandSlug={island} islandData={islandData} />
      </div>
    </div>
  );
}
