import { usePathname } from "next/navigation";
import { AiOutlineBarChart } from "react-icons/ai";
import { FaBook, FaSignOutAlt, FaMoon } from "react-icons/fa";

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";

export function Menu() {
  const pathname = usePathname();

  return (
    <Flex
      w={"17%"}
      h={"100%"}
      bgGradient="linear(to-b, menu_principal, menu_secundario)"
      borderRadius={"20px"}
      p={"20px"}
      pt={"35px"}
      flexDir={"column"}
      justifyContent={"space-between"}
    >
      <Flex flexDir={"column"}>
        <Box
          display={"flex"}
          flexDir={"row"}
          gap={5}
          h={"10%"}
          alignItems={"center"}
          mt={"10px"}
        >
          <Image
            w={"70px"}
            h={"70px"}
            src="/foto_perfil.png"
            borderRadius={"100%"}
          />
          <Text color={"white"} fontWeight={"bold"} fontSize={"18px"}>
            Guilherme
          </Text>
        </Box>

        <Stack mt={"50px"}>
          <Button
            display={"flex-start"}
            w={"100%"}
            h={"70px"}
            bg={pathname === "/financeiro" ? "menu_selecionado" : "null"}
            alignItems={"center"}
            p={"10px"}
            _hover={{
              bg: "menu_selecionado",
            }}
            borderRadius={"10px"}
          >
            <HStack gap={4}>
              <Icon as={AiOutlineBarChart} boxSize={"8"} color={"white"} />
              <Text color={"white"} fontWeight={"bold"}>
                Financeiro
              </Text>
            </HStack>
          </Button>

          <Button
            display={"flex-start"}
            w={"100%"}
            h={"70px"}
            bg={pathname === "/atividades" ? "menu_selecionado" : "null"}
            alignItems={"center"}
            p={"10px"}
            _hover={{
              bg: "menu_selecionado",
            }}
            borderRadius={"10px"}
          >
            <HStack gap={4}>
              <Icon as={FaBook} boxSize={"8"} color={"white"} />
              <Text color={"white"} fontWeight={"bold"}>
                Estudos
              </Text>
            </HStack>
          </Button>
        </Stack>
      </Flex>

      <Flex flexDir={"column"}>
        <Box w={"full"} h={"1px"} bg={"menu_selecionado"} />

        <HStack gap={4} mt={"25px"} ml={"10px"}>
          <Icon as={FaSignOutAlt} boxSize={"6"} color={"white"} />
          <Text fontWeight={"semi-bold"} color={"white"}>
            Sair
          </Text>
        </HStack>

        <Box
          w={"100%"}
          h={"55px"}
          borderRadius={"20px"}
          bg={"menu_selecionado"}
          alignItems={"center"}
          display={"flex"}
          p={"10px"}
          mt={"25px"}
          justifyContent={"space-between"}
        >
          <Box display={"flex"} flexDir={"row"} gap={5}>
            <Icon as={FaMoon} boxSize={"6"} color={"white"} />
            <Text color={"white"}>Modo claro</Text>
          </Box>
          <Switch size={"md"} />
        </Box>
      </Flex>
    </Flex>
  );
}
