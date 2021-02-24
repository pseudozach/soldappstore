import {
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  HStack,
  useDisclosure,
} from "@chakra-ui/core";
import React, { useState, useMemo, useEffect } from "react";
import db from "../../lib/firebase.js";
// import {sendTransaction} from './utils'

import Wallet from '@project-serum/sol-wallet-adapter';
import { Account,Connection, SystemProgram,Transaction,TransactionInstruction, clusterApiUrl } from '@solana/web3.js';

const ConnectWallet = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [balance, setBalance] = useState("");
  const [network, setNetwork] = useState(clusterApiUrl('devnet'));

  // const handleSubmit = async () => {
  //   setSaving(true);

  //   const date = new Date();

  //   // await db.collection("posts").add({
  //   //   title,
  //   //   upVotesCount: 0,
  //   //   downVotesCount: 0,
  //   //   createdAt: date.toUTCString(),
  //   //   updatedAt: date.toUTCString(),
  //   // });
  //   await db.collection("dapps").add({
  //     title,
  //     description,
  //     category,
  //     upVotesCount: 0,
  //     downVotesCount: 0,
  //     createdAt: date.toUTCString(),
  //     updatedAt: date.toUTCString(),
  //   });

  //   onClose();
  //   setTitle("");
  //   setDescription("");
  //   setCategory("");
  //   setSaving(false);
  // };



  //sol wallet stuff
  // const network = clusterApiUrl('devnet');
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');

  const connection = useMemo(() => new Connection(network), [network]);
  const wallet = useMemo(() => new Wallet(providerUrl, network), [
    providerUrl,
    network,
  ]);
  const [, setConnected] = useState(false);

  useEffect(() => {
    wallet.on('connect', () => {
      setConnected(true);
      console.log('Connected to wallet ' + wallet.publicKey.toBase58());
    });
    wallet.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from wallet');
    });
    return () => {
      wallet.disconnect();
    };
  }, [wallet]);

  // sendTransaction(network,connection,wallet);

  return (
    <>
      {wallet.connected ? (
        <>
          <div>Wallet address: {wallet.publicKey.toBase58()}.</div>
          <Button onClick="" colorScheme="blackAlpha">Send Transaction</Button>
        </>
      ) : (
        <Button onClick={() => wallet.connect()} colorScheme="blackAlpha" mr={1}>Connect Wallet</Button>
      )}
    </>
  );
};

export default ConnectWallet;
