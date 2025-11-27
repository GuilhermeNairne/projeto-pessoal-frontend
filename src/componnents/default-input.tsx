import { HStack, Input, Stack, Text } from "@chakra-ui/react";

type Props = {
  position: "cima" | "baixo";
  placeholder: string;
  title: string;
  w?: string;
  mt?: string;
};

export function DefaultInput({ placeholder, position, title, w, mt }: Props) {
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
          />
        </HStack>
      )}
    </>
  );
}
