import { ListCardsTarefasType } from "@/hooks/useTarefas";
import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { TiClipboard } from "react-icons/ti";

export function Quadros(values: ListCardsTarefasType) {
  const minutesToHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}H ${m}M`;
  };

  return (
    <Flex
      gap={{ base: 3, lg: 10 }}
      flexWrap="wrap"
    >
      <Box
        p={3}
        w={{ base: "100%", sm: "calc(50% - 6px)", md: "250px" }}
        h={{ base: "auto", md: "120px" }}
        minH="90px"
        borderRadius={8}
        boxShadow={"md"}
        bg={"surface.card"}
      >
        <HStack>
          <Box
            w={{ base: 6, md: 8 }}
            h={{ base: 6, md: 8 }}
            bg={`green.600`}
            borderRadius={5}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Icon as={FaCheck} boxSize={{ base: 3, md: 5 }} color={"white"} />
          </Box>
          <Text fontSize={{ base: "xs", md: "sm" }} color={"text.muted"} fontWeight={"light"}>
            METAS CUMPRIDAS (H)
          </Text>
        </HStack>

        <Text mt={{ base: 4, md: 10 }} fontSize={{ base: "md", md: "lg" }} color={`green.600`} fontWeight={"bold"}>
          {minutesToHours(values.totalMinutosConcluidos)} CONCLUÍDAS
        </Text>
      </Box>

      <Box
        p={3}
        w={{ base: "calc(50% - 6px)", md: "250px" }}
        h={{ base: "auto", md: "120px" }}
        minH="90px"
        borderRadius={8}
        boxShadow={"md"}
        bg={"surface.card"}
      >
        <HStack>
          <Box
            w={{ base: 6, md: 8 }}
            h={{ base: 6, md: 8 }}
            bg={`red.600`}
            borderRadius={5}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Icon as={MdOutlinePendingActions} boxSize={{ base: 4, md: 6 }} color={"white"} />
          </Box>
          <Text fontSize={{ base: "xs", md: "sm" }} color={"text.muted"} fontWeight={"light"}>
            PENDENTES
          </Text>
        </HStack>

        <Text mt={{ base: 4, md: 10 }} fontSize={{ base: "md", md: "lg" }} color={`red.600`} fontWeight={"bold"}>
          {values.totalPendente}{" "}
          {values.totalPendente === 1 ? "TAREFA" : "TAREFAS"}
        </Text>
      </Box>

      <Box
        p={3}
        w={{ base: "calc(50% - 6px)", md: "250px" }}
        h={{ base: "auto", md: "120px" }}
        minH="90px"
        borderRadius={8}
        boxShadow={"md"}
        bg={"surface.card"}
      >
        <HStack>
          <Box
            w={{ base: 6, md: 8 }}
            h={{ base: 6, md: 8 }}
            bg={`blue.600`}
            borderRadius={5}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Icon as={TiClipboard} boxSize={{ base: 4, md: 6 }} color={"white"} />
          </Box>
          <Text fontSize={{ base: "xs", md: "sm" }} color={"text.muted"} fontWeight={"light"}>
            TAREFAS CADASTRADAS
          </Text>
        </HStack>

        <Text mt={{ base: 4, md: 10 }} fontSize={{ base: "md", md: "lg" }} color={`blue.600`} fontWeight={"bold"}>
          {values.totalMes} {values.totalMes === 1 ? "TAREFA" : "TAREFAS"}
        </Text>
      </Box>
    </Flex>
  );
}
