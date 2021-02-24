import { AccountLayout, MintLayout, Token } from "@solana/spl-token";
import {
  Account,
  Connection,
  Transaction,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BufferLayout from 'buffer-layout';
import { TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT } from "../utils/ids";
import { TokenAccount } from "../models";
import { cache, TokenAccountParser } from "./../contexts/accounts";

import * as firebase from 'firebase/app';
import { Dapp } from "../models/dapp";
import db from "../lib/firebase.js";
import { WalletAdapter } from "../contexts/wallet";
// import { useConnectionConfig } from "../contexts/connection";
import { useAccount } from "../contexts/accounts";


// ff wallet address: 5UKn68ZUEnvdJUzY1WAMTEFsJXNS1L9mL94CgfgRbHn1
const ffwalletpubkey = new PublicKey("5UKn68ZUEnvdJUzY1WAMTEFsJXNS1L9mL94CgfgRbHn1");
const paymentSize = 1000000;

export function ensureSplAccount(
  instructions: TransactionInstruction[],
  cleanupInstructions: TransactionInstruction[],
  toCheck: TokenAccount,
  payer: PublicKey,
  amount: number,
  signers: Account[]
) {
  if (!toCheck.info.isNative) {
    return toCheck.pubkey;
  }

  const account = createUninitializedAccount(
    instructions,
    payer,
    amount,
    signers
  );

  instructions.push(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      WRAPPED_SOL_MINT,
      account,
      payer
    )
  );

  cleanupInstructions.push(
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      account,
      payer,
      payer,
      []
    )
  );

  return account;
}

export const DEFAULT_TEMP_MEM_SPACE = 65548;

export function createTempMemoryAccount(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  signers: Account[],
  owner: PublicKey,
  space = DEFAULT_TEMP_MEM_SPACE
) {
  const account = new Account();
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account.publicKey,
      // 0 will evict/close account since it cannot pay rent
      lamports: 0,
      space: space,
      programId: owner,
    })
  );

  signers.push(account);

  return account.publicKey;
}

export function createUninitializedMint(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  amount: number,
  signers: Account[]
) {
  const account = new Account();
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account.publicKey,
      lamports: amount,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  signers.push(account);

  return account.publicKey;
}

export function createUninitializedAccount(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  amount: number,
  signers: Account[]
) {
  const account = new Account();
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account.publicKey,
      lamports: amount,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  signers.push(account);

  return account.publicKey;
}

export function createTokenAccount(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  accountRentExempt: number,
  mint: PublicKey,
  owner: PublicKey,
  signers: Account[]
) {
  const account = createUninitializedAccount(
    instructions,
    payer,
    accountRentExempt,
    signers
  );

  instructions.push(
    Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mint, account, owner)
  );

  return account;
}

export const paytovote = async (wallet: WalletAdapter | undefined, publicKey: PublicKey, connection: Connection) => {
    try {
    // let transaction = SystemProgram.transfer({
    //   fromPubkey: publicKey,
    //   toPubkey: ffwalletpubkey,
    //   lamports: 100,

    // });

    const transfer = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: ffwalletpubkey,
      lamports: paymentSize,
    });
    let transaction = new Transaction();
    transaction.add(transfer);
    // console.log('Getting recent blockhash');
    // transaction.recentBlockhash = (
    //   await connection.getRecentBlockhash()
    // ).blockhash;
    const recentbh = await connection.getRecentBlockhash("max");
    // console.log("recentbh: ", recentbh);
    transaction.recentBlockhash = recentbh.blockhash;
    transaction.feePayer = publicKey;
    // console.log('Sending signature request to wallet tx: ', transaction, "wallet: ", wallet);
    let signed = await wallet?.signTransaction(transaction);
    // console.log('Got signature, submitting transaction: ', signed);
    let options = {
      skipPreflight: true,
      commitment: "singleGossip",
    };
    let signature = await connection.sendRawTransaction(signed!.serialize(), options);
    console.log('Submitted transaction ' + signature + ', awaiting confirmation');
    await connection.confirmTransaction(signature, undefined);//"singleGossip"
    console.log('Transaction ' + signature + ' confirmed');

    return signature;
  } catch (e) {
    console.warn(e);
    // console.log('Error: ' + e.message);
    return e;
  }
}

const greetedAccountDataLayout = BufferLayout.struct([
  BufferLayout.u32('numGreets'),
]);

