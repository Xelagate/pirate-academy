import Link from "next/link";
import { BadgePageClient } from "./client";

export const metadata = {
  title: "Graduation Badge · Pirate Academy",
};

export default function BadgePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="mb-4 text-5xl">🏴‍☠️</p>
      <h1 className="mb-2 text-4xl font-black tracking-tight">You Did It, Pirate!</h1>
      <p className="mb-10 text-muted-foreground">
        Your graduation badge has been minted on Solana devnet.
      </p>

      <BadgePageClient />

      <div className="mt-10 flex justify-center gap-4 text-sm">
        <Link
          href="/island/anchor-harbor"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Anchor Harbor
        </Link>
        <Link
          href="/"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
