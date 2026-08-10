"use client";

import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { useAdmin } from "@/hooks/useAdmin";
import { MenuMobile } from "@/componnents/menu-mobile";
import { AdminUserType, RoleType } from "@/types/admin-types";
import { FaPlus, FaTimes } from "react-icons/fa";
import {
  Box,
  Center,
  Flex,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

const roleColor: Record<string, string> = {
  ADMIN: "menu_principal",
  USER: "cinza_900",
};
const defaultRoleColor = "cinza_900";

export default function Usuarios() {
  const toast = useToast();
  const { listUsers, listRoles, addRole, removeRole } = useAdmin();

  const {
    data: result,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => listUsers(),
  });

  const { data: rolesResult } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => listRoles(),
  });

  const allRoles = rolesResult?.data ?? [];

  async function handleAddRole(user: AdminUserType, role: RoleType) {
    try {
      await addRole(user.id, role);

      refetch();

      return toast({
        title: "Papel adicionado com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      return toast({
        title: "Erro ao adicionar papel",
        status: "error",
        position: "top",
        isClosable: true,
      });
    }
  }

  async function handleRemoveRole(user: AdminUserType, role: RoleType) {
    try {
      await removeRole(user.id, role);

      refetch();

      return toast({
        title: "Papel removido com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      return toast({
        title: "Erro ao remover papel",
        status: "error",
        position: "top",
        isClosable: true,
      });
    }
  }

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      p={{ base: "10px", lg: "20px" }}
      flexDir={{ base: "column", lg: "row" }}
      gap={{ base: 4, lg: 10 }}
      overflow="hidden"
    >
      <MenuMobile />
      <Menu />

      <Flex w={"full"} h={"full"} flexDir={"column"}>
        <HStack mt={"35px"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            Usuários
          </Text>
        </HStack>

        <Stack mt={5}>
          <Box
            display={"flex"}
            flexDir={"row"}
            bg={"menu_principal"}
            borderRadius={"5px"}
            w={"full"}
            h={"45px"}
            alignItems={"center"}
            px={"15px"}
          >
            <Text w={"25%"} color={"white"}>
              Nome
            </Text>
            <Text w={"25%"} color={"white"}>
              Email
            </Text>
            <Text w={"15%"} color={"white"}>
              Criado em
            </Text>
            <Text w={"35%"} color={"white"}>
              Papéis
            </Text>
          </Box>

          <Flex
            w={"full"}
            flexDir={"column"}
            gap={3}
            borderRadius={"5px"}
            overflowY="auto"
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {result && result.data.length > 0 ? (
              result.data.map((user, index) => {
                const missingRoles = allRoles.filter(
                  (role) => !user.roles.some((userRole) => userRole.id === role.id),
                );

                return (
                  <Box
                    key={user.id}
                    boxShadow="md"
                    display="flex"
                    flexDir="row"
                    bg={index % 2 === 0 ? "#F3F3F3" : "#D9D9D9"}
                    borderRadius={"5px"}
                    w="full"
                    minH="45px"
                    alignItems="center"
                    px="15px"
                    py={"10px"}
                  >
                    <Text w="25%" color="black">
                      {user.name}
                    </Text>
                    <Text w="25%" color="black">
                      {user.email}
                    </Text>
                    <Text w="15%" color="black">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </Text>

                    <HStack w="35%" wrap={"wrap"}>
                      {user.roles.map((role) => (
                        <HStack
                          key={role.id}
                          bg={roleColor[role.name] ?? defaultRoleColor}
                          borderRadius={"5px"}
                          px={"8px"}
                          py={"2px"}
                          gap={2}
                        >
                          <Text color={"white"} fontSize={"sm"}>
                            {role.name}
                          </Text>
                          <Icon
                            as={FaTimes}
                            color={"white"}
                            boxSize={"3"}
                            cursor={"pointer"}
                            onClick={() => handleRemoveRole(user, role)}
                          />
                        </HStack>
                      ))}
                      {missingRoles.map((role) => (
                        <HStack
                          key={role.id}
                          border={"1px solid"}
                          borderColor={"cinza_900"}
                          borderRadius={"5px"}
                          px={"8px"}
                          py={"2px"}
                          gap={2}
                          cursor={"pointer"}
                          onClick={() => handleAddRole(user, role)}
                        >
                          <Text color={"cinza_920"} fontSize={"sm"}>
                            {role.name}
                          </Text>
                          <Icon as={FaPlus} color={"cinza_920"} boxSize={"3"} />
                        </HStack>
                      ))}
                    </HStack>
                  </Box>
                );
              })
            ) : isLoading ? (
              <Center mt={20}>
                <Spinner size={"lg"} />
              </Center>
            ) : (
              <Center mt={20}>
                <Text fontSize={"lg"} fontWeight={"bold"} color={"gray.600"}>
                  Nenhum usuário encontrado!
                </Text>
              </Center>
            )}
          </Flex>
        </Stack>
      </Flex>
    </Flex>
  );
}
