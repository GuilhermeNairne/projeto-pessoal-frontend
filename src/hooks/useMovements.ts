import { api } from "@/services/api";
import { FiltrosMovementsType } from "@/componnents/financial/filtros";
import { ExpensesByMonthType, MovementsType } from "@/types/financial-types";

export function useMovements() {
  async function listMovements(
    id_panel: string,
    filtros: FiltrosMovementsType | null,
  ) {
    const result = await api.get<MovementsType[]>(
      `financial-movement/list/${id_panel}`,
      {
        params: filtros,
      },
    );

    return result;
  }

  async function createMovement(body: MovementsType) {
    const bodyUpdated = {
      ...body,
      category_id: Number(body.category_id),
      value: Number(String(body.value).replace(/\./g, "").replace(",", ".")),
      date: new Date(body.date),
    };

    const result = await api.post("financial-movement/create", bodyUpdated);

    return result;
  }

  async function deleteMovement(
    id: number,
    panel_id: number,
    movement_value: number,
  ) {
    const body = { panel_id: panel_id, movement_value: movement_value };
    const result = await api.delete(`financial-movement/delete/${id}`, {
      data: body,
    });

    return result;
  }

  async function listExpensesByMonth(panel_id: number, month: number) {
    const result = await api.get<ExpensesByMonthType>(
      `financial-movement/expenses/${panel_id}`,
      {
        params: { month: month },
      },
    );

    return result;
  }

  return { createMovement, deleteMovement, listMovements, listExpensesByMonth };
}
