"use client";

import { Protected } from "@/componnents/Protected";
import { RequireAdmin } from "@/componnents/RequireAdmin";

export default function ModuloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <RequireAdmin>{children}</RequireAdmin>
    </Protected>
  );
}
