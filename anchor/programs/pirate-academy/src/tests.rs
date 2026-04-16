#[cfg(test)]
mod tests {
    use crate::ID as PROGRAM_ID;
    use litesvm::LiteSVM;
    use sha2::{Digest, Sha256};
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        signature::Keypair,
        signer::Signer,
        system_program,
        transaction::Transaction,
    };

    fn anchor_discriminator(name: &str) -> [u8; 8] {
        let preimage = format!("global:{name}");
        let hash = Sha256::digest(preimage.as_bytes());
        hash[..8].try_into().unwrap()
    }

    fn get_profile_pda(authority: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"pirate", authority.as_ref()], &PROGRAM_ID)
    }

    #[test]
    fn test_register_pirate() {
        let mut svm = LiteSVM::new();
        let program_bytes = include_bytes!("../../../target/deploy/pirate_academy.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 2_000_000_000).unwrap();

        let (profile_pda, _bump) = get_profile_pda(&authority.pubkey());

        let discriminator = anchor_discriminator("register_pirate");
        let crew_name = "Salty Sea Dogs";
        let crew_name_bytes = crew_name.as_bytes();
        // Borsh String encoding: 4-byte LE length prefix + UTF-8 bytes
        let mut data = discriminator.to_vec();
        data.extend_from_slice(&(crew_name_bytes.len() as u32).to_le_bytes());
        data.extend_from_slice(crew_name_bytes);

        let ix = Instruction {
            program_id: PROGRAM_ID,
            accounts: vec![
                AccountMeta::new(profile_pda, false),
                AccountMeta::new(authority.pubkey(), true),
                AccountMeta::new_readonly(system_program::ID, false),
            ],
            data,
        };

        let blockhash = svm.latest_blockhash();
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        );

        let result = svm.send_transaction(tx);
        assert!(
            result.is_ok(),
            "register_pirate should succeed: {:?}",
            result
        );

        let profile_account = svm.get_account(&profile_pda);
        assert!(
            profile_account.is_some(),
            "Profile PDA should exist after registration"
        );
    }

    #[test]
    fn test_register_pirate_rejects_empty_name() {
        let mut svm = LiteSVM::new();
        let program_bytes = include_bytes!("../../../target/deploy/pirate_academy.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 2_000_000_000).unwrap();

        let (profile_pda, _bump) = get_profile_pda(&authority.pubkey());

        let discriminator = anchor_discriminator("register_pirate");
        let mut data = discriminator.to_vec();
        // Empty string: length = 0
        data.extend_from_slice(&0u32.to_le_bytes());

        let ix = Instruction {
            program_id: PROGRAM_ID,
            accounts: vec![
                AccountMeta::new(profile_pda, false),
                AccountMeta::new(authority.pubkey(), true),
                AccountMeta::new_readonly(system_program::ID, false),
            ],
            data,
        };

        let blockhash = svm.latest_blockhash();
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        );

        let result = svm.send_transaction(tx);
        assert!(result.is_err(), "register_pirate should reject empty crew name");
    }
}
