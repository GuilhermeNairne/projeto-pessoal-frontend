"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { usePanels } from "@/hooks/usePanels";
import { PiPiggyBankFill } from "react-icons/pi";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatarValorBR } from "@/utils/convert-to-real";
import { GraficoGastosMes } from "@/componnents/financial/grafico-gastos-mes";
import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { GraficoJurosMensais } from "@/componnents/financial/grafico-juros-mensais";

export default function Graficos() {
  const { user } = useAuthContext();
  const { listPanels } = usePanels();

  const [painelSelecionado, setPainelSelecionado] = useState<{
    id_panel: number;
    panel: string;
  } | null>(null);

  const { data: panels } = useQuery({
    queryKey: ["panels", user?.id],
    queryFn: async () => listPanels(user?.id ?? ""),
  });

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      p={"20px"}
      flexDir={"row"}
      gap={10}
      overflow="hidden"
    >
      <Menu />

      <Flex flexDir={"column"} mt={30} alignSelf={"flex-start"} w={"full"}>
        <Text fontSize={"2xl"} fontWeight={"bold"} color={`principal`}>
          Selecione o painel
        </Text>
        <HStack mt={`20px`} gap={10}>
          {panels?.data.map((panel) => (
            <Box
              display="flex"
              flexDir="column"
              bg="white"
              onClick={() =>
                setPainelSelecionado({
                  id_panel: panel.id ?? 0,
                  panel: panel.name,
                })
              }
              p="15px"
              borderWidth={2}
              borderColor={
                painelSelecionado?.panel === panel.name
                  ? "menu_principal"
                  : "#dcdcdc"
              }
              borderRadius="8px"
              w="300px"
              h="130px"
              boxShadow="lg"
            >
              <HStack gap={3}>
                <Icon
                  as={PiPiggyBankFill}
                  boxSize="8"
                  color={
                    painelSelecionado?.panel === panel.name
                      ? "menu_principal"
                      : "#aeaeae"
                  }
                />
                <Text
                  fontWeight="bold"
                  fontSize="2xl"
                  color={
                    painelSelecionado?.panel === panel.name
                      ? "menu_principal"
                      : "#aeaeae"
                  }
                >
                  {panel.name}
                </Text>
              </HStack>

              <Text
                mt="20px"
                fontSize="2xl"
                color={
                  painelSelecionado?.panel === panel.name
                    ? "menu_principal"
                    : "#aeaeae"
                }
              >
                R$ {formatarValorBR(panel.initial_value)}
              </Text>
            </Box>
          ))}
        </HStack>

        {painelSelecionado && (
          <Flex
            w={`98%`}
            h={"650px"}
            bg={`white`}
            mt={`40px`}
            p={"20px"}
            overflowY={"auto"}
            flexDir={"column"}
            borderRadius={10}
          >
            <GraficoGastosMes painelSelecionado={painelSelecionado.id_panel} />

            <GraficoJurosMensais
              painelSelecionado={painelSelecionado.id_panel}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
