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
