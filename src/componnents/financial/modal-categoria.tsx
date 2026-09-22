import { useState } from "react";
import { useFormik } from "formik";
import { SketchPicker } from "react-color";
import { FaSave, FaTrash } from "react-icons/fa";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import { useCategoies } from "@/hooks/useCategories";
import { CategoriesType } from "@/types/financial-types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reload: () => void;
  onDelete: (categoria: CategoriesType) => void;
  panel_id: number;
  categoria?: CategoriesType;
};

export function ModalCategoria({
  isOpen,
  onClose,
  reload,
  onDelete,
  panel_id,
  categoria,
}: Props) {
  const toast = useToast();
  const { createCategory, updateCategory } = useCategoies();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!categoria?.id;

  const { values, handleChange, setFieldValue, resetForm } = useFormik({
    initialValues: {
      name: categoria?.name ?? "",
      color: categoria?.color ?? "#830e0e",
    },
    enableReinitialize: true,
    onSubmit: () => {},
  });

  async function handleSave() {
    if (isLoading) return;

    if (!values.name.trim()) {
      toast({
        title: "Informe o nome da categoria",
        status: "error",
        position: "top",
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing) {
        await updateCategory(categoria.id, {
          name: values.name.trim(),
          color: values.color,
        });
      } else {
        await createCategory({
          name: values.name.trim(),
          color: values.color,
          panel_id,
        });
      }

      toast({
        title: isEditing
          ? "Categoria alterada com sucesso!"
          : "Categoria cadastrada com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });

      onClose();
      reload();
      resetForm();
    } catch (error) {
      toast({
        title: isEditing
          ? "Erro ao editar categoria"
          : "Erro ao cadastrar categoria",
        status: "error",
        position: "top",
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent mx={{ base: 4 }}>
        <ModalHeader>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {isEditing ? "Editar categoria" : "Adicionar categoria"}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            placeholder="Informe o nome da categoria"
            position="cima"
            title="Categoria"
            value={values.name}
            onChange={handleChange("name")}
          />

          <Stack mt={5}>
            <Text fontWeight={"bold"}>Selecione a cor</Text>
            <SketchPicker
              color={values.color}
              onChange={(c: any) => setFieldValue("color", c.hex)}
            />
          </Stack>
        </ModalBody>
        <ModalFooter gap={5} mt={"30px"} display={"flex"}>
          {isEditing && (
            <DefaultButton
              icon={FaTrash}
              title="Excluir"
              bg="linear(to-r, #41150f, #650d0d)"
              w="150px"
              isLoading={isLoading}
              onClick={() => {
                onClose();
                onDelete(categoria);
              }}
            />
          )}

          <DefaultButton
            icon={FaSave}
            title="Salvar"
            w="150px"
            isLoading={isLoading}
            onClick={handleSave}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
