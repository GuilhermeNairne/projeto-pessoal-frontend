import { formatarValorBR } from "@/utils/convert-to-real";
import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { PiMoneyWavyFill, PiPiggyBankFill } from "react-icons/pi";

type Props = {
  paineis: {
    nome: string;
    valor: string;
  }[];
};

export function PainelContas({ paineis }: Props) {
  function calculaTotal() {
    return formatarValorBR(
      paineis.reduce((total, item) => total + Number(item.valor), 0)
    );
  }

  const chunk = (arr: any[], size: number) =>
    arr.reduce((acc: any[][], _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);

  const linhas = chunk(paineis, 3);

  const ultimaLinha = linhas.length > 0 ? linhas[linhas.length - 1] : [];

  const precisaLinhaExtraParaTotal = ultimaLinha.length === 3;

  if (precisaLinhaExtraParaTotal) {
    linhas.push([]);
  }

  return (
    <Flex flexDir="column" gap={5} mt={"20px"}>
      {linhas.map((linha: any, index: any) => (
        <HStack key={index} gap={10}>
          {linha.map((conta: any) => (
            <Box
              key={conta.nome}
              display="flex"
              flexDir="column"
              bg="white"
              p="15px"
              borderRadius="8px"
              w="350px"
              h="130px"
              boxShadow="lg"
            >
              <HStack gap={3}>
                <Icon as={PiMoneyWavyFill} boxSize="8" color="green" />
                <Text fontWeight="bold" fontSize="2xl">
                  {conta.nome}
                </Text>
              </HStack>

              <Text mt="20px" fontSize="2xl">
                R$ {formatarValorBR(conta.valor)}
              </Text>
            </Box>
          ))}

          {index === linhas.length - 1 && (
            <Box
              display="flex"
              flexDir="column"
              bg="menu_principal"
              p="15px"
              borderRadius="8px"
              w="350px"
              h="130px"
              boxShadow="lg"
            >
              <HStack gap={3}>
                <Icon as={PiPiggyBankFill} boxSize="8" color="white" />
                <Text fontWeight="bold" fontSize="2xl" color="white">
                  Total
                </Text>
              </HStack>

              <Text mt="20px" fontSize="2xl" color="white">
                R$ {calculaTotal()}
              </Text>
            </Box>
          )}
        </HStack>
      ))}
    </Flex>
  );
}
