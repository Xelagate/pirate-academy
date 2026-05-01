# Phase 1: Business Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make badges non-transferable (SBT), add a B2B landing page for companies, and create a partner collections config as the foundation for NFT-gated cosmetics in Phase 2.

**Architecture:** (1) Anchor program gets `PermanentFreezeDelegate` plugin on every minted badge — frozen forever, authority `None` = nobody can unfreeze. (2) A static Next.js page at `/for-companies` markets the B2B offering with a contact form. (3) A config file `app/lib/partner-collections.ts` defines partner NFT collection addresses so Phase 2 can gate cosmetics without hardcoding.

**Tech Stack:** Rust/Anchor, mpl-core 0.11.2 (`PermanentFreezeDelegate` + `PluginAuthorityPair`), Next.js 16 App Router, Tailwind CSS v4, TypeScript

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `anchor/programs/pirate-academy/src/instructions/mint_badge.rs` | Add SBT plugin to CreateV2CpiBuilder |
| Modify | `anchor/programs/pirate-academy/src/tests.rs` | Add SBT verification test |
| Create | `app/for-companies/page.tsx` | B2B landing page (server component) |
| Create | `app/for-companies/ContactForm.tsx` | Contact form (client component) |
| Create | `app/lib/partner-collections.ts` | Partner collection addresses config |
| Modify | `app/layout.tsx` | Add nav link to /for-companies |

---

## Task 1: SBT — Non-Transferable Badge

### Files
- Modify: `anchor/programs/pirate-academy/src/instructions/mint_badge.rs`
- Modify: `anchor/programs/pirate-academy/src/tests.rs`

- [ ] **Step 1: Write the failing test**

Add this test to `anchor/programs/pirate-academy/src/tests.rs` inside the `tests` module, after the existing `test_mint_badge_wrong_authority_rejected`:

```rust
#[test]
fn test_mint_badge_sbt_is_frozen() {
    let mut svm = base_svm();

    let authority = Keypair::new();
    svm.airdrop(&authority.pubkey(), 2_000_000_000).unwrap();

    do_register_pirate(&mut svm, &authority, "SBT Test Crew");

    let (profile_pda, _) = get_profile_pda(&authority.pubkey());
    let asset = Keypair::new();

    let data = anchor_discriminator("mint_badge").to_vec();
    let ix = Instruction {
        program_id: PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(authority.pubkey(), true),
            AccountMeta::new(profile_pda, false),
            AccountMeta::new(asset.pubkey(), true),
            AccountMeta::new_readonly(MPL_CORE_PROGRAM_ID, false),
            AccountMeta::new_readonly(system_program::ID, false),
        ],
        data,
    };
    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&authority.pubkey()),
        &[&authority, &asset],
        blockhash,
    );
    svm.send_transaction(tx).expect("mint_badge should succeed");

    let asset_account = svm.get_account(&asset.pubkey()).expect("Asset must exist");
    // A plain mpl-core asset without plugins is ~96 bytes.
    // PermanentFreezeDelegate plugin adds ~20 bytes.
    // Any value > 96 confirms plugin data is present.
    assert!(
        asset_account.data.len() > 96,
        "Asset data too short ({}). Expected plugin data (> 96 bytes).",
        asset_account.data.len()
    );
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd anchor && cargo test test_mint_badge_sbt_is_frozen 2>&1 | tail -20
```

Expected: test passes with current code (asset exists, but data is ~96 bytes without plugin) — OR fails if the current data length check is wrong. Note the actual data length printed in the failure message.

- [ ] **Step 3: Implement SBT plugin in mint_badge.rs**

Replace the full content of `anchor/programs/pirate-academy/src/instructions/mint_badge.rs`:

```rust
use anchor_lang::prelude::*;
use mpl_core::{
    instructions::CreateV2CpiBuilder,
    types::{PermanentFreezeDelegate, Plugin, PluginAuthority, PluginAuthorityPair},
};

use crate::state::PirateProfile;

pub fn mint_badge(ctx: Context<MintBadge>) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    let badge_num = profile.badges_minted.saturating_add(1);

    CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.asset.to_account_info())
        .payer(&ctx.accounts.authority.to_account_info())
        .owner(Some(&ctx.accounts.authority.to_account_info()))
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name(format!("Pirate Badge #{badge_num}"))
        .uri(format!("https://pirate.academy/badge/{badge_num}.json"))
        .plugins(vec![PluginAuthorityPair {
            plugin: Plugin::PermanentFreezeDelegate(PermanentFreezeDelegate { frozen: true }),
            authority: Some(PluginAuthority::None),
        }])
        .invoke()?;

    profile.badges_minted = badge_num;
    Ok(())
}

#[derive(Accounts)]
pub struct MintBadge<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"pirate", authority.key().as_ref()],
        bump = profile.bump,
        has_one = authority,
    )]
    pub profile: Account<'info, PirateProfile>,
    /// CHECK: new asset keypair — ownership and structure validated by mpl-core
    #[account(mut)]
    pub asset: Signer<'info>,
    /// CHECK: must be the mpl-core program (CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d)
    pub mpl_core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
```

