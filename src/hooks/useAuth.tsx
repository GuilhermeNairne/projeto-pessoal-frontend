import { api } from "@/services/api";

export function useAuth() {
  async function login(values: { email: string; password: string }) {
    const response = await api.post("auth/login", {
      email: values.email,
      password: values.password,
    });

    return response;
  }

  async function firstAccess(values: {
    email: string;
    password: string;
    name: string;
  }) {
    const response = await api.post("auth/register", {
      name: values.name,
      email: values.email,
      password: values.password,
    });

    return response;
  }

  return { login, firstAccess };
}
