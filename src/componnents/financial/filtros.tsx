import {
  Box,
  Collapse,
  Flex,
  HStack,
  Link,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { DefaultInput } from "../default-input";
import { DefaultButton } from "../default-button";
import { FaFilter } from "react-icons/fa";
import { CategoriesType } from "@/types/financial-types";

type Props = {
  open: boolean;
  categories?: CategoriesType[];
};

export function Filtros({ open, categories }: Props) {
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
      <Flex bg={"white"} borderRadius={"10px"} h={"190px"} flexDir={"column"}>
        <HStack
          p={"20px"}
          display={"flex"}
          justifyContent={"space-between"}
          w={"100%"}
        >
          <DefaultInput
            placeholder="Informe o nome do movimento"
            position="cima"
            title="Nome do movimento"
            w="260px"
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
            <Text fontWeight={"bold"}>Categoria</Text>
            <Select
              placeholder="Selecione a categoria"
              w={"250px"}
              bg={"white"}
              borderColor={"gray.400"}
              borderRadius={"10px"}
            >
              {/* {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option value={category.id}>{category.name} </option>
                ))
              ) : (
                <option value="">""</option>
              )} */}
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
          <Link>
            <Text color={"menu_principal"}>Limpar todos os filtros</Text>
          </Link>
          <DefaultButton icon={FaFilter} title="Filtrar" w="130px" />
        </Box>
      </Flex>
    </Collapse>
  );
}
