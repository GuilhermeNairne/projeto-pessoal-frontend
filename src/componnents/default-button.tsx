import { Button, Icon, Text } from "@chakra-ui/react";

type Props = {
  icon: any;
  w?: string;
  bg?: string;
  title: string;
  titleColor?: string;
};

export function DefaultButton({ w, icon, title, bg, titleColor }: Props) {
  return (
    <Button
      h={"40px"}
      w={w ?? "250px"}
      borderRadius={"10px"}
      bg={bg ?? "menu_principal"}
      _hover={{
        bg: "menu_principal",
        transform: "scale(1.03)",
      }}
      rightIcon={<Icon as={icon} boxSize={"6"} color={titleColor ?? "white"} />}
    >
      <Text fontWeight={"bold"} fontSize={"lg"} color={titleColor ?? "white"}>
        {title}
      </Text>
    </Button>
  );
}
