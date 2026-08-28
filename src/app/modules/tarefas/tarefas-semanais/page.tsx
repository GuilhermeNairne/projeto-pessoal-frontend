"use client";

import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { CiClock2 } from "react-icons/ci";
import { FiChevronLeft } from "react-icons/fi";
import "../../../../utils/mini-calendar.css";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { DayPicker } from "react-day-picker";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { ScrollBarcss } from "@/utils/scroll-bar-css";
import { useRouter, useSearchParams } from "next/navigation";
import { DefaultButton } from "@/componnents/default-button";
import { CardTarefa } from "@/componnents/atividades/card-tarefa";

import {
  Box,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { TarefaModal } from "@/componnents/atividades/tarefa-modal";
import { ListTarefasReturnType, useTarefas } from "@/hooks/useTarefas";
import { useQuery } from "react-query";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";

export default function TarefasSemanais() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { listTarefaPorDia } = useTarefas();
  const dateParam = searchParams.get("date");
  const parsedDate = dateParam ? new Date(dateParam) : new Date();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [tarefaSelecionada, setTarefaSelecionada] =
    useState<ListTarefasReturnType | null>();
  const baseDate = dateParam ? new Date(dateParam) : new Date();
  const startOfWeek = new Date(baseDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setHours(0, 0, 0, 0);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const monthName = parsedDate
    .toLocaleString("pt-BR", { month: "long" })
    .replace(/^\w/, (c) => c.toUpperCase());

  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + index);
    return d;
  });

  const { data: tarefas, refetch } = useQuery({
    queryKey: ["tarefas-semana", startOfWeek, endOfWeek],
    queryFn: async () =>
      listTarefaPorDia(
        ConvertDataToBR(String(startOfWeek)),
        ConvertDataToBR(String(endOfWeek)),
      ),
  });

  function getWeekOfMonth(date: Date) {
    if (!date || isNaN(date.getTime())) return 1;

    const dayOfMonth = date.getDate();

    return Math.ceil(dayOfMonth / 7);
  }

  function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
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

      <TarefaModal
        isOpen={isOpen}
        reload={() => refetch()}
        onClose={() => {
          (onClose(), setTarefaSelecionada(null));
        }}
        tarefa={tarefaSelecionada ?? ({} as ListTarefasReturnType)}
      />

      <Stack
        // mt={5}
        px={{ base: 2, md: 5, lg: 10 }}
        w={`full`}
        overflow={"auto"}
        css={ScrollBarcss}
      >
        <Flex
          mr={3}
          justifyContent={`space-between`}
          alignItems={{ base: "flex-start", md: "center" }}
          flexDir={{ base: "column", md: "row" }}
        >
          <Text
            color={"text.primary"}
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
            fontWeight={`bold`}
            mb={5}
          >
            {`${getWeekOfMonth(parsedDate)}° semana de ${monthName}`}
          </Text>

          <DefaultButton
            icon={MdOutlinePlaylistAdd}
            title="Adicionar tarefa"
            w="180px"
            onClick={() => onOpen()}
          />
        </Flex>

        <SimpleGrid
          justifyContent={"space-between"}
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          mt={{ base: 4, lg: 8 }}
          spacing={{ base: 4, md: 6, lg: 10 }}
          borderColor={"gray.400"}
        >
          <Box display={{ base: "none", lg: "block" }}>
            <DayPicker
              mode={undefined}
              showOutsideDays
              onDayClick={() => router.push("/modules/tarefas/calendario")}
              formatters={{
                formatCaption: (date) => {
                  const text = date.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  });
                  return capitalize(text);
                },
              }}
              locale={ptBR}
            />
          </Box>
          {weekDays.map((day, index) => {
            const tarefaDoDia = tarefas?.data[String(day.getUTCDate())];
            const totalTarefas = tarefaDoDia?.totalTarefas ?? 0;
            const totalConcluidas = tarefaDoDia?.totalConcluidas ?? 0;
            const porcentagem =
              totalTarefas > 0 ? (totalConcluidas / totalTarefas) * 100 : 0;
            return (
              <Box
                py={3}
                w="100%"
                h={{ base: "auto", lg: 400 }}
                minH={{ base: 200, md: 300 }}
                key={index}
                display={`flex`}
                flexDir={`column`}
                alignItems={`center`}
                borderWidth={2}
                bg={"surface.card"}
                boxShadow={"md"}
                borderRadius={8}
                borderColor={
                  day.getDate() === new Date().getDate()
                    ? "accent.text"
                    : "surface.card"
                }
              >
                <Flex
                  justifyContent={`space-between`}
                  alignItems={`flex-start`}
                  w={`full`}
                  px={3}
                >
                  <Stack>
                    <Text
                      fontWeight={`bold`}
                      fontSize={{ base: "md", lg: "lg" }}
                    >
                      {day
                        .toLocaleDateString("pt-BR", { weekday: "long" })
                        .replace(/^\w/, (c) => c.toUpperCase())}{" "}
                      -{" "}
                      {day.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </Text>

                    <HStack alignItems={"center"}>
                      <Icon as={CiClock2} sx={{ strokeWidth: 1 }} />
                      <Text fontSize={{ base: "xs", lg: "sm" }}>
                        {tarefaDoDia?.tempoRestante ?? "0h0m"} restante |{" "}
                        {tarefaDoDia?.totalTarefas ?? 0} atividades
                      </Text>
                    </HStack>
                  </Stack>

                  {tarefaDoDia?.totalConcluidas === totalTarefas ? (
                    <Icon as={FaCheck} color={`green.600`} mt={3} boxSize={6} />
                  ) : (
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      borderWidth={`2px`}
                      borderColor={`var(--chakra-colors-text-primary)`}
                      bg={`conic-gradient(var(--chakra-colors-text-primary) ${porcentagem}%, transparent ${porcentagem}%)`}
                    />
                  )}
                </Flex>

                <Box w={"full"} h={"2px"} bg={"border.default"} mt={5} />

                <Flex
                  overflowY={"auto"}
                  flexDir={`column`}
                  css={ScrollBarcss}
                  w={`full`}
                >
                  {tarefaDoDia && tarefaDoDia?.tarefas.length > 0 ? (
                    tarefaDoDia?.tarefas.map((tarefa) => (
                      <CardTarefa
                        dadosTarefa={tarefa}
                        refetch={() => refetch()}
                        onClick={() => {
                          (setTarefaSelecionada(tarefa), onOpen());
                        }}
                      />
                    ))
                  ) : (
                    <Text
                      textAlign={`center`}
                      fontWeight={`bold`}
                      mt={{ base: 8, lg: 20 }}
                    >
                      Nenhuma tarefa cadastrada
                    </Text>
                  )}
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
}
