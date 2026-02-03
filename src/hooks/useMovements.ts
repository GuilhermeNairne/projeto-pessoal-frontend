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
    console.log("body", bodyUpdated);
    const result = await api.post("financial-movement/create", bodyUpdated);

    return result;
  }

  return { createMovement };
}
