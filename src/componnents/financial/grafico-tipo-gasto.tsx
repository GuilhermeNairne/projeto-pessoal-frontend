import { PanelsType } from "@/types/financial-types";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { VictoryPie, VictoryTheme } from "victory";

type Props = {
  panel: PanelsType;
};

export function GraficoTipoGasto({ panel }: Props) {
  const chartData = panel.categories
    ?.map((category) => {
      const total = (panel.movements ?? [])
        .filter(
          (m) => m.movement_type === "OUT" && m.category_id === category.id,
        )
        .reduce((acc, m) => acc + Number(m.value), 0);

      return {
        x: category.name,
        y: total,
        color: category.color,
      };
    })
    .filter((item) => item.y > 0);

  return (
    <Box display={"flex"} flexDir={"column"}>
      <HStack display={"flex"} justifyContent={"space-between"}>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          Gráfico por tipo de gasto
        </Text>
      </HStack>
      {panel.movements?.some((move) => move.movement_type === "OUT") ? (
        <Box w={"100%"} display={"flex"} flexDir={"row"}>
          <VictoryPie
            startAngle={90}
            labels={({ datum }) => `R$ ${datum.y}`}
            endAngle={450}
            data={chartData}
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
