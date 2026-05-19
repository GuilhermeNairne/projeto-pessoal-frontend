import { usePanels } from "@/hooks/usePanels";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { useQuery } from "react-query";

type Props = {
  painelSelecionado: number;
};

export function GraficoJurosMensais({ painelSelecionado }: Props) {
  const { feesByMonth } = usePanels();

  const { data: feesData } = useQuery({
    queryKey: ["fees", painelSelecionado],
    queryFn: async () => feesByMonth(painelSelecionado),
  });

  return (
    <Stack mt={"100px"}>
      <Text fontSize={"lg"} fontWeight={"bold"}>
        Gráfico de juros por mês
      </Text>
      {feesData?.data.length === 0 && (
        <Text mt={2}>Nenhum movimento de juros registrado</Text>
      )}
      <HStack
        p={feesData && feesData?.data.length > 0 ? 5 : 0}
        spacing={10}
        display={"flex"}
        align={"flex-end"}
      >
        {feesData?.data.map((fee, index) => (
          <Stack key={index}>
            <Text>{fee.total}</Text>
            <Box
              w={10}
              h={Number(fee.total) / 10}
              bg={"red.600"}
              borderRadius={3}
            />
            <Text fontWeight={"bold"}>
              {new Date(fee.month)
                .toLocaleString("pt-BR", { month: "long" })
                .replace(/^./, (char) => char.toUpperCase())}
            </Text>
          </Stack>
        ))}
      </HStack>
    </Stack>
  );
}
