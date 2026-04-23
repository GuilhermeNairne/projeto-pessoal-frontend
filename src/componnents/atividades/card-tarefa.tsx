import { LuClipboardCheck } from "react-icons/lu";
import { Box, Checkbox, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { CiClock2 } from "react-icons/ci";

type Props = {
  tempo: string;
  titulo: string;
  status: string;
  descricao: string;
  onClick: () => void;
};

export function CardTarefa({
  descricao,
  status,
  tempo,
  titulo,
  onClick,
}: Props) {
  const horas = Math.floor(Number(tempo) / 60);
  const minutos = Number(tempo) % 60;
  const tempoFormatado = `${String(horas).padStart(2, "0")}h${String(minutos).padStart(2, "0")}m`;

  return (
    <Flex
      p={3}
      mt={5}
      w={`90%`}
      onClick={() => onClick()}
      borderWidth={1}
      borderRadius={3}
      flexDir={`column`}
      borderLeftWidth={2}
      alignSelf={"center"}
      bg={status === "Concluido" ? "cinza_200" : "#eef1f8"}
      borderLeftColor={status === "Concluida" ? "cinza_600" : "menu_principal"}
    >
      <Box display={`flex`} flexDir={`row`} justifyContent={`space-between`}>
        <HStack>
          <Icon
            as={LuClipboardCheck}
            color={status === "Concluida" ? "cinza_600" : "black"}
            boxSize={5}
            sx={{ strokeWidth: 2 }}
          />
          <Text
            fontWeight={`bold`}
            color={status === "Concluida" ? "cinza_600" : "black"}
          >
            {titulo}
          </Text>
        </HStack>

        <Checkbox
          colorScheme="gray"
          size="lg"
          isChecked={status === "Concluida"}
          borderColor={`gray.400`}
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
        color={status === "Concluida" ? "cinza_600" : "blue.500"}
      >
        {descricao}
      </Text>

      <HStack mt={5} alignItems={`center`}>
        <Icon
          as={CiClock2}
          sx={{ strokeWidth: 1 }}
          color={status === "Concluida" ? "cinza_600" : "black"}
        />
        <Text color={status === "Concluida" ? "cinza_600" : "black"}>
          {tempoFormatado} horas
        </Text>
      </HStack>
    </Flex>
  );
}
