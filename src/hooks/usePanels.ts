import { api } from "@/services/api";
import { PanelsType } from "@/types/financeiro-types";

export function usePanels() {
  async function listPanels() {
    const result = await api.get<PanelsType[]>("/financial/list-panels");

    return result;
  }

  return { listPanels };
}
