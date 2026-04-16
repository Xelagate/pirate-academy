use anchor_lang::prelude::*;

use crate::errors::PirateError;
use crate::state::PirateProfile;

pub fn register_pirate(ctx: Context<RegisterPirate>, crew_name: String) -> Result<()> {
    require!(
        !crew_name.is_empty() && crew_name.len() <= 24 && crew_name.is_ascii(),
        PirateError::BadCrewName
    );

    let profile = &mut ctx.accounts.profile;
    profile.authority = ctx.accounts.authority.key();
    profile.joined_slot = Clock::get()?.slot;
    profile.badges_minted = 0;
    profile.bump = ctx.bumps.profile;
    profile.crew_name = crew_name;

    Ok(())
}

#[derive(Accounts)]
#[instruction(crew_name: String)]
pub struct RegisterPirate<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PirateProfile::INIT_SPACE,
        seeds = [b"pirate", authority.key().as_ref()],
        bump,
    )]
    pub profile: Account<'info, PirateProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
