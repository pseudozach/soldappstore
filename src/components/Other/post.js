import { Box, HStack, Text } from "@chakra-ui/core";
import React, {useState} from "react";
import VoteButtons from "./vote-buttons";
import { Upvote } from "./upvote";
import { Button, Col, Row, Card, Tag } from "antd";
import { ExternalLinkIcon } from '@chakra-ui/icons'

    // <HStack key={post.id} w="100%" alignItems="flex-start">
    //   <VoteButtons post={post} />
    //   <Box bg="gray.100" p={4} rounded="md" w="100%">
    //     <Text>Title: {post.title}</Text>
    //     <Text>Description: {post.description}</Text>
    //     <Text>Category: {post.category}</Text>
    //   </Box>
    // </HStack>



const tagcolors = ["magenta","red","volcano","orange","gold","lime","green","cyan","blue","geekblue","purple"];
// const tagmap = ({ tag, index }) => {
//   console.log("tag, index: ", tag, index);
//   if(tag.toLowerCase() == "defi"){
//     return '<Tag color="magenta">{tag}</Tag>';
//   }
  
// }

 // , callback 
const Post = ({ post }) => {

  const [isReload, setReload] = useState(false);

  const handleClick = async () => {
    // console.log("tag clicked");
    setReload(true);
  }

  // this.state = {
  //   reload: false
  // }
  // function shouldReload() {
  //   this.setState({reload:!this.state.reload});
  // }

  // (tag)
    // <Button 
    //           type="link"
    //           href={"/#/" + tag}
    //           onClick={callback(tag)}
    //           style={{"padding": 0}}>
    //           </Button>


  const tagarray = post.category.split(",");

  return (
    <div style={{ width: "100%", margin: 10, display:"flex" }}>
      <Upvote post={post} />
      <Card 
        title={post.title} 
        key={post.id} 
        style={{ width: "100%"}}
        hoverable={true}
        actions={[
          <Button type="seconday" 
            href={post.link}
            target={"_blank"}
            icon={<ExternalLinkIcon />}>
             Open Dapp
          </Button>,
        ]}
       >
        <div>
          <p style={{margin: 4}}>{post.description}</p>

        </div>
        <div style={{margin: 4}}>
          {tagarray && tagarray.map((tag, index) => (
            <Tag color={tagcolors[index]}>{tag}</Tag>
          ))}
         </div>
      </Card>
    </div>
  );
};

export default Post;
