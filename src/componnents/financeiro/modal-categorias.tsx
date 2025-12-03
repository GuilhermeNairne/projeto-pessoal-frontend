import {
  Box,
  HStack,
  Input,
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
import { FaSave } from "react-icons/fa";
import { DefaultButton } from "../default-button";
import { SketchPicker } from "react-color";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categorias: {
    name: string;
    color: string;
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
            <Stack>
              {categorias.map((cate) => (
                <HStack>
                  <Box
                    w={"25px"}
                    h={"25px"}
                    borderRadius={"5px"}
                    bg={cate.color}
                  />
                  <Input
                    fontSize={"lg"}
                    w={"65%"}
                    h={"35px"}
                    value={cate.name}
                  />
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
