import React from "react";
import "./../../App.less";
import { Layout } from "antd";
import { Link } from "react-router-dom";

import { LABELS } from "../../constants";
import { AppBar } from "../AppBar";
const { Header, Content } = Layout;

// import { Container, Flex, Spinner, VStack } from "@chakra-ui/core";

export const AppLayout = React.memo((props: any) => {
  return (
    <div className="App wormhole-bg">
      <Layout>
        <Header className="App-Bar">
          <Link to="/">
            <div className="app-title" style={{display: "flex", alignItems: "center"}}>
              <img src="icon.png" style={{width: 32}}/>
              <h2>Solana Dapp Store</h2>
            </div>
          </Link>
          <AppBar />
        </Header>
        <Content style={{ padding: "0 50px" }}>{props.children}</Content>
      </Layout>
    </div>
  );
});
