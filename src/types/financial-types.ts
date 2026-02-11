export type PanelsType = {
  id?: number;
  user_id: string;
  name: string;
  initial_value: string;
  categories?: CategoriesType[];
  movements?: MovementsType[];
};

export type CategoriesType = {
  name: string;
  color: string;
  id: number;
  panel_id: number;
  totalSpent?: number;
};

export type MovementsType = {
  id?: number;
  name: string;
  value: number;
  movement_type: string;
  date: string;
  category_id: number;
  painel_id?: number;
  categories?: {
    name: string;
  };
};

export type ModalType =
  | "filtros"
  | "newPanel"
  | "deleteCategory"
  | "transaction"
  | "editPanel"
  | null;

export type EditPanelType = {
  panel: string;
  value: string;
  id: number;
};
