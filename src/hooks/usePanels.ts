import { api } from "@/services/api";
import {
  EditPanelType,
  ExpensesGraphicsType,
  FeesByMonthType,
  PanelsType,
  TotalSalaryType,
} from "@/types/financial-types";

export function usePanels() {
  async function listPanels(user_id: string) {
    const result = await api.get<PanelsType[]>(`/financial-panel/list/`);

    return result;
  }

  async function expensesGraphics(
    id_panel: number,
    month: number,
    year: number,
  ) {
    const result = await api.get<ExpensesGraphicsType>(
      `/financial-panel/expenses-graphics/${id_panel}`,
      {
        params: {
          month,
          year,
        },
      },
    );

    return result.data;
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

  async function feesByMonth(panel_id: number) {
    const result = await api.get<FeesByMonthType[]>(
      `financial-panel/fees/${panel_id}`,
    );

    return result;
  }

  async function totalSalary(id_panel: number, month: number, year: number) {
    const result = await api.get<TotalSalaryType>(
      `/financial-panel/salary/${id_panel}`,
      {
        params: {
          month,
          year,
        },
      },
    );

    return result.data;
  }

  return {
    listPanels,
    createPanel,
    editPanel,
    expensesGraphics,
    feesByMonth,
    totalSalary,
  };
}
