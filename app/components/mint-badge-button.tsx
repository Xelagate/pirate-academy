"use client";

import { useState, useEffect } from "react";
import { generateKeyPairSigner } from "@solana/kit";
import { toast } from "sonner";
import { useWallet } from "../lib/wallet/context";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { useSolanaClient } from "../lib/solana-client-context";
import { useCluster } from "./cluster-context";
import {
  getRegisterPirateInstructionAsync,
  getMintBadgeInstructionAsync,
  findProfilePda,
} from "../generated/pirate-academy";

export function MintBadgeButton() {
  const { signer, status } = useWallet();
  const { send, isSending } = useSendTransaction();
  const client = useSolanaClient();
  const { getExplorerUrl } = useCluster();

  const [crewName, setCrewName] = useState("Pirate Crew");
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [lastSig, setLastSig] = useState<string | null>(null);

  useEffect(() => {
    setProfileExists(null);
    setLastSig(null);
    if (!signer) return;

    let cancelled = false;
    async function check() {
      if (!signer) return;
      try {
        const [profileAddress] = await findProfilePda({ authority: signer.address });
        const info = await client.rpc.getAccountInfo(profileAddress, { encoding: "base64" }).send();
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
    setLastSig(null);

    try {
      const assetSigner = await generateKeyPairSigner();
      const instructions = [];

      if (!profileExists) {
        const name = crewName.trim() || "Pirate Crew";
        instructions.push(
          await getRegisterPirateInstructionAsync({ authority: signer, crewName: name })
        );
      }

      instructions.push(
        await getMintBadgeInstructionAsync({ authority: signer, asset: assetSigner })
      );

      const sig = await send({ instructions });
      setProfileExists(true);
      setLastSig(sig ?? null);
      toast.success("Badge minted!", {
        description: sig ? (
          <a
            href={getExplorerUrl(`/tx/${sig}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Explorer
          </a>
        ) : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Transaction failed", { description: msg.slice(0, 200) });
    }
  };

  if (status !== "connected") {
    return (
      <p className="text-sm text-muted">Connect your wallet to mint a badge.</p>
    );
  }

  const isLoading = profileExists === null;
  const label = profileExists ? "Mint Badge Again" : "Register & Mint Badge";

  return (
    <div className="flex flex-col gap-4">
      {!profileExists && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Crew name</label>
          <input
            type="text"
            value={crewName}
            onChange={(e) => setCrewName(e.target.value)}
            maxLength={24}
            placeholder="Pirate Crew"
            className="rounded-lg border border-border-low bg-card px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <button
        onClick={handleMint}
        disabled={isSending || isLoading}
        className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? "Sending…" : isLoading ? "Loading…" : label}
      </button>

      {lastSig && (
        <a
          href={getExplorerUrl(`/tx/${lastSig}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted underline underline-offset-2 transition hover:text-foreground"
        >
          Last tx: {lastSig.slice(0, 8)}…{lastSig.slice(-8)}
        </a>
      )}
    </div>
  );
}
