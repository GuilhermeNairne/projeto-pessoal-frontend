"use client";

import { Protected } from "@/componnents/Protected";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Protected>{children}</Protected>;
}
