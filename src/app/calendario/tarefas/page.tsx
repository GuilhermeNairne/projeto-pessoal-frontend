"use client";

import { Menu } from "@/componnents/menu";
import { ScrollBarcss } from "@/utils/scroll-bar-css";
import {
  Box,
  Checkbox,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { CiClock2 } from "react-icons/ci";
import { FaClock } from "react-icons/fa";
import { LuClipboardCheck } from "react-icons/lu";

export default function Tarefas() {
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

  console.log(getWeekOfMonth(new Date(String(dateParam))));

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
        <Text color={"menu_principal"} fontSize={`2xl`} fontWeight={`bold`}>
          Semana {getWeekOfMonth(new Date(String(dateParam)))} de Abril
        </Text>

        <SimpleGrid
          justifyContent={"space-between"}
          columns={4}
          mt={8}
          spacing={10}
          borderColor={"gray.400"}
        >
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

                <Flex
                  w={`90%`}
                  p={3}
                  mt={5}
                  alignSelf={"center"}
                  bg={"#eef1f8"}
                  borderWidth={1}
                  borderLeftWidth={2}
                  flexDir={`column`}
                  borderRadius={3}
                  borderLeftColor={"menu_principal"}
                >
                  <Box
                    display={`flex`}
                    flexDir={`row`}
                    justifyContent={`space-between`}
                  >
                    <HStack>
                      <Icon
                        as={LuClipboardCheck}
                        boxSize={5}
                        sx={{ strokeWidth: 2 }}
                      />
                      <Text fontWeight={`bold`}>Tarefa</Text>
                    </HStack>
                    <Checkbox
                      colorScheme="gray"
                      size="lg"
                      borderColor={`gray.400`}
                      sx={{
                        "& .chakra-checkbox__control": {
                          borderRadius: "5px",
                        },
                      }}
                    />
                  </Box>

                  <Text fontWeight={"bold"} mt={3} color={"blue.500"}>
                    Resolva o 43° Exame de Ordem e, após, assista a aula de
                    resolução
                  </Text>

                  <Text mt={5} fontWeight={"bold"}>
                    5 horas
                  </Text>
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
}
