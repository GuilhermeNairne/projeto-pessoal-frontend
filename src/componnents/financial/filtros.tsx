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
import { useCategoies } from "@/hooks/useCategories";
import { useQuery } from "react-query";
import { useFormik } from "formik";

export type FiltrosMovementsType = {
  name?: string;
  order_date?: string;
  movement_type?: string;
  category_id?: string;
};

type Props = {
  open: boolean;
  id_panel?: string;
  refetch: () => void;
  filtrosValues: (values: FiltrosMovementsType) => void;
};

export function Filtros({ open, id_panel, refetch, filtrosValues }: Props) {
  const { listCategories } = useCategoies();

  const { data: categories } = useQuery({
    queryKey: ["categories", id_panel],
    queryFn: async () => listCategories(id_panel ?? ""),
  });

  const { values, handleChange, resetForm, handleSubmit } = useFormik({
    initialValues: {
      name: "",
      order_date: "DESC",
      movement_type: "",
      category_id: "",
    },
    enableReinitialize: true,
    onSubmit: () => {
      filtrosValues(values);
      setTimeout(() => {
        refetch();
      }, 500);
    },
  });

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
        bg={"#d5d5d5d0"}
        borderRadius={"10px"}
        h={"190px"}
        flexDir={"column"}
        borderColor={"#d5d5d5dd"}
        borderWidth={"1px"}
      >
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
            value={values.name}
            onChange={handleChange("name")}
          />
          <Stack>
            <Text fontWeight={"bold"}>Ordenar por data</Text>
            <RadioGroup defaultValue="all" value={values.order_date}>
              <Radio
                borderColor={"gray.400"}
                value="DESC"
                mr={"20px"}
                onChange={handleChange("order_date")}
              >
                Mais recentes
              </Radio>
              <Radio
                borderColor={"gray.400"}
                value="ASC"
                onChange={handleChange("order_date")}
              >
                Mais antigos
              </Radio>
            </RadioGroup>
          </Stack>

          <Stack>
            <Text fontWeight={"bold"}>Movimento</Text>
            <RadioGroup defaultValue="ALL" value={values.movement_type}>
              <Radio
                borderColor={"gray.400"}
                value="IN"
                mr={"20px"}
                onChange={handleChange("movement_type")}
              >
                Entrada
              </Radio>
              <Radio
                borderColor={"gray.400"}
                value="OUT"
                onChange={handleChange("movement_type")}
              >
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
              value={values.category_id}
              borderRadius={"10px"}
              onChange={handleChange("category_id")}
            >
              {categories && categories.data.length > 0 ? (
                categories.data.map((category, index) => (
                  <option key={index} value={category.id}>
                    {category.name}{" "}
                  </option>
                ))
              ) : (
                <option value="">""</option>
              )}
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
          <Link
            onClick={() => {
              (resetForm(),
                filtrosValues({}),
                setTimeout(() => {
                  refetch();
                }, 500));
            }}
          >
            <Text color={"menu_principal"}>Limpar todos os filtros</Text>
          </Link>
          <DefaultButton
            icon={FaFilter}
            title="Filtrar"
            w="130px"
            onClick={handleSubmit}
          />
        </Box>
      </Flex>
    </Collapse>
  );
}
