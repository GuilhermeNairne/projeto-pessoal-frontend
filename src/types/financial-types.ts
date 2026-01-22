export type PaineisType = {
  id?: string;
  painel: {
    nome: string;
    valor: string;
  };
  ocorrencias?: {
    nome: string;
    valor: string;
    data: string;
    tipo: string;
    movimentacao: string;
  }[];
}[];

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
  name: string;
  value: number;
  movement_type: string;
  date: string;
  category_id: string;
};
