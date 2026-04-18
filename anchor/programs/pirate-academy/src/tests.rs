#[cfg(test)]
mod tests {
    use crate::ID as PROGRAM_ID;
    use litesvm::LiteSVM;
    use sha2::{Digest, Sha256};
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        pubkey,
        pubkey::Pubkey,
        signature::Keypair,
        signer::Signer,
        system_program,
        transaction::Transaction,
    };

    const MPL_CORE_PROGRAM_ID: Pubkey =
        pubkey!("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

    fn anchor_discriminator(name: &str) -> [u8; 8] {
        let preimage = format!("global:{name}");
        let hash = Sha256::digest(preimage.as_bytes());
        hash[..8].try_into().unwrap()
    }

    fn get_profile_pda(authority: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"pirate", authority.as_ref()], &PROGRAM_ID)
    }

    fn base_svm() -> LiteSVM {
        let mut svm = LiteSVM::new();
        let program_bytes = include_bytes!("../../../target/deploy/pirate_academy.so");
        svm.add_program(PROGRAM_ID, program_bytes);
        let mpl_core_bytes = include_bytes!("../../../tests/fixtures/mpl_core.so");
        svm.add_program(MPL_CORE_PROGRAM_ID, mpl_core_bytes);
        svm
    }

    fn do_register_pirate(svm: &mut LiteSVM, authority: &Keypair, crew_name: &str) {
        let (profile_pda, _) = get_profile_pda(&authority.pubkey());
        let mut data = anchor_discriminator("register_pirate").to_vec();
        let name_bytes = crew_name.as_bytes();
        data.extend_from_slice(&(name_bytes.len() as u32).to_le_bytes());
        data.extend_from_slice(name_bytes);

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
            &[authority],
            blockhash,
        );
        svm.send_transaction(tx).expect("register_pirate failed");
    }

    #[test]
    fn test_register_pirate() {
        let mut svm = base_svm();

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 2_000_000_000).unwrap();

        let (profile_pda, _bump) = get_profile_pda(&authority.pubkey());

        let discriminator = anchor_discriminator("register_pirate");
        let crew_name = "Salty Sea Dogs";
        let crew_name_bytes = crew_name.as_bytes();
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
        let mut svm = base_svm();

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 2_000_000_000).unwrap();

        let (profile_pda, _bump) = get_profile_pda(&authority.pubkey());

        let discriminator = anchor_discriminator("register_pirate");
        let mut data = discriminator.to_vec();
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

    #[test]
    fn test_mint_badge() {
        let mut svm = base_svm();

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 2_000_000_000).unwrap();

        do_register_pirate(&mut svm, &authority, "Jolly Roger Crew");

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

        let result = svm.send_transaction(tx);
        assert!(result.is_ok(), "mint_badge should succeed: {:?}", result);

        let asset_account = svm.get_account(&asset.pubkey());
        assert!(asset_account.is_some(), "Asset account should exist after minting");
    }

    #[test]
    fn test_mint_badge_wrong_authority_rejected() {
        let mut svm = base_svm();

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 2_000_000_000).unwrap();
        do_register_pirate(&mut svm, &authority, "Skull Crossbones");

        let (profile_pda, _) = get_profile_pda(&authority.pubkey());

        let impostor = Keypair::new();
        svm.airdrop(&impostor.pubkey(), 2_000_000_000).unwrap();
        let asset = Keypair::new();

        let data = anchor_discriminator("mint_badge").to_vec();
        let ix = Instruction {
            program_id: PROGRAM_ID,
            accounts: vec![
                AccountMeta::new(impostor.pubkey(), true),   // wrong authority
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
            Some(&impostor.pubkey()),
            &[&impostor, &asset],
            blockhash,
        );

        let result = svm.send_transaction(tx);
        assert!(result.is_err(), "mint_badge with wrong authority should fail");
    }
}