// , payerAccount: Account
export const addDappPubkey = async (env: string, wallet: WalletAdapter | undefined, publicKey: PublicKey, connection: Connection) => {
  let programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  if(env == "devnet"){
    programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  } else if (env == "tesnet"){
    programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  } else if (env == "mainnet-beta"){
    programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  }
  // devnet hello programid = 9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89
  
  // const store = new Store();
  try {
    // Create the greeted account
    const dappAccount = new Account();
    let dappPubkey = dappAccount.publicKey;
    console.log('addpubkey Creating account', dappPubkey.toBase58(), 'to vote for');
    const space = greetedAccountDataLayout.span;
    const lamports = await connection.getMinimumBalanceForRentExemption(
      greetedAccountDataLayout.span,
    );
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: dappPubkey,
        lamports,
        space,
        programId,
      }),
    );

    //instruction to take payment for the vote
    const transfer = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: ffwalletpubkey,
      lamports: paymentSize,
    });
    transaction.add(transfer);

    //instead of sendAndConfirmTransaction
    const recentbh = await connection.getRecentBlockhash("max");
    // console.log("recentbh: ", recentbh);
    transaction.recentBlockhash = recentbh.blockhash;
    transaction.feePayer = publicKey;
    // console.log('Sending signature request to wallet tx: ', transaction, "wallet: ", wallet);
    transaction.setSigners(
      // fee payied by the wallet owner
      publicKey,
      dappAccount.publicKey
    );
    // if (signers.length > 0) {
      transaction.partialSign(dappAccount);
    // }
    let signed = await wallet?.signTransaction(transaction);
    // console.log('Got signature, submitting transaction: ', signed);
    let options = {
      skipPreflight: true,
      commitment: "singleGossip",
    };
    let signature = await connection.sendRawTransaction(signed!.serialize(), options);
    console.log('Submitted transaction ' + signature + ', awaiting confirmation');
    await connection.confirmTransaction(signature, undefined);//"singleGossip"
    console.log('addDappPubkey Transaction ' + signature + ' confirmed');

    // return signature;

    //I cant find payerAccount for this so
    // await sendAndConfirmTransaction(
    //   connection,
    //   transaction,
    //   [payerAccount, dappAccount],
    //   {
    //     commitment: 'singleGossip',
    //     preflightCommitment: 'singleGossip',
    //   },
    // );

    // Save this info for next time
    return {
    // await store.save('config1.json', {
      // url: urlTls,
      programId: programId.toBase58(),
      dappPubkey: dappPubkey.toBase58(),
    }
    // );    
  } catch (e) {
    console.log("addDappPubkey failed: ",e);
    return e;
  }


}

export const addVotes = async (env: string, dappPubkey: PublicKey, wallet: WalletAdapter | undefined, publicKey: PublicKey, connection: Connection) => {
  // devnet hello programid = 9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89
  let programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  if(env == "devnet"){
    programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  } else if (env == "tesnet"){
    programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  } else if (env == "mainnet-beta"){
    programId = new PublicKey("9HwErV9wfuLpr7GnXSREh1fF226wiWpB2eBXZQg4sR89");
  }

  try {
    console.log('adding votes to', dappPubkey.toBase58());
    const instruction = new TransactionInstruction({
      keys: [{pubkey: dappPubkey, isSigner: false, isWritable: true}],
      programId,
      data: Buffer.alloc(0), // All instructions are hellos
    });
    const transaction = new Transaction();
    transaction.add(instruction);

    //instruction to take payment for the vote
    const transfer = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: ffwalletpubkey,
      lamports: paymentSize,
    });
    transaction.add(transfer);


    //instead of sendAndConfirmTransaction
    const recentbh = await connection.getRecentBlockhash("max");
    // console.log("recentbh: ", recentbh);
    transaction.recentBlockhash = recentbh.blockhash;
    transaction.feePayer = publicKey;
    // console.log('Sending signature request to wallet tx: ', transaction, "wallet: ", wallet);
    transaction.setSigners(
      // fee payied by the wallet owner
      publicKey,
      // dappAccount.publicKey
    );
    // if (signers.length > 0) {
      // transaction.partialSign(dappAccount);
    // }
    let signed = await wallet?.signTransaction(transaction);
    // console.log('Got signature, submitting transaction: ', signed);
    let options = {
      skipPreflight: true,
      commitment: "singleGossip",
    };
    let signature = await connection.sendRawTransaction(signed!.serialize(), options);
    console.log('Submitted transaction ' + signature + ', awaiting confirmation');
    await connection.confirmTransaction(signature, undefined);//"singleGossip"
    console.log('Upvote Transaction ' + signature + ' confirmed');
    return true;
  } catch (e) {
    return e;
  }
  // await sendAndConfirmTransaction(
  //   connection,
  //   new Transaction().add(instruction),
  //   [payerAccount],
  //   {
  //     commitment: 'singleGossip',
  //     preflightCommitment: 'singleGossip',
  //   },
  // );
}

export const countVotes = async (dappPubkey: PublicKey, connection: Connection) => {
  try{
    const accountInfo = await connection.getAccountInfo(dappPubkey);
    if (accountInfo === null) {
      throw 'Error: cannot find the dapp account';
    }
    const info = greetedAccountDataLayout.decode(Buffer.from(accountInfo.data));
    console.log(
      dappPubkey.toBase58(),
      'has ',
      info.numGreets.toString(),
      'votes',
    );
    return info.numGreets.toString();
  } catch(e) {
    return e;
  }
}

// TODO: check if one of to accounts needs to be native sol ... if yes unwrap it ...
export function findOrCreateAccountByMint(
  payer: PublicKey,
  owner: PublicKey,
  instructions: TransactionInstruction[],
  cleanupInstructions: TransactionInstruction[],
  accountRentExempt: number,
  mint: PublicKey, // use to identify same type
  signers: Account[],
  excluded?: Set<string>
): PublicKey {
  const accountToFind = mint.toBase58();
  const account = cache
    .byParser(TokenAccountParser)
    .map((id) => cache.get(id))
    .find(
      (acc) =>
        acc !== undefined &&
        acc.info.mint.toBase58() === accountToFind &&
        acc.info.owner.toBase58() === owner.toBase58() &&
        (excluded === undefined || !excluded.has(acc.pubkey.toBase58()))
    );
  const isWrappedSol = accountToFind === WRAPPED_SOL_MINT.toBase58();

  let toAccount: PublicKey;
  if (account && !isWrappedSol) {
    toAccount = account.pubkey;
  } else {
    // creating depositor pool account
    toAccount = createTokenAccount(
      instructions,
      payer,
      accountRentExempt,
      mint,
      owner,
      signers
    );

    if (isWrappedSol) {
      cleanupInstructions.push(
        Token.createCloseAccountInstruction(
          TOKEN_PROGRAM_ID,
          toAccount,
          payer,
          payer,
          []
        )
      );
    }
  }

  return toAccount;
}
