"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ISLANDS } from "@/lib/lessons";
import { completedCount, isIslandComplete } from "@/lib/progress";

const COMING_SOON = [
  { slug: "docker-depths", emoji: "🐳", title: "Docker Depths" },
  { slug: "sol-summit", emoji: "☀️", title: "Sol Summit" },
  { slug: "jito-ghost", emoji: "🤫", title: "Jito Ghost Ship" },
];

const ISLAND_META: Record<string, {
  image: string;
  color: "amber" | "sky";
  label: string;
  why: string;
}> = {
  "crab-forge": {
    image: "/art/crab-forge.png",
    color: "amber",
    label: "ISLAND 1 · RUST",
    why: "Rust is the language every Solana program is written in",
  },
  "anchor-harbor": {
    image: "/art/anchor-harbor.png",
    color: "sky",
    label: "ISLAND 2 · ANCHOR",
    why: "Anchor is the framework every Solana developer uses",
  },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function IslandMap() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [crabComplete, setCrabComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p: Record<string, number> = {};
    for (const [slug, island] of Object.entries(ISLANDS)) {
      p[slug] = completedCount(island.lessons.map((l) => l.lessonId));
    }
    setProgress(p);
    setCrabComplete(isIslandComplete("crab-forge"));
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section id="islands" className="py-20 px-6 max-w-3xl mx-auto">
        <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-2 uppercase">
          Archipelago
        </p>
        <h2 className="text-3xl font-black text-white mb-12">Choose your island</h2>
        <div className="flex flex-col gap-4 mb-8">
          <div className="animate-pulse rounded-2xl h-28 bg-white/5" />
          <div className="animate-pulse rounded-2xl h-28 bg-white/5" />
        </div>
      </section>
    );
  }

  const anchorLocked = !crabComplete;

  return (
    <section id="islands" className="relative py-20 px-6 overflow-hidden">
      {/* Pirate map background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/art/map.png')", opacity: 0.07 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, #060d1a 0%, transparent 20%, transparent 80%, #060d1a 100%)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
      <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-2 uppercase">
        Archipelago
      </p>
      <h2 className="text-3xl font-black text-white mb-12">Choose your island</h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 mb-8"
      >
        <motion.div variants={cardVariant}>
          <IslandCard
            slug="crab-forge"
            locked={false}
            done={progress["crab-forge"] ?? 0}
            total={ISLANDS["crab-forge"].lessons.length}
          />
        </motion.div>

        <motion.div variants={cardVariant} layout>
          <IslandCard
            slug="anchor-harbor"
            locked={anchorLocked}
            done={progress["anchor-harbor"] ?? 0}
            total={ISLANDS["anchor-harbor"].lessons.length}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {COMING_SOON.map(({ slug, emoji, title }) => (
          <div
            key={slug}
            className="border border-dashed border-white/[0.06] rounded-xl p-5 text-center opacity-40"
          >
            <div className="text-2xl mb-2">{emoji}</div>
            <p className="text-xs font-bold text-slate-500">{title}</p>
            <p className="text-[10px] text-slate-700 mt-1">Coming soon</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

function IslandCard({
  slug,
  locked,
  done,
  total,
}: {
  slug: string;
  locked: boolean;
  done: number;
  total: number;
}) {
  const island = ISLANDS[slug];
  const meta = ISLAND_META[slug];
  const pct = total > 0 ? (done / total) * 100 : 0;
  const firstLesson = island.lessons[0];
  const isAmber = meta.color === "amber";

  const inner = (
    <div
      className={[
        "relative flex overflow-hidden rounded-2xl border h-28 transition-all duration-300",
        locked
          ? "border-white/[0.05] bg-[#0a0f18] cursor-not-allowed opacity-55 grayscale-[0.4]"
          : isAmber
          ? "border-amber-500/20 bg-gradient-to-r from-[#0f1e2e] to-[#0a1628] shadow-[0_0_30px_rgba(245,158,11,0.08)] hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:-translate-y-0.5"
          : "border-sky-500/20 bg-gradient-to-r from-[#0a1a2e] to-[#060d1a] shadow-[0_0_30px_rgba(56,189,248,0.08)] hover:shadow-[0_0_40px_rgba(56,189,248,0.15)] hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div
        className="w-32 flex-shrink-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${meta.image}')`,
          maskImage:
            "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
        }}
      />

      <div className="flex flex-1 items-center justify-between px-6">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold tracking-[2px] mb-1 ${
              locked ? "text-slate-600" : isAmber ? "text-amber-500" : "text-sky-400"
            }`}
          >
            {meta.label}
          </p>
          <p className="text-lg font-black text-white mb-1">
            {island.emoji} {island.title}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{meta.why}</p>
        </div>

        <div className="flex-shrink-0 ml-4 text-right">
          <AnimatePresence mode="wait">
            {locked ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-slate-500 font-semibold whitespace-nowrap"
              >
                🔒 Clear Island 1 first
              </motion.div>
            ) : (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-1 bg-white/10 rounded-full mb-1.5 ml-auto">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAmber ? "bg-amber-500" : "bg-sky-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {done} / {total}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  if (locked) return inner;
  return (
    <Link href={`/island/${slug}/${firstLesson.slot}`}>{inner}</Link>
  );
}
