import { usePanels } from "@/hooks/usePanels";
import { formatarValorBR } from "@/utils/convert-to-real";
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
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  VictoryTheme,
} from "victory";

type Props = {
  painelSelecionado: number;
};

const CORES = {
  salario: "#339c00",
  despesas: "#d50c20",
};

export function GraficoSalarioDespesas({ painelSelecionado }: Props) {
  const { totalSalary, expensesGraphics } = usePanels();
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const chartWidth = useBreakpointValue({ base: 320, md: 550 }) ?? 550;
  const chartHeight = 110;

  function alteraMes(funcao: "proximo" | "anterior") {
    const data = new Date(anoAtual, mesAtual - 1);
    data.setMonth(data.getMonth() + (funcao === "proximo" ? 1 : -1));
    setMesAtual(data.getMonth() + 1);
    setAnoAtual(data.getFullYear());
  }

  const { data: salaryData, isLoading: isLoadingSalary } = useQuery({
    queryKey: ["salary", mesAtual, anoAtual, painelSelecionado],
    queryFn: async () =>
      totalSalary(painelSelecionado ?? 0, mesAtual, anoAtual),
  });

  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["graphics", mesAtual, anoAtual, painelSelecionado],
    queryFn: async () =>
      expensesGraphics(painelSelecionado ?? 0, mesAtual, anoAtual),
  });

  const isLoading = isLoadingSalary || isLoadingExpenses;

  const data = [
    {
      x: "Salário    ",
      y: salaryData?.total_salary ?? 0,
      color: CORES.salario,
    },
    {
      x: "Despesas",
      y: expensesData?.total_expenses ?? 0,
      color: CORES.despesas,
    },
  ];

  const semMovimentos = data.every((item) => item.y === 0);

  return (
    <Box mt={"100px"}>
      <Text fontSize={"lg"} fontWeight={"bold"}>
        Salário x Despesas do mês
      </Text>

      <HStack mt={5} justifyContent={"space-between"} w={"150px"}>
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

      {isLoading ? (
        <Center mt={10}>
          <Spinner size={"lg"} />
        </Center>
      ) : semMovimentos ? (
        <Text mt={10} fontWeight={"bold"}>
          Nenhum movimento registrado nesse mês
        </Text>
      ) : (
        <Stack p={1} mt={10} align={"flex-start"}>
          <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ y: 20 }}
            width={chartWidth}
            height={chartHeight}
            padding={{ top: 15, bottom: 25, left: 90, right: 70 }}
            containerComponent={<VictoryContainer responsive={false} />}
          >
            <VictoryAxis
              style={{
                axis: { stroke: "transparent" },
                tickLabels: {
                  fontWeight: "bold",
                  fontSize: 14,
                  fill: "var(--chakra-colors-text-primary)",
                },
              }}
            />
            <VictoryBar
              horizontal
              barWidth={24}
              cornerRadius={{ topRight: 4, bottomRight: 4 }}
              data={data}
              labels={({ datum }) => `R$ ${formatarValorBR(datum.y)}`}
              style={{
                data: { fill: ({ datum }) => datum.color },
                labels: {
                  fontWeight: "bold",
                  fill: "var(--chakra-colors-text-primary)",
                },
              }}
            />
          </VictoryChart>
        </Stack>
      )}
    </Box>
  );
}
