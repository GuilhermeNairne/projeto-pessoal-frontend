"use client";

import { Quadros } from "@/componnents/atividades/quadros";
import { Menu } from "@/componnents/menu";
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
import { useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Atividades() {
  const daysName = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const allDays = useMemo(() => {
    return getDaysInMonth(year, month - 1);
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
        <Quadros />

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
              display={"flex"}
              overflowY={`auto`}
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
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
}
