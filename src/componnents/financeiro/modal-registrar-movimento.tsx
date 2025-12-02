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
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";

type Props = {
  painel: string;
  isOpen: boolean;
  id: string;
  onClose: () => void;
  handleSave: (values: any) => void;
};

const categorias = ["Mercado", "Presente", "Alimentação"];

export function ModalRegistrarMovimento({
  isOpen,
  onClose,
  painel,
  id,
  handleSave,
}: Props) {
  const { values, handleChange, resetForm } = useFormik({
    initialValues: {
      nome: "",
      categoria: "",
      valor: "",
      tipo: "",
      id: id,
      data: brToIso(new Date().toLocaleDateString("pt-BR")),
    },
    enableReinitialize: true,
    onSubmit: (values) => {},
  });

  function handleClick() {
    handleSave(values);
    onClose();
    resetForm();
  }

  function brToIso(brDate: string) {
    const [dia, mes, ano] = brDate.split("/");
    return `${ano}-${mes}-${dia}`;
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
            onChange={handleChange("nome")}
          />

          <Stack mt={"20px"}>
            <Text fontWeight={"bold"}>Tipo</Text>
            <Select
              placeholder="Selecione a categoria"
              borderColor={"gray.400"}
              borderRadius={"10px"}
              onChange={handleChange("categoria")}
            >
              {categorias.map((categoria) => (
                <option value={categoria}>{categoria}</option>
              ))}
            </Select>
          </Stack>

          <Stack mt="20px">
            <Text fontWeight={"bold"}>Tipo da movimentação</Text>
            <RadioGroup defaultValue="2" onChange={handleChange("tipo")}>
              <Radio color="red" value="Entrada" mr={"20px"}>
                Entrada
              </Radio>
              <Radio color="red" value="Saída">
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
            onChange={handleChange("valor")}
          />

          <DefaultInput
            title="Data da movimentação"
            placeholder="Informe a data movimentação"
            position="cima"
            mt="20px"
            type="date"
            value={values.data}
            onChange={handleChange("data")}
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
