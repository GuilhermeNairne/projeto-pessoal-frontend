"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { usePanels } from "@/hooks/usePanels";
import { PiPiggyBankFill } from "react-icons/pi";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatarValorBR } from "@/utils/convert-to-real";
import { GraficoGastosMes } from "@/componnents/financial/grafico-gastos-mes";
import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { GraficoJurosMensais } from "@/componnents/financial/grafico-juros-mensais";
import { ScrollBarcss } from "@/utils/scroll-bar-css";

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
      p={{ base: "20px", lg: "20px" }}
      flexDir={{ base: "column", lg: "row" }}
      gap={{ base: 4, lg: 10 }}
      overflow="hidden"
    >
      <MenuMobile />
      <Menu />

      <Flex flexDir={"column"} w={"full"} mr={"18px"}>
        <Text
          fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
          fontWeight={"bold"}
          color={`principal`}
        >
          Selecione o painel
        </Text>
        <Flex
          mt={{ base: "10px", lg: "20px" }}
          gap={{ base: 3, lg: 10 }}
          flexWrap="wrap"
        >
          {panels?.data.map((panel) => (
            <Box
              key={panel.id}
              display="flex"
              flexDir="column"
              bg="white"
              cursor="pointer"
              onClick={() =>
                setPainelSelecionado({
                  id_panel: panel.id ?? 0,
                  panel: panel.name,
                })
              }
              p={{ base: "10px", lg: "15px" }}
              borderWidth={2}
              borderColor={
                painelSelecionado?.panel === panel.name
                  ? "menu_principal"
                  : "#dcdcdc"
              }
              borderRadius="8px"
              w={{
                base: "100%",
                sm: "calc(50% - 6px)",
                md: "250px",
                lg: "300px",
              }}
              h={{ base: "auto", lg: "130px" }}
              minH="100px"
              boxShadow="lg"
            >
              <HStack gap={{ base: 2, lg: 3 }}>
                <Icon
                  as={PiPiggyBankFill}
                  boxSize={{ base: "6", lg: "8" }}
                  color={
                    painelSelecionado?.panel === panel.name
                      ? "menu_principal"
                      : "#aeaeae"
                  }
                />
                <Text
                  fontWeight="bold"
                  fontSize={{ base: "lg", lg: "2xl" }}
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
                mt={{ base: "10px", lg: "20px" }}
                fontSize={{ base: "lg", lg: "2xl" }}
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
        </Flex>

        {painelSelecionado && (
          <Flex
            w={{ base: "100%", lg: "98%" }}
            h={{ base: "auto", lg: "650px" }}
            minH={{ base: "400px", md: "500px" }}
            bg={`white`}
            mt={{ base: "20px", lg: "40px" }}
            p={{ base: "10px", md: "15px", lg: "20px" }}
            overflow={"auto"}
            css={ScrollBarcss}
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
