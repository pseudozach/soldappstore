import { Box, HStack, Text } from "@chakra-ui/core";
import React from "react";
import VoteButtons from "./vote-buttons";

const Post = ({ post }) => {
  return (
    <HStack key={post.id} w="100%" alignItems="flex-start">
      <VoteButtons post={post} />
      <Box bg="gray.100" p={4} rounded="md" w="100%">
        <Text>Title: {post.title}</Text>
        <Text>Description: {post.description}</Text>
        <Text>Category: {post.category}</Text>
      </Box>
    </HStack>
  );
};

export default Post;
