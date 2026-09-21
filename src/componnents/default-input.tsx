import { HStack, Input, Stack, Text } from "@chakra-ui/react";

type Props = {
  position: "cima" | "lado";
  placeholder: string;
  title: string;
  w?: string;
  mt?: string;
  value?: string;
  type?: string;
  isDisabled?: boolean;
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
  isDisabled,
  onChange,
}: Props) {
  return (
    <>
      {position === "cima" ? (
        <Stack mt={mt ?? ""}>
          <Text fontWeight={"bold"}>{title}</Text>
          <Input
            borderColor={"border.default"}
            borderRadius={"10px"}
            placeholder={placeholder}
            w={w ?? "100%"}
            onChange={onChange}
            value={value}
            bg={"surface.card"}
            isDisabled={isDisabled}
            type={type ?? "string"}
          />
        </Stack>
      ) : (
        <HStack mt={mt ?? ""}>
          <Text fontWeight={"bold"}>{title}</Text>
          <Input
            borderColor={"border.default"}
            borderRadius={"10px"}
            placeholder={placeholder}
            w={w ?? "100%"}
            bg={"surface.card"}
            onChange={onChange}
            value={value}
            isDisabled={isDisabled}
            type={type ?? "string"}
          />
        </HStack>
      )}
    </>
  );
}
