"use client";

import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { usePanels } from "@/hooks/usePanels";
import { GrTransaction } from "react-icons/gr";
import { VictoryPie, VictoryTheme } from "victory";
import { useCategoies } from "@/hooks/useCategories";
import { CategoriesType } from "@/types/financial-types";
import { Filtros } from "@/componnents/financeiro/filtros";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";
import { IoIosAddCircleOutline, IoMdClose } from "react-icons/io";
import { PainelContas } from "@/componnents/financeiro/painel-contas";
import { ModalNovoPainel } from "@/componnents/financeiro/modal-novo-painel";
import { PopUpDeleteCategory } from "@/componnents/financeiro/pop-up-delete-category";
import { ModalRegistrarMovimento } from "@/componnents/financeiro/modal-registrar-movimento";
import {
  Box,
  Center,
  Flex,
  HStack,
  Icon,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { SketchPicker } from "react-color";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

export default function Financeiro() {
  const { listPanels } = usePanels();
  const user_id = localStorage.getItem("userId");
  const [openFiltros, setOpenFiltros] = useState(false);
  const [openModalNovoPainel, setOpenNovoPainel] = useState(false);
  const [popUpDeleteCategory, setPopUpDeleteCategory] = useState(false);
  const { deleteCategory, updateCategory, createCategory } = useCategoies();
  const [categorySelected, setCategorySelected] = useState<{
    id?: number;
    name?: string;
  }>({ id: undefined, name: "" });
  const [openTransactionModal, setOpenTransactionModal] = useState<{
    open: boolean;
    idPainel: string;
    name: string;
    categories: CategoriesType[];
  }>({ open: false, idPainel: "", name: "", categories: [] });
  const [categoryToDelete, setCategoryToDelete] = useState<{
    name: string;
    id: number;
  } | null>(null);
  // const [editing, setEditing] = useState<{
  //   index: number | null;
  //   name: string;
  // }>({
  //   index: null,
  //   name: "",
  // });

  const { data: panels, refetch: refetchPanel } = useQuery({
    queryKey: ["panels", user_id],
    queryFn: async () => listPanels(user_id ?? ""),
  });

  async function handleEditCategory(params: { name?: string; color?: string }) {
    if (!categorySelected) return;

    await updateCategory(categorySelected.id ?? 0, params);
    refetchPanel();
    setCategorySelected({ id: undefined, name: "" });
  }

  async function handleDeleteCategory() {
    await deleteCategory(categoryToDelete?.id);
    setCategoryToDelete(null);
    refetchPanel();
  }

  async function handleNewCategory(panel_id: number) {
    await createCategory({
      name: "Nova categoria",
      color: "#3c191dff",
      panel_id,
    });
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

      <PopUpDeleteCategory
        isOpen={popUpDeleteCategory}
        onClose={() => setPopUpDeleteCategory(false)}
        onConfirm={handleDeleteCategory}
        categoryName={categoryToDelete?.name ?? ""}
      />

      <ModalNovoPainel
        isOpen={openModalNovoPainel}
        onClose={() => {
          (setOpenNovoPainel(false), refetchPanel());
        }}
      />

      <ModalRegistrarMovimento
        isOpen={openTransactionModal.open === true}
        onClose={() =>
          setOpenTransactionModal({
            open: false,
            idPainel: "",
            name: "",
            categories: [],
          })
        }
        painel={openTransactionModal.name}
        id={openTransactionModal.idPainel}
        categorys={openTransactionModal.categories}
        handleSave={(values) => {}}
      />

      <Flex
        flexDir={"column"}
        w={"full"}
        mr={"18px"}
        overflow={"auto"}
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        <HStack justifyContent={"flex-end"} mt={"10px"} mr={"10px"}>
          <Link
            display={"flex"}
            flexDir={"row"}
            alignItems={"center"}
            gap={2}
            onClick={() => setOpenNovoPainel(true)}
          >
            <Text fontSize={"lg"}>Novo painel</Text>
            <Icon as={IoIosAddCircleOutline} boxSize={"8"} />
          </Link>
        </HStack>

        <PainelContas paineis={panels?.data ?? []} />

        {panels?.data.length === 0 ? (
          <Center mt={"200px"} display={"flex"} flexDir={"column"}>
            <Text color={"gray.600"} fontSize={"2xl"} fontWeight={"bold"}>
              Você ainda não criou nenhum painel,
            </Text>
            <Text color={"gray.600"} fontSize={"2xl"} fontWeight={"bold"}>
              Clique no botão acima para adicionar um.
            </Text>
          </Center>
        ) : null}

        {panels?.data.map((panel) => (
          <Box
            display={"flex"}
            flexDir={"column"}
            bg={"white"}
            boxShadow={"md"}
            mt={"50px"}
            p={"20px"}
            borderRadius={"8px"}
          >
            <HStack display={"flex"} justifyContent={"space-between"}>
              <Text fontSize={"3xl"} fontWeight={"bold"}>
                {panel.name}
              </Text>
              <Box
                onClick={() =>
                  setOpenTransactionModal({
                    open: true,
                    idPainel: String(panel.id) ?? "",
                    name: panel.name,
                    categories: panel.categories ?? [],
                  })
                }
                display={"flex"}
                flexDir={"row"}
                alignItems={"center"}
                gap={3}
              >
                <Text fontSize={"lg"}>Registrar movimento</Text>
                <Icon as={GrTransaction} boxSize={"5"} color={"green"} />
              </Box>
            </HStack>

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
                  openFiltros ? setOpenFiltros(false) : setOpenFiltros(true)
                }
                display={"flex"}
                flexDir={"row"}
                alignItems={"center"}
                gap={3}
              >
                <Text fontSize={"lg"}>Filtrar por</Text>
                <Icon
                  as={openFiltros ? FaChevronUp : FaChevronDown}
                  boxSize={"5"}
                />
              </Box>
            </HStack>

            <Filtros open={openFiltros} />

            <Stack mt={"10px"}>
              <Box
                display={"flex"}
                flexDir={"row"}
                bg={"menu_principal"}
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
                        <Text w="24%" color="black">
                          {occ.name}
                        </Text>
                        <Text w="17%" color="black">
                          {occ.category_id}
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
                              occ.movement_type === "Entrada"
                                ? FaArrowAltCircleUp
                                : FaArrowAltCircleDown
                            }
                            color={
                              occ.movement_type === "Entrada" ? "green" : "red"
                            }
                            boxSize="5"
                          />
                        </HStack>

                        <Icon w="2%" as={FaTrash} />
                      </Box>
                    ))
                  : null}
              </Flex>
            </Stack>

            <HStack
              w={"100%"}
              display={"flex"}
              mt={"80px"}
              justifyContent={"space-between"}
              alignItems={"flex-start"}
            >
              <Box display={"flex"} flexDir={"column"}>
                <HStack display={"flex"} justifyContent={"space-between"}>
                  <Text fontSize={"lg"} fontWeight={"bold"}>
                    Gráfico por tipo de gasto
                  </Text>
                </HStack>
                <Box w={"100%"} display={"flex"} flexDir={"row"}>
                  <VictoryPie
                    startAngle={90}
                    labels={({ datum }) => `R$ ${datum.y},00`}
                    endAngle={450}
                    data={panel.categories}
                    theme={VictoryTheme.clean}
                    style={{
                      labels: {
                        fontWeight: "bold",
                      },
                      data: {
                        fill: ({ datum }) => datum.color,
                      },
                    }}
                  />

                  <Stack
                    mt={"20px"}
                    maxH={"200px"}
                    overflowY={"auto"}
                    overflowX="hidden"
                    w={"200px"}
                    sx={{
                      "::-webkit-scrollbar": {
                        display: "none",
                      },
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {panel.categories
                      ? panel.categories
                          .filter((item) =>
                            item.totalSpent ? item.totalSpent : 0 > 0,
                          )
                          .map((item) => (
                            <HStack key={item.name}>
                              <Box
                                borderRadius="5px"
                                w="20px"
                                h="20px"
                                bg={item.color}
                              />
                              <Text fontSize="lg" fontWeight="bold">
                                {item.name}
                              </Text>
                            </HStack>
                          ))
                      : null}
                  </Stack>
                </Box>
              </Box>

              {categorySelected.id ? (
                <Box
                  display={"flex"}
                  flexDir={"column"}
                  alignItems={"flex-end"}
                >
                  <Icon
                    as={IoMdClose}
                    mb={"15px"}
                    onClick={() =>
                      setCategorySelected({ id: undefined, name: "" })
                    }
                  />
                  <SketchPicker
                    color={"#FF0000"}
                    onChange={(c: any) => {
                      handleEditCategory({ color: String(c.hex) });
                    }}
                  />
                </Box>
              ) : null}

              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                flexDir={"column"}
              >
                <Stack
                  w={"100%"}
                  display={"flex"}
                  mt={"20px"}
                  maxH={"250px"}
                  overflowY={"auto"}
                  overflowX="hidden"
                  sx={{
                    "::-webkit-scrollbar": {
                      width: "4px",
                    },
                    "::-webkit-scrollbar-button": {
                      height: "0px",
                      display: "block",
                    },
                    "::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                    "::-webkit-scrollbar-thumb": {
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "20px",
                    },
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0,0,0,0.3) transparent",
                  }}
                >
                  {panel.categories?.map((category, index) => (
                    <HStack>
                      <Box
                        w={"25px"}
                        h={"25px"}
                        borderRadius={"5px"}
                        bg={category.color}
                        onClick={() => setCategorySelected({ id: category.id })}
                      />
                      <Input
                        fontSize="lg"
                        w="50%"
                        h="35px"
                        value={
                          categorySelected.id === category.id
                            ? categorySelected.name
                            : category.name
                        }
                        onChange={(e) =>
                          setCategorySelected((prev) => ({
                            ...prev,
                            id: category.id,
                            name: e.target.value,
                          }))
                        }
                      />

                      <Icon
                        as={FaCheck}
                        ml="5px"
                        cursor="pointer"
                        onClick={() =>
                          handleEditCategory({ name: categorySelected.name })
                        }
                      />
                      <Icon
                        as={FaTrash}
                        ml={"5px"}
                        onClick={() => {
                          setCategoryToDelete({
                            name: category.name,
                            id: category.id,
                          });
                          setPopUpDeleteCategory(true);
                        }}
                      />
                    </HStack>
                  ))}
                </Stack>
                <HStack
                  mt={"20px"}
                  mr={"70px"}
                  onClick={() => handleNewCategory(panel.id ?? 0)}
                >
                  <Icon as={FaPlus} />
                  <Text>Adicionar categoria</Text>
                </HStack>
              </Box>
            </HStack>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
