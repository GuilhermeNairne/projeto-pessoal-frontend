import { useRef, useState } from "react";
import { SketchPicker } from "react-color";
import { IoMdClose } from "react-icons/io";
import { useCategoies } from "@/hooks/useCategories";
import { PanelsType } from "@/types/financial-types";
import { FaCheck, FaPlus, FaTrash } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

type Props = {
  panel: PanelsType;
  refetch: () => void;
};

const css = {
  "::-webkit-scrollbar": {
    width: "4px",
  },
  "::-webkit-scrollbar-button": {
    height: "0px",
    display: "block",
  },
  "::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "::-webkit-scrollbar-thumb": {
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "20px",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0,0,0,0.3) transparent",
};

type categoryToDelete = {
  name: string;
  id: number;
} | null;

type categorySelected = {
  id?: number;
  name?: string;
} | null;

export function CategoriasComponente({ panel, refetch }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { updateCategory, createCategory, deleteCategory } = useCategoies();
  const [categoryToDelete, setCategoryToDelete] =
    useState<categoryToDelete>(null);
  const [categorySelected, setCategorySelected] =
    useState<categorySelected>(null);

  async function handleEditCategory(params: { name?: string; color?: string }) {
    if (!categorySelected) return;

    await updateCategory(categorySelected.id ?? 0, params);
    refetch();
    setCategorySelected({ id: undefined, name: "" });
  }

  async function handleNewCategory(panel_id: number) {
    await createCategory({
      name: "Nova categoria",
      color: "#3c191dff",
      panel_id,
    });

    refetch();
  }

  async function handleDeleteCategory() {
    await deleteCategory(categoryToDelete?.id);
    onClose();
    refetch();
  }

  return (
    <>
      {categorySelected?.id ? (
        <Box display={"flex"} flexDir={"column"} alignItems={"flex-end"}>
          <Icon
            as={IoMdClose}
            mb={"15px"}
            onClick={() => setCategorySelected({ id: undefined, name: "" })}
          />
          <SketchPicker
            color={"#FF0000"}
            onChange={(c: any) => {
              handleEditCategory({ color: String(c.hex) });
            }}
          />
        </Box>
      ) : null}

      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        flexDir={"column"}
      >
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay />

          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deletar categoria
            </AlertDialogHeader>

            <AlertDialogBody>
              Deseja excluir a categoria <b>{categorySelected?.name}</b>?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>

              <Button
                color={"white"}
                bg={"menu_principal"}
                ml={3}
                onClick={handleDeleteCategory}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Stack
          w={"100%"}
          display={"flex"}
          mt={"20px"}
          maxH={"250px"}
          overflowY={"auto"}
          overflowX="hidden"
          sx={css}
        >
          {panel.categories?.map((category, index) => (
            <HStack>
              <Box
                w={"25px"}
                h={"25px"}
                borderRadius={"5px"}
                bg={category.color}
                onClick={() => setCategorySelected({ id: category.id })}
              />
              <Input
                fontSize="lg"
                w="50%"
                h="35px"
                value={
                  categorySelected?.id === category.id
                    ? categorySelected?.name
                    : category.name
                }
                onChange={(e) =>
                  setCategorySelected((prev) => ({
                    ...prev,
                    id: category.id,
                    name: e.target.value,
                  }))
                }
              />

              <Icon
                as={FaCheck}
                ml="5px"
                cursor="pointer"
                onClick={() =>
                  handleEditCategory({ name: categorySelected?.name })
                }
              />
              <Icon
                as={FaTrash}
                ml={"5px"}
                onClick={() => {
                  setCategoryToDelete({
                    name: category.name,
                    id: category.id,
                  });
                  onOpen();
                }}
              />
            </HStack>
          ))}
        </Stack>
        <HStack
          mt={"20px"}
          mr={"70px"}
          onClick={() => handleNewCategory(panel.id ?? 0)}
        >
          <Icon as={FaPlus} />
          <Text>Adicionar categoria</Text>
        </HStack>
      </Box>
    </>
  );
}
