import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { DefaultButton } from "../default-button";
import { FaSave, FaTrash } from "react-icons/fa";
import { DefaultInput } from "../default-input";
import { DefatultTextarea } from "../financial/default-textarea";
import { useFormik } from "formik";
import { brToIso } from "@/utils/brToIso";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  acao: "editar" | "criar";
};

export function TarefaModal({ isOpen, onClose, acao }: Props) {
  const { values, handleChange, resetForm, handleSubmit } = useFormik({
    initialValues: {
      tarefa: "",

      tempo: "",
      descricao: "",
      categoria: "",
      data: brToIso(new Date().toLocaleDateString("pt-BR")),
    },
    enableReinitialize: true,
    onSubmit: () => {},
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display={"flex"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {acao === "criar" ? "Adicionar tarefa" : "Editar tarefa"}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            placeholder="Informe o nome da tarefa"
            position="cima"
            title="Tarefa"
            value={values.tarefa}
            onChange={handleChange("tarefa")}
          />
          <DefatultTextarea
            placeholder="Informe a descrição da tarefa"
            position="cima"
            title="Descrição"
            mt="5"
            value={values.descricao}
            onChange={handleChange("descricao")}
          />

          <DefaultInput
            placeholder="Informe o tempo da tarefa"
            position="cima"
            title="Tempo"
            mt="5"
            type={"time"}
            value={values.tempo}
            onChange={handleChange("tempo")}
          />

          <Stack mt={5}>
            <Text fontWeight={"bold"}>Categoria</Text>
            <Select
              placeholder="Selecione a categoria"
              w={"full"}
              textColor={"gray.500"}
              bg={"white"}
              borderColor={"gray.400"}
              value={values.categoria}
              borderRadius={"10px"}
              onChange={handleChange("categoria")}
            >
              {/* {categories && categories.data.length > 0 ? (
                categories.data.map((category, index) => (
                  <option key={index} value={category.id}>
                    {category.name}{" "}
                  </option>
                ))
              ) : (
                <option value="">""</option>
              )} */}
            </Select>
          </Stack>

          <DefaultInput
            title="Data"
            placeholder="Informe a data da tarefa"
            position="cima"
            mt="20px"
            type="date"
            value={values.data}
            onChange={handleChange("data")}
          />
        </ModalBody>
        <ModalFooter gap={5} mt={"30px"} display={"flex"}>
          {acao === "editar" && (
            <DefaultButton
              icon={FaTrash}
              title="Excluir"
              bg="red.800"
              w="150px"
            />
          )}
          <DefaultButton icon={FaSave} title="Salvar" w="150px" />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
