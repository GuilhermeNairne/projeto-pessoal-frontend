import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  FaBook,
  FaSignOutAlt,
  FaMoon,
  FaCalendarAlt,
  FaChartBar,
  FaBell,
  FaUserShield,
  FaUsers,
  FaKey,
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
import { ModuleKey, hasModuleAccess } from "@/config/module-access";

const defaultPicture =
  "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg";

const menuOpcoes: {
  nome: string;
  icon: any;
  moduleKey: ModuleKey;
  opcoes: { pagina: string; rota: string; icon: any }[];
}[] = [
  {
    nome: "Financeiro",
    icon: MdOutlineAttachMoney,
    moduleKey: "financeiro",

    opcoes: [
      {
        pagina: "Contas financeiras",
        rota: "modules/financeiro",
        icon: FaMoneyBillTrendUp,
      },
      {
        pagina: "Gráficos",
        rota: "modules/financeiro/graficos",
        icon: FaChartBar,
      },
    ],
  },
  {
    nome: "Tarefas",
    icon: FaBook,
    moduleKey: "tarefas",

    opcoes: [
      {
        pagina: "Calendario",
        rota: "modules/tarefas/calendario",
        icon: FaCalendarAlt,
      },
      {
        pagina: "Categorias e Acomp.",
        rota: "modules/tarefas/categorias",
        icon: FaChartBar,
      },
    ],
  },
  {
    nome: "Notificacoes",
    icon: FaBell,
    moduleKey: "notificacoes",

    opcoes: [
      {
        pagina: "Notificações",
        rota: "modules/notificacoes",
        icon: FaBell,
      },
    ],
  },
  {
    nome: "Admin",
    icon: FaUserShield,
    moduleKey: "admin",

    opcoes: [
      {
        pagina: "Usuários",
        rota: "modules/admin/usuarios",
        icon: FaUsers,
      },
      {
        pagina: "Papéis",
        rota: "modules/admin/papeis",
        icon: FaKey,
      },
    ],
  },
];

export function Menu() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuthContext();
  const opcoesMenu = menuOpcoes.filter((item) =>
    hasModuleAccess(user, item.moduleKey),
  );

  function Logout() {
    signOut();
  }

  return (
    <Flex
      display={{ base: "none", lg: "flex" }}
      w={"16%"}
      maxW={"16%"}
      minW={"16%"}
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
            {opcoesMenu.map((item) => {
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
