import { api } from "@/services/api";
import { PanelsType } from "@/types/financial-types";

export function useCategoies() {
  async function createCategory(params: PanelsType) {
    const result = await api.post("financial-category/create", params);

    return result;
  }

  async function deleteCategory(id?: number) {
    const result = await api.delete(`financial-category/delete/${id}`);

    return result;
  }

  return { createCategory, deleteCategory };
}
