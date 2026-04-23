import { LuClipboardCheck } from "react-icons/lu";
import { Box, Checkbox, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { CiClock2 } from "react-icons/ci";

type Props = {
  titulo: string;
  descricao: string;
  tempo: string;
  status: string;
};

export function CardTarefa({ descricao, status, tempo, titulo }: Props) {
  return (
    <Flex
      w={`90%`}
      p={3}
      mt={5}
      alignSelf={"center"}
      bg={status === "Concluido" ? "cinza_200" : "#eef1f8"}
      borderWidth={1}
      borderLeftWidth={2}
      flexDir={`column`}
      borderRadius={3}
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
        <Text
          // mt={5}
          // fontWeight={"bold"}
          color={status === "Concluida" ? "cinza_600" : "black"}
        >
          {tempo} horas
        </Text>
      </HStack>
    </Flex>
  );
}
