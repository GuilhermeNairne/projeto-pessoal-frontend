"use client";

import { useQuery } from "react-query";
import { useMemo, useState } from "react";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { useRouter } from "next/navigation";
import { useTarefas } from "@/hooks/useTarefas";
import { ScrollBarcss } from "@/utils/scroll-bar-css";
import { useAuthContext } from "@/contexts/AuthContext";
import { Quadros } from "@/componnents/atividades/quadros";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import {
  Box,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

export default function Calendario() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { listTarefas, listCardsTarefas } = useTarefas();
  const daysName = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const allDays = useMemo(() => {
    return getDaysInMonth(year, month);
  }, [month, year]);
  const paddedDays = [...Array(firstDayOfWeek).fill(null), ...allDays];
  const monthName = new Date(year, month).toLocaleString("pt-BR", {
    month: "long",
  });
  const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  function getDaysInMonth(year: number, month: number) {
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, i) => {
      return new Date(year, month, i + 1);
    });
  }

  function changeMonth(action: "add" | "sub") {
    if (action === "add") {
      if (month === 11) {
        (setMonth(0), setYear(year + 1));
      } else {
        setMonth(month + 1);
      }
    } else {
      if (month === 0) {
        (setMonth(11), setYear(year - 1));
      } else {
        setMonth(month - 1);
      }
    }
  }

  function navigateTarefas(day: string) {
    const date = new Date(year, month, Number(day) + 1);
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    router.push(`/modules/tarefas/tarefas-semanais/?date=${formatted}`);
  }

  function lightenColor(hex: string, opacity: number = 0.3) {
    return `${hex}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }

  const { data: tarefas } = useQuery({
    queryKey: ["tarefas", month, year],
    queryFn: async () =>
      listTarefas({ user_id: user?.id ?? "", month: month + 1, year: year }),
  });

  const { data: cards } = useQuery({
    queryKey: ["cards", month, year],
    queryFn: async () =>
      listCardsTarefas({
        user_id: user?.id ?? "",
        month: month + 1,
        year: year,
      }),
  });

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

      <Stack
        mt={5}
        px={{ base: 2, md: 5, lg: 10 }}
        w={`full`}
        overflow={"auto"}
        css={ScrollBarcss}
      >
        <Quadros
          totalMes={cards?.data.totalMes ?? 0}
          totalMinutosConcluidos={cards?.data.totalMinutosConcluidos ?? 0}
          totalPendente={cards?.data.totalPendente ?? 0}
        />

        <HStack mt={{ base: 5, lg: 30 }} justifyContent={"space-between"} w={200}>
          <Icon
            as={FaChevronLeft}
            cursor="pointer"
            onClick={() => changeMonth("sub")}
          />
          <Text fontWeight={"bold"} fontSize={{ base: "sm", md: "md" }}>
            {formattedMonth} {year}
          </Text>
          <Icon
            as={FaChevronRight}
            cursor="pointer"
            onClick={() => changeMonth("add")}
          />
        </HStack>

        <HStack
          py={{ base: 2, lg: 3 }}
          mt={{ base: 4, lg: 10 }}
          px={{ base: 1, md: 10, lg: 20 }}
          mb={-2}
          w={"100%"}
          bg={`white`}
          borderTopWidth={1}
          borderRightWidth={1}
          borderLeftWidth={1}
          borderTopRadius={10}
          alignSelf={`center`}
          borderColor={"gray.400"}
          justifyContent={`space-between`}
        >
          {daysName.map((name) => (
            <Text
              key={name}
              color={`gray.500`}
              fontWeight={`hairline`}
              fontSize={{ base: "xs", md: "sm", lg: "lg" }}
            >
              {name}
            </Text>
          ))}
        </HStack>
        <SimpleGrid
          justifyContent={"space-between"}
          columns={7}
          spacing={{ base: 0, md: 1 }}
          borderColor={"gray.400"}
        >
          {paddedDays.map((day, index) => {
            const dayTarefas = day
              ? tarefas?.data.filter((tarefa) => {
                  const tarefaDate = new Date(tarefa.data);
                  return (
                    tarefaDate.getUTCFullYear() === day.getFullYear() &&
                    tarefaDate.getUTCMonth() === day.getMonth() &&
                    tarefaDate.getUTCDate() === day.getDate()
                  );
                })
              : [];

            return (
              <Box
                h={{ base: "60px", md: "100px", lg: "150px" }}
                p={{ base: 1, md: 2 }}
                key={index}
                borderWidth={1}
                borderRadius={3}
                display={"flex"}
                flexDir={`column`}
                alignItems={{ base: "center", md: "flex-start" }}
                onClick={() => day && navigateTarefas(day.getDate())}
                overflowY={{ base: "hidden", md: "auto" }}
                css={ScrollBarcss}
                borderColor={"gray.400"}
                _hover={{
                  bg: "gray.100",
                  cursor: "pointer",
                }}
              >
                <Box
                  w={6}
                  h={6}
                  display={`flex`}
                  alignItems={`center`}
                  justifyContent={`center`}
                  borderRadius={10}
                  bg={
                    day &&
                    day.getDate() === new Date().getDate() &&
                    month === new Date().getMonth()
                      ? "purple.600"
                      : undefined
                  }
                >
                  {day && (
                    <Text
                      fontSize={{ base: "xs", md: "sm", lg: "md" }}
                      color={
                        day &&
                        day.getDate() === new Date().getDate() &&
                        month === new Date().getMonth()
                          ? "white"
                          : undefined
                      }
                      textAlign="center"
                    >
                      {day.getDate()}
                    </Text>
                  )}
                </Box>

                {/* Mobile: colored dots */}
                <HStack
                  display={{ base: "flex", md: "none" }}
                  mt={1}
                  gap={1}
                  flexWrap="wrap"
                  justifyContent="center"
                >
                  {dayTarefas?.map((tarefa, i) => (
                    <Box
                      key={i}
                      w="6px"
                      h="6px"
                      borderRadius="full"
                      bg={tarefa.categoria.cor}
                    />
                  ))}
                </HStack>

                {/* Desktop: full task cards */}
                <Box display={{ base: "none", md: "block" }} w="full">
                  {dayTarefas?.map((tarefa, i) => (
                    <Box
                      key={i}
                      mt={3}
                      borderWidth={2}
                      borderColor={lightenColor(tarefa.categoria.cor)}
                      borderRadius={8}
                      w={`full`}
                      p={2}
                      bg={`Linear-gradient(135deg, ${lightenColor(tarefa.categoria.cor, 0.3)} 0%, ${lightenColor(tarefa.categoria.cor, 0.1)} 100%)`}
                    >
                      <HStack gap={3} alignItems={`flex-start`}>
                        <Stack gap={0}>
                          <Text fontWeight={`bold`} fontSize={{ md: "xs", lg: "sm" }}>
                            {tarefa.nome}
                          </Text>
                          <Text mt={1} fontSize={{ md: "xs", lg: "sm" }}>
                            {tarefa.categoria.nome}
                          </Text>
                        </Stack>
                      </HStack>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
}
