import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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

const menuOpcoes = [
  {
    nome: "Financeiro",
    icon: FaSignOutAlt,
  },
  {
    nome: "Estudos",
    icon: FaBook,
  },
];

export function Menu() {
  const [name, setName] = useState<string | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  const pathname = usePathname();
  const defaultPicture =
    "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg";

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const picture = localStorage.getItem("picture");

    setName(name);
    setPicture(picture);
  }, []);

  async function Logout() {
    await fetch("/api/logout", { method: "GET" });

    const clientId = "7mu3omfrp7utmr1niauqlghfvv";
    const logoutUri = "http://localhost:3001/login";
    const cognitoDomain =
      "https://us-east-2vdy8onemf.auth.us-east-2.amazoncognito.com";

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  }

  return (
    <Flex
      w={"22%"}
      h={"100%"}
      bg={"menu_principal"}
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
            src={picture ?? defaultPicture}
            borderRadius={"100%"}
          />
          <Text color={"white"} fontWeight={"bold"} fontSize={"18px"}>
            {name}
          </Text>
        </Box>

        <Stack mt={"50px"}>
          {menuOpcoes.map((item) => (
            <Button
              display={"flex-start"}
              w={"100%"}
              h={"70px"}
              bg={pathname === `/${item.nome.toLowerCase()}` ? "white" : "null"}
              alignItems={"center"}
              p={"10px"}
              _hover={{
                bg:
                  pathname === `/${item.nome.toLowerCase()}`
                    ? "null"
                    : "menu_selecionado",
              }}
              borderRadius={"10px"}
            >
              <HStack gap={4}>
                <Icon
                  as={item.icon}
                  boxSize={"8"}
                  color={
                    pathname === `/${item.nome.toLowerCase()}`
                      ? "menu_principal"
                      : "white"
                  }
                />
                <Text
                  color={
                    pathname === `/${item.nome.toLowerCase()}`
                      ? "menu_principal"
                      : "white"
                  }
                  fontWeight={
                    pathname === `/${item.nome.toLowerCase()}`
                      ? "bold"
                      : "light"
                  }
                  fontSize={"lg"}
                >
                  {item.nome}
                </Text>
              </HStack>
            </Button>
          ))}
        </Stack>
      </Flex>

      <Flex flexDir={"column"}>
        <Box w={"full"} h={"1px"} bg={"menu_selecionado"} />

        <HStack gap={4} mt={"25px"} ml={"10px"} onClick={() => Logout()}>
          <Icon as={FaSignOutAlt} boxSize={"6"} color={"white"} />
          <Text fontWeight={"semi-bold"} color={"white"} fontSize={"lg"}>
            Sair
          </Text>
        </HStack>

        <Box
          w={"100%"}
          h={"55px"}
          borderRadius={"20px"}
          bg={"white"}
          alignItems={"center"}
          display={"flex"}
          p={"10px"}
          mt={"25px"}
          justifyContent={"space-between"}
        >
          <Box display={"flex"} flexDir={"row"} gap={5}>
            <Icon as={FaMoon} boxSize={"6"} color={"menu_principal"} />
            <Text color={"menu_principal"} fontSize={"lg"}>
              Modo escuro
            </Text>
          </Box>
          <Switch color={"blackAlpha.600"} size={"md"} />
        </Box>
      </Flex>
    </Flex>
  );
}