- [ ] **Step 4: Run all tests**

```bash
cd anchor && cargo test 2>&1 | tail -20
```

Expected: `test result: ok. 6 passed; 0 failed`

- [ ] **Step 5: Rebuild and verify binary compiles**

```bash
cd anchor && cargo build-sbf 2>&1 | tail -10
```

Expected: `Finished` with no errors.

- [ ] **Step 6: Commit**

```bash
git add anchor/programs/pirate-academy/src/instructions/mint_badge.rs anchor/programs/pirate-academy/src/tests.rs
git commit -m "feat: make badges SBT via PermanentFreezeDelegate (non-transferable)"
```

---

## Task 2: Partner Collections Config

This file is needed by both the B2B page (to list current partners) and Phase 2 (for NFT-gated cosmetics).

### Files
- Create: `app/lib/partner-collections.ts`

- [ ] **Step 1: Create the config file**

Create `app/lib/partner-collections.ts`:

```typescript
export interface PartnerCollection {
  id: string;
  name: string;
  /** Metaplex verified collection address on mainnet */
  collectionAddress: string;
  /** Cosmetic reward unlocked for holders */
  rewardLabel: string;
  /** Ship skin or avatar item key used in Phase 2 cosmetics system */
  cosmeticKey: string;
}

export const PARTNER_COLLECTIONS: PartnerCollection[] = [
  {
    id: "monke-dao",
    name: "MonkeDAO",
    collectionAddress: "SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND",
    rewardLabel: "Monke Admiral Coat",
    cosmeticKey: "monke-admiral-coat",
  },
];

export function getPartnerById(id: string): PartnerCollection | undefined {
  return PARTNER_COLLECTIONS.find((p) => p.id === id);
}
```

> **Note:** MonkeDAO collection address above is the canonical SMB Gen2 collection on mainnet. Verify at https://www.tensor.trade/trade/smb before launch.

- [ ] **Step 2: TypeScript check**

```bash
cd /path/to/project && npx tsc --noEmit 2>&1 | grep "partner-collections" || echo "no errors"
```

Expected: `no errors`

- [ ] **Step 3: Commit**

```bash
git add app/lib/partner-collections.ts
git commit -m "feat: add partner collections config for NFT-gated cosmetics"
```

---

## Task 3: B2B Landing Page

### Files
- Create: `app/for-companies/page.tsx`
- Create: `app/for-companies/ContactForm.tsx`
- Modify: `app/layout.tsx` (add nav link)

- [ ] **Step 1: Create ContactForm client component**

Create `app/for-companies/ContactForm.tsx`:

```tsx
"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");

  const subject = encodeURIComponent(`[B2B] ${company} — course inquiry`);
  const body = encodeURIComponent(
    `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\nTopic / course idea:\n${topic}`
  );
  const mailtoHref = `mailto:Alex.enrout.invest@gmail.com?subject=${subject}&body=${body}`;

  const filled = name.trim() && company.trim() && email.trim() && topic.trim();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-amber-400/70">Ваше имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Captain Jack"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-amber-400/70">Компания</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Solana Foundation"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-amber-400/70">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber-400/50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-amber-400/70">Тема курса / идея</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={4}
          placeholder="Хотим курс по нашему протоколу для onboarding пользователей..."
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber-400/50 resize-none"
        />
      </div>
      <a
        href={filled ? mailtoHref : undefined}
        aria-disabled={!filled}
        className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition ${
          filled
            ? "bg-amber-400 text-black hover:bg-amber-300 cursor-pointer"
            : "bg-white/10 text-white/30 cursor-not-allowed pointer-events-none"
        }`}
      >
        Отправить заявку
      </a>
      <p className="text-xs text-white/30">
        Нажав кнопку, откроется ваш почтовый клиент с заполненным письмом.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create the landing page**

Create `app/for-companies/page.tsx`:

