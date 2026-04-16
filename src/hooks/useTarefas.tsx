import { api } from "@/services/api";
import { list } from "@chakra-ui/react";

type ListTarefasType = {
  user_id: string;
  month: number;
  year: number;
};

type ListTarefasReturnType = {
  nome: string;
  descricao: string;
  tempo: number;
  data: string;
  categoria: {
    nome: string;
    cor: string;
  };
};

export type ListCardsTarefasType = {
  totalPendente: number;
  totalMes: number;
  totalMinutosConcluidos: number;
};

export function useTarefas() {
  async function listTarefas(query: ListTarefasType) {
    const result = await api.get<ListTarefasReturnType[]>("/tarefas", {
      params: query,
    });

    return result;
  }

  async function listCardsTarefas(query: ListTarefasType) {
    const result = await api.get<ListCardsTarefasType>("/tarefas/list-cards", {
      params: query,
    });

    return result;
  }

  return { listTarefas, listCardsTarefas };
}
