"use client";

import { Box, ChakraProvider } from "@chakra-ui/react";
import { Geist, Geist_Mono } from "next/font/google";
import myTheme from "./mytheme";
import { AuthProvider } from "react-oidc-context";

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
  scope: "email openid phone",
  onSigninCallback: (user: any) => {
    console.log(user);
    const token = user.id_token || user.access_token;

    if (token) {
      document.cookie = `idToken=${token}; path=/; secure; sameSite=lax;`;
    }

    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

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
          <ChakraProvider theme={myTheme}>{children}</ChakraProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
