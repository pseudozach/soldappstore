import Wallet from '@project-serum/sol-wallet-adapter';
import { Account,Connection, SystemProgram,Transaction,TransactionInstruction, clusterApiUrl } from '@solana/web3.js';

const someCommonValues = ['common', 'values'];

export const doSomethingWithInput = (theInput) => {
   //Do something with the input
   return theInput;
};

export const justAnAlert = () => {
   alert('hello');
};

export const sendTransaction = async (network,connection,wallet) => {
    try {

      if(network.includes("devnet")){
        console.log("requesting aidrop on devnet");
        const {feeCalculator} = await connection.getRecentBlockhash();
        let fees = 0;
        fees += feeCalculator.lamportsPerSignature * 100;

        var airdropreq = await connection.requestAirdrop(wallet.publicKey, fees);
        console.log("airdropreq: ", airdropreq);        
      }


      let instruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: 100,
      });



      //directly via web3 / not wallet
      // let signature = '';
      // let signature = await web3.sendAndConfirmTransaction(
      //   this.web3sol,
      //   transaction,
      //   [this.state.account],
      //   {confirmations: 1},
      // );
      // try {

      // } catch (err) {
      //   // Transaction failed but fees were still taken

      //   this.postWindowMessage('addFundsResponse', {err: true});
      //   throw err;
      // }



      //sol-adapter method
      let transaction = new Transaction();
      // instructions.forEach((instruction) => 
      transaction.add(instruction);
      console.log('Getting recent blockhash');
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      console.log("wallet: ", wallet);
      transaction.setSigners(
        // fee payied by the wallet owner
        wallet.publicKey,
        // ...signers.map((s) => s.publicKey)
      );
      // or this
      // transaction.feePayer = wallet.publicKey;

      // if (signers.length > 0) {
      //   transaction.partialSign(...signers);
      // }
      console.log('Sending signature request to wallet: ', transaction);
      let signed = await wallet.signTransaction(transaction);

      console.log('Got signature, submitting transaction');
      let signature = await connection.sendRawTransaction(signed.serialize());
      console.log('Submitted transaction ' + signature + ', awaiting confirmation');
      await connection.confirmTransaction(signature, 1);
      console.log('Transaction ' + signature + ' confirmed');
    } catch (e) {
      console.warn(e);
      console.log('Error: ' + e.message);
      // this.setState({
      //   balance: await this.web3sol.getBalance(this.state.account.publicKey),
      // });
    }
  };


