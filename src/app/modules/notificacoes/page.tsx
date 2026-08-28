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
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery } from "react-query";
import { NotificacaoType, useNotifications } from "@/hooks/useNotifications";

export default function Notificacoes() {
  const { user } = useAuthContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();
  const { listNotifications } = useNotifications();

  const [email, setEmail] = useState(user?.email ?? "");
  const [telefone, setTelefone] = useState("");
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<
    NotificacaoType | undefined
  >(undefined);

  const { data: notificacoes, refetch } = useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: () => listNotifications(user?.id ?? ""),
    // enabled: !!user?.id,
  });

  function handleSalvarContato() {
    toast({
      position: "top",
      isClosable: true,
      status: "success",
      title: "Dados de contato salvos com sucesso!",
    });
  }

  function getMethodLabel(method: string) {
    switch (method) {
      case "EMAIL":
        return "E-mail";
      case "WHATSAPP":
        return "WhatsApp";
      case "BOTH":
        return "Ambos";
      default:
        return method;
    }
  }

  function getMethodColor(method: string) {
    switch (method) {
      case "EMAIL":
        return "blue";
      case "WHATSAPP":
        return "green";
      case "BOTH":
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
        reload={refetch}
      />

      <Box w={{ base: "100%", lg: "80%" }} overflow="auto">
        <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight={"bold"}>
          Notificações
        </Text>

        <Box
          mt={5}
          p={{ base: 4, lg: 6 }}
          bg={"surface.card"}
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
          {notificacoes?.data.map((notificacao, index) => (
            <Flex
              key={notificacao.id}
              flexDir={{ base: "column", md: "row" }}
              alignItems={{ base: "flex-start", md: "center" }}
              h={{ base: "auto", md: "50px" }}
              bg={index % 2 === 0 ? "surface.stripe.odd" : "surface.stripe.even"}
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
                <Text fontWeight={"semi-bold"}>{notificacao.title}</Text>
              </HStack>

              <HStack w={{ base: "100%", md: "25%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Descrição:
                </Text>
                <Text fontWeight={"semi-bold"} noOfLines={1} mr={5}>
                  {notificacao.description}
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
                  {notificacao.isCurrent
                    ? `Dia ${new Date(notificacao.date).getUTCDate()}`
                    : ConvertDataToBR(notificacao.date)}
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
                  colorScheme={getMethodColor(notificacao.method)}
                  borderRadius={4}
                  px={2}
                >
                  <HStack spacing={1}>
                    {(notificacao.method === "EMAIL" ||
                      notificacao.method === "BOTH") && (
                      <Icon as={MdEmail} boxSize={3} />
                    )}
                    {(notificacao.method === "WHATSAPP" ||
                      notificacao.method === "BOTH") && (
                      <Icon as={FaWhatsapp} boxSize={3} />
                    )}
                    <Text fontSize="xs">
                      {getMethodLabel(notificacao.method)}
                    </Text>
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
                  colorScheme={notificacao.isCurrent ? "green" : "gray"}
                  borderRadius={4}
                  px={2}
                >
                  {notificacao.isCurrent ? "Sim" : "Não"}
                </Badge>
              </HStack>

              <Flex
                w={{ base: "100%", md: "10%" }}
                justify={{ base: "flex-end", md: "center" }}
              >
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

          {(!notificacoes?.data || notificacoes.data.length === 0) && (
            <Text mt={5} color={"text.muted"} textAlign={"center"}>
              Nenhuma notificação cadastrada.
            </Text>
          )}
        </Stack>
      </Box>
    </Flex>
  );
}
