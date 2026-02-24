import { SignInData } from "@/contexts/AuthContext";
import { api } from "@/services/api";

export function useAuth() {
  async function login(values: SignInData) {
    const response = await api.post("auth/login", {
      email: values.email,
      password: values.password,
    });

    return response.data;
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
