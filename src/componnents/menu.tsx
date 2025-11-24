import { Box, Flex, HStack, Image, Text } from "@chakra-ui/react";
import NextImage from "next/image";

export function Menu() {
  return (
    <Flex
      w={"20%"}
      h={"100%"}
      bgGradient="linear(to-b, menu_principal, menu_secundario)"
      borderRadius={"20px"}
      p={"20px"}
    >
      <Box display={"flex"} flexDir={"row"} alignItems={"center"} gap={5}>
        <Image
          w={"60px"}
          h={"60px"}
          src="/foto_perfil.png"
          borderRadius={"100%"}
        />
        <Text>Guilherme</Text>
      </Box>
    </Flex>
  );
}
