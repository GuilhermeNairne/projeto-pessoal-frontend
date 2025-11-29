export type PaineisType = {
    painel: {
        nome: string; valor: string},
    ocorrencias?: {
        nome: string,
        valor: string,
        data: string,
        tipo: string,
        movimentacao: "entrada" | "saida",
    }[] 
}[]