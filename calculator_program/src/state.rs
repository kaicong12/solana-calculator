use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_error::ProgramError;
pub enum Instructions {
    Initialize,
    Calculate {
        val1: i32,
        val2: i32,
        operator: String,
    },
}

impl Instructions {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // first byte of instruction data tells you which instruction
        let (variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        match variant {
            0 => Ok(Self::Initialize),
            1 => {
                // we know that the next
                // 4 (val1) +
                // 4 (val2) +
                // 1 variable length (tells you operator bytes x) +
                // x (operator)
                let val1 = rest
                    .get(..4)
                    .and_then(|slice| slice.try_into().ok())
                    .map(i32::from_le_bytes)
                    .ok_or(ProgramError::InvalidInstructionData)?;

                // Next 4 bytes: val2
                let val2 = rest
                    .get(4..8)
                    .and_then(|slice| slice.try_into().ok())
                    .map(i32::from_le_bytes)
                    .ok_or(ProgramError::InvalidInstructionData)?;

                // Next byte passed from client: operator_len (u8)
                let operator_len = *rest.get(8).ok_or(ProgramError::InvalidInstructionData)?;

                let start: usize = 9;
                let end: usize = start + operator_len as usize;
                if end as usize > rest.len() {
                    return Err(ProgramError::InvalidInstructionData);
                }

                let operator_bytes = rest
                    .get(start..end)
                    .ok_or(ProgramError::InvalidInstructionData)?;

                let operator_string = std::str::from_utf8(operator_bytes)
                    .map_err(|_| ProgramError::InvalidInstructionData)?;

                Ok(Instructions::Calculate {
                    val1,
                    val2,
                    operator: String::from(operator_string),
                })
            }
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct ComputeResult {
    pub result: Option<i32>,
}
