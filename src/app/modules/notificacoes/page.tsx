"use client";

import {
  Box,
  Flex,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
  Badge,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { DefaultInput } from "@/componnents/default-input";
import { DefaultButton } from "@/componnents/default-button";
import { NotificacaoModal } from "@/componnents/notificacoes/notificacao-modal";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaPencil } from "react-icons/fa6";
import { FaWhatsapp, FaSave } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useState } from "react";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";

export type NotificacaoType = {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  canal: "email" | "whatsapp" | "ambos";
  recorrente: boolean;
};

const notificacoesMock: NotificacaoType[] = [
  {
    id: 1,
    titulo: "Pagar spotify Lucas",
    descricao:
      "Pagar a mensalidade do spotify para o Lucas no valor de 6,81.",
    data: "2026-07-05",
    canal: "whatsapp",
    recorrente: true,
  },
  {
    id: 2,
    titulo: "Reunião semanal",
    descricao: "Lembrete da reunião semanal toda segunda-feira às 10h.",
    data: "2026-06-23",
    canal: "email",
    recorrente: true,
  },
  {
    id: 3,
    titulo: "Renovar domínio",
    descricao: "Renovar o domínio do site pessoal antes do vencimento.",
    data: "2026-08-15",
    canal: "ambos",
    recorrente: false,
  },
  {
    id: 4,
    titulo: "Pagar conta de luz",
    descricao: "Pagar a conta de luz do apartamento todo dia 15.",
    data: "2026-07-15",
    canal: "email",
    recorrente: true,
  },
];

