import { useFormik } from "formik";
import { FaSave, FaTrash } from "react-icons/fa";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import { usePanels } from "@/hooks/usePanels";
import { EditPanelType } from "@/types/financial-types";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { maskCurrencyInput } from "@/utils/convert-to-real";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  panelValues: EditPanelType;
};

export function EditPanelModal({
  refetch,
  isOpen,
  onClose,
  panelValues,
}: Props) {
  const toast = useToast();
  const { editPanel, deletePanel } = usePanels();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const { values, handleChange, setFieldValue, resetForm } = useFormik({
    initialValues: {
      id: panelValues.id,
      panel: panelValues.panel,
      value: maskCurrencyInput(
        String(Math.round(Number(panelValues.value) * 100)),
      ),
    },
    enableReinitialize: true,
    onSubmit: (values) => { },
  });

  async function handleDelete() {
    try {
      setIsLoading(true);
      await deletePanel(panelValues.id);
      onConfirmClose();
      onClose();
      refetch();
      return toast({
        title: "Painel excluído com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir painel",
        status: "error",
        position: "top",
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEdit() {
    try {
      setIsLoading(true);
      await editPanel(values);
      onClose();
      refetch();
      return toast({
        title: "Painel alterado com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar painel",
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
        <ModalHeader display={"flex"} justifyContent={"center"}>
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            Editar painel
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <DefaultInput
              placeholder="Informe o nome do painel"
              position="cima"
              title="Painel"
              value={values.panel}
              onChange={handleChange("panel")}
            />
            <DefaultInput
              placeholder="Informe o valor do painel"
              position="cima"
              title="Valor"
              mt="20px"
              value={String(values.value)}
              onChange={(e) =>
                setFieldValue("value", maskCurrencyInput(e.target.value))
              }
            />
          </Stack>
        </ModalBody>
        <ModalFooter
          mt={"30px"}
          gap={5}
          display={"flex"}
          justifyContent={"center"}
        >
          <DefaultButton
            icon={FaTrash}
            title="Excluir"
            bg="linear(to-r, #41150f, #650d0d)"
            w="150px"
            isLoading={isLoading}
            onClick={onConfirmOpen}
          />
          <DefaultButton
            icon={FaSave}
            title="Salvar"
            w="150px"
            isLoading={isLoading}
            onClick={handleEdit}
          />
        </ModalFooter>
      </ModalContent>
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent mx={{ base: 4 }}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Excluir painel
          </AlertDialogHeader>

          <AlertDialogBody>
            Deseja excluir o painel <b>{panelValues.panel}</b>? Todos os dados
            vinculados a ele também serão apagados e esta ação não pode ser
            desfeita.
          </AlertDialogBody>

          <AlertDialogFooter gap={3}>
            <Button ref={cancelRef} onClick={onConfirmClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              isLoading={isLoading}
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
}
