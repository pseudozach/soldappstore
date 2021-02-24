use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    info,
    program_error::ProgramError,
    pubkey::Pubkey,
};
// use solana_program::{
//     account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
//     pubkey::Pubkey,
// };
use std::mem;
// use std::str::from_utf8;

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    info!("DappStore Rust program entrypoint");

    // Iterating accounts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        info!("Dapp does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // The data must be large enough to hold a u64 count
    if account.try_data_len()? < mem::size_of::<u32>() {
        info!("Dapp data length too small for u32");
        return Err(ProgramError::InvalidAccountData);
    }

    // save some string data
    // let memo = from_utf8(_instruction_data).map_err(|err| {
    //     //  err.valid_up_to()
    //     info!("Invalid UTF-8, from byte {} ");
    //     ProgramError::InvalidInstructionData
    // })?;

    // let mut data = account.try_borrow_mut_data()?;
    // // let mut num_greets = LittleEndian::read_u32(&data);
    // // 1st 10 bytes = app name
    // let appname = LittleEndian::read_u32(&data[0..10]);

    // // 2nd 10 bytes = description
    // let appdescription = LittleEndian::read_u32(&data[10..20]);

    // // 3rd 10 bytes = category
    // let appcategory = LittleEndian::read_u32(&data[20..30]);

    // // 4th 10 bytes = votes can be - x to + x
    // let appvote = LittleEndian::read_u32(&data[40..50]);

    // // have some checks and then increment or decrement vote
    // LittleEndian::write_u32(&mut data[40..50], appvote + 1);
    // info!("incremented appvote!");

    // msg!("Memo (len {}): {:?}", memo.len(), memo);
    // info!("Memo (len {}): {:?}" + memo.len()+", " +memo);

    // Increment and store the number of times the account has been greeted
    let mut data = account.try_borrow_mut_data()?;
    let mut appvotes = LittleEndian::read_u32(&data);
    appvotes += 1;
    LittleEndian::write_u32(&mut data[0..], appvotes);

    info!("Saved dappvotes!");

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u64>()];
        LittleEndian::write_u64(&mut data, 0);
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        assert_eq!(LittleEndian::read_u64(&accounts[0].data.borrow()), 0);
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(LittleEndian::read_u64(&accounts[0].data.borrow()), 1);
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(LittleEndian::read_u64(&accounts[0].data.borrow()), 2);
    }
}



// tests
// #[cfg(test)]
// mod test {
//     use super::*;
//     use solana_program::clock::Epoch;

//     #[test]
//     fn test_sanity() {
//         // mock program id

//         let program_id = Pubkey::default();

//         // mock accounts array...

//         let key = Pubkey::default(); // anything
//         let mut lamports = 0;

//         let mut data = vec![0; 2 * mem::size_of::<u32>()];
//         LittleEndian::write_u32(&mut data[0..4], 0); // set storage to zero
//         LittleEndian::write_u32(&mut data[4..8], 0);

//         let owner = Pubkey::default();

//         let account = AccountInfo::new(
//             &key,             // account pubkey
//             false,            // is_signer
//             true,             // is_writable
//             &mut lamports,    // balance in lamports
//             &mut data,        // storage
//             &owner,           // owner pubkey
//             false,            // is_executable
//             Epoch::default(), // rent_epoch
//         );

//         let mut instruction_data: Vec<u8> = vec![0];

//         let accounts = vec![account];

//         assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[0..4]), 0);
//         assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[4..8]), 0);

//         // vote for candidate 1

//         instruction_data[0] = 1;
//         process_instruction(&program_id, &accounts, &instruction_data).unwrap();
//         assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[0..4]), 1);
//         assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[4..8]), 0);

//         // vote for candidate 2

//         instruction_data[0] = 2;
//         process_instruction(&program_id, &accounts, &instruction_data).unwrap();
//         assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[0..4]), 1);
//         assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[4..8]), 1);
//     }
// }