use crate::state::ComputeResult;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{Sysvar, rent::Rent},
};

pub fn process_initialize(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let payer_account = next_account_info(accounts_iter)?;
    let data_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // ComputeResult with Option<i32> needs maximum 5 bytes:
    // 1 byte for Option discriminant + 4 bytes for i32 when Some
    let account_space = 5;
    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(account_space);

    // Create the counter account
    invoke(
        &system_instruction::create_account(
            payer_account.key,    // Account paying for the new account
            data_account.key,     // Account to be created
            required_lamports,    // Amount of lamports to transfer to the new account
            account_space as u64, // Size in bytes to allocate for the data field
            program_id,           // Set program owner to our program
        ),
        &[
            payer_account.clone(),
            data_account.clone(),
            system_program.clone(),
        ],
    )?;

    let result_data: ComputeResult = ComputeResult { result: Some(0) };
    let mut account_data = &mut data_account.data.borrow_mut()[..];
    result_data.serialize(&mut account_data)?;

    Ok(())
}

pub fn process_increment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    val1: i32,
    val2: i32,
    operator: String,
) -> ProgramResult {
    let operator_str = operator.as_str();
    let accounts_iter = &mut accounts.iter();
    let data_account = next_account_info(accounts_iter)?;

    if data_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let result: Option<i32> = match operator_str {
        "+" => Some(val1 + val2),
        "-" => Some(val1 - val2),
        "*" => Some(val1 * val2),
        "/" => {
            if val2 == 0 {
                None
            } else {
                Some(val1 / val2)
            }
        }
        _ => None,
    };

    let mut data = data_account.data.borrow_mut();
    // deserialize data living on Solana into Rust struct
    let mut data_struct: ComputeResult = ComputeResult::try_from_slice(&data)?;
    data_struct.result = result;

    // Serialize the updated counter data back into the account
    data_struct.serialize(&mut &mut data[..])?;

    Ok(())
}
