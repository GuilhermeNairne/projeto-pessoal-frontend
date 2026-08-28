"use client";

import {
  Box,
  Flex,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { listCategoriesType, useTarefas } from "@/hooks/useTarefas";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery } from "react-query";
import { FaPencil } from "react-icons/fa6";
import { DefaultButton } from "@/componnents/default-button";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CategoriaModal } from "@/componnents/atividades/categoria-modal";
import { useState } from "react";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from "victory";

export default function Categorias() {
  const { user } = useAuthContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { listCategorias, graficoCategorias } = useTarefas();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    listCategoriesType | undefined
  >(undefined);

  const { data: categorias, refetch } = useQuery({
    queryKey: [`categorias`, user?.id],
    queryFn: () => listCategorias(user?.id ?? ""),
  });

  const { data: grafico } = useQuery({
    queryKey: [`grafico`, user?.id],
    queryFn: () => graficoCategorias(user?.id ?? ""),
  });

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

      <CategoriaModal
        isOpen={isOpen}
        onClose={onClose}
        reload={refetch}
        categoria={categoriaSelecionada}
      />

      <Box w={{ base: "100%", lg: "80%" }} overflow="auto">
        <HStack justifyContent={"flex-end"} mt={"10px"}>
          <Link
            display={"flex"}
            flexDir={"row"}
            alignItems={"center"}
            gap={2}
            onClick={() => {
              (setCategoriaSelecionada(undefined), onOpen());
            }}
          >
            <Text fontSize={{ base: "md", lg: "lg" }}>Nova categoria</Text>
            <Icon as={IoIosAddCircleOutline} boxSize={{ base: "6", lg: "8" }} />
          </Link>
        </HStack>

        <HStack
          display={{ base: "none", md: "flex" }}
          mt={5}
          h={"40px"}
          bg={`menu_principal`}
          borderRadius={5}
          p={5}
        >
          <Text w={`25%`} fontWeight={`semi-bold`} color={`white`}>
            Categoria
          </Text>
          <Text w={`10%`} fontWeight={`semi-bold`} color={`white`}>
            Cor
          </Text>
          <Text w={`15%`} fontWeight={`semi-bold`} color={`white`}>
            Tarefas pendentes
          </Text>
        </HStack>

        <Stack mt={5}>
          {categorias?.data.map((categoria, index) => (
            <Flex
              key={categoria.nome}
              flexDir={{ base: "column", md: "row" }}
              alignItems={{ base: "flex-start", md: "center" }}
              h={{ base: "auto", md: "40px" }}
              bg={index % 2 === 0 ? "surface.stripe.odd" : "surface.stripe.even"}
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
                <Text fontWeight={`semi-bold`}>{categoria.nome}</Text>
              </HStack>

              <HStack w={{ base: "100%", md: "10%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Cor:
                </Text>
                <Box
                  w={`14px`}
                  h={`14px`}
                  borderRadius={5}
                  bg={categoria.cor}
                />
              </HStack>

              <HStack w={{ base: "100%", md: "60%" }}>
                <Text
                  display={{ base: "inline", md: "none" }}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Pendentes:
                </Text>
                <Text fontWeight={`semi-bold`}>
                  {categoria.tarefasPendentes}
                </Text>
              </HStack>

              <Icon
                as={FaPencil}
                cursor="pointer"
                alignSelf={{ base: "flex-end", md: "center" }}
                onClick={() => {
                  (setCategoriaSelecionada(categoria), onOpen());
                }}
              />
            </Flex>
          ))}
        </Stack>

        <Text
          mt={{ base: 10, lg: 100 }}
          fontSize={{ base: "md", lg: "lg" }}
          fontWeight={"bold"}
        >
          Quantidade de tarefas concluídas por categoria
        </Text>

        <Box
          w={{ base: "100%", md: "70%", lg: "40%" }}
          h={{ base: "280px", md: "320px", lg: "350px" }}
          alignItems={`flex-start`}
          display={`flex`}
          justifyContent={`flex-start`}
        >
          <VictoryChart
            padding={{ top: 20, bottom: 100, left: 50, right: 20 }}
            domainPadding={25}
            theme={VictoryTheme.clean}
          >
            <VictoryAxis
              tickValues={grafico?.data.map((item) => item.nome) ?? []}
              style={{
                tickLabels: {
                  angle: -25,
                  textAnchor: "end",
                  fontSize: 12,
                  padding: 2,
                  fill: "var(--chakra-colors-text-primary)",
                },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: {
                  fill: "var(--chakra-colors-text-primary)",
                },
              }}
            />
            <VictoryBar
              categories={{
                x: grafico?.data.map((item) => item.nome) ?? [],
              }}
              data={grafico?.data.map((item) => ({
                x: item.nome,
                y: item.total,
                fill: item.cor,
              }))}
              style={{
                data: {
                  fill: ({ datum }) => datum.fill,
                },
              }}
            />
          </VictoryChart>
        </Box>
      </Box>
    </Flex>
  );
}
