import { useQuery } from "react-query";
import { VictoryPie, VictoryTheme } from "victory";
import { useMovements } from "@/hooks/useMovements";
import { PanelsType } from "@/types/financial-types";
import { Box, HStack, Spinner, Stack, Text } from "@chakra-ui/react";

type Props = {
  panel: PanelsType;
  month: number;
};

export function GraficoTipoGasto({ panel, month }: Props) {
  const { listExpensesByMonth } = useMovements();
  const monthName = new Date().toLocaleString("pt-BR", { month: "long" });

  const {
    data: chartData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["expensesByMonth", panel, month],
    queryFn: async () => listExpensesByMonth(Number(panel.id), month),
  });

  return (
    <Box display={"flex"} flexDir={"column"}>
      <HStack display={"flex"} justifyContent={"space-between"}>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          Gráfico por tipo de gasto do mês de {monthName.toUpperCase()}
        </Text>
      </HStack>
      {panel.movements?.some((move) => move.movement_type === "OUT") ? (
        <Box w={"100%"} display={"flex"} flexDir={"row"}>
          {isLoading ? (
            <Spinner size={"lg"} />
          ) : (
            <Stack>
              <VictoryPie
                startAngle={90}
                labels={({ datum }) => `R$ ${datum.y}`}
                endAngle={450}
                data={chartData?.data.data}
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
                  R$ {chartData?.data.total}
                </Text>
              </HStack>
            </Stack>
          )}
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
            {panel.categories
              ? panel.categories
                  .filter((item) => (item.totalSpent ? item.totalSpent : 0))
                  .map((item) => (
                    <HStack key={item.name}>
                      <Box
                        borderRadius="5px"
                        w="20px"
                        h="20px"
                        bg={item.color}
                      />
                      <Text fontSize="lg" fontWeight="bold">
                        {item.name}
                      </Text>
                    </HStack>
                  ))
              : null}
          </Stack>
        </Box>
      ) : (
        <Text mt={"10px"}>
          Não foi registrado nenhuma movimentação de gasto.
        </Text>
      )}
    </Box>
  );
}
