import {
  Checkbox,
  HStack,
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
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import { FaSave, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { NotificacaoType } from "@/app/modules/notificacoes/page";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  notificacao?: NotificacaoType;
  onSave: (notificacao: Omit<NotificacaoType, "id">) => void;
  onDelete: (id: number) => void;
};

export function NotificacaoModal({
  isOpen,
  onClose,
  notificacao,
  onSave,
  onDelete,
}: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [canal, setCanal] = useState<"email" | "whatsapp" | "ambos">("email");
  const [recorrente, setRecorrente] = useState(false);

  useEffect(() => {
    if (notificacao) {
      setTitulo(notificacao.titulo);
      setDescricao(notificacao.descricao);
      setData(notificacao.data);
      setCanal(notificacao.canal);
      setRecorrente(notificacao.recorrente);
    } else {
      setTitulo("");
      setDescricao("");
      setData("");
      setCanal("email");
      setRecorrente(false);
    }
  }, [notificacao, isOpen]);

  function handleSave() {
    if (!titulo.trim()) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Informe o título da notificação!",
      });
      return;
    }

    setIsLoading(true);

    onSave({ titulo, descricao, data, canal, recorrente });

    toast({
      position: "top",
      isClosable: true,
      status: "success",
      title: notificacao
        ? "Notificação alterada com sucesso!"
        : "Notificação cadastrada com sucesso!",
    });

    setIsLoading(false);
    onClose();
  }

  function handleDelete() {
    if (!notificacao) return;

    setIsLoading(true);
    onDelete(notificacao.id);

    toast({
      position: "top",
      isClosable: true,
      status: "success",
      title: "Notificação deletada com sucesso!",
    });

    setIsLoading(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent mx={{ base: 4 }}>
        <ModalHeader display={"flex"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {!notificacao ? "Adicionar notificação" : "Editar notificação"}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DefaultInput
            placeholder="Informe o título"
            position="cima"
            title="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <Stack mt={5}>
            <Text fontWeight={"bold"}>Descrição</Text>
            <Textarea
              borderColor={"gray.400"}
              borderRadius={"10px"}
              placeholder="Informe a descrição"
              w={"100%"}
              bg={"white"}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Stack>

          <DefaultInput
            placeholder="Informe a data"
            position="cima"
            title="Data"
            mt="20px"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <Stack mt={5}>
            <Text fontWeight={"bold"}>Canal de envio</Text>
            <RadioGroup
              value={canal}
              onChange={(value) =>
                setCanal(value as "email" | "whatsapp" | "ambos")
              }
            >
              <Stack spacing={3}>
                <Radio value="email" colorScheme="blue">
                  E-mail
                </Radio>
                <Radio value="whatsapp" colorScheme="green">
                  WhatsApp
                </Radio>
                <Radio value="ambos" colorScheme="purple">
                  Ambos
                </Radio>
              </Stack>
            </RadioGroup>
          </Stack>

          <Stack mt={5}>
            <Checkbox
              isChecked={recorrente}
              onChange={(e) => setRecorrente(e.target.checked)}
              colorScheme="blue"
            >
              <Text fontWeight={"bold"}>Notificação recorrente</Text>
            </Checkbox>
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
            onClick={() => handleSave()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