export default function Notificacoes() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();

  const [email, setEmail] = useState("kakacorsine@gmail.com");
  const [telefone, setTelefone] = useState("(11) 99999-9999");
  const [notificacoes, setNotificacoes] =
    useState<NotificacaoType[]>(notificacoesMock);
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<
    NotificacaoType | undefined
  >(undefined);

  function handleSalvarContato() {
    toast({
      position: "top",
      isClosable: true,
      status: "success",
      title: "Dados de contato salvos com sucesso!",
    });
  }

  function handleSalvarNotificacao(notificacao: Omit<NotificacaoType, "id">) {
    if (notificacaoSelecionada) {
      setNotificacoes((prev) =>
        prev.map((n) =>
          n.id === notificacaoSelecionada.id
            ? { ...n, ...notificacao }
            : n
        )
      );
    } else {
      const novaNotificacao: NotificacaoType = {
        ...notificacao,
        id: Math.max(...notificacoes.map((n) => n.id), 0) + 1,
      };
      setNotificacoes((prev) => [...prev, novaNotificacao]);
    }
  }

  function handleDeletarNotificacao(id: number) {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }

  function getCanalLabel(canal: string) {
    switch (canal) {
      case "email":
        return "E-mail";
      case "whatsapp":
        return "WhatsApp";
      case "ambos":
        return "Ambos";
      default:
        return canal;
    }
  }

  function getCanalColor(canal: string) {
    switch (canal) {
      case "email":
        return "blue";
      case "whatsapp":
        return "green";
      case "ambos":
        return "purple";
      default:
        return "gray";
    }
  }

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      p={{ base: "10px", lg: "20px" }}
      flexDir={{ base: "column", lg: "row" }}
      gap={{ base: 4, lg: 10 }}
      overflow="hidden"
    >
      <MenuMobile />
      <Menu />

      <NotificacaoModal
        isOpen={isOpen}
        onClose={onClose}
        notificacao={notificacaoSelecionada}
        onSave={handleSalvarNotificacao}
        onDelete={handleDeletarNotificacao}
      />

      <Box w={{ base: "100%", lg: "80%" }} overflow="auto">
        <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight={"bold"}>
          Notificações
        </Text>

        <Box
          mt={5}
          p={{ base: 4, lg: 6 }}
          bg={"white"}
          borderRadius={8}
          boxShadow={"md"}
        >
          <Text fontSize={{ base: "md", lg: "lg" }} fontWeight={"bold"} mb={4}>
            Dados para envio
          </Text>

          <Flex
            flexDir={{ base: "column", md: "row" }}
            gap={{ base: 3, md: 5 }}
            alignItems={{ base: "stretch", md: "flex-end" }}
          >
            <Box flex={1}>
              <DefaultInput
                placeholder="Informe o e-mail"
                position="cima"
                title="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </Box>

            <Box flex={1}>
              <DefaultInput
                placeholder="Informe o telefone"
                position="cima"
                title="Telefone (WhatsApp)"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </Box>

            <DefaultButton
              icon={FaSave}
              title="Salvar"
              w={{ base: "100%", md: "150px" } as any}
              onClick={handleSalvarContato}
            />
          </Flex>
        </Box>

        <HStack justifyContent={"space-between"} mt={"30px"}>
          <Text fontSize={{ base: "md", lg: "lg" }} fontWeight={"bold"}>
            Notificações cadastradas
          </Text>
          <Link
            display={"flex"}
            flexDir={"row"}
            alignItems={"center"}
            gap={2}
            onClick={() => {
              setNotificacaoSelecionada(undefined);
              onOpen();
            }}
          >
            <Text fontSize={{ base: "md", lg: "lg" }}>Nova notificação</Text>
            <Icon as={IoIosAddCircleOutline} boxSize={{ base: "6", lg: "8" }} />
          </Link>
        </HStack>

        <HStack
          display={{ base: "none", md: "flex" }}
          mt={5}
          h={"40px"}
          bg={"menu_principal"}
          borderRadius={5}
          p={5}
        >
          <Text w={"20%"} fontWeight={"semi-bold"} color={"white"}>
            Título
          </Text>
          <Text w={"25%"} fontWeight={"semi-bold"} color={"white"}>
            Descrição
          </Text>
          <Text w={"15%"} fontWeight={"semi-bold"} color={"white"}>
            Data
          </Text>
          <Text w={"15%"} fontWeight={"semi-bold"} color={"white"}>
            Canal
          </Text>
          <Text w={"15%"} fontWeight={"semi-bold"} color={"white"}>
            Recorrente
          </Text>
          <Text w={"10%"} fontWeight={"semi-bold"} color={"white"}>
            Ações
          </Text>
        </HStack>

        <Stack mt={5} pb={10}>
          {notificacoes.map((notificacao, index) => (
            <Flex
              key={notificacao.id}
              flexDir={{ base: "column", md: "row" }}
              alignItems={{ base: "flex-start", md: "center" }}
              h={{ base: "auto", md: "50px" }}
              bg={index % 2 === 0 ? "#F3F3F3" : "#D9D9D9"}
              borderRadius={5}
              p={{ base: 3, md: 5 }}
              gap={{ base: 2, md: 0 }}
            >
              <HStack w={{ base: "100%", md: "20%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Título:
                </Text>
                <Text fontWeight={"semi-bold"}>{notificacao.titulo}</Text>
              </HStack>

              <HStack w={{ base: "100%", md: "25%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Descrição:
                </Text>
                <Text fontWeight={"semi-bold"} noOfLines={1}>
                  {notificacao.descricao}
                </Text>
              </HStack>

              <HStack w={{ base: "100%", md: "15%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Data:
                </Text>
                <Text fontWeight={"semi-bold"}>
                  {ConvertDataToBR(notificacao.data)}
                </Text>
              </HStack>

              <HStack w={{ base: "100%", md: "15%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Canal:
                </Text>
                <Badge
                  colorScheme={getCanalColor(notificacao.canal)}
                  borderRadius={4}
                  px={2}
                >
                  <HStack spacing={1}>
                    {(notificacao.canal === "email" ||
                      notificacao.canal === "ambos") && (
                      <Icon as={MdEmail} boxSize={3} />
                    )}
                    {(notificacao.canal === "whatsapp" ||
                      notificacao.canal === "ambos") && (
                      <Icon as={FaWhatsapp} boxSize={3} />
                    )}
                    <Text fontSize="xs">{getCanalLabel(notificacao.canal)}</Text>
                  </HStack>
                </Badge>
              </HStack>

              <HStack w={{ base: "100%", md: "15%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Recorrente:
                </Text>
                <Badge
                  colorScheme={notificacao.recorrente ? "green" : "gray"}
                  borderRadius={4}
                  px={2}
                >
                  {notificacao.recorrente ? "Sim" : "Não"}
                </Badge>
              </HStack>

              <Flex w={{ base: "100%", md: "10%" }} justify={{ base: "flex-end", md: "center" }}>
                <Icon
                  as={FaPencil}
                  cursor="pointer"
                  onClick={() => {
                    setNotificacaoSelecionada(notificacao);
                    onOpen();
                  }}
                />
              </Flex>
            </Flex>
          ))}

          {notificacoes.length === 0 && (
            <Text mt={5} color={"gray.500"} textAlign={"center"}>
              Nenhuma notificação cadastrada.
            </Text>
          )}
        </Stack>
      </Box>
    </Flex>
  );
}
