import { api } from "@/services/api";
import { PanelsType } from "@/types/financial-types";

export function usePanels() {
  async function listPanels(user_id: string) {
    const result = await api.get<PanelsType[]>(
      `/financial-panel/list/${user_id}`,
    );

    return result;
  }

  async function createPanel(params: PanelsType) {
    const result = await api.post("financial-panel/create", params);

    return result;
  }

  return { listPanels, createPanel };
}
