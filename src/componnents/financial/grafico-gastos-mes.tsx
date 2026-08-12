import { usePanels } from "@/hooks/usePanels";
import {
  Box,
  Center,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useQuery } from "react-query";
import { VictoryPie, VictoryTheme } from "victory";

type Props = {
  painelSelecionado: number;
};

export function GraficoGastosMes({ painelSelecionado }: Props) {
  const { expensesGraphics } = usePanels();
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const pieSize = useBreakpointValue({ base: 260, md: 350 }) ?? 350;
  const pieInnerRadius = useBreakpointValue({ base: 50, md: 80 }) ?? 80;

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

      {expensesGraphicsData?.total_expenses === 0 ? null : (
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
      )}
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
            <Box
              w={"100%"}
              display={"flex"}
              flexDir={{ base: "column", md: "row" }}
              alignItems={{ base: "center", md: "flex-start" }}
            >
              <Stack position={"relative"} w={`${pieSize}px`} flexShrink={0}>
                <VictoryPie
                  width={pieSize}
                  height={pieSize}
                  padding={{ top: 30, bottom: 30, left: 50, right: 50 }}
                  innerRadius={pieInnerRadius}
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
                  left={"50%"}
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
                mt={{ base: 5, md: "20px" }}
                ml={{ base: 0, md: 10 }}
                maxH={"200px"}
                overflowY={"auto"}
                overflowX="hidden"
                w={{ base: "100%", md: "250px" }}
                maxW={{ base: `${pieSize}px`, md: "250px" }}
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
                      <HStack key={item.x} w={"100%"}>
                        <Box
                          flexShrink={0}
                          borderRadius="5px"
                          w="20px"
                          h="20px"
                          bg={item.color}
                        />
                        <Text
                          flex={1}
                          minW={0}
                          overflow={"hidden"}
                          textOverflow={"ellipsis"}
                          whiteSpace={"nowrap"}
                          title={item.x}
                          fontSize="lg"
                          fontWeight="bold"
                        >
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
