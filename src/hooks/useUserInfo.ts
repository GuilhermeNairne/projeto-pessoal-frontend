import { api } from "@/services/api";
import { PanelsType } from "@/types/financeiro-types";

export function useUserInfo() {
  async function getUserInfo() {
    const result = await api.get<{ name: string; picture: string }>(
      "/user-info",
      {
        withCredentials: true,
      },
    );

    return result;
  }

  return { getUserInfo };
}
