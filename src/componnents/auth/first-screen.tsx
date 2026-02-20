import { Box, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { FaCalendar, FaDollarSign } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";

export function FirstScreen() {
  const itens = [
    {
      bg: "#20365B",
      icon: FaDollarSign,
      iconColor: "#008BB2",
      text: "Controle financeiro",
      subtext: "Gerencie suas finanças com facilidade",
    },
    {
      bg: "#2A325E",
      icon: FaCalendar,
      iconColor: "#5A72C3",
      text: "Calendário de estudos",
      subtext: "Organize sua rotina de aprendizado",
    },
    {
      bg: "#333260",
      icon: GiProgression,
      iconColor: "#A78BFA",
      text: "Acompanhe Progresso",
      subtext: "Visualize sua evolução em tempo real",
    },
  ];

  return (
    <Flex
      w="40%"
      h="full"
      pb={12}
      pl={28}
      justifyContent={"center"}
      flexDir={"column"}
      bg="radial-gradient(circle, #0a1323 0%, var(--chakra-colors-menu_principal) 75%)"
    >
      <Text fontSize={"5xl"} fontWeight={"bold"} color={"white"}>
        Organize hoje.
      </Text>
      <Text fontSize={"5xl"} fontWeight={"bold"} color={"#60a5fa"} mt={-2}>
        Conquiste amanhã.
      </Text>

      <Stack mt={20}>
        {itens.map((item) => (
          <HStack mt={5} gap={5}>
            <Box
              w={"50px"}
              h={"50px"}
              bg={item.bg}
              borderRadius={5}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              _hover={{
                transform: "scale(1.03)",
              }}
            >
              <Icon as={item.icon} boxSize={7} color={item.iconColor} />
            </Box>
            <Stack gap={0}>
              <Text fontSize={"2xl"} fontWeight={"light"} color={"white"}>
                {item.text}
              </Text>
              <Text fontSize={"lg"} fontWeight={"light"} color={"gray.500"}>
                {item.subtext}
              </Text>
            </Stack>
          </HStack>
        ))}
      </Stack>
    </Flex>
  );
}
