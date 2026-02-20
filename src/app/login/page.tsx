"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { GrLinkNext } from "react-icons/gr";
import { CiCircleCheck } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FirstScreen } from "@/componnents/auth/first-screen";
import { DefaultButton } from "@/componnents/default-button";

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

export default function Login() {
  const toast = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { values, handleChange, resetForm, handleSubmit } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    enableReinitialize: true,
    onSubmit: () => {
      handleLogin();
    },
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
      <FirstScreen />

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
              value={values.email}
              placeholder="seu@email.com"
              onChange={handleChange("email")}
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
              value={values.password}
              placeholder="Informe sua senha"
              onChange={handleChange("password")}
              type={showPassword ? "text" : "password"}
            />
          </InputGroup>
        </Stack>

        <Link>
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
        </Link>

        <DefaultButton
          icon={GrLinkNext}
          title="Logar"
          w="full"
          h="50px"
          onClick={handleSubmit}
          bg="radial-gradient(circle, #0a1323 0%, var(--chakra-colors-menu_principal) 75%)"
        />

        <HStack display={"flex"} justifyContent={"center"} mt={10}>
          <Text fontSize={"lg"} textAlign={"center"} fontWeight={"thin"}>
            Não tem uma conta?
          </Text>
          <Link onClick={() => router.push("/primeiro-acesso")}>
            <Text
              fontSize={"lg"}
              textAlign={"center"}
              color={"menu_principal"}
              fontWeight={"bold"}
            >
              Cadastre-se
            </Text>
          </Link>
        </HStack>
      </Flex>
    </Flex>
  );
}
