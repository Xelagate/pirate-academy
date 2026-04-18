"use client";

import { useSearchParams } from "next/navigation";
import { useCluster } from "@/components/cluster-context";
import { Suspense } from "react";

function BadgeDetails() {
  const params = useSearchParams();
  const { getExplorerUrl } = useCluster();

  const sig = params.get("sig");
  const asset = params.get("asset");

  if (!sig && !asset) {
    return (
      <p className="text-sm text-muted-foreground">
        No badge data found. Complete{" "}
        <a href="/island/anchor-harbor/05" className="underline hover:text-foreground">
          Anchor Harbor Lesson 5
        </a>{" "}
        to mint your badge.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Badge image placeholder — swap in real art when ready */}
      <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-7xl shadow-lg">
        ⚓
      </div>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-left text-sm">
        <p className="mb-3 font-semibold text-amber-400">Pirate Academy Graduate</p>
        {asset && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Asset address</span>
            <p className="break-all font-mono text-xs">{asset}</p>
          </div>
        )}
        {sig && (
          <div>
            <span className="text-xs text-muted-foreground">Transaction</span>
            <p className="break-all font-mono text-xs">{sig}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        {sig && (
          <a
            href={getExplorerUrl(`/tx/${sig}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            View Transaction on Explorer ↗
          </a>
        )}
        {asset && (
          <a
            href={getExplorerUrl(`/address/${asset}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground underline underline-offset-2 transition hover:text-foreground"
          >
            View Asset on Explorer ↗
          </a>
        )}
      </div>
    </div>
  );
}

export function BadgePageClient() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <BadgeDetails />
    </Suspense>
  );
}
