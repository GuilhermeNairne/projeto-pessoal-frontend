"use client";

import { Filtros } from "@/componnents/financeiro/filtros";
import { ModalCategorias } from "@/componnents/financeiro/modal-categorias";
import { ModalNovoPainel } from "@/componnents/financeiro/modal-novo-painel";
import { ModalRegistrarMovimento } from "@/componnents/financeiro/modal-registrar-movimento";
import { PainelContas } from "@/componnents/financeiro/painel-contas";
import { Menu } from "@/componnents/menu";
import { PaineisType } from "@/types/financeiro-types";
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
import { GrTransaction } from "react-icons/gr";
import { IoIosAddCircleOutline } from "react-icons/io";
import { VictoryPie, VictoryTheme } from "victory";
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
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";
import { PopUpDeleteCategory } from "@/componnents/financeiro/pop-up-delete-category";

export type CategoryType = {
  x: string;
  y: number;
  color: string;
};

export default function Financeiro() {
  const [categorySelected, setCategorySelected] = useState<string | null>(null);
  const [openFiltros, setOpenFiltros] = useState(false);
  const [paineis, setPaineis] = useState<PaineisType>([]);
  const [openModalNovoPainel, setOpenNovoPainel] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] = useState<{
    open: boolean;
    idPainel: string;
    name: string;
  }>({ open: false, idPainel: "", name: "" });
  const [popUpDeleteCategory, setPopUpDeleteCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState("");
  const [openModalCategorias, setOpenModalCategorias] = useState(false);
  const [collorPalette, setColorPalette] = useState(false);
  const [editing, setEditing] = useState<{
    index: number | null;
    name: string;
  }>({
    index: null,
    name: "",
  });

  const [categories, setCategories] = useState<CategoryType[]>([
    { x: "Mercado", y: 0, color: "#d50c20" },
    { x: "Alimentação", y: 0, color: "#0cd513ff" },
    { x: "Roupas", y: 0, color: "#0c2ad5ff" },
    { x: "Academia", y: 0, color: "#111a4bff" },
  ]);

  function handleChangeColor(color: string) {
    if (!categorySelected) return;

    setCategories((prev) =>
      prev.map((item) =>
        item.x === categorySelected ? { ...item, color } : item
      )
    );

    setColorPalette(false);
  }

  function handleNewCategory() {
    setCategories((prev) => [
      ...prev,
      { x: "nova categoria", y: 0, color: "#3c191dff" },
    ]);
  }

  function handleSaveCategoryName(index: number) {
    if (editing.index === index) {
      setCategories((prev) =>
        prev.map((c, i) => (i === index ? { ...c, x: editing.name } : c))
      );

      setEditing({ index: null, name: "" });
    }
  }

  function handleDeleteCategory() {
    setCategories((prev) => prev.filter((cate) => cate.x !== categoryToDelete));

    setCategoryToDelete("");
  }

  function createPainel(values: { nome: string; valor: string }) {
    setPaineis((prev) => {
      const ultimoId = prev.length > 0 ? prev[prev.length - 1].id : 0;
      const novoId = ultimoId ? ultimoId + 1 : "1";

      return [
        ...prev,
        {
          id: novoId,
          painel: values,
          ocorrencias: [],
        },
      ];
    });
  }

  function cadastrasMovimentacoes(values: {
    nome: string;
    valor: string;
    data: string;
    tipo: "Entrada" | "Saída";
    categoria: string;
    id: string;
  }) {
    const valorMov = Number(values.valor.replace(/\./g, "").replace(",", "."));

    if (values.tipo === "Saída") {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.x === values.categoria ? { ...cat, y: cat.y + valorMov } : cat
        )
      );
    }

    setPaineis((prev) =>
      prev.map((painel) => {
        if (painel.id === values.id) {
          console.log("painel", painel.painel.valor);

          const valorMov = Number(
            values.valor.replace(/\./g, "").replace(",", ".")
          );

          const valorAtual = Number(painel.painel.valor);

          const novoValor =
            values.tipo === "Entrada"
              ? valorAtual + valorMov
              : valorAtual - valorMov;

          return {
            ...painel,
            painel: {
              ...painel.painel,
              valor: novoValor.toString(),
            },
            ocorrencias: [
              ...(painel.ocorrencias || []),
              {
                nome: values.nome,
                valor: values.valor,
                data: values.data,
                tipo: values.tipo,
                movimentacao: values.categoria,
              },
            ],
          };
        }

        return painel;
      })
    );
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
        categoryName={categoryToDelete}
      />

      <ModalNovoPainel
        isOpen={openModalNovoPainel}
        onClose={() => setOpenNovoPainel(false)}
        handleSave={(values) => createPainel(values)}
      />

      <ModalRegistrarMovimento
        isOpen={openTransactionModal.open === true}
        onClose={() =>
          setOpenTransactionModal({ open: false, idPainel: "", name: "" })
        }
        painel={openTransactionModal.name}
        id={openTransactionModal.idPainel}
        categorys={categories}
        handleSave={(values) => cadastrasMovimentacoes(values)}
      />

      <ModalCategorias
        isOpen={openModalCategorias}
        onClose={() => setOpenModalCategorias(false)}
        categorias={categories}
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

        <PainelContas paineis={paineis} />

        {paineis.length === 0 ? (
          <Center mt={"200px"} display={"flex"} flexDir={"column"}>
            <Text color={"gray.600"} fontSize={"2xl"} fontWeight={"bold"}>
              Você ainda não criou nenhum painel,
            </Text>
            <Text color={"gray.600"} fontSize={"2xl"} fontWeight={"bold"}>
              Clique no botão acima para adicionar um.
            </Text>
          </Center>
        ) : null}

        {paineis.map((painel) => (
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
                {painel.painel.nome}
              </Text>
              <Box
                onClick={() =>
                  setOpenTransactionModal({
                    open: true,
                    idPainel: painel.id ?? "",
                    name: painel.painel.nome,
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
                {painel.ocorrencias && painel.ocorrencias?.length > 0
                  ? painel.ocorrencias.map((occ, index) => (
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
                          {occ.nome}
                        </Text>
                        <Text w="17%" color="black">
                          {occ.movimentacao}
                        </Text>
                        <Text w="12%" color="black">
                          R$ {occ.valor}
                        </Text>
                        <Text w="16%" color="black">
                          {ConvertDataToBR(occ.data)}
                        </Text>

                        <HStack w="28%">
                          <Icon
                            as={
                              occ.tipo === "Entrada"
                                ? FaArrowAltCircleUp
                                : FaArrowAltCircleDown
                            }
                            color={occ.tipo === "Entrada" ? "green" : "red"}
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
                    data={categories}
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
                    {categories
                      .filter((item) => item.y > 0)
                      .map((item) => (
                        <HStack key={item.x}>
                          <Box
                            borderRadius="5px"
                            w="20px"
                            h="20px"
                            bg={item.color}
                          />
                          <Text fontSize="lg" fontWeight="bold">
                            {item.x}
                          </Text>
                        </HStack>
                      ))}
                  </Stack>
                </Box>
              </Box>

              {collorPalette ? (
                <SketchPicker
                  color={"#FF0000"}
                  onChange={(c: any) => {
                    handleChangeColor(c.hex);
                  }}
                />
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
                  {categories.map((category, index) => (
                    <HStack>
                      <Box
                        w={"25px"}
                        h={"25px"}
                        borderRadius={"5px"}
                        bg={category.color}
                        onClick={() => {
                          setCategorySelected(category.x),
                            setColorPalette(true);
                        }}
                      />
                      <Input
                        fontSize="lg"
                        w="50%"
                        h="35px"
                        value={
                          editing.index === index ? editing.name : category.x
                        }
                        onChange={(e) =>
                          setEditing({
                            index,
                            name: e.target.value,
                          })
                        }
                      />

                      <Icon
                        as={FaCheck}
                        ml="5px"
                        cursor="pointer"
                        onClick={() => handleSaveCategoryName(index)}
                      />
                      <Icon
                        as={FaTrash}
                        ml={"5px"}
                        onClick={() => {
                          setCategoryToDelete(category.x);
                          setPopUpDeleteCategory(true);
                        }}
                      />
                    </HStack>
                  ))}
                </Stack>
                <HStack mt={"20px"} mr={"70px"} onClick={handleNewCategory}>
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
