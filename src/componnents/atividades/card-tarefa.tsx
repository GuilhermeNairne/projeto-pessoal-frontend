import { LuClipboardCheck } from "react-icons/lu";
import {
  Box,
  Checkbox,
  Flex,
  HStack,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { CiClock2 } from "react-icons/ci";
import { FaPencil } from "react-icons/fa6";
import { ListTarefasReturnType, useTarefas } from "@/hooks/useTarefas";
import { da } from "date-fns/locale";

type Props = {
  onClick: () => void;
  refetch: () => void;
  dadosTarefa: ListTarefasReturnType;
};

export function CardTarefa({ dadosTarefa, onClick, refetch }: Props) {
  const toast = useToast();
  const { editTarefa } = useTarefas();
  const horas = Math.floor(Number(dadosTarefa.tempo) / 60);
  const minutos = Number(dadosTarefa.tempo) % 60;
  const tempoFormatado = `${String(horas).padStart(2, "0")}h${String(minutos).padStart(2, "0")}m`;

  async function handleEditaTarefa() {
    try {
      const body = {
        ...dadosTarefa,
        tempo: String(dadosTarefa.tempo),
        status: dadosTarefa.status === "Concluida" ? "Pendente" : "Concluida",
      };
      await editTarefa(dadosTarefa.id, body);

      refetch();
    } catch (error) {
      toast({
        position: "top",
        isClosable: true,
        status: "error",
        title: "Erro ao editar status da tarefa!",
      });
    }
  }

  return (
    <Flex
      p={3}
      mt={5}
      w={`90%`}
      borderWidth={1}
      borderRadius={3}
      flexDir={`column`}
      borderLeftWidth={2}
      alignSelf={"center"}
      bg={dadosTarefa.status === "Concluido" ? "surface.taskDone" : "surface.taskActive"}
      borderLeftColor={
        dadosTarefa.status === "Concluida" ? "border.default" : "text.primary"
      }
    >
      <Box display={`flex`} flexDir={`row`} justifyContent={`space-between`}>
        <HStack>
          <Icon
            as={LuClipboardCheck}
            color={dadosTarefa.status === "Concluida" ? "text.muted" : "text.primary"}
            boxSize={5}
            sx={{ strokeWidth: 2 }}
          />
          <Text
            fontWeight={`bold`}
            maxW={`80%`}
            color={dadosTarefa.status === "Concluida" ? "text.muted" : "text.primary"}
          >
            {dadosTarefa.nome}
          </Text>
        </HStack>

        <Checkbox
          colorScheme="gray"
          size="lg"
          onChange={() => handleEditaTarefa()}
          isChecked={dadosTarefa.status === "Concluida"}
          borderColor={"border.default"}
          sx={{
            "& .chakra-checkbox__control": {
              borderRadius: "5px",
            },
          }}
        />
      </Box>

      <Text
        fontWeight={"bold"}
        mt={3}
        color={dadosTarefa.status === "Concluida" ? "text.muted" : "blue.500"}
      >
        {dadosTarefa.descricao}
      </Text>

      <HStack mt={5} justifyContent={`space-between`} alignItems={`center`}>
        <Flex alignItems={`center`} gap={1}>
          <Icon
            as={CiClock2}
            sx={{ strokeWidth: 1 }}
            color={dadosTarefa.status === "Concluida" ? "text.muted" : "text.primary"}
          />
          <Text
            color={dadosTarefa.status === "Concluida" ? "text.muted" : "text.primary"}
          >
            {tempoFormatado} horas
          </Text>
        </Flex>

        <Icon as={FaPencil} onClick={() => onClick()} />
      </HStack>
    </Flex>
  );
}
