"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet/context";
import { useSolanaClient } from "@/lib/solana-client-context";
import { WalletButton } from "@/components/wallet-button";
import { completedCount, nextLesson } from "@/lib/progress";
import { findProfilePda, fetchMaybePirateProfile } from "@/generated/pirate-academy";
import { ISLANDS } from "@/lib/lessons";

const ALL_LESSON_IDS = Object.values(ISLANDS).flatMap((i) =>
  i.lessons.map((l) => l.lessonId)
);

export function HeroSection() {
  const { signer } = useWallet();
  const client = useSolanaClient();

  const [crewName, setCrewName] = useState<string | null>(null);
  const [next, setNext] = useState<{ island: string; slot: string; title: string } | null>(null);
  const [totalDone, setTotalDone] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Read progress from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setMounted(true);
    setNext(nextLesson());
    setTotalDone(completedCount(ALL_LESSON_IDS));
  }, []);

  // Fetch crew name from PDA when wallet connects
  useEffect(() => {
    if (!signer) {
      setCrewName(null);
      return;
    }
    let cancelled = false;
    async function fetchCrewName() {
      if (!signer) return;
      try {
        const [profileAddress] = await findProfilePda({ authority: signer.address });
        const profile = await fetchMaybePirateProfile(client.rpc, profileAddress);
        if (!cancelled && profile.exists) setCrewName(profile.data.crewName);
      } catch {
        // silent — profile may not exist yet
      }
    }
    void fetchCrewName();
    return () => {
      cancelled = true;
    };
  }, [signer, client]);

  const hasStarted = mounted && totalDone > 0;
  const ctaHref = hasStarted
    ? next
      ? `/island/${next.island}/${next.slot}`
      : "/badge"
    : "#islands";
  const ctaLabel = hasStarted ? "Continue Voyage →" : "Begin the Voyage →";
  const isReturning = hasStarted;

  const eyebrow = crewName
    ? `Welcome back, Captain ${crewName}`
    : "Solana onboarding, reimagined";

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* hero.png background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/art/hero.png')", opacity: 0.18 }}
      />
      {/* gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.08) 0%, transparent 60%), linear-gradient(to bottom, rgba(6,13,26,0.3) 0%, rgba(6,13,26,0) 40%, rgba(6,13,26,0.95) 75%, #060d1a 100%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-5 border-b border-amber-500/10">
        <span className="text-amber-500 font-black text-sm tracking-[3px] uppercase">
          ⚓ Pirate Academy
        </span>
        <WalletButton />
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-16">
        <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-5 uppercase">
          {eyebrow}
        </p>
        <h1
          className="text-7xl md:text-8xl font-black leading-none mb-6 select-none"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Pirate
          <br />
          Academy
        </h1>
        <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-10">
          Write real Rust. Deploy real Anchor programs.
          <br />
          Mint your proof on Solana devnet.
        </p>

        <div className="flex flex-col items-center gap-3">
          <a
            href={ctaHref}
            className={[
              "inline-block px-10 py-4 rounded-2xl font-black text-lg transition-all",
              isReturning
                ? "bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_40px_rgba(56,189,248,0.4)]"
                : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-pulse",
            ].join(" ")}
          >
            {ctaLabel}
          </a>
          <a
            href="/onboard"
            className="text-sm text-slate-500 hover:text-amber-400 transition-colors underline underline-offset-4"
          >
            Not sure where to start? Let AI chart your course →
          </a>
        </div>

        {hasStarted && next && (
          <p className="mt-3 text-sm text-slate-600">
            ↳ {next.title} · {ISLANDS[next.island]?.title}
          </p>
        )}
      </div>

      {/* Scroll hint */}
      <div className="relative z-10 text-center pb-8 text-slate-700 text-[10px] tracking-[3px] animate-bounce">
        ▼ &nbsp; CHOOSE YOUR ISLAND &nbsp; ▼
      </div>
    </section>
  );
}
