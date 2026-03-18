"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { useSearchParams } from "next/navigation";
import { useMovements } from "@/hooks/useMovements";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { Filtros, FiltrosMovementsType } from "@/componnents/financial/filtros";
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
import { formatarValorBR } from "@/utils/convert-to-real";

export default function Movimentacoes() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const id_panel = searchParams.get("id_panel");
  const { deleteMovement, listMovements } = useMovements();
  const [activeModal, setActiveModal] = useState<"filtros" | null>(null);
  const [filtros, setFiltros] = useState<FiltrosMovementsType | null>({});

  const {
    data: movements,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["movements", id_panel],
    queryFn: async () => listMovements(id_panel ?? "", filtros),
  });

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
      p={"20px"}
      flexDir={"row"}
      gap={10}
      overflow="hidden"
    >
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
            h={activeModal === "filtros" ? "50px" : "35px"}
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
            h={activeModal === "filtros" ? undefined : "85%"}
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
            {movements && movements.data.length > 0 ? (
              movements.data.map((occ, index) => (
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
                <Text fontSize={"lg"} fontWeight={"bold"}>
                  Nenhuma movimentação registrada!
                </Text>
              </Center>
            )}
          </Flex>
        </Stack>
      </Flex>
    </Flex>
  );
}