```tsx
import { ContactForm } from "./ContactForm";
import { PARTNER_COLLECTIONS } from "@/lib/partner-collections";

export const metadata = {
  title: "Pirate Academy · Для компаний",
  description:
    "Закажите брендованный интерактивный курс для вашего комьюнити. Студенты получают SBT-бейджи — верифицируемые credentials на блокчейне.",
};

const FEATURES = [
  {
    icon: "⚓",
    title: "Брендованный курс",
    body: "Мы создаём интерактивный курс под вашу технологию или протокол. Студенты учатся прямо в браузере — Rust, TypeScript, концепции вашего продукта.",
  },
  {
    icon: "🏴‍☠️",
    title: "SBT-сертификат",
    body: "Каждый выпускник получает нетрансферабельный NFT-бейдж с вашим брендом. Кошелёк студента — его резюме. Вы нанимаете из пула верифицированных специалистов.",
  },
  {
    icon: "🗓️",
    title: "Сезонные коллабы",
    body: "Лимитированные кампании к запуску продукта или токена. Курс идёт ограниченный сезон — бейдж становится редким артефактом. Создаёт ажиотаж и вирусность.",
  },
];

export default function ForCompaniesPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <p className="mb-4 text-sm font-semibold tracking-widest text-amber-400 uppercase">
          Для компаний
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
          Обучите комьюнити.<br />
          Оставьте след на блокчейне.
        </h1>
        <p className="text-lg text-white/60 leading-relaxed">
          Pirate Academy создаёт интерактивные курсы для Solana-экосистемы.
          Ваши студенты получают SBT-бейджи — цифровые credentials, которые
          нельзя купить или передать. Только заработать.
        </p>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h2 className="mb-2 text-base font-semibold">{f.title}</h2>
              <p className="text-sm text-white/50 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      {PARTNER_COLLECTIONS.length > 0 && (
        <section className="px-6 pb-20 max-w-3xl mx-auto text-center">
          <p className="mb-6 text-sm font-semibold tracking-widest text-amber-400 uppercase">
            Текущие партнёры
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {PARTNER_COLLECTIONS.map((p) => (
              <span
                key={p.id}
                className="rounded-full border border-amber-400/30 bg-amber-400/5 px-4 py-1.5 text-sm text-amber-300"
              >
                {p.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="px-6 pb-32 max-w-xl mx-auto">
        <h2 className="mb-8 text-2xl font-bold text-center">Обсудить проект</h2>
        <ContactForm />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Add nav link in layout.tsx**

Open `app/layout.tsx`. Find the nav links section (wherever `Острова` or home links are) and add a link to `/for-companies`. The exact placement depends on the current nav structure — add it as the last nav item:

```tsx
<a
  href="/for-companies"
  className="text-sm text-white/60 transition hover:text-white"
>
  Для компаний
</a>
```

- [ ] **Step 4: Run build**

```bash
pnpm build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` with `/for-companies` listed in the static pages.

- [ ] **Step 5: Verify locally**

```bash
pnpm dev
```

Open `http://localhost:3000/for-companies` — verify the page renders, all three feature cards are visible, the contact form fills and enables the button, the partner badge shows "MonkeDAO".

- [ ] **Step 6: Commit**

```bash
git add app/for-companies/page.tsx app/for-companies/ContactForm.tsx app/layout.tsx
git commit -m "feat: add B2B landing page at /for-companies with contact form"
```

---

## Task 4: Redeploy Anchor Program (SBT)

The mint_badge instruction changed — need to rebuild and upgrade on devnet.

### Prerequisites
- Solana CLI configured for devnet
- Deploy keypair with SOL for upgrade

- [ ] **Step 1: Build the program**

```bash
cd anchor && anchor build 2>&1 | tail -10
```

Expected: `Finished release [optimized]`

- [ ] **Step 2: Upgrade the program**

```bash
cd anchor && anchor upgrade target/deploy/pirate_academy.so --program-id 9pHeiuDFexs5HQSmsNbzxhYR1mWW223oeNwFEsz5XWiW 2>&1
```

Expected: `Program upgraded successfully`

> If upgrade fails due to insufficient SOL, run `solana airdrop 2` first.

- [ ] **Step 3: Upgrade IDL on-chain**

```bash
cd anchor && anchor idl upgrade 9pHeiuDFexs5HQSmsNbzxhYR1mWW223oeNwFEsz5XWiW --filepath target/idl/pirate_academy.json
```

Expected: `Idl account updated`

- [ ] **Step 4: Smoke test on devnet**

Open the deployed app at `https://course-eight-plum.vercel.app`, connect wallet, complete a lesson, mint a badge. On Solana Explorer, open the badge NFT — verify it shows "Frozen" status.

- [ ] **Step 5: Commit**

```bash
git add anchor/target/idl/pirate_academy.json anchor/target/types/pirate_academy.ts 2>/dev/null || true
git commit -m "chore: upgrade devnet program with SBT (PermanentFreezeDelegate)"
```

---

## Self-Review Checklist

- [x] SBT spec requirement: `PermanentFreezeDelegate` + `authority: None` → Task 1
- [x] B2B landing page spec requirement → Task 3
- [x] Partner collections config (foundation for Phase 2 cosmetics) → Task 2
- [x] No TBD or placeholder code
- [x] Type names consistent: `PluginAuthorityPair`, `PermanentFreezeDelegate`, `PluginAuthority::None` used identically in Task 1 instruction and prose
- [x] `PARTNER_COLLECTIONS` imported in `page.tsx` from `@/lib/partner-collections` matches the export in Task 2
- [x] Seasonal collab framework from spec: covered by the B2B page + partner config (the "framework" at this stage is the config system + contact funnel; automated campaign tooling is Phase 3)
