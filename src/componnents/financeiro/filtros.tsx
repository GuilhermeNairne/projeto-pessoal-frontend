import {
  Box,
  Collapse,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Select,
  SlideFade,
  Stack,
  Text,
} from "@chakra-ui/react";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import { FaFilter } from "react-icons/fa";

type Props = {
  open: boolean;
};

export function Filtros({ open }: Props) {
  return (
    <Collapse
      in={open}
      animateOpacity
      transition={{
        enter: { duration: 0.8 },
        exit: { duration: 0.8 },
      }}
      style={{ opacity: open ? 1 : 0 }}
    >
      <Flex
        bg={"cinza_hover"}
        borderRadius={"10px"}
        h={"190px"}
        flexDir={"column"}
      >
        <HStack
          p={"20px"}
          display={"flex"}
          justifyContent={"space-between"}
          w={"100%"}
        >
          <DefaultInput
            placeholder="Informe o nome do movimentos"
            position="cima"
            title="Nome"
            w="150px"
          />
          <Stack>
            <Text fontWeight={"bold"}>Ordenar por data</Text>
            <RadioGroup defaultValue="2">
              <Radio borderColor={"gray.400"} value="1" mr={"20px"}>
                Mais recentes
              </Radio>
              <Radio borderColor={"gray.400"} value="2">
                Mais antigos
              </Radio>
            </RadioGroup>
          </Stack>
          <Stack>
            <Text fontWeight={"bold"}>Ordenar por valor</Text>
            <RadioGroup defaultValue="2">
              <Radio borderColor={"gray.400"} value="1" mr={"20px"}>
                Maior valor
              </Radio>
              <Radio borderColor={"gray.400"} value="2">
                Menor valor
              </Radio>
            </RadioGroup>
          </Stack>
          <Stack>
            <Text fontWeight={"bold"}>Movimento</Text>
            <RadioGroup defaultValue="2">
              <Radio borderColor={"gray.400"} value="1" mr={"20px"}>
                Entrada
              </Radio>
              <Radio borderColor={"gray.400"} value="2">
                Saída
              </Radio>
            </RadioGroup>
          </Stack>

          <Stack>
            <Text fontWeight={"bold"}>Tipo</Text>
            <Select
              placeholder="Selecione o tipo"
              w={"170px"}
              bg={"white"}
              borderColor={"gray.400"}
              borderRadius={"10px"}
            >
              <option value="1">Opção 1</option>
              <option value="2">Opção 2</option>
              <option value="3">Opção 3</option>
            </Select>
          </Stack>
        </HStack>

        <Box
          display={"flex"}
          justifyContent={"flex-end"}
          mt={"20px"}
          mr={"20px"}
          alignItems={"center"}
          gap={5}
        >
          <Text color={"menu_principal"}>Limpar todos os filtros</Text>
          <DefaultButton icon={FaFilter} title="Filtrar" w="130px" />
        </Box>
      </Flex>
    </Collapse>
  );
}
