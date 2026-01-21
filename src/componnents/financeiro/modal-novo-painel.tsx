import { useFormik } from "formik";
import { FaSave } from "react-icons/fa";
import { usePanels } from "@/hooks/usePanels";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ModalNovoPainel({ isOpen, onClose }: Props) {
  const toast = useToast();
  const { createPanel } = usePanels();
  const user_id = localStorage.getItem("userId");
  const { values, handleChange, resetForm } = useFormik({
    initialValues: {
      name: "",
      inicial_value: "",
    },
    onSubmit: (values) => {},
  });

  async function handleClick() {
    try {
      const params = {
        user_id: user_id ?? "",
        name: values.name,
        initial_value: values.inicial_value,
      };

      await createPanel(params);
      onClose();
      resetForm();
      return toast({
        title: "Painel criado com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: error.response ?? "Painel criado com sucesso!",
        status: "error",
        position: "top",
        isClosable: true,
      });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display={"flex"} justifyContent={"center"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            Novo painel
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            placeholder="Informe o nome do painel"
            position="cima"
            title="Nome"
            value={values.name}
            onChange={handleChange("name")}
          />
          <DefaultInput
            placeholder="Informe o valor da conta"
            position="cima"
            title="Valor"
            value={values.inicial_value}
            mt="20px"
            type="number"
            onChange={handleChange("inicial_value")}
          />
        </ModalBody>

        <ModalFooter display={"flex"} justifyContent={"center"}>
          <DefaultButton
            icon={FaSave}
            title="Salvar"
            w="150px"
            onClick={handleClick}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
