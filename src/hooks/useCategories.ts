import { api } from "@/services/api";
import { CategoriesType } from "@/types/financial-types";

export function useCategoies() {
  async function createCategory(params: Omit<CategoriesType, "id">) {
    const result = await api.post("financial-category/create", params);

    return result;
  }

  async function deleteCategory(id?: number) {
    const result = await api.delete(`financial-category/delete/${id}`);

    return result;
  }

  async function updateCategory(id: number, body: Partial<CategoriesType>) {
    const result = await api.patch(`financial-category/update/${id}`, body);

    return result;
  }

  return { createCategory, deleteCategory, updateCategory };
}
