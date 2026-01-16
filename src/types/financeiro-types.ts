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
  id: number;
  user_id: number;
  name: string;
  initial_value: string;
};
