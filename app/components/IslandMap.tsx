"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ISLANDS } from "@/lib/lessons";
import { completedCount, isIslandComplete } from "@/lib/progress";

// % positions on map.png (x = left, y = top)
const ISLAND_SPOTS = [
  { slug: "crab-forge",    x: 23, y: 29, color: "amber" as const, tooltipBelow: true  },
  { slug: "anchor-harbor", x: 47, y: 52, color: "sky"   as const, tooltipBelow: false },
];

const COMING_SOON_SPOTS = [
  { slug: "docker-depths", x: 20, y: 74 },
  { slug: "sol-summit",    x: 74, y: 27 },
  { slug: "jito-ghost",    x: 78, y: 67 },
];

const ACCENT: Record<"amber" | "sky", { ring: string; dot: string; text: string }> = {
  amber: { ring: "rgba(245,158,11,0.55)", dot: "#f59e0b", text: "text-amber-500" },
  sky:   { ring: "rgba(56,189,248,0.55)", dot: "#38bdf8", text: "text-sky-400"   },
};

export function IslandMap() {
  const router = useRouter();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [crabComplete, setCrabComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const p: Record<string, number> = {};
    for (const [slug, island] of Object.entries(ISLANDS)) {
      p[slug] = completedCount(island.lessons.map((l) => l.lessonId));
    }
    setProgress(p);
    setCrabComplete(isIslandComplete("crab-forge"));
    setMounted(true);
  }, []);

  function handleClick(slug: string, locked: boolean) {
    if (locked) return;
    const first = ISLANDS[slug].lessons[0];
    router.push(`/island/${slug}/${first.slot}`);
  }

  return (
    <section id="islands" className="py-20 px-6 max-w-4xl mx-auto">
      <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-2 uppercase">
        Archipelago
      </p>
      <h2 className="text-3xl font-black text-white mb-8">Choose your island</h2>

      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_0_60px_rgba(0,0,0,0.6)]">
        {/* Map image */}
        <img
          src="/art/map.png"
          alt="Pirate Academy archipelago map"
          className="w-full select-none pointer-events-none"
          draggable={false}
        />

        {/* Active island hotspots */}
        {ISLAND_SPOTS.map(({ slug, x, y, color, tooltipBelow }) => {
          const island = ISLANDS[slug];
          const locked = slug === "anchor-harbor" && !crabComplete;
          const done  = progress[slug] ?? 0;
          const total = island?.lessons.length ?? 0;
          const ac    = ACCENT[color];

          return (
            <div
              key={slug}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
            >
              <button
                onClick={() => handleClick(slug, locked)}
                onMouseEnter={() => setHovered(slug)}
                onMouseLeave={() => setHovered(null)}
                className={locked ? "cursor-not-allowed" : "cursor-pointer"}
                aria-label={island?.title}
              >
                {/* Pulse rings — only when unlocked + mounted */}
                {mounted && !locked && (
                  <>
                    {[0, 0.75].map((delay) => (
                      <motion.div
                        key={delay}
                        className="absolute inset-0 rounded-full"
                        style={{ border: `2px solid ${ac.ring}` }}
                        animate={{ scale: [1, 2.8], opacity: [0.7, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay }}
                      />
                    ))}
                  </>
                )}

                {/* Dot */}
                <div
                  className="w-5 h-5 rounded-full border-2 border-white/50 relative z-10 flex items-center justify-center transition-transform duration-150 hover:scale-125"
                  style={{
                    backgroundColor: locked ? "rgba(80,80,100,0.7)" : ac.dot,
                    boxShadow: locked ? "none" : `0 0 14px ${ac.dot}, 0 0 4px #fff4`,
                  }}
                >
                  {locked && <span className="text-[9px] leading-none">🔒</span>}
                </div>
              </button>

              {/* Tooltip */}
              <AnimatePresence>
                {hovered === slug && (
                  <motion.div
                    initial={{ opacity: 0, y: tooltipBelow ? -4 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.13 }}
                    className={[
                      "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none",
                      tooltipBelow ? "top-full mt-3" : "bottom-full mb-3",
                    ].join(" ")}
                  >
                    <div className="bg-[#070e1c]/95 border border-white/10 rounded-xl px-3 py-2 min-w-[148px] text-center backdrop-blur-md shadow-xl">
                      <p className={`text-[10px] font-bold tracking-[2px] mb-0.5 ${ac.text}`}>
                        {island?.emoji} {island?.title}
                      </p>
                      {locked ? (
                        <p className="text-[10px] text-slate-500">Clear Island 1 first</p>
                      ) : (
                        <p className="text-[10px] text-slate-400">
                          {done} / {total} lessons
                        </p>
                      )}
                    </div>
                    {/* Arrow */}
                    <div
                      className={[
                        "w-2 h-2 bg-[#070e1c] border-white/10 rotate-45 mx-auto",
                        tooltipBelow
                          ? "border-t border-l -mt-1"
                          : "border-b border-r -mb-1 order-first",
                      ].join(" ")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Coming-soon ghost dots */}
        {COMING_SOON_SPOTS.map(({ slug, x, y }) => (
          <div
            key={slug}
            className="absolute pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20 opacity-40" />
          </div>
        ))}

        {/* Skeleton overlay before mount */}
        {!mounted && (
          <div className="absolute inset-0 bg-black/30 animate-pulse rounded-2xl" />
        )}
      </div>
    </section>
  );
}
