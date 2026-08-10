"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const isAdmin = !!user?.roles?.some((role) => role.name === "ADMIN");

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/home");
    }
  }, [loading, isAdmin, router]);

  if (loading) return null;

  if (!isAdmin) return null;

  return <>{children}</>;
}
