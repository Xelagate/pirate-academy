import { HeroSection } from "@/components/HeroSection";
import { IslandMap } from "@/components/IslandMap";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";

export const metadata = {
  title: "Pirate Academy · Learn Solana",
  description:
    "Write real Rust. Deploy real Anchor programs. Mint your proof on Solana devnet.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <HeroSection />
      <RewardSection />
      <ErrorBoundary
        fallback={
          <section id="islands" className="py-20 px-6 max-w-3xl mx-auto">
            <ErrorFallback message="Не удалось загрузить карту — обнови страницу" />
          </section>
        }
      >
        <IslandMap />
      </ErrorBoundary>
    </div>
  );
}

function RewardSection() {
  return (
    <section className="py-20 px-6 text-center border-y border-amber-500/10">
      <p className="text-[10px] font-bold tracking-[4px] text-amber-500 mb-6 uppercase">
        Your Reward
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/badge.png"
        alt="Graduation Badge NFT"
        className="mx-auto mb-6 w-44 h-44 object-contain rounded-2xl"
      />
      <h2 className="text-2xl font-black text-white mb-3">
        Graduate of Pirate Academy
      </h2>
      <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
        Complete both islands. Mint your graduation NFT on Solana devnet — your
        proof of work, on-chain forever.
      </p>
    </section>
  );
}
