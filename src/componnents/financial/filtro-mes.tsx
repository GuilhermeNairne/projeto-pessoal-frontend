import { HStack, Icon, StackProps, Text } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Props = Omit<StackProps, "onChange"> & {
  mesAtual: number;
  anoAtual: number;
  onChange: (mes: number, ano: number) => void;
};

export function FiltroMes({ mesAtual, anoAtual, onChange, ...rest }: Props) {
  function alteraMes(funcao: "proximo" | "anterior") {
    const data = new Date(anoAtual, mesAtual - 1);
    data.setMonth(data.getMonth() + (funcao === "proximo" ? 1 : -1));
    onChange(data.getMonth() + 1, data.getFullYear());
  }

  return (
    <HStack justifyContent={"space-between"} w={"150px"} {...rest}>
      <Icon
        as={FaChevronLeft}
        cursor={"pointer"}
        onClick={() => alteraMes("anterior")}
      />
      <HStack>
        <Text style={{ textTransform: "capitalize" }}>
          {new Date(anoAtual, mesAtual - 1).toLocaleString("pt-BR", {
            month: "long",
          })}
        </Text>
        <Text>{anoAtual}</Text>
      </HStack>
      <Icon
        as={FaChevronRight}
        cursor={"pointer"}
        onClick={() => alteraMes("proximo")}
      />
    </HStack>
  );
}
