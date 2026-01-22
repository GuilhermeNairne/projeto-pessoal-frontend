import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaSave, FaTrash } from "react-icons/fa";
import { DefaultButton } from "../default-button";
import { SketchPicker } from "react-color";
import { useState } from "react";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import { FaPencil } from "react-icons/fa6";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categorias: {
    x: string;
    color: string;
    y: number;
  }[];
};

export function ModalCategorias({ isOpen, onClose, categorias }: Props) {
  const [color, setColor] = useState("#FF0000");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display={"flex"} justifyContent={"center"}>
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            Categorias
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack ml={"30px"} mt={"30px"}>
            <Stack
              w={"100%"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              ml={"60px"}
            >
              {categorias.map((categoria) => (
                <HStack>
                  <Box
                    w={"25px"}
                    h={"25px"}
                    borderRadius={"5px"}
                    bg={categoria.color}
                  />
                  <Input
                    fontSize={"lg"}
                    w={"50%"}
                    h={"35px"}
                    value={categoria.x}
                  />

                  <Icon as={FaPencil} ml={"5px"} />
                  <Icon as={FaTrash} ml={"5px"} />
                </HStack>
              ))}
            </Stack>

            <Box mr={"30px"}>
              <SketchPicker
                color={color}
                onChange={(c: any) => setColor(c.hex)}
              />
            </Box>
          </HStack>
        </ModalBody>
        <ModalFooter mt={"30px"} display={"flex"} justifyContent={"center"}>
          <DefaultButton icon={FaSave} title="Salvar" w="150px" />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
