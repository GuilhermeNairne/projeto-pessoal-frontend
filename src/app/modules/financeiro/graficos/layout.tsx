"use client";

import { Protected } from "@/componnents/Protected";

export default function ModuloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Protected>{children}</Protected>;
}
