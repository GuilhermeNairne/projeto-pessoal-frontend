"use client";

import { Protected } from "@/componnents/Protected";

export default function PerfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Protected>{children}</Protected>;
}
