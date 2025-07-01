pub mod processor;
pub mod state;

use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey,
};
use state::Instructions;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instructions = Instructions::unpack(instruction_data)?;
    match instructions {
        Instructions::Initialize => processor::process_initialize(program_id, accounts)?,
        Instructions::Calculate {
            val1,
            val2,
            operator,
        } => processor::process_increment(program_id, accounts, val1, val2, operator)?,
    }
    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;
    use borsh::BorshDeserialize;
    use solana_program_test::*;
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        signature::{Keypair, Signer},
        system_program,
        transaction::Transaction,
    };
    use state::ComputeResult;

    #[tokio::test]
    async fn test_process_initialize() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "calculator_program",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        let account_keypair = Keypair::new();

        // 0 here represents the 0-th instruction from the instruction enums, which is to initialize
        let init_instruction_data = vec![0];
        let initialize_instruction = Instruction::new_with_bytes(
            program_id,
            &init_instruction_data,
            vec![
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new(account_keypair.pubkey(), true),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
        );

        let mut transaction =
            Transaction::new_with_payer(&[initialize_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &account_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();
        let account = banks_client
            .get_account(account_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: ComputeResult =
                ComputeResult::deserialize(&mut &account_data.data[..]).unwrap();
            assert_eq!(counter.result, Some(0));
        }
    }
}
