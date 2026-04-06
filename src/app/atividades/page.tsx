"use client";

import { Menu } from "@/componnents/menu";
import { Quadros } from "@/componnents/atividades/quadros";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";

export default function Atividades() {
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

      <Stack mt={5}>
        <Quadros />

        <HStack mt={30} gap={5}>
          <Icon as={FaChevronLeft} />
          <Text fontWeight={"bold"}>Abril 2026</Text>
          <Icon as={FaChevronRight} />
        </HStack>
      </Stack>
    </Flex>
  );
}
