"use client";

import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import { Flex, Text } from "@chakra-ui/react";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { DefaultButton } from "@/componnents/default-button";

export default function Login() {
  const auth = useAuth();
  const router = useRouter();

  async function handleLogin() {
    await auth.signinRedirect();
  }

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.replace("/financeiro");
    }
  }, [auth.isAuthenticated, router]);

  return (
    <Flex
      flexDir={"column"}
      p={"20px"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Text>Login</Text>

      <DefaultButton
        icon={FaMoneyBillTrendUp}
        title="Logar"
        onClick={handleLogin}
      />
    </Flex>
  );
}
