import { Box, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { FaBook } from "react-icons/fa";

export function Quadros() {
  const quadros = [
    {
      title: "PRIMEIRO TEXTO",
      quantidade: "01",
      color: "red.600",
      icon: FaBook,
    },
    {
      title: "SEGUNDO TEXTO",
      quantidade: "02",
      color: "blue.600",
      icon: FaBook,
    },
    {
      title: "TERCEIRO TEXTO",
      quantidade: "04",
      color: "green.600",
      icon: FaBook,
    },
    {
      title: "QUARTO TEXTO",
      quantidade: "04",
      color: "orange.600",
      icon: FaBook,
    },
  ];

  return (
    <HStack gap={10} display={"flex"}>
      {quadros.map((quadro) => (
        <Box
          p={3}
          w={250}
          h={"120px"}
          borderRadius={8}
          boxShadow={"md"}
          bg={"white"}
        >
          <HStack>
            <Box
              w={8}
              h={8}
              bg={quadro.color}
              borderRadius={5}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Icon as={quadro.icon} boxSize={5} color={"white"} />
            </Box>
            <Text fontSize={"sm"} color={"gray.500"} fontWeight={"light"}>
              {quadro.title}
            </Text>
          </HStack>

          <Text
            mt={10}
            fontSize={"lg"}
            color={quadro.color}
            fontWeight={"bold"}
          >
            {quadro.quantidade} atividades
          </Text>
        </Box>
      ))}
    </HStack>
  );
}
