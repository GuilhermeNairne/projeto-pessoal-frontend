"use client";

import { Quadros } from "@/componnents/atividades/quadros";
import { Menu } from "@/componnents/menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTarefas } from "@/hooks/useTarefas";
import { ScrollBarcss } from "@/utils/scroll-bar-css";
import {
  Box,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ta } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useQuery } from "react-query";

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
    const date = new Date(year, month, Number(day));

    router.push(
      `/modules/tarefas/tarefas-semanais/?date=${date.toISOString()}`,
    );
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
      p={"20px"}
      flexDir={"row"}
      gap={10}
      overflow="hidden"
    >
      <Menu />

      <Stack mt={5} px={10} w={`full`} overflow={"auto"} css={ScrollBarcss}>
        <Quadros
          totalMes={cards?.data.totalMes ?? 0}
          totalMinutosConcluidos={cards?.data.totalMinutosConcluidos ?? 0}
          totalPendente={cards?.data.totalPendente ?? 0}
        />

        <HStack mt={30} justifyContent={"space-between"} w={200}>
          <Icon as={FaChevronLeft} onClick={() => changeMonth("sub")} />
          <Text fontWeight={"bold"}>
            {formattedMonth} {year}
          </Text>
          <Icon as={FaChevronRight} onClick={() => changeMonth("add")} />
        </HStack>

        <HStack
          py={3}
          mt={10}
          px={20}
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
            <Text color={`gray.500`} fontWeight={`hairline`} fontSize={`lg`}>
              {name}
            </Text>
          ))}
        </HStack>
        <SimpleGrid
          justifyContent={"space-between"}
          columns={7}
          spacing={1}
          borderColor={"gray.400"}
        >
          {paddedDays.map((day, index) => (
            <Box
              h="150px"
              p={2}
              key={index}
              borderWidth={1}
              borderRadius={3}
              display={"flex"}
              flexDir={`column`}
              onClick={() => navigateTarefas(day.getDate())}
              overflowY={`auto`}
              css={ScrollBarcss}
              borderColor={"gray.400"}
              alignItems={"flex-start"}
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

              {tarefas?.data.map((tarefa) => {
                const tarefaDay = new Date(tarefa.data).getUTCDate();
                const dayNumber = day ? day.getDate() : null;

                return tarefaDay === dayNumber ? (
                  <Box
                    mt={3}
                    borderWidth={2}
                    borderColor={tarefa.categoria.cor}
                    borderRadius={8}
                    w={`full`}
                    p={2}
                    bg={lightenColor(tarefa.categoria.cor)}
                  >
                    <HStack gap={3} alignItems={`flex-start`}>
                      <Box
                        w={3}
                        mt={2}
                        h={3}
                        borderRadius={`100%`}
                        bg={tarefa.categoria.cor}
                      />
                      <Stack gap={0}>
                        <Text fontWeight={`bold`}>{tarefa.nome}</Text>
                        <Text>{tarefa.categoria.nome}</Text>
                      </Stack>
                    </HStack>
                  </Box>
                ) : null;
              })}
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
}
