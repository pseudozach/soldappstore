import { Button, Dropdown, Menu, Modal, Form, Input } from "antd";
import { ButtonProps } from "antd/lib/button";
import { FormInstance } from 'antd/lib/form';

import React from "react";
import { LABELS } from "../../constants";
import { useWallet } from "../../contexts/wallet";
import { useAccount } from "../../contexts/accounts";
import { PlusOutlined} from '@ant-design/icons';

import { useConnection, useConnectionConfig } from "../../contexts/connection";
import { paytovote, addDappPubkey, addVotes, countVotes } from "../../actions/index";
import { notify } from "../../utils/notifications";
import * as firebase from 'firebase/app';
import { Dapp } from "../../models/dapp";
import db from "../../lib/firebase.js";

import {
  Account,
  // Connection,
  // BpfLoader,
  // BPF_LOADER_PROGRAM_ID,
  // PublicKey,
  // LAMPORTS_PER_SOL,
  // SystemProgram,
  // TransactionInstruction,
  // Transaction,
  // sendAndConfirmTransaction,
} from '@solana/web3.js';
// export interface ConnectButtonProps
//   extends ButtonProps,
//     React.RefAttributes<HTMLElement> {
//   allowWalletChange?: boolean;
// }

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export const AddNewButton = (props: {}) => {
  // const { connected, connect, select, provider } = useWallet();
  // const { onClick, children, disabled, allowWalletChange, ...rest } = props;
  const connection = useConnection();
  const { publicKey, wallet } = useWallet();
  const connectionConfig = useConnectionConfig();
  const account = useAccount();

  // console.log("AddNewButton connectionConfig: ", connectionConfig);
  // console.log("AddNewButton connection: ", connection);
  // console.log("AddNewButton wallet: ", wallet);

  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [modalText, setModalText] = React.useState('Content of the modal')

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = async () => {
    // setModalText('The modal will be closed after two seconds');
    let formdata = formRef.current!.getFieldsValue();
    // console.log("got form: ", formdata);
    // console.log("2 got form: ", formdata.title);
    formdata.upVotesCount = 0;
    formdata.downVotesCount = 0;
    const date = new Date();
    formdata.createdAt = date.toUTCString();
    formdata.updatedAt = date.toUTCString();
    let categories = formdata.category.toLowerCase();
    categories = formdata.category.split(",");
    formdata.categories = categories;

    // console.log("3 got form: ", formdata);

    if(!publicKey){
      // console.log("props.post: ", props.post, props.post!.id);
      notify({
        message: "Wallet not connected.",
        type: "error",
      });
      return;      
    }
    setConfirmLoading(true);
    formRef.current!.resetFields();

    // simple payment
    // let result = await paytovote(wallet, publicKey, connection);
    // console.log("paytovote result: ", result);

    // add new dapp pubkey to program
    
    // // new dapp = new account
    // const dappAccount = new Account();
    let result = await addDappPubkey(connectionConfig.env, wallet, publicKey, connection);
    console.log("got dappPubkey: ", result);
    formdata.pubkey = result.dappPubkey;
    formdata.programId = result.programId;

    console.log("saving dapp: ", formdata);

    if(!result.message){
      // add new doc
      await db.collection("dapps").add(formdata);
      notify({
        message: "Dapp Saved Successfully",
        type: "success",
      });
    } else {
      notify({
        message: 'Error: ' + result.message,
        type: "error",
      });
    }

    
    setVisible(false);
    

    // setTimeout(() => {
    //   setVisible(false);
    //   setConfirmLoading(false);
    // }, 2000);

  };

  const handleCancel = () => {
    // console.log('Clicked cancel button');
    setVisible(false);
  };

  let formRef = React.createRef<FormInstance>();
  // const onFinish = (values: any) => {
  //   console.log(values);
  // };

  // const onReset = () => {
  //   formRef.current!.resetFields();
  // };

  // const onFill = () => {
  //   formRef.current!.setFieldsValue({
  //     note: 'Hello world!',
  //     gender: 'male',
  //   });
  // };

  // only show if wallet selected or user connected

  // const menu = (
  //   <Menu>
  //     <Menu.Item key="3" onClick={select}>
  //       Change Wallet
  //     </Menu.Item>
  //   </Menu>
  // );

  // if (!provider || !allowWalletChange) {
  //   return (
  //     <Button
  //       {...rest}
  //       onClick={connected ? onClick : connect}
  //       disabled={connected && disabled}
  //     >
  //       {connected ? props.children : LABELS.CONNECT_LABEL}
  //     </Button>
  //   );
  // }

  return (
    <>
    <Button type="primary" 
      icon={<PlusOutlined />}
      onClick={showModal}
      style={{marginRight: 2}}
      >
      Add New Dapp
    </Button>
    <Modal
      title="Add New Dapp"
      visible={visible}
      onOk={handleOk}
      okText="Submit"
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Form {...layout} ref={formRef} name="control-ref">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="link" label="Link" rules={[{ type: "url", required: true, message: 'Please input website URL' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true}]}>
          <Input />
        </Form.Item>
      </Form>

    </Modal>
    </>
  );
};


