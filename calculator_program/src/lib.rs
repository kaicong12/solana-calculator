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
