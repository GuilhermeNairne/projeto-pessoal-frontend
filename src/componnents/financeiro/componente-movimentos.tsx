import { useState } from "react";
import { Filtros } from "./filtros";
import { PanelsType } from "@/types/financial-types";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";
import { Box, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
} from "react-icons/fa";

type Props = {
  panel: PanelsType;
};

export function ComponenteMovimentos({ panel }: Props) {
  const [activeModal, setActiveModal] = useState<"filtros" | null>(null);
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
          gap={2}
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
          {panel.movements && panel.movements?.length > 0
            ? panel.movements.map((occ, index) => (
                <Box
                  boxShadow="md"
                  display="flex"
                  flexDir="row"
                  bg={index % 2 === 0 ? "#F3F3F3" : "#D9D9D9"}
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

                  <HStack w="28%">
                    <Icon
                      as={
                        occ.movement_type === "IN"
                          ? FaArrowAltCircleUp
                          : FaArrowAltCircleDown
                      }
                      color={occ.movement_type === "IN" ? "green" : "red"}
                      boxSize="5"
                    />
                  </HStack>

                  <Icon w="2%" as={FaTrash} />
                </Box>
              ))
            : null}
        </Flex>
      </Stack>
    </>
  );
}
