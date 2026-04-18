use anchor_lang::prelude::*;
use mpl_core::instructions::CreateV2CpiBuilder;

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
