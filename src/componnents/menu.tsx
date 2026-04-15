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

import { MdOutlineAttachMoney } from "react-icons/md";
import { FaMoneyBillTrendUp } from "react-icons/fa6";

const defaultPicture =
  "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg";

const menuOpcoes = [
  {
    nome: "Financeiro",
    icon: MdOutlineAttachMoney,

    opcoes: [
      {
        pagina: "Contas financeiras",
        rota: "modules/financeiro",
        icon: FaMoneyBillTrendUp,
      },
    ],
  },
  {
    nome: "Tarefas",
    icon: FaBook,

    opcoes: [
      {
        pagina: "Calendario",
        rota: "modules/tarefas/calendario",
        icon: FaCalendarAlt,
      },
      {
        pagina: "Categorias e Acomp.",
        rota: "modules/tarefa/categorias-acompanhamento",
        icon: FaChartBar,
      },
    ],
  },
];

export function Menu() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuthContext();

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
          <Accordion allowToggle>
            {menuOpcoes.map((item) => {
              const isOnPage = pathname.includes(item.nome.toLocaleLowerCase());

              return (
                <AccordionItem border="none" mb={3}>
                  <AccordionButton
                    h={`70px`}
                    bg={isOnPage ? `white` : undefined}
                    borderRadius={4}
                    p={2}
                    _hover={{
                      borderRadius: 4,
                      fontWeight: "bold",
                    }}
                  >
                    <Box
                      flex="1"
                      textAlign="left"
                      display={"flex"}
                      flexDir={"row"}
                      alignItems={"center"}
                      gap={4}
                    >
                      <Icon
                        as={item.icon}
                        boxSize={8}
                        color={isOnPage ? "menu_principal" : `white`}
                      />
                      <Text
                        color={isOnPage ? "menu_principal" : "white"}
                        fontSize={"lg"}
                        fontWeight={"semi-bold"}
                      >
                        {item.nome}
                      </Text>
                    </Box>
                    <AccordionIcon
                      color={isOnPage ? "menu_principal" : `white`}
                    />
                  </AccordionButton>
                  <AccordionPanel pb={2}>
                    <VStack align="stretch">
                      {item.opcoes.map((modulo) => (
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          color="gray.200"
                          fontWeight={`light`}
                          fontSize={"md"}
                          _hover={{ color: "white", fontWeight: "bold" }}
                          onClick={() => {
                            router.push(`/${modulo.rota}`);
                          }}
                        >
                          {modulo.pagina}
                        </Button>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
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
