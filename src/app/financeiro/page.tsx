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
import { GraficoTipoGasto } from "@/componnents/financial/grafico-tipo-gasto";
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
} from "@chakra-ui/react";
import { GraficoJuros } from "@/componnents/financial/grafico-juros";
import { ScrollBarcss } from "@/utils/scroll-bar-css";

export default function Financeiro() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { listPanels } = usePanels();
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
                <Box
                  display={"flex"}
                  flexDir={"row"}
                  alignItems={"center"}
                  gap={3}
                >
                  <Text fontSize={"lg"}>Registrar movimento</Text>
                  <Icon as={GrTransaction} boxSize={"5"} color={"green"} />
                </Box>
              </Link>
            </HStack>

            <ComponenteMovimentos
              panel={panel}
              refetch={() => refetchPanel()}
              navigate={() =>
                router.push(`/movimentacoes?id_panel=${panel.id}`)
              }
            />

            <GraficoJuros juros={panel.juros} />
            <HStack
              w={"100%"}
              display={"flex"}
              mt={"80px"}
              justifyContent={"space-between"}
              alignItems={"flex-start"}
            >
              <GraficoTipoGasto
                panel={panel}
                month={new Date().getMonth() + 1}
              />

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
