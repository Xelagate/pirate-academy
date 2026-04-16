use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PirateProfile {
    pub authority: Pubkey,
    pub joined_slot: u64,
    pub badges_minted: u8,
    pub bump: u8,
    #[max_len(24)]
    pub crew_name: String,
}
