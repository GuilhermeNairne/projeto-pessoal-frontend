import { usePanels } from "@/hooks/usePanels";
import {
  Box,
  Center,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useQuery } from "react-query";
import { VictoryPie, VictoryTheme } from "victory";

type Props = {
  painelSelecionado: number;
};

export function GraficoGastosMes({ painelSelecionado }: Props) {
  const { listPanels, expensesGraphics } = usePanels();
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);

  const {
    data: expensesGraphicsData,
    refetch: refetchGraphics,
    isLoading: isLoadingGraphics,
  } = useQuery({
    queryKey: ["graphics", mesAtual, anoAtual, painelSelecionado],
    queryFn: async () =>
      expensesGraphics(painelSelecionado ?? 0, mesAtual, anoAtual),
  });

  function alteraMes(funcao: "proximo" | "anterior") {
    const data = new Date(anoAtual, mesAtual - 1);
    data.setMonth(data.getMonth() + (funcao === "proximo" ? 1 : -1));
    setMesAtual(data.getMonth() + 1);
    setAnoAtual(data.getFullYear());
  }

  return (
    <Box>
      <Text fontSize={"lg"} fontWeight={"bold"}>
        Gráfico de gastos do mês
      </Text>

      <HStack mt={10} justifyContent={"space-between"} w={"150px"}>
        <Icon as={FaChevronLeft} onClick={() => alteraMes("anterior")} />
        <HStack>
          <Text style={{ textTransform: "capitalize" }}>
            {new Date(2026, mesAtual - 1).toLocaleString("pt-BR", {
              month: "long",
            })}
          </Text>
          <Text>{anoAtual}</Text>
        </HStack>
        <Icon as={FaChevronRight} onClick={() => alteraMes("proximo")} />
      </HStack>
      {expensesGraphicsData?.total_expenses === 0 ? (
        <Text mt={10} fontWeight={`bold`}>
          Nenhum movimento registrado nesse mês
        </Text>
      ) : (
        <Stack>
          {isLoadingGraphics ? (
            <Center mt={20}>
              <Spinner size={"lg"} />
            </Center>
          ) : (
            <Box w={"100%"} display={"flex"} flexDir={"row"}>
              <Stack position={"relative"} w={"350px"}>
                <VictoryPie
                  width={300}
                  height={300}
                  padding={{ top: 20, bottom: 20, left: 20, right: 56 }}
                  innerRadius={80}
                  padAngle={2}
                  startAngle={90}
                  labels={({ datum }) => `R$ ${datum.y}`}
                  endAngle={450}
                  theme={VictoryTheme.clean}
                  style={{
                    labels: {
                      fontWeight: "bold",
                    },
                    data: {
                      fill: ({ datum }) => datum.color,
                    },
                  }}
                  data={expensesGraphicsData?.categories}
                />

                <Stack
                  position={"absolute"}
                  top={"50%"}
                  left={"45%"}
                  transform={"translate(-50%, -50%)"}
                  gap={0}
                  align={"center"}
                  pointerEvents={"none"}
                >
                  <Text fontSize={"sm"} color={"gray.500"}>
                    Total gasto
                  </Text>
                  <Text fontSize={"lg"} fontWeight={"bold"}>
                    R$ {expensesGraphicsData?.total_expenses}
                  </Text>
                </Stack>
              </Stack>

              <Stack
                mt={"20px"}
                ml={40}
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
                {expensesGraphicsData?.categories
                  ? expensesGraphicsData.categories.map((item) => (
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
      )}
    </Box>
  );
}
