import { Box, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { FaCalendar, FaDollarSign } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";

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
      text: "Calendário de atividades",
      subtext: "Organize sua rotina de aprendizado",
    },
    {
      bg: "#333260",
      icon: IoIosNotifications,
      iconColor: "#A78BFA",
      text: "Notificações",
      subtext: "Envio de notificações via email e whatsapp",
    },
  ];

  return (
    <Flex
      w={{ base: "0%", lg: "40%" }}
      h="full"
      pb={12}
      pl={{ base: 6, md: 12, lg: 16, xl: 28 }}
      pr={{ base: 4, md: 6, lg: 8 }}
      borderRadius={20}
      justifyContent={"center"}
      flexDir={"column"}
      display={{ base: "none", lg: "flex" }}
      bg="radial-gradient(circle, #0a1323 0%, var(--chakra-colors-menu_principal) 75%)"
    >
      <Text
        fontSize={{ base: "2xl", lg: "4xl", xl: "5xl" }}
        fontWeight={"bold"}
        color={"white"}
      >
        Organize hoje.
      </Text>
      <Text
        fontSize={{ base: "2xl", lg: "4xl", xl: "5xl" }}
        fontWeight={"bold"}
        color={"#60a5fa"}
        mt={-2}
      >
        Conquiste amanhã.
      </Text>

      <Stack mt={{ base: 10, lg: 14, xl: 20 }}>
        {itens.map((item, index) => (
          <HStack mt={{ base: 3, lg: 5 }} gap={{ base: 3, lg: 5 }} key={index}>
            <Box
              w={"50px"}
              h={"50px"}
              minW={"50px"}
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
              <Text
                fontSize={{ base: "lg", lg: "xl", xl: "2xl" }}
                fontWeight={"light"}
                color={"white"}
              >
                {item.text}
              </Text>
              <Text
                fontSize={{ base: "sm", lg: "md", xl: "lg" }}
                fontWeight={"light"}
                color={"gray.500"}
              >
                {item.subtext}
              </Text>
            </Stack>
          </HStack>
        ))}
      </Stack>
    </Flex>
  );
}
