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
import { listCategoriesType, useTarefas } from "@/hooks/useTarefas";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery } from "react-query";
import { FaPencil } from "react-icons/fa6";
import { DefaultButton } from "@/componnents/default-button";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CategoriaModal } from "@/componnents/atividades/categoria-modal";
import { useState } from "react";

export default function Categorias() {
  const { user } = useAuthContext();
  const { listCategorias } = useTarefas();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    listCategoriesType | undefined
  >(undefined);

  const { data: categorias, refetch } = useQuery({
    queryKey: [`categorias`, user?.id],
    queryFn: () => listCategorias(user?.id ?? ""),
  });

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

      <CategoriaModal
        isOpen={isOpen}
        onClose={onClose}
        reload={refetch}
        categoria={categoriaSelecionada}
      />

      <Box w={`80%`}>
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
            <Text fontSize={"lg"}>Nova categoria</Text>
            <Icon as={IoIosAddCircleOutline} boxSize={"8"} />
          </Link>
        </HStack>
        <HStack mt={5} h={"40px"} bg={`menu_principal`} borderRadius={5} p={5}>
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
            <HStack
              h={"40px"}
              bg={index % 2 === 0 ? "#F3F3F3" : "#D9D9D9"}
              borderRadius={5}
              p={5}
            >
              <Text w={`25%`} fontWeight={`semi-bold`}>
                {categoria.nome}
              </Text>
              <Box w={`10%`}>
                <Box
                  ml={3}
                  w={`14px`}
                  h={`14px`}
                  borderRadius={5}
                  bg={categoria.cor}
                />
              </Box>

              <Text ml={16} w={`60%`} fontWeight={`semi-bold`}>
                {categoria.tarefasPendentes}
              </Text>

              <Icon
                as={FaPencil}
                alignItems={`flex-end`}
                onClick={() => {
                  (setCategoriaSelecionada(categoria), onOpen());
                }}
              />
            </HStack>
          ))}
        </Stack>
      </Box>
    </Flex>
  );
}
