"use client";

import { Box, ChakraProvider } from "@chakra-ui/react";
import { Geist, Geist_Mono } from "next/font/google";
import myTheme from "./mytheme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
          // height: "100%",
          width: "100%",
          // minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#E8E8E8",
        }}
      >
        <ChakraProvider theme={myTheme}>{children}</ChakraProvider>
      </body>
    </html>
  );
}
