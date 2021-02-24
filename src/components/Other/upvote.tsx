import React, { useEffect,useState,useCallback, useRef } from "react";
import { useConnection, useConnectionConfig } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { notify } from "../../utils/notifications";
import { LABELS } from "../../constants";
// import "./loading.less";

// import Jazzicon from "jazzicon";
// import bs58 from "bs58";
// import "./style.less";
import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";

import { Button, Tooltip, Spin, Avatar, Statistic } from 'antd';
import { InfoCircleOutlined, UpCircleOutlined, LoadingOutlined } from "@ant-design/icons";

import * as firebase from 'firebase/app';
import { Dapp } from "../../models/dapp";

import db from "../../lib/firebase.js";

import { paytovote, addVotes, countVotes } from "../../actions/index";

const largeloadingcss = {
  fontSize: 32,
  margin: 2,
}

export const Upvote = (props: {
  post?: Dapp;
  address?: string | PublicKey;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const { style, className, post } = props;
  // const address =
  //   typeof props.address === "string"
  //     ? props.address
  //     : props.address?.toBase58();
  // const ref = useRef<HTMLDivElement>();

  const connection = useConnection();
  const connectionConfig = useConnectionConfig();
  // const sendTransaction = useSendTransaction();
  const { publicKey, wallet } = useWallet();

  const [isVoting, setVoting] = useState(false);
  const [votedPosts, setVotedPosts] = useState([]);

  // useEffect(() => {
  //   if (address && ref.current) {
  //     ref.current.innerHTML = "";
  //     ref.current.className = className || "";
  //     ref.current.appendChild(
  //       Jazzicon(
  //         style?.width || 16,
  //         parseInt(bs58.decode(address).toString("hex").slice(5, 15), 16)
  //       )
  //     );
  //   }
  // }, [address, style, className]);

    // <div className="identicon-wrapper" ref={ref as any} style={props.style} />

  // async function sendTransaction() {
  //   const ffwalletpubkey = new PublicKey("5UKn68ZUEnvdJUzY1WAMTEFsJXNS1L9mL94CgfgRbHn1");
  //   try {
  //     let transaction = SystemProgram.transfer({
  //       fromPubkey: publicKey,
  //       toPubkey: ffwalletpubkey,
  //       lamports: 100,
  //     });
  //     console.log('Getting recent blockhash');
  //     transaction.recentBlockhash = (
  //       await connection.getRecentBlockhash()
  //     ).blockhash;
  //     console.log('Sending signature request to wallet');
  //     let signed = await wallet.signTransaction(transaction);
  //     console.log('Got signature, submitting transaction');
  //     let signature = await connection.sendRawTransaction(signed.serialize());
  //     console.log('Submitted transaction ' + signature + ', awaiting confirmation');
  //     await connection.confirmTransaction(signature, 1);
  //     console.log('Transaction ' + signature + ' confirmed');
  //   } catch (e) {
  //     console.warn(e);
  //     console.log('Error: ' + e.message);
  //   }
  // }

  const handleClick = async () => {
    if(!publicKey){
      // console.log("props.post: ", props.post, props.post!.id);
      notify({
        message: "Wallet not connected.",
        type: "error",
      });
      return;      
    }
    setVoting(true);

    const dappPubkey = new PublicKey(props.post?.pubkey!);
    let result = await addVotes(connectionConfig.env, dappPubkey, wallet, publicKey, connection);
    let count = await countVotes (dappPubkey, connection);
    // let result = await paytovote(wallet, publicKey, connection);
    console.log("addVotes, count result: ",result, count);

    //mapping is 1 vote on blockchain = 1million lamports = 0.001 SOL

    // sync fs db to blockchain
    if(!result.message){
      let upvoteref = db.collection("dapps").doc(props.post!.id);
      // const increment = firebase.default.firestore.FieldValue.increment(1);
      upvoteref.update({ upVotesCount: count/1000 });
      notify({
        message: "Upvote Successful",
        type: "success",
      });
    } else {
      notify({
        message: 'Error: ' + result.message,
        type: "error",
      });
    }


    // try {
    //   // let transaction = SystemProgram.transfer({
    //   //   fromPubkey: publicKey,
    //   //   toPubkey: ffwalletpubkey,
    //   //   lamports: 100,

    //   // });

    //   // ff wallet address: 5UKn68ZUEnvdJUzY1WAMTEFsJXNS1L9mL94CgfgRbHn1
    //   const ffwalletpubkey = new PublicKey("5UKn68ZUEnvdJUzY1WAMTEFsJXNS1L9mL94CgfgRbHn1");
    //   const transfer = SystemProgram.transfer({
    //     fromPubkey: publicKey,
    //     toPubkey: ffwalletpubkey,
    //     lamports: 1000,
    //   });
    //   let transaction = new Transaction();
    //   transaction.add(transfer);
    //   console.log('Getting recent blockhash');
    //   // transaction.recentBlockhash = (
    //   //   await connection.getRecentBlockhash()
    //   // ).blockhash;
    //   const recentbh = await connection.getRecentBlockhash("max");
    //   console.log("recentbh: ", recentbh);
    //   transaction.recentBlockhash = recentbh.blockhash;
    //   transaction.feePayer = publicKey;
    //   console.log('Sending signature request to wallet tx: ', transaction, "wallet: ", wallet);
    //   let signed = await wallet?.signTransaction(transaction);
    //   console.log('Got signature, submitting transaction: ', signed);
    //   let options = {
    //     skipPreflight: true,
    //     commitment: "singleGossip",
    //   };
    //   let signature = await connection.sendRawTransaction(signed!.serialize(), options);
    //   console.log('Submitted transaction ' + signature + ', awaiting confirmation');
    //   await connection.confirmTransaction(signature, undefined);//"singleGossip"
    //   console.log('Transaction ' + signature + ' confirmed');

    //   let upvoteref = db.collection("dapps").doc(props.post!.id);
    //   const increment = firebase.default.firestore.FieldValue.increment(1);
    //   upvoteref.update({ upVotesCount: increment });
    // } catch (e) {
    //   console.warn(e);
    //   // console.log('Error: ' + e.message);
    //   notify({
    //     message: 'Error: ' + e.message,
    //     type: "error",
    //   });
    // }


    // const badProgramId = {
    //   keys: [
    //     {pubkey: publicKey, isSigner: true, isWritable: true},
    //     {pubkey: ffwalletpubkey, isSigner: false, isWritable: true},
    //   ],
    //   // programId: StakeProgram.programId,
    //   // data: Buffer.from([2, 0, 0, 0]),
    // };
    // const tinstruction = new TransactionInstruction(badProgramId);

    // await connection.sendTransaction(uptx, wallet?);


    // ConnectWallet.sendTransaction();

    // // Do calculation to save the vote.
    // let upVotesCount = props.post!.upVotesCount;
    // let downVotesCount = props.post!.downVotesCount;

    // const date = new Date();

    // if (type === "upvote") {
    //   upVotesCount = upVotesCount + 1;
    // } else {
    //   downVotesCount = downVotesCount + 1;
    // }

    // db.collection("posts")
    // console.log("props.post: ", props.post);

    // console.log("props.post: ", props.post);

    // old method
    // await db.collection("dapps")
    //   .doc(props.post!.id).set({
    //   title: props.post!.title,
    //   description: props.post!.description,
    //   category: props.post!.category,
    //   upVotesCount,
    //   downVotesCount,
    //   createdAt: props.post!.createdAt,
    //   updatedAt: date.toUTCString(),
    // });

    // Disable the voting button once the voting is successful.
    // handleDisablingOfVoting(post.id);
    setVoting(false);
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 32, margin: 3 }} spin />;

    // shape="" type="primary" , color: '#08c'
          // <Statistic title="SOL" value={props.post?.upVotesCount} />

  return (
    <>
    <div style={{display: "flex", flexDirection: "column"}}>
      {isVoting ? (<Spin indicator={antIcon} style={{display: "flex", justifyContent: "center", alignItems: "center"}}/>) : 
      (<Button icon={<UpCircleOutlined style={{ fontSize: '32px'}}/>} 
              style={{width: "fit-content", height: "auto", fontSize: '32px'}}
              type="primary"
              loading={isVoting}
              onClick={handleClick}
              >
      </Button>)}
      <Avatar shape="square" size={64} style={{width: "100%", flex: 1, background: "inherit"}}>{props.post?.upVotesCount}</Avatar>
      <p style={{flex: 2}}>SOL</p>
    </div>
    </>
  );
};
