import { useMovements } from "@/hooks/useMovements";
import { PanelsType } from "@/types/financial-types";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";
import {
  Box,
  Flex,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaList, FaTrash } from "react-icons/fa";
import {
  IoChevronDownCircleOutline,
  IoChevronUpCircleOutline,
} from "react-icons/io5";
import { Filtros } from "./filtros";

type Props = {
  panel: PanelsType;
  refetch: () => void;
  navigate: () => void;
};

export function ComponenteMovimentos({ panel, refetch, navigate }: Props) {
  const toast = useToast();
  const { deleteMovement } = useMovements();
  const [activeModal, setActiveModal] = useState<"filtros" | null>(null);

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
    <>
      <HStack
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mt={"35px"}
      >
        <Text fontSize={"lg"} fontWeight={"bold"}>
          Entradas e saídas
        </Text>
        <Box display={"flex"} flexDir={"row"} alignItems={"center"} gap={3}>
          <Link onClick={() => navigate()}>
            <Text fontSize={"lg"}>Ver todas movimentações</Text>
          </Link>
          <Icon as={FaList} boxSize={"5"} />
        </Box>
      </HStack>

      <Filtros open={activeModal === "filtros"} />

      <Stack mt={"10px"}>
        <Box
          display={"flex"}
          flexDir={"row"}
          bg={"menu_principal"}
          borderRadius={"5px"}
          w={"full"}
          h={"35px"}
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
          maxH={"250px"}
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
          {panel.movements && panel.movements.length > 0
            ? panel.movements.slice(0, 5).map((occ, index) => (
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
                    R$ {occ.value}
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
                      handleDelete(occ.id ?? 0, panel.id ?? 0, occ.value)
                    }
                  />
                </Box>
              ))
            : null}
        </Flex>
      </Stack>
    </>
  );
}
