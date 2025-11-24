"use client";

import { Menu } from "@/componnents/menu";
import { Flex } from "@chakra-ui/react";

export default function Financeiro() {
  return (
    <Flex w={"100%"} h={"100%"} p={"20px"}>
      <Menu />
    </Flex>
  );
}
