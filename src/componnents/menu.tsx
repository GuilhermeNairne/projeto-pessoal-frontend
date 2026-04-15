import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  FaBook,
  FaSignOutAlt,
  FaMoon,
  FaCalendarAlt,
  FaChartBar,
} from "react-icons/fa";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";

const menuOpcoes = [
  {
    nome: "Financeiro",
    icon: FaSignOutAlt,
    tipo: "simples",
  },
  {
    nome: "Tarefas",
    icon: FaBook,
    tipo: "dropdown",
    opcoes: [
      {
        pagina: "Calendario",
        rota: "calendario",
        icon: FaCalendarAlt,
      },
      {
        pagina: "Categorias e Acomp.",
        rota: "categorias-acompanhamento",
        icon: FaChartBar,
      },
    ],
  },
];

export function Menu() {
  const router = useRouter();
  const { signOut, user } = useAuthContext();

  const pathname = usePathname();
  const defaultPicture =
    "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg";

  function Logout() {
    signOut();
  }

  return (
    <Flex
      w={"20%"}
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
            src={defaultPicture}
            borderRadius={"100%"}
          />
          <Text color={"white"} fontWeight={"bold"} fontSize={"18px"}>
            {user?.name}
          </Text>
        </Box>

        <Stack mt={"50px"}>
          {menuOpcoes.map((item, index) =>
            item.tipo === "simples" ? (
              <Button
                display={"flex-start"}
                w={"100%"}
                h={"70px"}
                key={index}
                onClick={() =>
                  router.push(`/modules/${item.nome.toLowerCase()}`)
                }
                bg={
                  pathname === `/modules/${item.nome.toLowerCase()}`
                    ? "white"
                    : "null"
                }
                alignItems={"center"}
                p={"10px"}
                _hover={{
                  bg:
                    pathname === `/modules/${item.nome.toLowerCase()}`
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
                      pathname === `/modules/${item.nome.toLowerCase()}`
                        ? "menu_principal"
                        : "white"
                    }
                  />
                  <Text
                    color={
                      pathname === `/modules/${item.nome.toLowerCase()}`
                        ? "menu_principal"
                        : "white"
                    }
                    fontWeight={
                      pathname === `/modules/${item.nome.toLowerCase()}`
                        ? "bold"
                        : "light"
                    }
                    fontSize={"lg"}
                  >
                    {item.nome}
                  </Text>
                </HStack>
              </Button>
            ) : (
              <Accordion allowToggle>
                <AccordionItem border={"none"} mt={5}>
                  <AccordionButton
                    p={2}
                    _hover={{
                      borderColor: "menu_principal",
                      borderRadius: 4,
                      fontWeight: "bold",
                    }}
                  >
                    <Box
                      flex={"1"}
                      textAlign={"left"}
                      display={"flex"}
                      flexDir={"row"}
                      alignItems={"center"}
                      gap={4}
                    >
                      <Icon as={item.icon} boxSize={8} color={"white"} />
                      <Text color={"white"} fontSize={"lg"}>
                        {item.nome}
                      </Text>
                    </Box>
                    <AccordionIcon color={"white"} />
                  </AccordionButton>
                  <AccordionPanel pb={2}>
                    <VStack align={"stretch"}>
                      {item.opcoes?.map((modulo) => (
                        <Button
                          display={"flex-start"}
                          w={"100%"}
                          h={"50px"}
                          mt={3}
                          key={index}
                          onClick={() =>
                            router.push(
                              `/modules/${item.nome.toLocaleLowerCase()}/${modulo.rota.toLowerCase()}`,
                            )
                          }
                          bg={
                            pathname ===
                            `/modules/${item.nome.toLocaleLowerCase()}/${modulo.rota.toLowerCase()}`
                              ? "white"
                              : "null"
                          }
                          alignItems={"center"}
                          p={"10px"}
                          _hover={{
                            bg:
                              pathname ===
                              `/modules/${item.nome.toLocaleLowerCase()}/${modulo.rota.toLowerCase()}`
                                ? "null"
                                : "menu_selecionado",
                          }}
                          borderRadius={"10px"}
                        >
                          <HStack gap={4}>
                            <Icon
                              as={modulo.icon}
                              boxSize={"6"}
                              color={
                                pathname ===
                                `/modules/${item.nome.toLocaleLowerCase()}/${modulo.rota.toLowerCase()}`
                                  ? "menu_principal"
                                  : "white"
                              }
                            />
                            <Text
                              color={
                                pathname ===
                                `/modules/${item.nome.toLocaleLowerCase()}/${modulo.rota.toLowerCase()}`
                                  ? "menu_principal"
                                  : "white"
                              }
                              fontWeight={
                                pathname ===
                                `/modules/${item.nome.toLocaleLowerCase()}/${modulo.rota.toLowerCase()}`
                                  ? "bold"
                                  : "light"
                              }
                              fontSize={"md"}
                            >
                              {modulo.pagina}
                            </Text>
                          </HStack>
                        </Button>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            ),
          )}
        </Stack>
      </Flex>

      <Flex flexDir={"column"}>
        <Box w={"full"} h={"1px"} bg={"white"} />

        <HStack gap={4} mt={"25px"} ml={"10px"}>
          <Icon as={FaSignOutAlt} boxSize={"6"} color={"white"} />
          <Link onClick={() => Logout()}>
            <Text fontWeight={"semi-bold"} color={"white"} fontSize={"lg"}>
              Sair
            </Text>
          </Link>
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
