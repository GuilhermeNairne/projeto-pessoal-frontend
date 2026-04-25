import { ListCardsTarefasType } from "@/hooks/useTarefas";
import { Box, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { FaBook, FaCheck } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { TiClipboard } from "react-icons/ti";

export function Quadros(values: ListCardsTarefasType) {
  const minutesToHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}H ${m}M`;
  };

  return (
    <HStack gap={10} display={"flex"}>
      <Box
        p={3}
        w={250}
        h={"120px"}
        borderRadius={8}
        boxShadow={"md"}
        bg={"white"}
      >
        <HStack>
          <Box
            w={8}
            h={8}
            bg={`green.600`}
            borderRadius={5}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Icon as={FaCheck} boxSize={5} color={"white"} />
          </Box>
          <Text fontSize={"sm"} color={"gray.500"} fontWeight={"light"}>
            METAS CUMPRIDAS (H)
          </Text>
        </HStack>

        <Text mt={10} fontSize={"lg"} color={`green.600`} fontWeight={"bold"}>
          {minutesToHours(values.totalMinutosConcluidos)} CONCLUÍDAS
        </Text>
      </Box>

      <Box
        p={3}
        w={250}
        h={"120px"}
        borderRadius={8}
        boxShadow={"md"}
        bg={"white"}
      >
        <HStack>
          <Box
            w={8}
            h={8}
            bg={`red.600`}
            borderRadius={5}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Icon as={MdOutlinePendingActions} boxSize={6} color={"white"} />
          </Box>
          <Text fontSize={"sm"} color={"gray.500"} fontWeight={"light"}>
            PENDENTES
          </Text>
        </HStack>

        <Text mt={10} fontSize={"lg"} color={`red.600`} fontWeight={"bold"}>
          {values.totalPendente}{" "}
          {values.totalPendente === 1 ? "TAREFA" : "TAREFAS"}
        </Text>
      </Box>

      <Box
        p={3}
        w={250}
        h={"120px"}
        borderRadius={8}
        boxShadow={"md"}
        bg={"white"}
      >
        <HStack>
          <Box
            w={8}
            h={8}
            bg={`blue.600`}
            borderRadius={5}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <Icon as={TiClipboard} boxSize={6} color={"white"} />
          </Box>
          <Text fontSize={"sm"} color={"gray.500"} fontWeight={"light"}>
            TAREFAS CADASTRADAS
          </Text>
        </HStack>

        <Text mt={10} fontSize={"lg"} color={`blue.600`} fontWeight={"bold"}>
          {values.totalMes} {values.totalMes === 1 ? "TAREFA" : "TAREFAS"}
        </Text>
      </Box>
    </HStack>
  );
}
