import { api } from "@/services/api";
import { EditPanelType, PanelsType } from "@/types/financial-types";

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

  async function editPanel(values: EditPanelType) {
    const result = await api.patch(`financial-panel/update/${values.id}`, {
      name: values.panel,
      initial_value: Number(values.value.replace(/,/g, ".")),
    });

    return result;
  }

  return { listPanels, createPanel, editPanel };
}
