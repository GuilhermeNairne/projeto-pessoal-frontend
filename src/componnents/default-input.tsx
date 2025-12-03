import { HStack, Input, Stack, Text } from "@chakra-ui/react";

type Props = {
  position: "cima" | "lado";
  placeholder: string;
  title: string;
  w?: string;
  mt?: string;
  value?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function DefaultInput({
  placeholder,
  position,
  title,
  w,
  mt,
  type,
  value,
  onChange,
}: Props) {
  return (
    <>
      {position === "cima" ? (
        <Stack mt={mt ?? ""}>
          <Text fontWeight={"bold"}>{title}</Text>
          <Input
            borderColor={"gray.400"}
            borderRadius={"10px"}
            placeholder={placeholder}
            w={w ?? "100%"}
            onChange={onChange}
            value={value}
            bg={"white"}
            type={type ?? "string"}
          />
        </Stack>
      ) : (
        <HStack mt={mt ?? ""}>
          <Text fontWeight={"bold"}>{title}</Text>
          <Input
            borderColor={"gray.400"}
            borderRadius={"10px"}
            placeholder={placeholder}
            w={w ?? "100%"}
            bg={"white"}
            onChange={onChange}
            value={value}
            type={type ?? "string"}
          />
        </HStack>
      )}
    </>
  );
}
