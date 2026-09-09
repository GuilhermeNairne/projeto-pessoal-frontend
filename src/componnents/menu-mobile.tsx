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
  FaHome,
  FaUserCircle,
} from "react-icons/fa";
import { HiMenu } from "react-icons/hi";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  Stack,
  Switch,
  Text,
  VStack,
  useDisclosure,
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

export function MenuMobile() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { signOut, user } = useAuthContext();
  const opcoesMenu = menuOpcoes.filter((item) =>
    hasModuleAccess(user, item.moduleKey),
  );
  const isHomePage = pathname === "/home";
  const isPerfilPage = pathname === "/modules/perfil";

  function Logout() {
    signOut();
  }

  return (
    <>
      <Flex
        display={{ base: "flex", lg: "none" }}
        w="full"
        h="60px"
        bg="menu_principal"
        borderRadius="12px"
        px={4}
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <HStack gap={3}>

          <Text color="white" fontWeight="bold" fontSize="md" noOfLines={1}>
            {user?.name}
          </Text>
        </HStack>

        <IconButton
          aria-label="Abrir menu"
          icon={<Icon as={HiMenu} boxSize={7} />}
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={onOpen}
        />
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="menu_principal">
          <DrawerCloseButton color="white" size="lg" mt={2} />

          <DrawerBody
            display="flex"
            flexDir="column"
            justifyContent="space-between"
            pt="35px"
            px="20px"
          >
            <Flex flexDir="column">
              <Box
                as="button"
                display="flex"
                flexDir="row"
                gap={4}
                alignItems="center"
                mt="10px"
                onClick={() => {
                  router.push("/modules/perfil");
                  onClose();
                }}
              >
                <Image
                  w="55px"
                  h="55px"
                  src={user?.profilePicture || defaultPicture}
                  borderRadius="100%"
                />
                <Text color="white" fontWeight="bold" fontSize="16px">
                  {user?.name}
                </Text>
              </Box>

              <Stack mt="40px">
                <Box
                  as="button"
                  onClick={() => {
                    router.push("/home");
                    onClose();
                  }}
                  h="60px"
                  bg={isHomePage ? "white" : undefined}
                  borderRadius={4}
                  p={2}
                  mb={3}
                  display="flex"
                  flexDir="row"
                  alignItems="center"
                  gap={3}
                  _hover={{
                    borderRadius: 4,
                    fontWeight: "bold",
                  }}
                >
                  <Icon
                    as={FaHome}
                    boxSize={7}
                    color={isHomePage ? "menu_principal" : "white"}
                  />
                  <Text
                    color={isHomePage ? "menu_principal" : "white"}
                    fontSize="md"
                    fontWeight="semi-bold"
                  >
                    Home
                  </Text>
                </Box>

                <Accordion allowToggle>
                  {opcoesMenu.map((item, idx) => {
                    const isOnPage = pathname.includes(
                      item.nome.toLocaleLowerCase()
                    );

                    return (
                      <AccordionItem border="none" mb={3} key={idx}>
                        <AccordionButton
                          h="60px"
                          bg={isOnPage ? "white" : undefined}
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
                            display="flex"
                            flexDir="row"
                            alignItems="center"
                            gap={3}
                          >
                            <Icon
                              as={item.icon}
                              boxSize={7}
                              color={isOnPage ? "menu_principal" : "white"}
                            />
                            <Text
                              color={isOnPage ? "menu_principal" : "white"}
                              fontSize="md"
                              fontWeight="semi-bold"
                            >
                              {item.nome}
                            </Text>
                          </Box>
                          <AccordionIcon
                            color={isOnPage ? "menu_principal" : "white"}
                          />
                        </AccordionButton>
                        <AccordionPanel pb={2}>
                          <VStack align="stretch">
                            {item.opcoes.map((modulo, mIdx) => (
                              <Button
                                key={mIdx}
                                variant="ghost"
                                justifyContent="flex-start"
                                color="gray.200"
                                fontWeight="light"
                                fontSize="md"
                                _hover={{
                                  color: "white",
                                  fontWeight: "bold",
                                }}
                                onClick={() => {
                                  router.push(`/${modulo.rota}`);
                                  onClose();
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

                <Box
                  as="button"
                  onClick={() => {
                    router.push("/modules/perfil");
                    onClose();
                  }}
                  h="60px"
                  bg={isPerfilPage ? "white" : undefined}
                  borderRadius={4}
                  p={2}
                  mt={3}
                  display="flex"
                  flexDir="row"
                  alignItems="center"
                  gap={3}
                  _hover={{
                    borderRadius: 4,
                    fontWeight: "bold",
                  }}
                >
                  <Icon
                    as={FaUserCircle}
                    boxSize={7}
                    color={isPerfilPage ? "menu_principal" : "white"}
                  />
                  <Text
                    color={isPerfilPage ? "menu_principal" : "white"}
                    fontSize="md"
                    fontWeight="semi-bold"
                  >
                    Perfil
                  </Text>
                </Box>
              </Stack>
            </Flex>

            <Flex flexDir="column" pb={6}>
              <Box w="full" h="1px" bg="white" />

              <HStack gap={4} mt="25px" ml="10px">
                <Icon as={FaSignOutAlt} boxSize="6" color="white" />
                <Link onClick={() => Logout()}>
                  <Text
                    fontWeight="semi-bold"
                    color="white"
                    fontSize="lg"
                  >
                    Sair
                  </Text>
                </Link>
              </HStack>
              <Box
                w="100%"
                h="55px"
                borderRadius="20px"
                bg="white"
                alignItems="center"
                display="flex"
                p="10px"
                mt="25px"
                justifyContent="space-between"
              >
                <Box display="flex" flexDir="row" gap={4}>
                  <Icon as={FaMoon} boxSize="6" color="menu_principal" />
                  <Text color="menu_principal" fontSize="md">
                    Modo escuro
                  </Text>
                </Box>
                <Switch color="blackAlpha.600" size="md" />
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
