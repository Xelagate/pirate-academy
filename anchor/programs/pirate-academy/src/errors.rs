use anchor_lang::prelude::*;

#[error_code]
pub enum PirateError {
    #[msg("Crew name must be 1–24 ASCII characters")]
    BadCrewName,
    #[msg("This pirate already graduated")]
    AlreadyGraduated,
}
