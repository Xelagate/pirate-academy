use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

#[cfg(test)]
mod tests;

use instructions::*;

declare_id!("9pHeiuDFexs5HQSmsNbzxhYR1mWW223oeNwFEsz5XWiW");

#[program]
pub mod pirate_academy {
    use super::*;

    pub fn register_pirate(ctx: Context<RegisterPirate>, crew_name: String) -> Result<()> {
        instructions::register_pirate::register_pirate(ctx, crew_name)
    }

    pub fn mint_badge(ctx: Context<MintBadge>) -> Result<()> {
        instructions::mint_badge::mint_badge(ctx)
    }
}
