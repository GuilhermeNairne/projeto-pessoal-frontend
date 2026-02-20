import { useFormik } from "formik";
import { FaSave } from "react-icons/fa";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import { usePanels } from "@/hooks/usePanels";
import { EditPanelType } from "@/types/financial-types";
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
  const { editPanel } = usePanels();
  const { values, handleChange, resetForm } = useFormik({
    initialValues: {
      id: panelValues.id,
      panel: panelValues.panel,
      value: panelValues.value,
    },
    enableReinitialize: true,
    onSubmit: (values) => {},
  });

  async function handleEdit() {
    try {
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
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
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
              onChange={handleChange("value")}
            />
          </Stack>
        </ModalBody>
        <ModalFooter mt={"30px"} display={"flex"} justifyContent={"center"}>
          <DefaultButton
            icon={FaSave}
            title="Salvar"
            w="150px"
            onClick={handleEdit}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
