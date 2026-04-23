import { api } from "@/services/api";

type ListTarefasType = {
  user_id: string;
  month: number;
  year: number;
};

export type ListTarefasReturnType = {
  nome: string;
  descricao: string;
  tempo: number;
  data: string;
  status: string;
  categoria: {
    nome: string;
    cor: string;
  };
};

type ListTarefasSemanaType = Record<
  string,
  {
    tarefas: ListTarefasReturnType[];
    tempoRestante: number;
    totalTarefas: number;
    totalConcluidas: number;
  }
>;

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

  async function listTarefaPorDia(primeiroDia: string, ultimoDia: string) {
    const result = await api.get<ListTarefasSemanaType>("/tarefas/semana", {
      params: { primeiroDia, ultimoDia },
    });

    return result;
  }

  return { listTarefaPorDia, listTarefas, listCardsTarefas };
}
