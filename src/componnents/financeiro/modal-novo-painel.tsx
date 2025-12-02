import { useFormik } from "formik";
import { FaSave } from "react-icons/fa";
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
} from "@chakra-ui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  handleSave: (values: any) => void;
};

export function ModalNovoPainel({ isOpen, onClose, handleSave }: Props) {
  const { values, handleChange, resetForm } = useFormik({
    initialValues: {
      nome: "",
      valor: "",
    },
    onSubmit: (values) => {},
  });

  function handleClick() {
    handleSave(values);
    onClose();
    return resetForm();
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
            value={values.nome}
            onChange={handleChange("nome")}
          />
          <DefaultInput
            placeholder="Informe o valor da conta"
            position="cima"
            title="Valor"
            value={values.valor}
            mt="20px"
            type="number"
            onChange={handleChange("valor")}
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
