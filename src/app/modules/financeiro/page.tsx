"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Menu } from "@/componnents/menu";
import { FaPencil } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { usePanels } from "@/hooks/usePanels";
import { GrTransaction } from "react-icons/gr";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useAuthContext } from "@/contexts/AuthContext";
import { PainelContas } from "@/componnents/financial/painel-contas";
import { EditPanelModal } from "@/componnents/financial/modal-edit-panel";
import { ModalNovoPainel } from "@/componnents/financial/modal-novo-painel";
import { ComponenteMovimentos } from "@/componnents/financial/componente-movimentos";
import { CategoriasComponente } from "@/componnents/financial/categorias-componente";
import { ModalRegistrarMovimento } from "@/componnents/financial/modal-registrar-movimento";
import {
  CategoriesType,
  EditPanelType,
  ModalType,
} from "@/types/financial-types";

import {
  Box,
  Center,
  Flex,
  HStack,
  Icon,
  Link,
  Spinner,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ScrollBarcss } from "@/utils/scroll-bar-css";
import { MenuMobile } from "@/componnents/menu-mobile";
import { GraficoGastosMes } from "@/componnents/financial/grafico-gastos-mes";

export default function Financeiro() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { listPanels } = usePanels();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editPanelValues, setEditPanelValues] = useState<EditPanelType>();
  const [openTransactionModal, setOpenTransactionModal] = useState<{
    open: boolean;
    idPainel: string;
    name: string;
    categories: CategoriesType[];
  }>({ open: false, idPainel: "", name: "", categories: [] });

  const {
    data: panels,
    refetch: refetchPanel,
    isLoading,
  } = useQuery({
    queryKey: ["panels", user?.id],
    queryFn: async () => listPanels(user?.id ?? ""),
  });

  function handleEditPanel({ id, panel, value }: EditPanelType) {
    setEditPanelValues({ panel, value, id });
    setActiveModal("editPanel");
  }

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      p={{ base: "20px", lg: "20px" }}
      flexDir={{ base: "column", lg: "row" }}
      gap={{ base: 4, lg: 10 }}
      overflow="hidden"
    >
      <MenuMobile />
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
        css={ScrollBarcss}
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

        <PainelContas paineis={panels?.data ?? []} isLoading={isLoading} />

        {panels?.data.map((panel, index) => (
          <Box
            key={index}
            display={"flex"}
            flexDir={"column"}
            bg={"surface.card"}
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
              <Link
                onClick={() =>
                  setOpenTransactionModal({
                    open: true,
                    idPainel: String(panel.id) ?? "",
                    name: panel.name,
                    categories: panel.categories ?? [],
                  })
                }
              >
                {isMobile ? (
                  <Icon as={GrTransaction} boxSize={"5"} color={"green"} />
                ) : (
                  <Box
                    display={"flex"}
                    flexDir={"row"}
                    alignItems={"center"}
                    gap={3}
                  >
                    <Text fontSize={"lg"}>Registrar movimento</Text>
                    <Icon as={GrTransaction} boxSize={"5"} color={"green"} />
                  </Box>
                )}
              </Link>
            </HStack>

            {isMobile ? null : (
              <ComponenteMovimentos
                panel={panel}
                refetch={() => refetchPanel()}
                navigate={() =>
                  router.push(
                    `/modules/financeiro/movimentacoes?id_panel=${panel.id}`,
                  )
                }
              />
            )}

            <HStack
              w={"100%"}
              display={"flex"}
              mt={"60px"}
              justifyContent={"space-between"}
              alignItems={"flex-start"}
            >
              <GraficoGastosMes painelSelecionado={panel.id ?? 0} />

              {isMobile ? null : (
                <CategoriasComponente
                  panel={panel}
                  refetch={() => refetchPanel()}
                />
              )}
            </HStack>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
