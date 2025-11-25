import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { PiMoneyWavyFill, PiPiggyBankFill } from "react-icons/pi";

const contas = [
  {
    nome: "Previdência",
    valor: "58.547,56",
  },
  {
    nome: "Conta corrente",
    valor: "560,45",
  },
];

export function PainelContas() {
  return (
    <HStack mt={"50px"}>
      <Box gap={10} display={"flex"}>
        {contas.map((conta) => (
          <Box
            display={"flex"}
            flexDir={"column"}
            bg={"white"}
            p={"15px"}
            borderRadius={"8px"}
            w={"350px"}
            h={"130px"}
            boxShadow={"lg"}
          >
            <HStack gap={3}>
              <Icon as={PiMoneyWavyFill} boxSize={"8"} color={"green"} />
              <Text fontSize={"2xl"}>{conta.nome}</Text>
            </HStack>
            <Text mt={"20px"} fontWeight={"bold"} fontSize={"2xl"}>
              R$ {conta.valor}
            </Text>
          </Box>
        ))}
        <Box
          display={"flex"}
          flexDir={"column"}
          bg={"menu_principal"}
          p={"15px"}
          borderRadius={"8px"}
          w={"350px"}
          h={"130px"}
          boxShadow={"lg"}
        >
          <HStack gap={3}>
            <Icon as={PiPiggyBankFill} boxSize={"8"} color={"white"} />
            <Text fontSize={"2xl"} color={"white"}>
              Total
            </Text>
          </HStack>
          <Text
            mt={"20px"}
            fontWeight={"bold"}
            fontSize={"2xl"}
            color={"white"}
          >
            R$ 60.785,12
          </Text>
        </Box>
      </Box>
    </HStack>
  );
}
