"use client";

import myTheme from "./mytheme";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "react-oidc-context";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_vdY8oNeMf",
  client_id: "7mu3omfrp7utmr1niauqlghfvv",
  redirect_uri: "http://localhost:3001/login",
  response_type: "code",
  scope: "aws.cognito.signin.user.admin profile email openid phone",
  onSigninCallback: async (user: any) => {
    try {
      const client = new CognitoIdentityProviderClient({ region: "us-east-2" });

      const command = new GetUserCommand({ AccessToken: user.access_token });
      const response = await client.send(command);

      const attrs = Object.fromEntries(
        response?.UserAttributes?.map((a) => [a.Name, a.Value]) || []
      );

      if (attrs.name) localStorage.setItem("userName", attrs.name);
      if (attrs.picture) localStorage.setItem("picture", attrs.picture || "");

      const token = user.id_token || user.access_token;
      if (token) {
        document.cookie = `idToken=${token}; path=/; secure; sameSite=lax;`;
      }
    } catch (error) {
      console.log(error);
    }
  },
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#E8E8E8",
        }}
      >
        <AuthProvider {...cognitoAuthConfig}>
          <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={myTheme}>{children}</ChakraProvider>
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
