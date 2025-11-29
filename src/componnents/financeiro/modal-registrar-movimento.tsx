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
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";

type Props = {
  painel: string;
  isOpen: boolean;
  onClose: () => void;
  handleSave: (values: any) => void;

};




export function ModalRegistrarMovimento({ isOpen, onClose, painel, handleSave }: Props) {

const { values, handleChange, resetForm } = useFormik({
    initialValues: {
      nome: "",
      categoria: "",
      valor: "",
      tipo: "",
      data: ""
    },
    onSubmit: (values) => {},
  });

  function handleClick() {
    handleSave(values),
    onClose(),
    resetForm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            Registrar movimento {painel}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            title="Nome da movimentação"
            position="cima"
            placeholder="Informe o nome da movimentação"
            value={values.nome}
          />

          <DefaultInput
            title="Categoria"
            placeholder="Selecione a categoria da movimentação"
            position="cima"
            mt="20px"
            value={values.categoria}
          />

          <Stack mt="20px">
            <Text fontWeight={"bold"}>Tipo da movimentação</Text>
            <RadioGroup defaultValue="2">
              <Radio  color="red" value="1" mr={"20px"}>
                Entrada
              </Radio>
              <Radio color="red" value="2">
                Saída
              </Radio>
            </RadioGroup>
          </Stack>

          <DefaultInput
            title="Valor da movimentação"
            placeholder="Informa o valor da movimentação"
            position="cima"
            mt="20px"
            value={values.valor}
          />

          <DefaultInput
            title="Data da movimentação"
            placeholder="Informe a data movimentação"
            position="cima"
            mt="20px"
            value={values.data}
          />
        </ModalBody>

        <ModalFooter display={"flex"} justifyContent={"center"}>
          <DefaultButton icon={FaSave} title="Salvar" w="150px" />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
