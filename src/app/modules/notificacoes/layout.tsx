"use client";

import { Protected } from "@/componnents/Protected";
import { RequireModuleAccess } from "@/componnents/RequireModuleAccess";

export default function ModuloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <RequireModuleAccess module="notificacoes">
        {children}
      </RequireModuleAccess>
    </Protected>
  );
}
