"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GrTransaction } from "react-icons/gr";
import { FaChevronRight } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdPowerSettingsNew } from "react-icons/md";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { DefaultButton } from "@/componnents/default-button";
import { TarefaModal } from "@/componnents/atividades/tarefa-modal";
import { ModalRegistrarMovimento } from "@/componnents/financial/modal-registrar-movimento";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePanels } from "@/hooks/usePanels";
import { useTarefas } from "@/hooks/useTarefas";
import { useNotifications } from "@/hooks/useNotifications";
import { useAdmin } from "@/hooks/useAdmin";
import { formatarValorBR } from "@/utils/convert-to-real";
import { ModuleKey, hasModuleAccess } from "@/config/module-access";
import { modulesNav } from "@/config/modules-nav";
import { Box, Flex, HStack, Icon, Spinner, Text } from "@chakra-ui/react";

const MotionBox = motion(Box);

export default function Home() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false);
  const [isMovimentoModalOpen, setIsMovimentoModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const now = new Date();
  const primeiroNome = user?.name?.split(" ")[0] ?? "";
  const saudacao =
    now.getHours() < 12
      ? "Bom dia,"
      : now.getHours() < 18
        ? "Boa tarde,"
        : "Boa noite,";
  const dataLabel = now
    .toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .replace(/\./g, "")
    .toUpperCase();

  const modulosDisponiveis = modulesNav.filter((item) =>
    hasModuleAccess(user, item.moduleKey),
  );

  const { listPanels } = usePanels();
  const {
    data: panels,
    isLoading: isLoadingPanels,
    refetch: refetchPanels,
  } = useQuery({
    queryKey: ["home-panels", user?.id],
    queryFn: () => listPanels(user?.id ?? ""),
    enabled: !!user?.id && hasModuleAccess(user, "financeiro"),
  });

  const { listCardsTarefas } = useTarefas();
  const {
    data: tarefasCards,
    isLoading: isLoadingTarefas,
    refetch: refetchTarefasCards,
  } = useQuery({
    queryKey: ["home-tarefas-cards", user?.id],
    queryFn: () =>
      listCardsTarefas({
        user_id: user?.id ?? "",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }),
    enabled: !!user?.id && hasModuleAccess(user, "tarefas"),
  });

  const { listNotifications } = useNotifications();
  const { data: notificacoes, isLoading: isLoadingNotificacoes } = useQuery({
    queryKey: ["home-notificacoes", user?.id],
    queryFn: () => listNotifications(user?.id ?? ""),
    enabled: !!user?.id && hasModuleAccess(user, "notificacoes"),
  });

  const { listUsers } = useAdmin();
  const { data: adminUsers, isLoading: isLoadingAdminUsers } = useQuery({
    queryKey: ["home-admin-users", user?.id],
    queryFn: () => listUsers(),
    enabled: !!user?.id && hasModuleAccess(user, "admin"),
  });

  const saldoTotal =
    panels?.data?.reduce(
      (total, item) => total + Number(item.initial_value),
      0,
    ) ?? 0;

  function getModuleStat(moduleKey: ModuleKey) {
    switch (moduleKey) {
      case "financeiro":
        return {
          loading: isLoadingPanels,
          text: `R$ ${formatarValorBR(saldoTotal)}`,
        };
      case "tarefas":
        return {
          loading: isLoadingTarefas,
          text: `${tarefasCards?.data.totalPendente ?? 0} pendente(s)`,
        };
      case "notificacoes":
        return {
          loading: isLoadingNotificacoes,
          text: `${notificacoes?.data.length ?? 0} cadastrada(s)`,
        };
      case "admin":
        return {
          loading: isLoadingAdminUsers,
          text: `${adminUsers?.data.length ?? 0} usuário(s)`,
        };
      default:
        return null;
    }
  }

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      p={{ base: "20px", lg: "20px" }}
      flexDir={{ base: "column", lg: "row" }}
      gap={{ base: 4, lg: 10 }}
      overflow="hidden"
    >
      <MenuMobile />
      <Menu />

      <TarefaModal
        isOpen={isTarefaModalOpen}
        onClose={() => setIsTarefaModalOpen(false)}
        reload={() => refetchTarefasCards()}
      />

      <ModalRegistrarMovimento
        isOpen={isMovimentoModalOpen}
        onClose={() => setIsMovimentoModalOpen(false)}
        refetch={() => refetchPanels()}
        paineis={panels?.data ?? []}
      />

      <Flex
        flexDir={"column"}
        w={"full"}
        bg={"branco"}
        boxShadow={"md"}
        borderRadius={"20px"}
        p={{ base: "24px", lg: "36px" }}
        overflow={"auto"}
      >
        <Flex
          justifyContent={"space-between"}
          alignItems={{ base: "flex-start", md: "flex-end" }}
          flexDir={{ base: "column", md: "row" }}
          gap={2}
        >
          <Box>
            <Text
              fontSize={"xs"}
              fontWeight={"bold"}
              letterSpacing={"0.2em"}
              color={"ambar_texto"}
              fontFamily={"var(--font-geist-sans)"}
            >
              {saudacao.toUpperCase()}
            </Text>
            <Text
              fontSize={{ base: "2xl", lg: "3xl" }}
              fontWeight={"bold"}
              color={"menu_principal"}
              fontFamily={"var(--font-geist-sans)"}
            >
              {primeiroNome}
            </Text>
          </Box>

          <Text
            fontSize={"xs"}
            letterSpacing={"0.15em"}
            color={"cinza_900"}
            fontFamily={"var(--font-geist-mono)"}
          >
            {dataLabel}
          </Text>
        </Flex>

        <Box h={"1px"} bg={"cinza_600"} mt={"24px"} mb={"28px"} />

        {modulosDisponiveis.length === 0 ? (
          <Flex
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            gap={3}
            border={"1px dashed"}
            borderColor={"cinza_600"}
            borderRadius={"12px"}
            py={"60px"}
            px={"20px"}
          >
            <Icon as={MdPowerSettingsNew} boxSize={8} color={"cinza_900"} />
            <Text
              fontSize={"lg"}
              fontWeight={"bold"}
              color={"menu_principal"}
              textAlign={"center"}
            >
              Você não possui permissões para acessar aos módulos
            </Text>
            <Text fontSize={"sm"} color={"cinza_900"} textAlign={"center"}>
              Peça a um administrador para liberar seus módulos.
            </Text>
          </Flex>
        ) : (
          <>
            <Text
              fontSize={"xs"}
              fontWeight={"bold"}
              letterSpacing={"0.2em"}
              color={"cinza_900"}
              mb={"8px"}
            >
              SISTEMAS DISPONÍVEIS
            </Text>

            <Flex flexDir={"column"}>
              {modulosDisponiveis.map((item, index) => {
                const stat = getModuleStat(item.moduleKey);

                return (
                  <MotionBox
                    key={item.moduleKey}
                    as="button"
                    onClick={() => router.push(`/${item.rota}`)}
                    initial={
                      prefersReducedMotion ? undefined : { opacity: 0, x: -12 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    w={"100%"}
                    gap={4}
                    py={"18px"}
                    px={{ base: "10px", lg: "16px" }}
                    borderBottom={
                      index === modulosDisponiveis.length - 1
                        ? undefined
                        : "1px solid"
                    }
                    borderColor={"cinza_600"}
                    borderRadius={"8px"}
                    sx={{
                      transition:
                        "background-color 0.2s ease, transform 0.2s ease",
                    }}
                    _hover={{
                      bg: "fundo_cinza",
                      transform: "translateX(4px)",
                    }}
                  >
                    <HStack gap={4} minW={0}>
                      <Icon
                        as={item.icon}
                        boxSize={6}
                        color={"menu_principal"}
                      />

                      <Box textAlign={"left"} minW={0}>
                        <Text
                          fontSize={"lg"}
                          fontWeight={"bold"}
                          color={"menu_principal"}
                          noOfLines={1}
                        >
                          {item.nome}
                        </Text>
                        <Text fontSize={"md"} color={"cinza_900"} noOfLines={1}>
                          {item.descricao}
                        </Text>
                      </Box>
                    </HStack>

                    {stat ? (
                      stat.loading ? (
                        <Spinner size={"xs"} color={"ambar_texto"} />
                      ) : (
                        <Text
                          fontSize={{ base: "md", lg: "lg" }}
                          fontWeight={"bold"}
                          color={"ambar_texto"}
                          fontFamily={"var(--font-geist-mono)"}
                          whiteSpace={"nowrap"}
                        >
                          {stat.text}
                        </Text>
                      )
                    ) : (
                      <HStack gap={1} color={"cinza_900"}>
                        <Text fontSize={"sm"} whiteSpace={"nowrap"}>
                          Acessar
                        </Text>
                        <Icon as={FaChevronRight} boxSize={3} />
                      </HStack>
                    )}
                  </MotionBox>
                );
              })}
            </Flex>

            <HStack mt={"32px"} spacing={4} flexWrap={"wrap"}>
              {hasModuleAccess(user, "financeiro") && (
                <DefaultButton
                  icon={GrTransaction}
                  title="Novo lançamento"
                  bg={"linear(to-r, #F5A623, #d88a12)"}
                  titleColor={"#10182B"}
                  onClick={() => setIsMovimentoModalOpen(true)}
                />
              )}
              {hasModuleAccess(user, "tarefas") && (
                <DefaultButton
                  icon={IoIosAddCircleOutline}
                  title="Nova tarefa"
                  bg={"linear(to-r, #F5A623, #d88a12)"}
                  titleColor={"#10182B"}
                  onClick={() => setIsTarefaModalOpen(true)}
                />
              )}
            </HStack>
          </>
        )}
      </Flex>
    </Flex>
  );
}
