"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "react-oidc-context";
import { QueryClient, QueryClientProvider } from "react-query";
import myTheme from "./mytheme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={myTheme}>{children}</ChakraProvider>
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
