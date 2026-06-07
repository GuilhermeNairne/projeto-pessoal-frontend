"use client";

import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { CiClock2 } from "react-icons/ci";
import "../../../../utils/mini-calendar.css";
import { Menu } from "@/componnents/menu";
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
      p={"20px"}
      flexDir={"row"}
      gap={10}
      overflow="hidden"
    >
      <Menu />

      <TarefaModal
        isOpen={isOpen}
        reload={() => refetch()}
        onClose={() => {
          (onClose(), setTarefaSelecionada(null));
        }}
        tarefa={tarefaSelecionada ?? ({} as ListTarefasReturnType)}
      />

      <Stack mt={5} px={10} w={`full`} overflow={"auto"} css={ScrollBarcss}>
        <HStack mr={3} justifyContent={`space-between`}>
          <Text color={"menu_principal"} fontSize={`2xl`} fontWeight={`bold`}>
            {`${getWeekOfMonth(parsedDate)}° semana de ${monthName}`}
          </Text>

          <DefaultButton
            icon={MdOutlinePlaylistAdd}
            title="Adicionar tarefa"
            w="180px"
            onClick={() => onOpen()}
          />
        </HStack>

        <SimpleGrid
          justifyContent={"space-between"}
          columns={4}
          mt={8}
          spacing={10}
          borderColor={"gray.400"}
        >
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
          {weekDays.map((day, index) => {
            const tarefaDoDia = tarefas?.data[String(day.getUTCDate())];
            const totalTarefas = tarefaDoDia?.totalTarefas ?? 0;
            const totalConcluidas = tarefaDoDia?.totalConcluidas ?? 0;
            const porcentagem =
              totalTarefas > 0 ? (totalConcluidas / totalTarefas) * 100 : 0;
            return (
              <Box
                py={3}
                w={320}
                h={400}
                key={index}
                display={`flex`}
                flexDir={`column`}
                alignItems={`center`}
                borderWidth={2}
                bg={"white"}
                boxShadow={"md"}
                borderRadius={8}
                borderColor={
                  day.getDate() === new Date().getDate()
                    ? "menu_principal"
                    : "white"
                }
              >
                <Flex
                  justifyContent={`space-between`}
                  alignItems={`flex-start`}
                  w={`full`}
                  px={3}
                >
                  <Stack>
                    <Text fontWeight={`bold`} fontSize={`lg`}>
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
                      <Text fontSize={`sm`}>
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
                      borderColor={`#1e293b`}
                      bg={`conic-gradient(#1e293b ${porcentagem}%, transparent ${porcentagem}%)`}
                    />
                  )}
                </Flex>

                <Box w={"full"} h={"2px"} bg={"#dedede"} mt={5} />

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
                    <Text textAlign={`center`} fontWeight={`bold`} mt={20}>
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
