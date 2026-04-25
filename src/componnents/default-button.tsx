import { Button, Icon, Text } from "@chakra-ui/react";

type Props = {
  icon: any;
  w?: string;
  h?: string;
  bg?: string;
  title: string;
  isLoading?: boolean;
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
  isLoading,
  onClick,
}: Props) {
  return (
    <Button
      h={h ?? "40px"}
      boxShadow={"md"}
      w={w ?? "200px"}
      borderRadius={5}
      gap={1}
      onClick={onClick}
      isLoading={isLoading}
      bg={bg ?? "menu_principal"}
      _hover={{
        bg: bg,
        transform: "scale(1.03)",
      }}
      rightIcon={<Icon as={icon} boxSize={"5"} color={titleColor ?? "white"} />}
    >
      <Text fontWeight={"bold"} fontSize={"lg"} color={titleColor ?? "white"}>
        {title}
      </Text>
    </Button>
  );
}
