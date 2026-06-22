import {
  Box,
  HStack,
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
import { FaSave, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { listCategoriesType, useTarefas } from "@/hooks/useTarefas";
import { useFormik } from "formik";
import { useAuthContext } from "@/contexts/AuthContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categoria?: listCategoriesType;
  reload: () => void;
};

export function CategoriaModal({ isOpen, onClose, reload, categoria }: Props) {
  const toast = useToast();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const { createCategoria, deleteCategoria, editCategoria } = useTarefas();

  const { values, handleChange, resetForm, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        user_id: user?.id ?? "",
        nome: categoria?.nome ?? "",
        cor: categoria?.cor ?? "#830e0e",
      },
      enableReinitialize: true,
      onSubmit: () => {
        categoria?.id ? handleEditCategoria() : handleCreateCategoria();
      },
    });

  async function handleEditCategoria() {
    try {
      setIsLoading(true);
      await editCategoria(categoria?.id ?? 0, values);

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Categoria alterada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao editar categoria!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCategoria() {
    try {
      setIsLoading(true);
      await deleteCategoria(categoria?.id ?? 0);

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Categoria deletada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao deletar categoria!",
      });
    } finally {
      setIsLoading(false);
    }
  }
  async function handleCreateCategoria() {
    try {
      setIsLoading(true);
      await createCategoria(values);

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Categoria cadastrada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao cadastrar tarefa!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent mx={{ base: 4 }}>
        <ModalHeader display={"flex"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {!categoria?.id ? "Adicionar categoria" : "Editar categoria"}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            placeholder="Informe o nome da categoria"
            position="cima"
            title="Categoria"
            value={values.nome}
            onChange={handleChange("nome")}
          />

          <Stack mt={5}>
            <Text fontWeight={"bold"}>Selecione a cor</Text>
            <HStack>
              <SketchPicker
                color={values.cor}
                onChange={(c: any) => setFieldValue("cor", c.hex)}
              />
            </HStack>
          </Stack>
        </ModalBody>
        <ModalFooter gap={5} mt={"30px"} display={"flex"}>
          {categoria && (
            <DefaultButton
              icon={FaTrash}
              title="Excluir"
              bg="linear(to-r, #41150f, #650d0d)"
              onClick={() => handleDeleteCategoria()}
              w="150px"
              isLoading={isLoading}
            />
          )}

          <DefaultButton
            icon={FaSave}
            title="Salvar"
            w="150px"
            isLoading={isLoading}
            onClick={() => handleSubmit()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
