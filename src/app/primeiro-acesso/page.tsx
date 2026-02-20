"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useAuth } from "@/hooks/useAuth";
import { GrLinkNext } from "react-icons/gr";
import { MdOutlineEmail } from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";
import { RiLockPasswordLine } from "react-icons/ri";
import { FirstScreen } from "@/componnents/auth/first-screen";
import { DefaultButton } from "@/componnents/default-button";

import { FaRegEye, FaRegEyeSlash, FaUser } from "react-icons/fa";

import {
  Box,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { registerSchema } from "@/schemas/auth.schema";

export default function Login() {
  const toast = useToast();
  const { firstAccess } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { values, handleChange, resetForm, errors, handleSubmit } = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      password_repetead: "",
    },
    enableReinitialize: true,
    validationSchema: registerSchema,
    onSubmit: () => {
      handleFirstAccess();
    },
  });

  async function handleFirstAccess() {
    try {
      await firstAccess({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Primeiro acesso realizado com sucesso!",
      });

      resetForm();
    } catch (error: any) {
      console.log("error", error);
      toast({
        position: "top",
        status: "error",
        isClosable: true,
        title:
          error.response.data.message ?? "Erro ao realizar primeiro acesso!",
      });
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
          <Icon as={LuClipboardList} boxSize={8} color={"white"} />
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
              onChange={handleChange("name")}
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
              onChange={handleChange("email")}
            />
          </InputGroup>
          {errors.email && (
            <Text color={"red.600"} fontWeight={"bold"} fontSize={"sm"}>
              {errors.email}
            </Text>
          )}
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
              onChange={handleChange("password")}
              type={showPassword ? "text" : "password"}
            />
          </InputGroup>
          {errors.password && (
            <Text color={"red.600"} fontWeight={"bold"} fontSize={"sm"}>
              {errors.password}
            </Text>
          )}
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
              onBlur={handleChange("password_repetead")}
              type={showPassword ? "text" : "password"}
            />
          </InputGroup>
          {errors.password_repetead && (
            <Text color={"red.600"} fontWeight={"bold"} fontSize={"sm"}>
              {errors.password_repetead}
            </Text>
          )}
        </Stack>

        <DefaultButton
          icon={GrLinkNext}
          title="Cadastrar-se"
          w="full"
          h="50px"
          onClick={handleSubmit}
          bg="radial-gradient(circle, #0a1323 0%, var(--chakra-colors-menu_principal) 75%)"
        />
      </Flex>
    </Flex>
  );
}
