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
  FaUser,
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
  useToast,
  Link,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const toast = useToast();
  const { login } = useAuth();
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

  async function handleLogin() {
    try {
      await login(values);

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Login realizado com sucesso!",
      });
    } catch (error) {
      toast({
        position: "top",
        status: "error",
        isClosable: true,
        title: "Erro ao realizar login!",
      });
    } finally {
      resetForm();
    }
  }

  return (
    <Flex flexDir={"row"} w={"full"} h={"full"}>
      <Flex
        w="40%"
        h="full"
        pb={12}
        pl={28}
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
                _hover={{
                  transform: "scale(1.03)",
                }}
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
        w={"60%"}
        h={"full"}
        px={60}
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
          _hover={{
            transform: "scale(1.03)",
          }}
        >
          <Icon as={CiCircleCheck} boxSize={8} color={"white"} />
        </Box>
        <Text fontSize={"3xl"} fontWeight={"bold"} mt={2}>
          Bem-vindo a plataforma
        </Text>
        <Text fontSize={"lg"} color={"gray.400"}>
          Faça seu primeiro acesso
        </Text>

        <Stack mt={20}>
          <Text fontWeight={"bold"}>Nome completo</Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none" mt={1}>
              <Icon as={FaUser} boxSize={6} color="gray.400" />
            </InputLeftElement>

            <Input
              pl="40px"
              h="50px"
              borderWidth={1}
              boxShadow={"sm"}
              borderColor="gray.300"
              placeholder="seu nome completo"
              onChange={() => handleChange("name")}
            />
          </InputGroup>
        </Stack>

        <Stack mt={7}>
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

        <Stack mt={7} mb={20}>
          <Text fontWeight={"bold"}>Repita sua Senha</Text>
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
              placeholder="Informe sua senha novamente"
              onChange={() => handleChange("password_repetead")}
              type={showPassword ? "text" : "password"}
            />
          </InputGroup>
        </Stack>

        <DefaultButton
          icon={GrLinkNext}
          title="Cadastrar-se"
          w="full"
          h="50px"
          onClick={handleLogin}
          bg="radial-gradient(circle, #0a1323 0%, var(--chakra-colors-menu_principal) 75%)"
        />
      </Flex>
    </Flex>
  );
}
