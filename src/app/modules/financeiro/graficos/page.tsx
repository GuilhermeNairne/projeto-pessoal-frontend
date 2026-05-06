"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { usePanels } from "@/hooks/usePanels";
import { PiPiggyBankFill } from "react-icons/pi";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatarValorBR } from "@/utils/convert-to-real";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  Box,
  Center,
  Flex,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { VictoryPie, VictoryTheme } from "victory";

export default function Graficos() {
  const { user } = useAuthContext();
  const { listPanels, expensesGraphics } = usePanels();
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [painelSelecionado, setPainelSelecionado] = useState<{
    id_panel: number;
    panel: string;
  } | null>(null);

  const {
    data: panels,
    refetch: refetchPanel,
    isLoading: isLoadingPanels,
  } = useQuery({
    queryKey: ["panels", user?.id],
    queryFn: async () => listPanels(user?.id ?? ""),
  });

  const {
    data: graphics,
    refetch: refetchGraphics,
    isLoading: isLoadingGraphics,
  } = useQuery({
    queryKey: ["graphics", mesAtual, anoAtual, painelSelecionado],
    queryFn: async () =>
      expensesGraphics(painelSelecionado?.id_panel ?? 0, mesAtual, anoAtual),
  });

  function alteraMes(funcao: "proximo" | "anterior") {
    const data = new Date(anoAtual, mesAtual - 1);
    data.setMonth(data.getMonth() + (funcao === "proximo" ? 1 : -1));
    setMesAtual(data.getMonth() + 1);
    setAnoAtual(data.getFullYear());
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

      <Flex flexDir={"column"} mt={30} alignSelf={"flex-start"} w={"full"}>
        <Text fontSize={"2xl"} fontWeight={"bold"} color={`principal`}>
          Selecione o painel
        </Text>
        <HStack mt={`20px`} gap={10}>
          {panels?.data.map((panel) => (
            <Box
              display="flex"
              flexDir="column"
              bg="white"
              onClick={() =>
                setPainelSelecionado({
                  id_panel: panel.id ?? 0,
                  panel: panel.name,
                })
              }
              p="15px"
              borderWidth={2}
              borderColor={
                painelSelecionado?.panel === panel.name
                  ? "menu_principal"
                  : "#dcdcdc"
              }
              borderRadius="8px"
              w="300px"
              h="130px"
              boxShadow="lg"
            >
              <HStack gap={3}>
                <Icon
                  as={PiPiggyBankFill}
                  boxSize="8"
                  color={
                    painelSelecionado?.panel === panel.name
                      ? "menu_principal"
                      : "#aeaeae"
                  }
                />
                <Text
                  fontWeight="bold"
                  fontSize="2xl"
                  color={
                    painelSelecionado?.panel === panel.name
                      ? "menu_principal"
                      : "#aeaeae"
                  }
                >
                  {panel.name}
                </Text>
              </HStack>

              <Text
                mt="20px"
                fontSize="2xl"
                color={
                  painelSelecionado?.panel === panel.name
                    ? "menu_principal"
                    : "#aeaeae"
                }
              >
                R$ {formatarValorBR(panel.initial_value)}
              </Text>
            </Box>
          ))}
        </HStack>

        {painelSelecionado && (
          <Flex
            w={`98%`}
            h={"650px"}
            bg={`white`}
            mt={`40px`}
            p={"20px"}
            borderRadius={10}
          >
            <Box>
              <Text fontSize={"lg"} fontWeight={"bold"}>
                Gráfico de gastos do mês
              </Text>

              <HStack mt={10} justifyContent={"space-between"} w={"150px"}>
                <Icon
                  as={FaChevronLeft}
                  onClick={() => alteraMes("anterior")}
                />
                <HStack>
                  <Text style={{ textTransform: "capitalize" }}>
                    {new Date(2026, mesAtual - 1).toLocaleString("pt-BR", {
                      month: "long",
                    })}
                  </Text>
                  <Text>{anoAtual}</Text>
                </HStack>
                <Icon
                  as={FaChevronRight}
                  onClick={() => alteraMes("proximo")}
                />
              </HStack>

              <Stack>
                {isLoadingGraphics ? (
                  <Center mt={20}>
                    <Spinner size={"lg"} />
                  </Center>
                ) : (
                  <Box w={"100%"} display={"flex"} flexDir={"row"}>
                    <Stack>
                      <VictoryPie
                        startAngle={90}
                        labels={({ datum }) => `R$ ${datum.y}`}
                        endAngle={450}
                        data={graphics?.categories}
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

                      <HStack>
                        <Text fontSize={"lg"}>Total gasto: </Text>
                        <Text fontSize={"lg"} fontWeight={"bold"}>
                          R$ {graphics?.total_expenses}
                        </Text>
                      </HStack>
                    </Stack>

                    <Stack
                      mt={"20px"}
                      maxH={"200px"}
                      overflowY={"auto"}
                      overflowX="hidden"
                      w={"250px"}
                      sx={{
                        "::-webkit-scrollbar": {
                          display: "none",
                        },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {graphics?.categories
                        ? graphics.categories.map((item) => (
                            <HStack key={item.x}>
                              <Box
                                borderRadius="5px"
                                w="20px"
                                h="20px"
                                bg={item.color}
                              />
                              <Text fontSize="lg" fontWeight="bold">
                                {item.x}
                              </Text>
                            </HStack>
                          ))
                        : null}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
