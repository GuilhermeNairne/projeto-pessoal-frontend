"use client";

import { useRef, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GrLinkNext } from "react-icons/gr";
import { CiCircleCheck } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine, RiShieldKeyholeLine } from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FirstScreen } from "@/componnents/auth/first-screen";
import { DefaultButton } from "@/componnents/default-button";
import {
  recoveryEmailSchema,
  recoveryCodeSchema,
  recoveryNewPasswordSchema,
} from "@/schemas/auth.schema";

import {
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

type Step = "email" | "code" | "newPassword" | "success";

export default function RecuperarSenha() {
  const toast = useToast();
  const router = useRouter();
  const {
    sendPasswordRecoveryEmail,
    validateRecoveryCode,
    resetPassword,
  } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: recoveryEmailSchema,
    onSubmit: () => handleSendEmail(),
  });

  const codeForm = useFormik({
    initialValues: { code: "" },
    validationSchema: recoveryCodeSchema,
    enableReinitialize: true,
    onSubmit: () => handleValidateCode(),
  });

  const passwordForm = useFormik({
    initialValues: { newPassword: "", newPasswordRepeated: "" },
    validationSchema: recoveryNewPasswordSchema,
    onSubmit: () => handleResetPassword(),
  });

  async function handleSendEmail() {
    try {
      setIsLoading(true);
      await sendPasswordRecoveryEmail(emailForm.values.email);

      setRecoveryEmail(emailForm.values.email);
      setStep("code");
      toast({
        position: "top",
        isClosable: true,
        status: "success",
        title: "Código enviado para o seu e-mail!",
      });
    } catch (error: any) {
      if (error?.response?.status === 429) {
        toast({
          position: "top",
          status: "warning",
          isClosable: true,
          title: "Muitas tentativas!",
          description: "Aguarde alguns minutos antes de solicitar um novo código.",
        });
      } else {
        toast({
          position: "top",
          status: "error",
          isClosable: true,
          title:
            error?.response?.data?.message ?? "Erro ao enviar e-mail de recuperação!",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleValidateCode() {
    try {
      setIsLoading(true);
      await validateRecoveryCode(recoveryEmail, codeForm.values.code);

      setStep("newPassword");
    } catch (error: any) {
      if (error?.response?.status === 429) {
        toast({
          position: "top",
          status: "warning",
          isClosable: true,
          title: "Muitas tentativas!",
          description: "Aguarde alguns minutos antes de tentar novamente.",
        });
      } else {
        toast({
          position: "top",
          status: "error",
          isClosable: true,
          title: error?.response?.data?.message ?? "Código inválido!",
          description: "Solicite um novo código caso ele tenha expirado.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    try {
      setIsLoading(true);
      await resetPassword(passwordForm.values.newPassword);

      setStep("success");
    } catch (error: any) {
      toast({
        position: "top",
        status: "error",
        isClosable: true,
        title:
          error?.response?.data?.message ?? "Erro ao atualizar senha!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCodeDigitChange(index: number, digit: string) {
    const sanitized = digit.replace(/\D/g, "").slice(-1);
    const currentDigits = codeForm.values.code.split("");
    currentDigits[index] = sanitized;

    const nextCode = currentDigits.join("").slice(0, 6);
    codeForm.setFieldValue("code", nextCode);

    if (sanitized && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !codeForm.values.code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <Flex
      flexDir={{ base: "column", lg: "row" }}
      w={"full"}
      h={"full"}
      p={{ base: 4, md: 6, lg: 10 }}
      bg={"white"}
    >
      <FirstScreen />

      <Flex
        w={{ base: "100%", lg: "60%" }}
        h={"full"}
        px={{ base: 4, sm: 8, md: 16, lg: 20, xl: 60 }}
        py={{ base: 10, lg: 0 }}
        justifyContent={"center"}
        flexDir={"column"}
        overflowY={"auto"}
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
          <Icon
            as={step === "success" ? CiCircleCheck : RiShieldKeyholeLine}
            boxSize={8}
            color={"white"}
          />
        </Box>

        {step === "email" && (
          <>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={"bold"} mt={2}>
              Esqueceu sua senha?
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color={"gray.400"}>
              Informe seu e-mail para receber um código de verificação
            </Text>

            <Stack mt={{ base: 8, md: 12, lg: 20 }}>
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
                  value={emailForm.values.email}
                  placeholder="seu@email.com"
                  onChange={emailForm.handleChange("email")}
                  onKeyDown={(event) =>
                    event.key === "Enter" && emailForm.handleSubmit()
                  }
                />
              </InputGroup>
              {emailForm.errors.email && (
                <Text color={"red.600"} fontWeight={"bold"} fontSize={"sm"}>
                  {emailForm.errors.email}
                </Text>
              )}
            </Stack>

            <DefaultButton
              icon={GrLinkNext}
              title="Enviar código"
              w="full"
              h="50px"
              mt={10}
              isLoading={isLoading}
              onClick={emailForm.handleSubmit}
            />
          </>
        )}

        {step === "code" && (
          <>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={"bold"} mt={2}>
              Verifique seu e-mail
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color={"gray.400"}>
              Enviamos um código de 6 dígitos para{" "}
              <Text as="span" fontWeight={"bold"} color={"gray.600"}>
                {recoveryEmail}
              </Text>
            </Text>

            <HStack mt={{ base: 8, md: 12, lg: 20 }} justifyContent={"center"} gap={3}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    codeInputsRef.current[index] = el;
                  }}
                  w={{ base: "42px", md: "50px" }}
                  h={{ base: "50px", md: "58px" }}
                  textAlign={"center"}
                  fontSize={"2xl"}
                  fontWeight={"bold"}
                  borderWidth={1}
                  boxShadow={"sm"}
                  borderColor="gray.300"
                  maxLength={1}
                  inputMode="numeric"
                  value={codeForm.values.code[index] ?? ""}
                  onChange={(event) =>
                    handleCodeDigitChange(index, event.target.value)
                  }
                  onKeyDown={(event) => handleCodeKeyDown(index, event)}
                />
              ))}
            </HStack>
            {codeForm.errors.code && (
              <Text
                color={"red.600"}
                fontWeight={"bold"}
                fontSize={"sm"}
                textAlign={"center"}
                mt={3}
              >
                {codeForm.errors.code}
              </Text>
            )}

            <DefaultButton
              icon={GrLinkNext}
              title="Verificar código"
              w="full"
              h="50px"
              mt={10}
              isLoading={isLoading}
              onClick={codeForm.handleSubmit}
            />

            <Link
              _hover={{ textDecoration: "none" }}
              onClick={handleSendEmail}
              mt={5}
            >
              <Text
                color={"menu_principal"}
                fontWeight={"bold"}
                fontSize={"sm"}
                textAlign={"center"}
              >
                Não recebeu o código? Reenviar
              </Text>
            </Link>
          </>
        )}

        {step === "newPassword" && (
          <>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={"bold"} mt={2}>
              Crie uma nova senha
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color={"gray.400"}>
              Sua nova senha precisa ser diferente da anterior
            </Text>

            <Stack mt={{ base: 8, md: 12, lg: 20 }}>
              <Text fontWeight={"bold"}>Nova senha</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none" mt={1}>
                  <Icon as={RiLockPasswordLine} boxSize={6} color="gray.400" />
                </InputLeftElement>
                <InputRightElement mt={1}>
                  <Icon
                    as={showPassword ? FaRegEye : FaRegEyeSlash}
                    boxSize={5}
                    color="gray.400"
                    cursor={"pointer"}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>

                <Input
                  h="50px"
                  pl="40px"
                  borderWidth={1}
                  boxShadow={"sm"}
                  borderColor="gray.300"
                  value={passwordForm.values.newPassword}
                  placeholder="Informe sua nova senha"
                  onChange={passwordForm.handleChange("newPassword")}
                  type={showPassword ? "text" : "password"}
                />
              </InputGroup>
              {passwordForm.errors.newPassword && (
                <Text color={"red.600"} fontWeight={"bold"} fontSize={"sm"}>
                  {passwordForm.errors.newPassword}
                </Text>
              )}
            </Stack>

            <Stack mt={7}>
              <Text fontWeight={"bold"}>Confirme a nova senha</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none" mt={1}>
                  <Icon as={RiLockPasswordLine} boxSize={6} color="gray.400" />
                </InputLeftElement>
                <InputRightElement mt={1}>
                  <Icon
                    as={showPassword ? FaRegEye : FaRegEyeSlash}
                    boxSize={5}
                    color="gray.400"
                    cursor={"pointer"}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>

                <Input
                  h="50px"
                  pl="40px"
                  borderWidth={1}
                  boxShadow={"sm"}
                  borderColor="gray.300"
                  value={passwordForm.values.newPasswordRepeated}
                  placeholder="Confirme sua nova senha"
                  onChange={passwordForm.handleChange("newPasswordRepeated")}
                  type={showPassword ? "text" : "password"}
                />
              </InputGroup>
              {passwordForm.errors.newPasswordRepeated && (
                <Text color={"red.600"} fontWeight={"bold"} fontSize={"sm"}>
                  {passwordForm.errors.newPasswordRepeated}
                </Text>
              )}
            </Stack>

            <DefaultButton
              icon={GrLinkNext}
              title="Redefinir senha"
              w="full"
              h="50px"
              mt={10}
              isLoading={isLoading}
              onClick={passwordForm.handleSubmit}
            />
          </>
        )}

        {step === "success" && (
          <>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={"bold"} mt={2}>
              Senha redefinida!
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color={"gray.400"}>
              Sua senha foi atualizada com sucesso. Você já pode fazer login com a
              nova senha.
            </Text>

            <DefaultButton
              icon={GrLinkNext}
              title="Ir para o login"
              w="full"
              h="50px"
              mt={{ base: 8, md: 12, lg: 20 }}
              onClick={() => router.push("/login")}
            />
          </>
        )}

        {step !== "success" && (
          <Link
            _hover={{ textDecoration: "none" }}
            onClick={() => router.push("/login")}
            mt={5}
          >
            <Text
              color={"gray.400"}
              fontWeight={"bold"}
              fontSize={"sm"}
              textAlign={"center"}
            >
              Voltar para login
            </Text>
          </Link>
        )}
      </Flex>
    </Flex>
  );
}
