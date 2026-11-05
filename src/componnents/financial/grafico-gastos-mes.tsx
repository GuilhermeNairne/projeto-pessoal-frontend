import { usePanels } from "@/hooks/usePanels";
import {
  Box,
  Center,
  HStack,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useQuery } from "react-query";
import { VictoryPie, VictoryTheme } from "victory";
import { FiltroMes } from "./filtro-mes";

type Props = {
  painelSelecionado: number;
  // Quando informados, o mês é controlado por fora e o filtro interno não aparece
  mesAtual?: number;
  anoAtual?: number;
};

export function GraficoGastosMes({ painelSelecionado, ...props }: Props) {
  const { expensesGraphics } = usePanels();
  const [anoInterno, setAnoInterno] = useState(new Date().getFullYear());
  const [mesInterno, setMesInterno] = useState(new Date().getMonth() + 1);
  const filtroExterno =
    props.mesAtual !== undefined && props.anoAtual !== undefined;
  const mesAtual = props.mesAtual ?? mesInterno;
  const anoAtual = props.anoAtual ?? anoInterno;
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

  return (
    <Box>
      <Text fontSize={"lg"} fontWeight={"bold"}>
        Gráfico de gastos do mês
      </Text>

      {filtroExterno ? null : (
        <FiltroMes
          mt={10}
          mesAtual={mesAtual}
          anoAtual={anoAtual}
          onChange={(mes, ano) => {
            setMesInterno(mes);
            setAnoInterno(ano);
          }}
        />
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
                    parent: {
                      backgroundColor: "var(--chakra-colors-surface-card)",
                    },
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
                  <Text fontSize={"sm"} color={"text.muted"}>
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
