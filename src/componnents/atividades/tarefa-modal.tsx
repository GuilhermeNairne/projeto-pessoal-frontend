import {
  Badge,
  Checkbox,
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
  useToast,
} from "@chakra-ui/react";
import { DefaultButton } from "../default-button";
import { FaSave, FaTrash } from "react-icons/fa";
import { DefaultInput } from "../default-input";
import { DefatultTextarea } from "../financial/default-textarea";
import { useFormik } from "formik";
import { brToIso } from "@/utils/brToIso";
import { ListTarefasReturnType, useTarefas } from "@/hooks/useTarefas";
import { useQuery } from "react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tarefa?: ListTarefasReturnType;
  reload: () => void;
};

function getErrorMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) return message.join("\n");
  if (typeof message === "string" && error?.response?.status === 400) {
    return message;
  }

  return fallback;
}

export function TarefaModal({ isOpen, onClose, tarefa, reload }: Props) {
  const toast = useToast();
  const hoje = brToIso(new Date().toLocaleDateString("pt-BR"));
  const { user } = useAuthContext();
  const tempoMinutos = tarefa?.tempo ?? 0;
  const horas = Math.floor(Number(tempoMinutos) / 60);
  const minutos = Number(tempoMinutos) % 60;
  const [isLoading, setIsLoading] = useState(false);
  const { listCategorias, createTarefa, editTarefa, deleteTarefa } =
    useTarefas();

  const { data: categorias } = useQuery({
    queryKey: [`categorias`, user?.id],
    queryFn: async () => listCategorias(user?.id ?? ""),
  });

  const { values, handleChange, resetForm, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        nome: tarefa?.nome ?? "",
        tempo: tarefa?.tempo
          ? `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`
          : "",
        descricao: tarefa?.descricao ?? "",
        categoriaId: Number(tarefa?.categoriaId) ?? 0,
        data: tarefa?.data
          ? tarefa.data.split("T")[0]
          : brToIso(new Date().toLocaleDateString("pt-BR")),
        userId: user?.id ?? "",
        enviarAviso: !!tarefa?.notificacao,
        dataAviso: tarefa?.notificacao?.date.slice(0, 10) ?? "",
      },
      enableReinitialize: true,
      onSubmit: () => {
        if (!validateAviso()) return;

        tarefa?.id ? handleEditTarefa() : handleCreateTarefa();
      },
    });

  // Aviso existente com a data intacta: nada a validar nem a enviar no PATCH
  const avisoInalterado =
    values.enviarAviso &&
    !!tarefa?.notificacao &&
    values.dataAviso === tarefa.notificacao.date.slice(0, 10);

  function validateAviso() {
    if (!values.enviarAviso || avisoInalterado) return true;

    const title = !values.dataAviso
      ? "Informe a data do aviso!"
      : values.dataAviso < hoje
        ? "A data do aviso deve ser hoje ou posterior!"
        : "";

    if (title) {
      toast({ position: "top", isClosable: true, status: "error", title });
    }

    return !title;
  }

  async function handleEditTarefa() {
    try {
      setIsLoading(true);
      const { enviarAviso, dataAviso, ...campos } = values;

      await editTarefa(
        tarefa?.id ?? 0,
        avisoInalterado ? campos : { ...campos, enviarAviso, dataAviso },
      );

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Tarefa alterada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: getErrorMessage(error, "Erro ao editar tarefa!"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteTarafe() {
    try {
      setIsLoading(true);
      await deleteTarefa(tarefa?.id ?? 0);

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Tarefa deletada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao deletar tarefa!",
      });
    } finally {
      setIsLoading(false);
    }
  }
  async function handleCreateTarefa() {
    try {
      setIsLoading(true);
      await createTarefa(values);

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Tarefa cadastrada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: getErrorMessage(error, "Erro ao cadastrar tarefa!"),
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
            {!tarefa?.id ? "Adicionar tarefa" : "Editar tarefa"}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            placeholder="Informe o nome da tarefa"
            position="cima"
            title="Tarefa"
            value={values.nome}
            onChange={handleChange("nome")}
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
              textColor={"text.primary"}
              bg={"surface.card"}
              borderColor={"border.default"}
              value={values.categoriaId}
              borderRadius={"10px"}
              onChange={handleChange("categoriaId")}
            >
              {categorias && categorias.data.length > 0 ? (
                categorias.data.map((category, index) => (
                  <option key={index} value={category.id}>
                    {category.nome}{" "}
                  </option>
                ))
              ) : (
                <option value="">""</option>
              )}
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

          <Stack mt={5}>
            <Checkbox
              isChecked={values.enviarAviso}
              onChange={(e) => setFieldValue("enviarAviso", e.target.checked)}
              colorScheme="blue"
            >
              <Text fontWeight={"bold"}>Enviar aviso</Text>
            </Checkbox>
          </Stack>

          {values.enviarAviso && (
            <>
              <DefaultInput
                title="Data do aviso"
                placeholder="Informe a data do aviso"
                position="cima"
                mt="20px"
                type="date"
                min={hoje}
                value={values.dataAviso}
                onChange={handleChange("dataAviso")}
              />
              {tarefa?.notificacao && !tarefa.notificacao.isCurrent && (
                <Stack mt={2} direction={"row"} alignItems={"center"}>
                  <Badge colorScheme="gray">Aviso enviado</Badge>
                  <Text fontSize={"sm"} color={"text.muted"}>
                    Alterar a data reativa o aviso.
                  </Text>
                </Stack>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter gap={5} mt={"30px"} display={"flex"}>
          {tarefa?.nome && (
            <DefaultButton
              icon={FaTrash}
              title="Excluir"
              bg="linear(to-r, #41150f, #650d0d)"
              onClick={() => handleDeleteTarafe()}
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
