# Pirate Academy

Learn Solana development through interactive coding lessons with an AI tutor. Complete exercises, pass challenges, and mint an on-chain graduation badge when you're done.

Built for the **Solana Frontier Hackathon 2026**.

**[Live Demo](https://course-eight-plum.vercel.app)**

## What it does

- Interactive coding lessons organized into islands (topics)
- In-browser code editor with real-time validation
- Progress saved locally — pick up where you left off
- On-chain badge minted via Anchor program when you complete the course
- AI tutor for personalized help (coming soon)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Solana Client | `@solana/kit`, wallet-standard |
| On-chain Program | Anchor (Rust), deployed on devnet |
| Program Client | Codama-generated, type-safe |

## On-chain Program

The `pirate-academy` Anchor program is deployed on **devnet**:

```
9pHeiuDFexs5HQSmsNbzxhYR1mWW223oeNwFEsz5XWiW
```

Two instructions:
- `register_pirate` — creates a PDA profile for the student
- `mint_badge` — mints an NFT graduation badge via Metaplex Core CPI

## Running Locally

### Prerequisites

- Node.js 18+
- [Rust](https://rustup.rs/)
- [Solana CLI](https://solana.com/docs/intro/installation)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)

### Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect a devnet wallet.

### Run tests

```bash
cd anchor
cargo test
```

### Deploy your own program

```bash
solana config set --url devnet
solana airdrop 2

cd anchor
anchor build
anchor keys sync
anchor build
anchor deploy

cd ..
npm run codama:js  # regenerate TypeScript client
```

## Project Structure

```
├── app/
│   ├── components/        # UI components (IslandMap, WalletButton, etc.)
│   ├── content/lessons/   # MDX lesson content
│   │   ├── crab-forge/    # Rust basics (7 lessons)
│   │   └── anchor-harbor/ # Anchor program development (5 lessons)
│   ├── generated/         # Codama-generated Solana program clients
│   └── lib/               # Wallet, progress, hooks, validators
├── anchor/
│   └── programs/pirate-academy/  # Anchor program (Rust)
└── codama.json            # Client generation config
```

## Hackathon

Built by [@PirateAcademyHQ](https://x.com/PirateAcademyHQ) as part of **Solana Frontier Hackathon 2026**.
Part of the [@SuperteamUA](https://x.com/SuperteamUA) ecosystem.
