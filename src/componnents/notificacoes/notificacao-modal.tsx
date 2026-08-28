import {
  Checkbox,
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
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import { FaSave, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { useFormik } from "formik";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificacaoType, useNotifications } from "@/hooks/useNotifications";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  notificacao?: NotificacaoType;
  reload: () => void;
};

export function NotificacaoModal({
  isOpen,
  onClose,
  notificacao,
  reload,
}: Props) {
  const toast = useToast();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const { createNotification, editNotification, deleteNotification } =
    useNotifications();

  const { values, handleChange, resetForm, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        title: notificacao?.title ?? "",
        description: notificacao?.description ?? "",
        date: notificacao?.date ? notificacao.date.substring(0, 10) : "",
        recurrentDay: notificacao?.isCurrent && notificacao?.date
          ? String(new Date(notificacao.date).getUTCDate())
          : "1",
        isCurrent: notificacao?.isCurrent ?? false,
        method: notificacao?.method ?? "EMAIL",
      },
      enableReinitialize: true,
      onSubmit: () => {
        notificacao?.id ? handleEdit() : handleCreate();
      },
    });

  function buildDate() {
    if (values.isCurrent) {
      const today = new Date();
      const day = Number(values.recurrentDay);
      const month = today.getDate() >= day
        ? today.getMonth() + 1
        : today.getMonth();
      const year = month > 11
        ? today.getFullYear() + 1
        : today.getFullYear();
      const adjustedMonth = month > 11 ? 0 : month;
      return new Date(year, adjustedMonth, day).toISOString().substring(0, 10);
    }
    return values.date;
  }

  async function handleCreate() {
    try {
      setIsLoading(true);
      await createNotification({
        userId: user?.id ?? "",
        title: values.title,
        description: values.description,
        date: buildDate(),
        isCurrent: values.isCurrent,
        method: values.method as "EMAIL" | "WHATSAPP" | "BOTH",
      });

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Notificação cadastrada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao cadastrar notificação!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEdit() {
    try {
      setIsLoading(true);
      await editNotification(notificacao?.id ?? 0, {
        title: values.title,
        description: values.description,
        date: buildDate(),
        isCurrent: values.isCurrent,
        method: values.method as "EMAIL" | "WHATSAPP" | "BOTH",
      });

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Notificação alterada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao editar notificação!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setIsLoading(true);
      await deleteNotification(notificacao?.id ?? 0);

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Notificação deletada com sucesso!",
      });

      onClose();
      reload();
      resetForm();
    } catch (error: any) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao deletar notificação!",
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
            {!notificacao?.id ? "Adicionar notificação" : "Editar notificação"}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            placeholder="Informe o título"
            position="cima"
            title="Título"
            value={values.title}
            onChange={handleChange("title")}
          />

          <Stack mt={5}>
            <Text fontWeight={"bold"}>Descrição</Text>
            <Textarea
              borderColor={"border.default"}
              borderRadius={"10px"}
              placeholder="Informe a descrição"
              w={"100%"}
              bg={"surface.card"}
              value={values.description}
              onChange={handleChange("description")}
            />
          </Stack>

          <Stack mt={5}>
            <Checkbox
              isChecked={values.isCurrent}
              onChange={(e) => setFieldValue("isCurrent", e.target.checked)}
              colorScheme="blue"
            >
              <Text fontWeight={"bold"}>Notificação recorrente</Text>
            </Checkbox>
          </Stack>

          {values.isCurrent ? (
            <Stack mt={5}>
              <Text fontWeight={"bold"}>Dia do mês para envio</Text>
              <Select
                borderColor={"border.default"}
                borderRadius={"10px"}
                bg={"surface.card"}
                value={values.recurrentDay}
                onChange={handleChange("recurrentDay")}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={String(day)}>
                    Dia {day}
                  </option>
                ))}
              </Select>
            </Stack>
          ) : (
            <DefaultInput
              placeholder="Informe a data"
              position="cima"
              title="Data"
              mt="20px"
              type="date"
              value={values.date}
              onChange={handleChange("date")}
            />
          )}

          <Stack mt={5}>
            <Text fontWeight={"bold"}>Canal de envio</Text>
            <RadioGroup
              value={values.method}
              onChange={(value) => setFieldValue("method", value)}
            >
              <Stack spacing={3}>
                <Radio value="EMAIL" colorScheme="blue">
                  E-mail
                </Radio>
                <Radio value="WHATSAPP" colorScheme="green" isDisabled>
                  WhatsApp
                </Radio>
                <Radio value="BOTH" colorScheme="purple" isDisabled>
                  Ambos
                </Radio>
              </Stack>
            </RadioGroup>
          </Stack>
        </ModalBody>
        <ModalFooter gap={5} mt={"30px"} display={"flex"}>
          {notificacao && (
            <DefaultButton
              icon={FaTrash}
              title="Excluir"
              bg="linear(to-r, #41150f, #650d0d)"
              onClick={() => handleDelete()}
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
