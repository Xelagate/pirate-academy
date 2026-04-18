"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateKeyPairSigner } from "@solana/kit";
import { toast } from "sonner";
import { useWallet } from "@/lib/wallet/context";
import { useSendTransaction } from "@/lib/hooks/use-send-transaction";
import { useSolanaClient } from "@/lib/solana-client-context";
import { useCluster } from "@/components/cluster-context";
import {
  getRegisterPirateInstructionAsync,
  getMintBadgeInstructionAsync,
  findProfilePda,
} from "@/generated/pirate-academy";
import { markComplete } from "@/lib/progress";

export function FinalLesson({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const { signer, status } = useWallet();
  const { send, isSending } = useSendTransaction();
  const client = useSolanaClient();
  const { getExplorerUrl } = useCluster();

  const [crewName, setCrewName] = useState("Pirate Crew");
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    setProfileExists(null);
    if (!signer) return;
    let cancelled = false;
    async function check() {
      if (!signer) return;
      try {
        const [addr] = await findProfilePda({ authority: signer.address });
        const info = await client.rpc.getAccountInfo(addr, { encoding: "base64" }).send();
        if (!cancelled) setProfileExists(info.value !== null);
      } catch {
        if (!cancelled) setProfileExists(false);
      }
    }
    void check();
    return () => { cancelled = true; };
  }, [signer, client]);

  const handleMint = async () => {
    if (!signer) return;
    try {
      const assetSigner = await generateKeyPairSigner();
      const instructions = [];
      if (!profileExists) {
        instructions.push(
          await getRegisterPirateInstructionAsync({
            authority: signer,
            crewName: crewName.trim() || "Pirate Crew",
          })
        );
      }
      instructions.push(
        await getMintBadgeInstructionAsync({ authority: signer, asset: assetSigner })
      );

      const sig = await send({ instructions });
      markComplete(lessonId);
      toast.success("Badge minted! Setting sail to your trophy page…");
      router.push(`/badge?sig=${sig ?? ""}&asset=${assetSigner.address}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Transaction failed", { description: msg.slice(0, 200) });
    }
  };

  if (status !== "connected") {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Connect your wallet to mint your graduation badge.</p>
      </div>
    );
  }

  const isLoading = profileExists === null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
      <p className="text-sm font-semibold text-amber-400">⚓ Final Challenge — Live Devnet Transaction</p>

      {!profileExists && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Your crew name (max 24 chars)</label>
          <input
            type="text"
            value={crewName}
            onChange={(e) => setCrewName(e.target.value)}
            maxLength={24}
            placeholder="Pirate Crew"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      )}

      <button
        onClick={handleMint}
        disabled={isSending || isLoading}
        className="cursor-pointer rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? "Sending transaction…" : isLoading ? "Checking profile…" : "🏴‍☠️ Mint My Badge"}
      </button>

      <p className="text-xs text-muted-foreground">
        This signs a real Solana devnet transaction. Make sure your wallet is set to <strong>devnet</strong>.
      </p>
    </div>
  );
}
