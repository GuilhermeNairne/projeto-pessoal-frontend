"use client";

import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { usePanels } from "@/hooks/usePanels";
import { GrTransaction } from "react-icons/gr";
import { IoIosAddCircleOutline } from "react-icons/io";
import {
  CategoriesType,
  EditPanelType,
  ModalType,
} from "@/types/financial-types";
import { PainelContas } from "@/componnents/financial/painel-contas";
import { Box, Flex, HStack, Icon, Link, Text } from "@chakra-ui/react";
import { ModalNovoPainel } from "@/componnents/financial/modal-novo-painel";
import { GraficoTipoGasto } from "@/componnents/financial/grafico-tipo-gasto";
import { CategoriasComponente } from "@/componnents/financial/categorias-componente";
import { ComponenteMovimentos } from "@/componnents/financial/componente-movimentos";
import { ModalRegistrarMovimento } from "@/componnents/financial/modal-registrar-movimento";
import { FaPencil } from "react-icons/fa6";
import { EditPanelModal } from "@/componnents/financial/modal-edit-panel";

const css = {
  "&::-webkit-scrollbar": {
    display: "none",
  },
  "-ms-overflow-style": "none",
  "scrollbar-width": "none",
};

export default function Financeiro() {
  const { listPanels } = usePanels();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editPanelValues, setEditPanelValues] = useState<EditPanelType>();
  const [openTransactionModal, setOpenTransactionModal] = useState<{
    open: boolean;
    idPainel: string;
    name: string;
    categories: CategoriesType[];
  }>({ open: false, idPainel: "", name: "", categories: [] });

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id);
  }, []);

  const { data: panels, refetch: refetchPanel } = useQuery({
    queryKey: ["panels", userId],
    queryFn: async () => listPanels(userId ?? ""),
  });

  function handleEditPanel({ id, panel, value }: EditPanelType) {
    setEditPanelValues({ panel, value, id });
    setActiveModal("editPanel");
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
        isOpen={activeModal === "newPanel"}
        onClose={() => {
          (setActiveModal(null), refetchPanel());
        }}
      />

      <EditPanelModal
        isOpen={activeModal === "editPanel"}
        onClose={() => setActiveModal(null)}
        refetch={() => refetchPanel()}
        panelValues={{
          id: editPanelValues?.id ?? 0,
          panel: editPanelValues?.panel ?? "",
          value: editPanelValues?.value ?? "",
        }}
      />

      <ModalRegistrarMovimento
        isOpen={openTransactionModal.open === true}
        refetch={() => refetchPanel()}
        onClose={() =>
          setOpenTransactionModal({
            open: false,
            idPainel: "",
            name: "",
            categories: [],
          })
        }
        painel={openTransactionModal.name}
        painel_id={openTransactionModal.idPainel}
        categorys={openTransactionModal.categories}
      />

      <Flex
        flexDir={"column"}
        w={"full"}
        mr={"18px"}
        overflow={"auto"}
        css={css}
      >
        <HStack justifyContent={"flex-end"} mt={"10px"} mr={"10px"}>
          <Link
            display={"flex"}
            flexDir={"row"}
            alignItems={"center"}
            gap={2}
            onClick={() => setActiveModal("newPanel")}
          >
            <Text fontSize={"lg"}>Novo painel</Text>
            <Icon as={IoIosAddCircleOutline} boxSize={"8"} />
          </Link>
        </HStack>

        <PainelContas paineis={panels?.data ?? []} />

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
              <HStack gap={5}>
                <Text fontSize={"3xl"} fontWeight={"bold"}>
                  {panel.name}
                </Text>
                <Icon
                  as={FaPencil}
                  boxSize={5}
                  onClick={() =>
                    handleEditPanel({
                      panel: panel.name,
                      value: panel.initial_value,
                      id: panel.id ?? 0,
                    })
                  }
                />
              </HStack>
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

            <ComponenteMovimentos
              panel={panel}
              refetch={() => refetchPanel()}
            />

            <HStack
              w={"100%"}
              display={"flex"}
              mt={"80px"}
              justifyContent={"space-between"}
              alignItems={"flex-start"}
            >
              <GraficoTipoGasto panel={panel} />

              <CategoriasComponente
                panel={panel}
                refetch={() => refetchPanel()}
              />
            </HStack>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
