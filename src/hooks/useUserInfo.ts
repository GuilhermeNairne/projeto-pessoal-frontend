import { api } from "@/services/api";

export function useUserInfo() {
  async function getUserInfo() {
    const result = await api.get<{
      name: string;
      picture: string;
      userId: string;
    }>("/user-info", {
      withCredentials: true,
    });

    return result;
  }

  return { getUserInfo };
}
