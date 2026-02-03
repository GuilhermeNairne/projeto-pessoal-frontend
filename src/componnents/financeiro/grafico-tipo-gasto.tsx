import { PanelsType } from "@/types/financial-types";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { VictoryPie, VictoryTheme } from "victory";

type Props = {
  panel: PanelsType;
};

export function GraficoTipoGasto({ panel }: Props) {
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
            labels={({ datum }) => `R$ ${datum.y},00`}
            endAngle={450}
            data={panel.categories}
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
            w={"200px"}
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
                  .filter((item) => (item.totalSpent ? item.totalSpent : 0 > 0))
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
