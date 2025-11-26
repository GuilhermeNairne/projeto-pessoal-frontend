"use client";

import { Menu } from "@/componnents/menu";
import { PainelContas } from "@/componnents/painel-contas";
import { Box, Button, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { GrTransaction } from "react-icons/gr";
import {
  FaChevronDown,
  FaArrowAltCircleUp,
  FaArrowAltCircleDown,
  FaPencilAlt,
} from "react-icons/fa";
import { VictoryPie, VictoryTheme } from "victory";

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

const sampleData = [
  { x: "Aluguel", y: 1200, color: "#d50c20" },
  { x: "Mercado", y: 800, color: "#339c00" },
  { x: "Transporte", y: 250, color: "#ffc107" },
  { x: "Lazer", y: 300, color: "#007bff" },
  { x: "Outros", y: 150, color: "#9c27b0" },
];

const total = sampleData.reduce((acc, item) => acc + item.y, 0);

export default function Financeiro() {
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

      <Flex
        flexDir={"column"}
        w={"full"}
        mr={"18px"}
        overflow={"auto"}
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        <HStack justifyContent={"flex-end"} mt={"10px"} mr={"10px"}>
          <Text>Novo painel</Text>
          <Icon as={IoIosAddCircleOutline} boxSize={"8"} />
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
            <Text fontSize={"3xl"} fontWeight={"bold"}>
              Previdência
            </Text>
            <Box display={"flex"} flexDir={"row"} alignItems={"center"} gap={3}>
              <Text fontSize={"lg"}>Registrar movimento</Text>
              <Icon as={GrTransaction} boxSize={"5"} color={"green"} />
            </Box>
          </HStack>

          <HStack
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            mt={"35px"}
          >
            <Text fontSize={"lg"} fontWeight={"bold"}>
              Entradas e saídas
            </Text>
            <Box display={"flex"} flexDir={"row"} alignItems={"center"} gap={3}>
              <Text fontSize={"lg"}>Filtrar por</Text>
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

          <HStack w={"100%"} display={"flex"} mt={"80px"}>
            <Box display={"flex"} flexDir={"column"} w={"100%"}>
              <HStack display={"flex"} justifyContent={"space-between"}>
                <Text fontSize={"lg"} fontWeight={"bold"}>
                  Gráfico por tipo de gasto
                </Text>
                <HStack gap={3} display={"flex"} alignItems={"center"}>
                  <Text fontSize={"lg"}>Editar categorias</Text>
                  <Icon
                    color={"menu_principal"}
                    as={FaPencilAlt}
                    boxSize={"5"}
                  />
                </HStack>
              </HStack>
              <Box w={"50%"} display={"flex"} flexDir={"row"}>
                <VictoryPie
                  startAngle={90}
                  labels={({ datum }) =>
                    `${((datum.y / total) * 100).toFixed(1)}%`
                  }
                  endAngle={450}
                  data={sampleData}
                  theme={VictoryTheme.clean}
                  style={{
                    labels: {
                      fontWeight: "bold",
                    },
                    data: {
                      fill: ({ datum }) => datum.color,
                    },
                  }}
                />

                <Stack mt={"80px"}>
                  {sampleData.map((item) => (
                    <HStack>
                      <Box
                        borderRadius={"5px"}
                        w={"20px"}
                        h={"20px"}
                        bg={item.color}
                      />
                      <Text fontSize={"lg"} fontWeight={"bold"}>
                        {item.x}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </Box>
            </Box>
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
}
