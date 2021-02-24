import { Box, Container, Flex,Spacer,Heading } from "@chakra-ui/core";
import React from "react";
import AddNewPost from "./add-new-post";
import ConnectWallet from "./connect-wallet";

// <Flex justifyContent="flex-end" w="100%" position="sticky" top={0}>
//           <AddNewPost />
//         </Flex>
// position="sticky" top={0} p={4}

const Navbar = () => {
  return (
    <Box bg="gray.100" zIndex={1} p={4}>
      <Container maxW="md" >
		<Flex>
		  <Box p="2">
		    <Heading size="md">Sol Dapp Store</Heading>
		  </Box>
		  <Spacer />
		  <Box>
		    <ConnectWallet />
		  </Box>
		  <Box>
		    <AddNewPost />
		  </Box>
		</Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
