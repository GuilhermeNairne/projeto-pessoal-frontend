"use client";

import { CardTarefa } from "@/componnents/atividades/card-tarefa";
import { DefaultButton } from "@/componnents/default-button";
import { Menu } from "@/componnents/menu";
import { ScrollBarcss } from "@/utils/scroll-bar-css";
import { ptBR } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CiClock2 } from "react-icons/ci";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import "../../../utils/mini-calendar.css";

import {
  Box,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

export default function Tarefas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const baseDate = dateParam ? new Date(dateParam) : new Date();
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());

  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + index);
    return d;
  });

  function getWeekOfMonth(date: Date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    const dayOfMonth = date.getDate();
    const firstDayWeekDay = firstDay.getDay();

    return Math.ceil((dayOfMonth + firstDayWeekDay) / 7);
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

      <Stack mt={5} px={10} w={`full`} overflow={"auto"} css={ScrollBarcss}>
        <HStack mr={3} justifyContent={`space-between`}>
          <Text color={"menu_principal"} fontSize={`2xl`} fontWeight={`bold`}>
            {getWeekOfMonth(new Date(String(dateParam)))}° semana de Abril
          </Text>

          <DefaultButton
            icon={MdOutlinePlaylistAdd}
            title="Adicionar tarefa"
            w="180px"
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
            onDayClick={() => router.push("/calendario")}
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
                      <Text fontSize={`sm`}>1h0m | 2 atividades</Text>
                    </HStack>
                  </Stack>

                  <Box
                    w={8}
                    h={8}
                    borderRadius="full"
                    borderWidth={`2px`}
                    borderColor={`#1e293b`}
                    bg="conic-gradient(#1e293b 75%, transparent 25%)"
                  />
                </Flex>

                <Box w={"full"} h={"2px"} bg={"#dedede"} mt={5} />

                <Flex overflowY={"auto"} flexDir={`column`} css={ScrollBarcss}>
                  <CardTarefa
                    descricao="Resolva o 43° Exame de Ordem e, após, assista a aula de resolução"
                    titulo="Prova OAB"
                    tempo="5"
                    status="pendente"
                  />
                  <CardTarefa
                    descricao="Resolva o 43° Exame de Ordem e, após, assista a aula de resolução"
                    titulo="Prova OAB"
                    tempo="5"
                    status="realizado"
                  />
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
}
