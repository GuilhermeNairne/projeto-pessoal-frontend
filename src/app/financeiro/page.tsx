"use client";

import { Menu } from "@/componnents/menu";
import { PainelContas } from "@/componnents/painel-contas";
import { Box, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { GrTransaction } from "react-icons/gr";
import {
  FaChevronDown,
  FaArrowAltCircleUp,
  FaArrowAltCircleDown,
} from "react-icons/fa";

const ocorrenciasPrevidencia = [
  {
    nome: "Juros",
    valor: "520,00",
    data: "01/10/2025",
    tipo: "Juros do banco",
    movimentacao: "entrada",
  },
  {
    nome: "Presente pai",
    valor: "340,00",
    data: "25/09/2025",
    tipo: "Presentes",
    movimentacao: "saida",
  },
];

export default function Financeiro() {
  return (
    <Flex w={"100%"} h={"100%"} p={"20px"} flexDir={"row"} gap={10}>
      <Menu />

      <Flex flexDir={"column"}>
        <HStack justifyContent={"flex-end"} mt={"10px"} mr={"10px"}>
          <Icon as={IoIosAddCircleOutline} boxSize={"8"} />
          <Text>Novo painel</Text>
        </HStack>

        <PainelContas />

        <Box
          display={"flex"}
          flexDir={"column"}
          bg={"white"}
          boxShadow={"md"}
          mt={"50px"}
          p={"20px"}
          borderRadius={"8px"}
        >
          <HStack display={"flex"} justifyContent={"space-between"}>
            <Text fontSize={"2xl"} fontWeight={"bold"}>
              Previdência
            </Text>
            <Box display={"flex"} flexDir={"row"} alignItems={"center"} gap={3}>
              <Icon as={GrTransaction} boxSize={"5"} color={"green"} />
              <Text>Fazer movimentação</Text>
            </Box>
          </HStack>

          <HStack
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            mt={"50px"}
          >
            <Text fontSize={"lg"}>Entradas e saídas</Text>
            <Box display={"flex"} flexDir={"row"} alignItems={"center"} gap={3}>
              <Text>Filtrar por</Text>
              <Icon as={FaChevronDown} boxSize={"5"} />
            </Box>
          </HStack>

          <Stack mt={"10px"}>
            <Box
              display={"flex"}
              flexDir={"row"}
              bg={"menu_principal"}
              w={"full"}
              h={"35px"}
              alignItems={"center"}
              px={"15px"}
            >
              <Text w={"30%"} color={"white"}>
                Movimentação
              </Text>
              <Text w={"15%"} color={"white"}>
                Valor
              </Text>
              <Text w={"15%"} color={"white"}>
                Data
              </Text>
              <Text w={"15%"} color={"white"}>
                Tipo
              </Text>
              <Text w={"10%"} color={"white"}></Text>
            </Box>
            {ocorrenciasPrevidencia.map((occ, index) => (
              <Box
                boxShadow={"md"}
                display={"flex"}
                flexDir={"row"}
                bg={index % 2 === 0 ? "#F3F3F3" : "#D9D9D9"}
                w={"full"}
                h={"35px"}
                alignItems={"center"}
                px={"15px"}
              >
                <Text w={"30%"} color={"black"}>
                  {occ.nome}
                </Text>
                <Text w={"15%"} color={"black"}>
                  {occ.valor}
                </Text>
                <Text w={"15%"} color={"black"}>
                  {occ.data}
                </Text>
                <Text w={"35%"} color={"black"}>
                  {occ.tipo}
                </Text>
                <Icon
                  w={"10%"}
                  as={
                    occ.movimentacao === "entrada"
                      ? FaArrowAltCircleUp
                      : FaArrowAltCircleDown
                  }
                  color={occ.movimentacao === "entrada" ? "green" : "red"}
                  boxSize={"5"}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
}
