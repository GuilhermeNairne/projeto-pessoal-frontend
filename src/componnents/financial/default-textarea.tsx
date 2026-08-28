import { Stack, Text, Textarea } from "@chakra-ui/react";

type Props = {
  position: "cima" | "lado";
  placeholder: string;
  title: string;
  w?: string;
  mt?: string;
  value?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function DefatultTextarea({
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
    <Stack mt={mt ?? ""}>
      <Text fontWeight={"bold"}>{title}</Text>
      <Textarea
        borderColor={"border.default"}
        borderRadius={"10px"}
        placeholder={placeholder}
        w={w ?? "100%"}
        onChange={onChange}
        value={value}
        bg={"surface.card"}
      />
    </Stack>
  );
}
