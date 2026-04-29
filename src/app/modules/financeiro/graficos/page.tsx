"use client";

import { Menu } from "@/componnents/menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePanels } from "@/hooks/usePanels";
import { formatarValorBR } from "@/utils/convert-to-real";
import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { useState } from "react";
import { PiPiggyBankFill } from "react-icons/pi";
import { useQuery } from "react-query";

export default function Graficos() {
  const { user } = useAuthContext();
  const { listPanels } = usePanels();
  const [painelSelecionado, setPainelSelecionado] = useState("");

  const {
    data: panels,
    refetch: refetchPanel,
    isLoading,
  } = useQuery({
    queryKey: ["panels", user?.id],
    queryFn: async () => listPanels(user?.id ?? ""),
  });

  function calculaTotal() {
    return formatarValorBR(
      panels?.data.reduce(
        (total, item) => total + Number(item.initial_value),
        0,
      ) ?? 0,
    );
  }

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
              onClick={() => setPainelSelecionado(panel.name)}
              p="15px"
              borderWidth={2}
              borderColor={
                painelSelecionado === panel.name ? "menu_principal" : "#dcdcdc"
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
                    painelSelecionado === panel.name
                      ? "menu_principal"
                      : "#aeaeae"
                  }
                />
                <Text
                  fontWeight="bold"
                  fontSize="2xl"
                  color={
                    painelSelecionado === panel.name
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
                  painelSelecionado === panel.name
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
            h={`600px`}
            bg={`white`}
            mt={`40px`}
            borderRadius={10}
          ></Flex>
        )}
      </Flex>
    </Flex>
  );
}
