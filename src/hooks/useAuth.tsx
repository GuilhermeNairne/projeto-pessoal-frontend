import { api } from "@/services/api";

export function useAuth() {
  async function login(values: { email: string; password: string }) {
    const response = await api.post("auth/login", values);

    return response;
  }

  return { login };
}
