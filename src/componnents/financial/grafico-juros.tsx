import { usePanels } from "@/hooks/usePanels";
import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";

export function GraficoJuros() {
  const { getJuros } = usePanels();

  const data = [
    {
      month: "2026-03-01T00:00:00.000Z",
      total: "627.88",
    },
    {
      month: "2026-04-01T00:00:00.000Z",
      total: "700.88",
    },
  ];

  return (
    <Flex mt={"40px"} flexDir={"column"}>
      <Text fontSize={"lg"} fontWeight={"bold"}>
        Gráfico de juros mensais
      </Text>

      <HStack p={5} spacing={10} display={"flex"} align={"flex-end"}>
        {data.map((mes) => (
          <Stack>
            <Text>{mes.total}</Text>
            <Box
              w={10}
              h={Number(mes.total) / 10}
              bg={"red.600"}
              borderRadius={3}
            />
            <Text fontWeight={"bold"}>
              {new Date(mes.month).toLocaleString("pt-BR", { month: "long" })}
            </Text>
          </Stack>
        ))}
      </HStack>
    </Flex>
  );
}
