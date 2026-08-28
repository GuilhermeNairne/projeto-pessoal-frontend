"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { useAdmin } from "@/hooks/useAdmin";
import { MenuMobile } from "@/componnents/menu-mobile";
import { RoleType } from "@/types/admin-types";
import { FaPencil } from "react-icons/fa6";
import { FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import {
  Box,
  Center,
  Flex,
  HStack,
  Icon,
  Input,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { DefaultButton } from "@/componnents/default-button";

export default function Papeis() {
  const toast = useToast();
  const { listRoles, createRole, renameRole, deleteRole } = useAdmin();

  const {
    data: result,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => listRoles(),
  });

  const [novoNome, setNovoNome] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function errorMessage(error: any, fallback: string) {
    if (error?.response?.status === 409) return "Já existe um papel com esse nome";
    if (error?.response?.status === 404) return "Papel não encontrado";
    return fallback;
  }

  async function handleCreateRole() {
    if (!novoNome.trim()) return;

    setIsCreating(true);
    try {
      await createRole(novoNome.trim());
      setNovoNome("");
      refetch();

      return toast({
        title: "Papel criado com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      return toast({
        title: errorMessage(error, "Erro ao criar papel"),
        status: "error",
        position: "top",
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  }

  function startEdit(role: RoleType) {
    setEditingId(role.id);
    setEditValue(role.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function handleRenameRole(role: RoleType) {
    if (!editValue.trim() || editValue.trim() === role.name) {
      return cancelEdit();
    }

    setIsSaving(true);
    try {
      await renameRole(role.id, editValue.trim());
      cancelEdit();
      refetch();

      return toast({
        title: "Papel renomeado com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      return toast({
        title: errorMessage(error, "Erro ao renomear papel"),
        status: "error",
        position: "top",
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteRole(role: RoleType) {
    try {
      await deleteRole(role.id);
      refetch();

      return toast({
        title: "Papel removido com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      return toast({
        title: errorMessage(error, "Erro ao remover papel"),
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
            Papéis
          </Text>
        </HStack>

        <HStack mt={5}>
          <Input
            borderColor={"border.default"}
            borderRadius={"10px"}
            placeholder={"Nome do novo papel"}
            w={{ base: "100%", md: "300px" }}
            bg={"surface.card"}
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateRole();
            }}
          />
          <DefaultButton
            icon={FaPlus}
            title="Adicionar"
            w="150px"
            isLoading={isCreating}
            onClick={handleCreateRole}
          />
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
            <Text w={"50%"} color={"white"}>
              Nome
            </Text>
            <Text w={"30%"} color={"white"}>
              Criado em
            </Text>
            <Text w={"20%"} color={"white"}>
              Ações
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
              result.data.map((role, index) => (
                <Box
                  key={role.id}
                  boxShadow="md"
                  display="flex"
                  flexDir="row"
                  bg={index % 2 === 0 ? "surface.stripe.odd" : "surface.stripe.even"}
                  borderRadius={"5px"}
                  w="full"
                  minH="45px"
                  alignItems="center"
                  px="15px"
                  py={"10px"}
                >
                  <Box w="50%">
                    {editingId === role.id ? (
                      <Input
                        autoFocus
                        size="sm"
                        bg={"surface.card"}
                        borderRadius={"5px"}
                        w={"80%"}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameRole(role);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    ) : (
                      <Text color="text.primary">{role.name}</Text>
                    )}
                  </Box>
                  <Text w="30%" color="text.primary">
                    {role.created_at
                      ? new Date(role.created_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </Text>
                  <HStack w="20%">
                    {editingId === role.id ? (
                      <>
                        <Icon
                          as={FaSave}
                          cursor={isSaving ? "default" : "pointer"}
                          opacity={isSaving ? 0.5 : 1}
                          onClick={() => !isSaving && handleRenameRole(role)}
                        />
                        <Icon
                          as={FaTimes}
                          cursor={"pointer"}
                          onClick={cancelEdit}
                        />
                      </>
                    ) : (
                      <>
                        <Icon
                          as={FaPencil}
                          cursor={"pointer"}
                          onClick={() => startEdit(role)}
                        />
                        <Icon
                          as={FaTrash}
                          cursor={"pointer"}
                          onClick={() => handleDeleteRole(role)}
                        />
                      </>
                    )}
                  </HStack>
                </Box>
              ))
            ) : isLoading ? (
              <Center mt={20}>
                <Spinner size={"lg"} />
              </Center>
            ) : (
              <Center mt={20}>
                <Text fontSize={"lg"} fontWeight={"bold"} color={"text.muted"}>
                  Nenhum papel encontrado!
                </Text>
              </Center>
            )}
          </Flex>
        </Stack>
      </Flex>
    </Flex>
  );
}
