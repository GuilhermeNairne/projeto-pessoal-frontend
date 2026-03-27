import { usePanels } from "@/hooks/usePanels";
import { JurosType } from "@/types/financial-types";
import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";

type Props = {
  juros?: JurosType[];
};

export function GraficoJuros({ juros }: Props) {
  return (
    <Flex mt={"40px"} flexDir={"column"}>
      <Text fontSize={"lg"} fontWeight={"bold"}>
        Gráfico de juros mensais
      </Text>

      <HStack
        p={juros && juros?.length > 0 ? 5 : 0}
        spacing={10}
        display={"flex"}
        align={"flex-end"}
      >
        {juros && juros.length > 0 ? (
          juros.map((mes, index) => (
            <Stack key={index}>
              <Text>{mes.total}</Text>
              <Box
                w={10}
                h={Number(mes.total) / 10}
                bg={"red.600"}
                borderRadius={3}
              />
              <Text fontWeight={"bold"}>
                {new Date(mes.month)
                  .toLocaleString("pt-BR", { month: "long" })
                  .replace(/^./, (char) => char.toUpperCase())}
              </Text>
            </Stack>
          ))
        ) : (
          <Text color={"gray.500"}>
            Crie uma categoria juros para aparecer o gráfico.
          </Text>
        )}
      </HStack>
    </Flex>
  );
}
