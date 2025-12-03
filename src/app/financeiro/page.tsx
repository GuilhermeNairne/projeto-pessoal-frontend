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
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { GrTransaction } from "react-icons/gr";
import { IoIosAddCircleOutline } from "react-icons/io";
import { VictoryPie, VictoryTheme } from "victory";

import {
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
  FaChevronDown,
  FaChevronUp,
  FaPencilAlt,
  FaTrash,
} from "react-icons/fa";
import { ConvertDataToBR } from "@/utils/convert-data-to-BR";

const sampleData = [
  { x: "Aluguel", y: 1200, color: "#d50c20" },
  { x: "Mercado", y: 800, color: "#339c00" },
  { x: "Transporte", y: 250, color: "#ffc107" },
  { x: "Lazer", y: 300, color: "#007bff" },
  { x: "Outros", y: 150, color: "#9c27b0" },
];

export default function Financeiro() {
  const [openFiltros, setOpenFiltros] = useState(false);
  const [paineis, setPaineis] = useState<PaineisType>([]);
  const [openModalNovoPainel, setOpenNovoPainel] = useState(false);
  const [openModalMovimento, setOpenModalMovimento] = useState<{
    aberto: boolean;
    idPainel: string;
  }>({ aberto: false, idPainel: "" });
  const [openModalCategorias, setOpenModalCategorias] = useState(false);
  const [categorias, setCategorias] = useState<
    { name: string; color: string }[]
  >([]);

  function criaPainel(values: { nome: string; valor: string }) {
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
    tipo: "Entrada" | "Saida";
    categoria: string;
    id: string;
  }) {
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

      <ModalNovoPainel
        isOpen={openModalNovoPainel}
        onClose={() => setOpenNovoPainel(false)}
        handleSave={(values) => criaPainel(values)}
      />

      <ModalRegistrarMovimento
        isOpen={openModalMovimento.aberto === true}
        onClose={() => setOpenModalMovimento({ aberto: false, idPainel: "" })}
        painel="Previdência"
        id={openModalMovimento.idPainel}
        handleSave={(values) => cadastrasMovimentacoes(values)}
      />

      <ModalCategorias
        isOpen={openModalCategorias}
        onClose={() => setOpenModalCategorias(false)}
        categorias={categorias}
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
                  setOpenModalMovimento({
                    aberto: true,
                    idPainel: painel.id ?? "",
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
                <Text w={"30%"} color={"white"}>
                  Movimentação
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
              {painel.ocorrencias && painel.ocorrencias?.length > 0
                ? painel.ocorrencias.map((occ, index) => (
                    <Box
                      boxShadow={"md"}
                      display={"flex"}
                      flexDir={"row"}
                      bg={index % 2 === 0 ? "#F3F3F3" : "#D9D9D9"}
                      w={"full"}
                      h={"35px"}
                      alignItems={"center"}
                      px={"15px"}
                    >
                      <Text w={"30%"} color={"black"}>
                        {occ.nome}
                      </Text>
                      <Text w={"14%"} color={"black"}>
                        R$ {occ.valor}
                      </Text>
                      <Text w={"16%"} color={"black"}>
                        {ConvertDataToBR(occ.data)}
                      </Text>
                      <HStack w={"40%"}>
                        <Text color={"black"}>{occ.tipo}</Text>
                        <Icon
                          as={
                            occ.tipo === "Entrada"
                              ? FaArrowAltCircleUp
                              : FaArrowAltCircleDown
                          }
                          color={occ.tipo === "Entrada" ? "green" : "red"}
                          boxSize={"5"}
                        />
                      </HStack>
                      <Icon w={"1%"} as={FaTrash} />
                    </Box>
                  ))
                : null}
            </Stack>

            <HStack w={"100%"} display={"flex"} mt={"80px"}>
              <Box display={"flex"} flexDir={"column"} w={"100%"}>
                <HStack display={"flex"} justifyContent={"space-between"}>
                  <Text fontSize={"lg"} fontWeight={"bold"}>
                    Gráfico por tipo de gasto
                  </Text>
                  <HStack
                    gap={3}
                    display={"flex"}
                    alignItems={"center"}
                    onClick={() => setOpenModalCategorias(true)}
                  >
                    <Text fontSize={"lg"}>Editar categorias</Text>
                    <Icon
                      color={"menu_principal"}
                      as={FaPencilAlt}
                      boxSize={"5"}
                    />
                  </HStack>
                </HStack>
                <Box w={"50%"} display={"flex"} flexDir={"row"}>
                  <VictoryPie
                    startAngle={90}
                    labels={({ datum }) => `R$ ${datum.y},00`}
                    endAngle={450}
                    data={sampleData}
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

                  <Stack mt={"80px"}>
                    {sampleData.map((item) => (
                      <HStack>
                        <Box
                          borderRadius={"5px"}
                          w={"20px"}
                          h={"20px"}
                          bg={item.color}
                        />
                        <Text fontSize={"lg"} fontWeight={"bold"}>
                          {item.x}
                        </Text>
                      </HStack>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </HStack>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
