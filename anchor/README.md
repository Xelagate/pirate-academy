# pirate-academy Anchor Program

Deployed on **devnet**: `9pHeiuDFexs5HQSmsNbzxhYR1mWW223oeNwFEsz5XWiW`

## Instructions

- `register_pirate(crew_name)` — creates a `PirateProfile` PDA for the student
- `mint_badge` — mints an NFT graduation badge via Metaplex Core CPI

## Testing

```bash
cargo test
```

## Deploy

```bash
anchor build
anchor keys sync
anchor build
anchor deploy --provider.cluster devnet
```
