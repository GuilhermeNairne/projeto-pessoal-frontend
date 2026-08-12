"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { hasModuleAccess, ModuleKey } from "@/config/module-access";

export function RequireModuleAccess({
  module,
  children,
}: {
  module: ModuleKey;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const allowed = hasModuleAccess(user, module);

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace("/home");
    }
  }, [loading, allowed, router]);

  if (loading) return null;

  if (!allowed) return null;

  return <>{children}</>;
}
