import { api } from "@/services/api";
import { MovementsType } from "@/types/financial-types";

export function useMovements() {
  async function createMovement(body: MovementsType) {
    const bodyUpdated = {
      ...body,
      category_id: Number(body.category_id),
      value: Number(String(body.value).replace(/\./g, "").replace(",", ".")),
      date: new Date(`${body.date}T12:00:00`),
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

  return { createMovement, deleteMovement };
}
