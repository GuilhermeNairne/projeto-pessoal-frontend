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
