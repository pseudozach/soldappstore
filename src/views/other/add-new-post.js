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
import React, { useState } from "react";
import db from "../../lib/firebase.js";

const AddNewPost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);

    const date = new Date();

    // await db.collection("posts").add({
    //   title,
    //   upVotesCount: 0,
    //   downVotesCount: 0,
    //   createdAt: date.toUTCString(),
    //   updatedAt: date.toUTCString(),
    // });
    await db.collection("dapps").add({
      title,
      description,
      category,
      upVotesCount: 0,
      downVotesCount: 0,
      createdAt: date.toUTCString(),
      updatedAt: date.toUTCString(),
    });

    onClose();
    setTitle("");
    setDescription("");
    setCategory("");
    setSaving(false);
  };

  return (
    <>
      {true ? (
      <Button onClick={onOpen} colorScheme="blue">
        Add new Dapp
      </Button>
      ) : null}

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>Add new Dapp</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl id="post-title">
                <FormLabel>Dapp title</FormLabel>
                <Textarea
                  type="post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <FormLabel>Dapp description</FormLabel>
                <Textarea
                  type="post-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <FormLabel>Dapp category</FormLabel>
                <Input placeholder="DeFi,AMM,etc" value={category} onChange={(e) => setCategory(e.target.value)}
                  />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={4}>
                <Button onClick={onClose}>Close</Button>
                <Button
                  onClick={handleSubmit}
                  colorScheme="blue"
                  disabled={!title.trim()}
                  isLoading={isSaving}
                >
                  Save
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
};

export default AddNewPost;
