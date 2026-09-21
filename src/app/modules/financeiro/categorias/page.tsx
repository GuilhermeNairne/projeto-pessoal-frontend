"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { FaPencil } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Center,
  Flex,
  HStack,
  Icon,
  Link,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCategoies } from "@/hooks/useCategories";
import { usePanels } from "@/hooks/usePanels";
import { CategoriesType } from "@/types/financial-types";
import { ModalCategoria } from "@/componnents/financial/modal-categoria";
import { ModalConfirmarExclusaoCategoria } from "@/componnents/financial/modal-confirmar-exclusao-categoria";

export default function CategoriasFinanceiro() {
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { listCategories, deleteCategory } = useCategoies();
  const { listPanels } = usePanels();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    CategoriesType | undefined
  >(undefined);
  const [categoriaParaExcluir, setCategoriaParaExcluir] =
    useState<CategoriesType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: panels, isLoading: isLoadingPanels } = useQuery({
    queryKey: ["panels", user?.id],
    queryFn: async () => listPanels(user?.id ?? ""),
  });

  const id_panel =
    searchParams.get("id_panel") ??
    (panels?.data[0]?.id ? String(panels.data[0].id) : null);
  const painel = panels?.data.find((item) => String(item.id) === id_panel);

  const {
    data: categories,
    refetch,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["categories", id_panel],
    queryFn: async () => listCategories(id_panel ?? ""),
    enabled: !!id_panel,
  });

  function handleSelectPanel(id: number) {
    router.replace(`/modules/financeiro/categorias?id_panel=${id}`);
  }

  async function handleDelete() {
    if (!categoriaParaExcluir || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteCategory(categoriaParaExcluir.id);

      setCategoriaParaExcluir(null);
      refetch();

      toast({
        title: "Categoria excluída com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      setCategoriaParaExcluir(null);

      toast({
        title: "Não foi possível excluir a categoria",
        description:
          "Verifique se ela não possui movimentações vinculadas e tente novamente.",
        status: "error",
        position: "top",
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
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

      <ModalCategoria
        isOpen={isOpen}
        onClose={onClose}
        reload={refetch}
        onDelete={setCategoriaParaExcluir}
        panel_id={Number(id_panel)}
        categoria={categoriaSelecionada}
      />

      <ModalConfirmarExclusaoCategoria
        categoria={categoriaParaExcluir}
        isLoading={isDeleting}
        onClose={() => setCategoriaParaExcluir(null)}
        onConfirm={handleDelete}
      />

      <Box w={"full"} overflow="auto">
        <HStack justifyContent={"space-between"} mt={"10px"}>
          <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight={"bold"}>
            Categorias
          </Text>

          {id_panel ? (
            <Link
              display={"flex"}
              flexDir={"row"}
              alignItems={"center"}
              gap={2}
              onClick={() => {
                setCategoriaSelecionada(undefined);
                onOpen();
              }}
            >
              <Text fontSize={{ base: "md", lg: "lg" }}>Nova categoria</Text>
              <Icon
                as={IoIosAddCircleOutline}
                boxSize={{ base: "6", lg: "8" }}
              />
            </Link>
          ) : null}
        </HStack>

        <Flex mt={5} gap={3} flexWrap="wrap">
          {panels?.data.map((panel) => (
            <Box
              key={panel.id}
              as="button"
              px={4}
              py={2}
              bg="surface.card"
              borderWidth={2}
              borderRadius="8px"
              borderColor={
                painel?.id === panel.id ? "accent.text" : "border.default"
              }
              color={painel?.id === panel.id ? "accent.text" : "text.muted"}
              fontWeight="bold"
              onClick={() => handleSelectPanel(panel.id ?? 0)}
            >
              {panel.name}
            </Box>
          ))}
        </Flex>

        <HStack
          display={{ base: "none", md: "flex" }}
          mt={5}
          h={"40px"}
          bg={"menu_principal"}
          borderRadius={5}
          p={5}
        >
          <Text w={"25%"} fontWeight={"semi-bold"} color={"white"}>
            Categoria
          </Text>
          <Text w={"10%"} fontWeight={"semi-bold"} color={"white"}>
            Cor
          </Text>
        </HStack>

        <Stack mt={5}>
          {isLoadingPanels || isLoadingCategories ? (
            <Center mt={20}>
              <Spinner size={"lg"} />
            </Center>
          ) : !id_panel ? (
            <Center mt={20}>
              <Text fontSize={"lg"} fontWeight={"bold"} color={"text.muted"}>
                Nenhum painel cadastrado!
              </Text>
            </Center>
          ) : categories && categories.data.length > 0 ? (
            categories.data.map((categoria, index) => (
              <Flex
                key={categoria.id}
                flexDir={{ base: "column", md: "row" }}
                alignItems={{ base: "flex-start", md: "center" }}
                h={{ base: "auto", md: "40px" }}
                bg={
                  index % 2 === 0
                    ? "surface.stripe.odd"
                    : "surface.stripe.even"
                }
                borderRadius={5}
                p={{ base: 3, md: 5 }}
                gap={{ base: 2, md: 0 }}
              >
                <HStack w={{ base: "100%", md: "25%" }}>
                  <Text
                    display={{ base: "inline", md: "none" }}
                    fontWeight="bold"
                    fontSize="sm"
                  >
                    Categoria:
                  </Text>
                  <Text fontWeight={"semi-bold"}>{categoria.name}</Text>
                </HStack>

                <HStack w={{ base: "100%", md: "65%" }}>
                  <Text
                    display={{ base: "inline", md: "none" }}
                    fontWeight="bold"
                    fontSize="sm"
                  >
                    Cor:
                  </Text>
                  <Box
                    w={"14px"}
                    h={"14px"}
                    borderRadius={5}
                    bg={categoria.color}
                  />
                </HStack>

                <HStack gap={4} alignSelf={{ base: "flex-end", md: "center" }}>
                  <Icon
                    as={FaPencil}
                    cursor="pointer"
                    onClick={() => {
                      setCategoriaSelecionada(categoria);
                      onOpen();
                    }}
                  />
                  <Icon
                    as={FaTrash}
                    cursor="pointer"
                    onClick={() => setCategoriaParaExcluir(categoria)}
                  />
                </HStack>
              </Flex>
            ))
          ) : (
            <Center mt={20}>
              <Text fontSize={"lg"} fontWeight={"bold"} color={"text.muted"}>
                Nenhuma categoria cadastrada!
              </Text>
            </Center>
          )}
        </Stack>
      </Box>
    </Flex>
  );
}
