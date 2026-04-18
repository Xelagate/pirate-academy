"use client";

import { ThemeToggle } from "../components/theme-toggle";
import { ClusterSelect } from "../components/cluster-select";
import { WalletButton } from "../components/wallet-button";
import { MintBadgeButton } from "../components/mint-badge-button";
import { GridBackground } from "../components/grid-background";

export default function DevPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />
      <div className="relative z-10">
        <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight">
            Pirate Academy · Dev
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ClusterSelect />
            <WalletButton />
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 pt-10">
          <h1 className="mb-2 text-3xl font-black tracking-tight">
            ⚓ Mint Badge
          </h1>
          <p className="mb-8 text-sm text-muted">
            Vertical slice — register your pirate profile and mint an NFT badge on devnet.
          </p>

          <div className="w-full max-w-sm rounded-2xl border border-border-low bg-card p-6 shadow-sm">
            <MintBadgeButton />
          </div>
        </main>
      </div>
    </div>
  );
}
