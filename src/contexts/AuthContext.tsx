"use client";

import { api } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  roles: { id: number; name: string }[];
  profilePicture?: string | null;
};

export type SignInData = {
  email: string;
  password: string;
};

type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  signIn(data: SignInData): Promise<void>;
  loading: boolean;
  signOut(): void;
  updateUser(data: Partial<User>): void;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  async function signIn(data: SignInData) {
    const response = await api.post("auth/login", {
      email: data.email,
      password: data.password,
    });

    setUser(response.data.user);
  }

  async function signOut() {
    await api.post("auth/logout");
    setUser(null);
  }

  function updateUser(data: Partial<User>) {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get("auth/me");
        setUser(response.data.user);
      } catch {
        try {
          const response = await api.post("auth/refresh");
          setUser(response.data.user);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuthContext() {
  return useContext(AuthContext);
}
