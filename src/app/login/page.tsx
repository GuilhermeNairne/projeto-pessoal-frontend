"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { GrLinkNext } from "react-icons/gr";
import { CiCircleCheck } from "react-icons/ci";
import { GiProgression } from "react-icons/gi";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { DefaultButton } from "@/componnents/default-button";

import {
  FaRegEye,
  FaCalendar,
  FaDollarSign,
  FaRegEyeSlash,
} from "react-icons/fa";

import {
  Box,
  Flex,
  Icon,
  Text,
  Input,
  Stack,
  HStack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const itens = [
    {
      bg: "#20365B",
      icon: FaDollarSign,
      iconColor: "#008BB2",
      text: "Controle financeiro",
      subtext: "Gerencie suas finanças com facilidade",
    },
    {
      bg: "#2A325E",
      icon: FaCalendar,
      iconColor: "#5A72C3",
      text: "Calendário de estudos",
      subtext: "Organize sua rotina de aprendizado",
    },
    {
      bg: "#333260",
      icon: GiProgression,
      iconColor: "#A78BFA",
      text: "Acompanhe Progresso",
      subtext: "Visualize sua evolução em tempo real",
    },
  ];

  const { values, handleChange, resetForm } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    enableReinitialize: true,
    onSubmit: () => {},
  });

  return (
    <Flex flexDir={"row"} w={"full"} h={"full"}>
      <Flex
        w="50%"
        h="full"
        pb={12}
        pl={40}
        justifyContent={"center"}
        flexDir={"column"}
        bg="radial-gradient(circle, #0a1323 0%, var(--chakra-colors-menu_principal) 75%)"
      >
        <Text fontSize={"5xl"} fontWeight={"bold"} color={"white"}>
          Organize hoje.
        </Text>
        <Text fontSize={"5xl"} fontWeight={"bold"} color={"#60a5fa"} mt={-2}>
          Conquiste amanhã.
        </Text>
        <Text fontSize={"lg"} fontWeight={"light"} color={"gray.400"} mt={2}>
          Controle financeiro e planejamento de estudos em um só lugar.
        </Text>

        <Stack mt={20}>
          {itens.map((item) => (
            <HStack mt={5} gap={5}>
              <Box
                w={"50px"}
                h={"50px"}
                bg={item.bg}
                borderRadius={5}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Icon as={item.icon} boxSize={7} color={item.iconColor} />
              </Box>
              <Stack gap={0}>
                <Text fontSize={"2xl"} fontWeight={"light"} color={"white"}>
                  {item.text}
                </Text>
                <Text fontSize={"lg"} fontWeight={"light"} color={"gray.500"}>
                  {item.subtext}
                </Text>
              </Stack>
            </HStack>
          ))}
        </Stack>
      </Flex>

      <Flex
        w={"50%"}
        h={"full"}
        p={40}
        justifyContent={"center"}
        flexDir={"column"}
      >
        <Box
          w="50px"
          h="50px"
          bg="linear-gradient(135deg, #4473C1 0%, #20365B 100%)"
          borderRadius={5}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          boxShadow={"md"}
        >
          <Icon as={CiCircleCheck} boxSize={8} color={"white"} />
        </Box>
        <Text fontSize={"3xl"} fontWeight={"bold"} mt={2}>
          Bem-vindo de volta
        </Text>
        <Text fontSize={"lg"} color={"gray.400"}>
          Faça login na sua conta
        </Text>

        <Stack mt={20}>
          <Text fontWeight={"bold"}>E-mail</Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none" mt={1}>
              <Icon as={MdOutlineEmail} boxSize={6} color="gray.400" />
            </InputLeftElement>

            <Input
              pl="40px"
              h="50px"
              borderWidth={1}
              boxShadow={"sm"}
              borderColor="gray.300"
              placeholder="seu@email.com"
              onChange={() => handleChange("email")}
            />
          </InputGroup>
        </Stack>

        <Stack mt={7}>
          <Text fontWeight={"bold"}>Senha</Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none" mt={1}>
              <Icon as={RiLockPasswordLine} boxSize={6} color="gray.400" />
            </InputLeftElement>
            <InputRightElement mt={1}>
              <Icon
                as={showPassword ? FaRegEye : FaRegEyeSlash}
                boxSize={5}
                color="gray.400"
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>

            <Input
              h="50px"
              pl="40px"
              borderWidth={1}
              boxShadow={"sm"}
              borderColor="gray.300"
              placeholder="Informe sua senha"
              onChange={() => handleChange("password")}
              type={showPassword ? "text" : "password"}
            />
          </InputGroup>
        </Stack>

        <Text
          textAlign={"right"}
          mt={2}
          fontSize={"sm"}
          color={"menu_principal"}
          fontWeight={"semibold"}
          mb={10}
        >
          Esqueci a senha
        </Text>

        <DefaultButton
          icon={GrLinkNext}
          title="Logar"
          bg="radial-gradient(circle, #0a1323 0%, var(--chakra-colors-menu_principal) 75%)"
          w="full"
          h="50px"
        />

        <HStack display={"flex"} justifyContent={"center"} mt={10}>
          <Text fontSize={"lg"} textAlign={"center"} fontWeight={"thin"}>
            Não tem uma conta?
          </Text>
          <Text
            fontSize={"lg"}
            textAlign={"center"}
            color={"menu_principal"}
            fontWeight={"bold"}
          >
            Cadastre-se
          </Text>
        </HStack>
      </Flex>
    </Flex>
  );
}
