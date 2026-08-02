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
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { CategoriesType, MovementsType } from "@/types/financial-types";
import { useMovements } from "@/hooks/useMovements";
import { useState } from "react";
import { brToIso } from "@/utils/brToIso";
import { formatarValorBR } from "@/utils/convert-to-real";

type Props = {
  painel: string;
  isOpen: boolean;
  painel_id: string;
  categorys: CategoriesType[];
  onClose: () => void;
  refetch: () => void;
  movement?: MovementsType | null;
};

function isoToInputDate(iso: string) {
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

  return date.toISOString().split("T")[0];
}

export function ModalRegistrarMovimento({
  isOpen,
  onClose,
  painel,
  painel_id,
  categorys,
  refetch,
  movement,
}: Props) {
  const toast = useToast();
  const { createMovement, updateMovement } = useMovements();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!movement;
  const { values, handleChange, resetForm } = useFormik({
    initialValues: {
      name: movement?.name ?? "",
      value: movement ? formatarValorBR(movement.value) ?? "" : "",
      category_id: movement?.category_id ?? 0,
      movement_type: movement?.movement_type ?? "",
      painel_id: Number(painel_id),
      date: movement
        ? isoToInputDate(movement.date)
        : brToIso(new Date().toLocaleDateString("pt-BR")),
    },
    enableReinitialize: true,
    onSubmit: (values) => { },
  });

  async function handleClick() {
    try {
      setIsLoading(true);

      if (isEditing && movement?.id) {
        await updateMovement(
          movement.id,
          values as unknown as Partial<MovementsType>,
        );
      } else {
        await createMovement(values as unknown as MovementsType);
      }

      toast({
        title: isEditing
          ? "Movimentação atualizada com sucesso!"
          : "Movimentação registrada com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });

      onClose();
      refetch();
      resetForm();
    } catch (error) {
      toast({
        title: isEditing
          ? "Erro ao atualizar movimentação"
          : "Erro ao registrar movimentação",
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
            {isEditing ? "Editar movimento" : "Registrar movimento"} {painel}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            title="Nome da movimentação"
            position="cima"
            placeholder="Informe o nome da movimentação"
            value={values.name}
            onChange={handleChange("name")}
          />

          <Stack mt={"20px"}>
            <Text fontWeight={"bold"}>Tipo</Text>
            <Select
              placeholder="Selecione a categoria"
              borderColor={"gray.400"}
              borderRadius={"10px"}
              value={values.category_id || ""}
              onChange={handleChange("category_id")}
            >
              {categorys.map((categoria, index) => (
                <option key={index} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack mt="20px">
            <Text fontWeight={"bold"}>Tipo da movimentação</Text>
            <RadioGroup
              value={values.movement_type}
              onChange={handleChange("movement_type")}
            >
              <Radio color="red" value="IN" mr={"20px"}>
                Entrada
              </Radio>
              <Radio color="red" value="OUT">
                Saída
              </Radio>
            </RadioGroup>
          </Stack>

          <DefaultInput
            title="Valor da movimentação"
            placeholder="Informa o valor da movimentação"
            position="cima"
            mt="20px"
            value={String(values.value)}
            onChange={handleChange("value")}
          />

          <DefaultInput
            title="Data da movimentação"
            placeholder="Informe a data movimentação"
            position="cima"
            mt="20px"
            type="date"
            value={values.date}
            onChange={handleChange("date")}
          />
        </ModalBody>

        <ModalFooter display={"flex"} justifyContent={"center"}>
          <DefaultButton
            icon={FaSave}
            title="Salvar"
            w="150px"
            isLoading={isLoading}
            onClick={handleClick}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
