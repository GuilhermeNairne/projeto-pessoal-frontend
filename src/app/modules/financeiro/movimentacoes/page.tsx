"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { useSearchParams } from "next/navigation";
import { useMovements } from "@/hooks/useMovements";
import { formatarValorBR } from "@/utils/convert-to-real";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";
import { Filtros, FiltrosMovementsType } from "@/componnents/financial/filtros";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaTrash,
} from "react-icons/fa";
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

import {
  IoChevronDownCircleOutline,
  IoChevronUpCircleOutline,
} from "react-icons/io5";

export default function Movimentacoes() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const id_panel = searchParams.get("id_panel");
  const [actualPage, setActualPage] = useState(1);
  const { deleteMovement, listMovements } = useMovements();
  const [activeModal, setActiveModal] = useState<"filtros" | null>(null);
  const [filtros, setFiltros] = useState<FiltrosMovementsType | null>({});

  const {
    data: result,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["movements", id_panel, actualPage],
    queryFn: async () => listMovements(id_panel ?? "", filtros, actualPage),
  });

  const pages = Array.from(
    { length: result?.data.pagination.totalPages ?? 1 },
    (_, i) => i + 1,
  );

  async function handleDelete(
    id: number,
    panel_id: number,
    movement_value: number,
  ) {
    try {
      await deleteMovement(id, panel_id, movement_value);

      refetch();

      return toast({
        title: "Movimentação deletada com sucesso!",
        status: "success",
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      return toast({
        title: "Erro ao deletar movimentação",
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
        <HStack
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          mt={"35px"}
          mb={activeModal ? 5 : 0}
        >
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            Entradas e saídas
          </Text>
          <Box
            onClick={() =>
              activeModal === "filtros"
                ? setActiveModal(null)
                : setActiveModal("filtros")
            }
            display={"flex"}
            flexDir={"row"}
            alignItems={"center"}
            gap={3}
          >
            <Text fontSize={"lg"}>Filtrar por</Text>
            <Icon
              as={activeModal === "filtros" ? FaChevronUp : FaChevronDown}
              boxSize={"5"}
            />
          </Box>
        </HStack>

        <Filtros
          id_panel={id_panel ?? ""}
          refetch={() => refetch()}
          open={activeModal === "filtros"}
          filtrosValues={(values) => setFiltros(values)}
        />

        <Stack mt={5} h={activeModal === "filtros" ? "65%" : undefined}>
          <Box
            display={"flex"}
            flexDir={"row"}
            bg={"menu_principal"}
            borderRadius={"5px"}
            w={"full"}
            h={activeModal === "filtros" ? "40px" : "45px"}
            alignItems={"center"}
            px={"15px"}
          >
            <Text w={"25%"} color={"white"}>
              Movimentação
            </Text>
            <Text w={"20%"} color={"white"}>
              Categoria
            </Text>
            <Text w={"15%"} color={"white"}>
              Valor
            </Text>
            <Text w={"15%"} color={"white"}>
              Data
            </Text>
            <Text w={"15%"} color={"white"}>
              Tipo
            </Text>
            <Text w={"10%"} color={"white"}></Text>
            <Text w={"10%"} color={"white"}></Text>
          </Box>
          <Flex
            w={"full"}
            flexDir={"column"}
            gap={3}
            h={activeModal === "filtros" ? undefined : "95%"}
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
            {result && result.data.movements.length > 0 ? (
              result.data.movements.map((occ, index) => (
                <Box
                  boxShadow="md"
                  display="flex"
                  flexDir="row"
                  bg={index % 2 === 0 ? "#F3F3F3" : "#D9D9D9"}
                  borderRadius={"5px"}
                  w="full"
                  h="35px"
                  alignItems="center"
                  px="15px"
                  py={"10px"}
                >
                  <Text w="23%" color="black">
                    {occ.name}
                  </Text>
                  <Text w="18%" color="black">
                    {occ.categories?.name}
                  </Text>
                  <Text w="12%" color="black">
                    R$ {formatarValorBR(occ.value)}
                  </Text>
                  <Text w="16%" color="black">
                    {ConvertDataToBR(occ.date)}
                  </Text>

                  <HStack w="29%">
                    <Icon
                      as={
                        occ.movement_type === "IN"
                          ? IoChevronUpCircleOutline
                          : IoChevronDownCircleOutline
                      }
                      color={occ.movement_type === "IN" ? "green" : "red"}
                      boxSize="5"
                    />
                  </HStack>

                  <Icon
                    w="2%"
                    as={FaTrash}
                    onClick={() =>
                      handleDelete(
                        occ.id ?? 0,
                        Number(id_panel) ?? 0,
                        occ.value,
                      )
                    }
                  />
                </Box>
              ))
            ) : isLoading ? (
              <Center mt={20}>
                <Spinner size={"lg"} />
              </Center>
            ) : (
              <Center mt={20}>
                <Text fontSize={"lg"} fontWeight={"bold"} color={"gray.600"}>
                  Nenhuma movimentação registrada!
                </Text>
              </Center>
            )}
          </Flex>

          <HStack
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            mt={10}
          >
            <Box
              borderRadius={4}
              w={`25px`}
              h={`25px`}
              display={"flex"}
              justifyContent={`center`}
              alignItems={`center`}
              onClick={() => setActualPage(Number(actualPage - 1))}
              bg={
                result?.data.pagination.page === 1
                  ? "gray.500"
                  : "menu_principal"
              }
            >
              <Icon as={FaChevronLeft} color={`white`} />
            </Box>
            {pages.map((page, index) => (
              <Stack>
                <Box
                  borderRadius={4}
                  w={`25px`}
                  h={`25px`}
                  display={"flex"}
                  justifyContent={`center`}
                  alignItems={`center`}
                  bg={"menu_principal"}
                  onClick={() => setActualPage(page)}
                  key={index}
                >
                  <Text fontWeight={`bold`} fontSize={`md`} color={`white`}>
                    {page}
                  </Text>
                </Box>
                {result?.data.pagination.page === page ? (
                  <Box w={`25px`} bg={`menu_principal`} h={`2px`} />
                ) : null}
              </Stack>
            ))}
            <Box
              borderRadius={4}
              w={`25px`}
              h={`25px`}
              display={"flex"}
              justifyContent={`center`}
              alignItems={`center`}
              onClick={() => setActualPage(Number(actualPage + 1))}
              bg={
                result?.data.pagination.totalPages ===
                result?.data.pagination.page
                  ? "gray.500"
                  : "menu_principal"
              }
            >
              <Icon as={FaChevronRight} color={`white`} />
            </Box>
          </HStack>
        </Stack>
      </Flex>
    </Flex>
  );
}
