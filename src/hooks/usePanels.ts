import { api } from "@/services/api";
import { PanelsType } from "@/types/financeiro-types";

export function usePanels() {
  async function listPanels() {
    const result = await api.get<PanelsType[]>("/financial-panel/list");

    return result;
  }

  async function createPanel(params: PanelsType) {
    const result = await api.post("financial-panel/create", params);

    return result;
  }

  return { listPanels, createPanel };
}
