import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button, Col, Row, Card, Tag } from "antd";
import React, { useEffect,useState, useMemo } from "react";
import { Link, useParams, useLocation, useHistory } from "react-router-dom";
import { ConnectButton } from "../../components/ConnectButton";
import { useNativeAccount } from "../../contexts/accounts";
import { useConnectionConfig } from "../../contexts/connection";
import { useMarkets } from "../../contexts/market";
import { formatNumber } from "../../utils/utils";

import { Container, Flex, Spinner, VStack } from "@chakra-ui/core";
import Navbar from "../other/navbar";
import Post from "../../components/Other/post";
import db from "../../lib/firebase";

import * as firebase from 'firebase/app';
import { Dapp } from "../../models/dapp";

// import Timestamp = firebase.firestore.Timestamp

export const HomeView = (props: any) => {
  // console.log("props: ", props);

  const { marketEmitter, midPriceInUSD } = useMarkets();
  const { tokenMap } = useConnectionConfig();
  const { account } = useNativeAccount();
  const history = useHistory();
  const { CheckableTag } = Tag;
  const tagsData = ['defi', 'amm', 'dex', 'wallet'];

  const [posts, setPosts] = useState<Dapp[]| null>();
  const [isLoading, setLoading] = useState(true);
  const [selectedtag, setSelectedtag] = useState<string>("");

  function handleChange(tag: string, checked: boolean) {
    if(!checked){
      setSelectedtag("");  
      updateFB("");
    } else {
      setSelectedtag(tag);
      updateFB(tag);
    }
    
    // const { selectedTags } = this.state;
    // const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
    console.log('You are interested in: ', selectedtag, tag, checked);
    
    // this.setState({ selectedTags: nextSelectedTags });
  }
  // const [isReload, setReload] = useState(false);

  const location = useLocation();
  // console.log("location :" ,location.pathname);

  // const { id } = useParams();

  // interface RouteParams {
  //   slug: string
  // }
  // const params = useParams<RouteParams>();
  // console.log("params: ", params);

  // let { tag } : any = useParams();
  // console.log("tag: ", tag);

  // const { id } = useParams<{ id: string }>();
  // const query = new URLSearchParams(props.location.search);

  // console.log("before: ", props?.match.params);  
  // let tag = "";
  // if(props?.match.params.slug){
  //   tag = props?.match.params.slug
  //   console.log("tag: ", tag);
  // }
  


  // const balance = useMemo(
  //   () => formatNumber.format((account?.lamports || 0) / LAMPORTS_PER_SOL),
  //   [account]
  // );

  // tag: any
  // const updateThings = (taginput: any) => {
  //   console.log("updateThings: ", props?.match.params, tag, taginput);
  //   console.log("location :" ,location.pathname);
  //   // setReload(true);
  //   // if(props?.match.params.slug){
  //   //   tag = props?.match.params.slug
  //   //   console.log("set tag: ", tag);
  //   // }
  //   // updateFB();
  // }
  // const noTag = () => {
  //   console.log("noTag");
  //   tag = "";
  //   updateFB();
  //   history.push('/');
  // }
  // function filterData(tag: string) {
  //   // body...

  //       // db.collection("posts")
  //   db.collection("dapps")
  //     // .orderBy("createdAt", "desc")
  //     .where("category", ">=", tag)
  //     .orderBy("upVotesCount", "desc")
  //     .onSnapshot((querySnapshot) => {
  //       // const _posts = [];
  //       const _posts = new Array<Dapp>();

  //       querySnapshot.forEach((doc) => {
  //         _posts.push({
  //           id: doc.id,
  //           ...doc.data() as Dapp
  //         });
  //         // _posts.push(doc.data() as Dapp)
  //       });

  //       console.log("filtered data: ", _posts);
  //       setPosts(_posts);
  //     });

  // }

  function updateFB (tag: string) {

    let dappsref;

    // db.collection("posts")
    let collref = db.collection("dapps")
      // .orderBy("createdAt", "desc");
      

      if(tag && tag != ""){
        console.log("added tag: ", tag);
        // dappsref = collref.where("category", ">=", tag);
        dappsref = collref.where('categories', "array-contains", tag);
      } else {
       dappsref = collref.orderBy("upVotesCount", "desc");
      }

      dappsref?.get()
      .then((querySnapshot) => {
        //works
        // const data = querySnapshot.docs.map((doc) => (doc.data() as Dapp));

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Dapp
        }));
        // const data = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));        

        console.log("got data - dapps: ", data);
        setPosts(data);
        setLoading(false);
      });

  }


  useEffect(() => {
    // Hook to handle the initial fetching of posts
    updateFB("");

  }, []);

  useEffect(() => {
    // Hook to handle the real-time updating of posts whenever there is a
    // change in the datastore (https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots)
    let dappsref;
    // db.collection("posts")
    let collref = db.collection("dapps")
      // .orderBy("createdAt", "desc");

      // console.log("checking tag: ", tag);
      if(selectedtag && selectedtag != ""){
        console.log("added tag: ", selectedtag);
        // dappsref = collref.where("category", ">=", tag);
        dappsref = collref.where('categories', "array-contains", selectedtag);
      } else {
        // console.log("upVotesCount desc: ");
       dappsref = collref.orderBy("upVotesCount", "desc");
      }

      dappsref?.onSnapshot((querySnapshot) => {
        // const _posts = [];
        const _posts = new Array<Dapp>();

        querySnapshot.forEach((doc) => {
          _posts.push({
            id: doc.id,
            ...doc.data() as Dapp
          });
          // _posts.push(doc.data() as Dapp)
        });

        console.log("2 got data - dapps: ", _posts);
        setPosts(_posts);
      });

  }, []);

  // useEffect(() => {
  //   const refreshTotal = () => {};

  //   const dispose = marketEmitter.onMarket(() => {
  //     refreshTotal();
  //   });

  //   refreshTotal();

  //   return () => {
  //     dispose();
  //   };
  // }, [marketEmitter, midPriceInUSD, tokenMap]);

      // <Col span={24}>
      //   <h2>Your balance: {balance} SOL</h2>
      // </Col>

      // <Col span={12}>
      //   <ConnectButton />
      // </Col>
      // <Col span={12}>
      //   <Link to="/faucet">
      //     <Button>Faucet</Button>
      //   </Link>
      // </Col>
      // <Col span={24}>
      //   <div className="builton" />
      // </Col>

    //  <Container maxW="md" centerContent p={8}>
    //     <VStack spacing={8} w="100%">
        

    //   </VStack>
    // </Container>

    // <h1>Dapp List</h1>
    // style={{fontSize: 32}}

  const tagcolors = ["magenta","red","volcano","orange","gold","lime","green","cyan","blue","geekblue","purple"];
  // const randomtagcolor = tagcolors[randomIntFromInterval(0,10)];

  // function randomIntFromInterval(min: any, max: any) { // min and max included 
  //   return Math.floor(Math.random() * (max - min + 1) + min);
  // }

  function catmap (category: string) {
    let color = "magenta";
    switch (category) {
      case "defi":
        color = "magenta";
        break;
      case "amm":
        color = "orange";
        break;
      case "dex":
        color = "lime";
        break;
      case "dex":
        color = "cyan";
        break;

      default:
        color = "magenta";
        break;
    }
    return color;
  }

  // {tag ? <Tag color={catmap(tag)} closable={true} onClose={noTag}>{tag}</Tag> : null}
  // callback={updateThings}

  return (
    <Row gutter={[16, 16]} align="middle">
      <Col span={4}></Col>
      <Col span={16}>
          <div style={{margin: 4}}>
            <span style={{ marginRight: 8 }}>Categories:</span>
            {tagsData.map(tag => (
              <CheckableTag
                key={tag}
                checked={selectedtag.indexOf(tag) > -1}
                onChange={checked => handleChange(tag, checked)}
              >
                {tag}
              </CheckableTag>
            ))}
          </div>
          {posts && posts.map((post) => (
            <Post post={post} key={post.id}/>
          ))}
      </Col>
      <Col span={4}></Col>
    </Row>
  );
};
