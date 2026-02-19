import { Button, Icon, Text } from "@chakra-ui/react";

type Props = {
  icon: any;
  w?: string;
  h?: string;
  bg?: string;
  title: string;
  titleColor?: string;
  onClick?: () => void;
};

export function DefaultButton({
  w,
  icon,
  title,
  h,
  bg,
  titleColor,
  onClick,
}: Props) {
  return (
    <Button
      h={h ?? "40px"}
      boxShadow={"md"}
      w={w ?? "250px"}
      borderRadius={5}
      onClick={onClick}
      bg={bg ?? "menu_principal"}
      _hover={{
        bg: bg,
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
