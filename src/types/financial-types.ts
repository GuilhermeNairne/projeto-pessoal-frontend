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
};

export type CategoriesType = {
  name: string;
  color: string;
  id: number;
  painel_id: number;
};
