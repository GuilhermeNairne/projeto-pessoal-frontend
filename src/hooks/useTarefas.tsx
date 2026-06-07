import { api } from "@/services/api";

type ListTarefasType = {
  user_id: string;
  month: number;
  year: number;
};

export type ListTarefasReturnType = {
  nome: string;
  id: number;
  descricao: string;
  tempo: string;
  categoriaId: number;
  userId: string;
  data: string;
  status: string;
  categoria: {
    nome: string;
    cor: string;
  };
};

type createTarefaType = {
  nome: string;
  descricao: string;
  tempo: string;
  data: string;
  userId: string;
  categoriaId: number;
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

export type listCategoriesType = {
  id?: number;
  nome: string;
  cor: string;
  user_id: string;
  tarefasPendentes?: number;
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

  async function listTarefaPorDia(primeiroDia: string, ultimoDia: string) {
    console.log("listTarefaPorDia called with:", { primeiroDia, ultimoDia });
    const result = await api.get<ListTarefasSemanaType>("/tarefas/semana", {
      params: { primeiroDia, ultimoDia },
    });

    return result;
  }

  async function createTarefa(body: createTarefaType) {
    const [horas, minutos] = String(body.tempo).split(":").map(Number);
    const tempoEmMinutos = horas * 60 + minutos;

    const result = await api.post("/tarefas", {
      ...body,
      categoriaId: Number(body.categoriaId),
      tempo: Number(tempoEmMinutos),
    });

    return result;
  }

  async function editTarefa(id_tarefa: number, body: createTarefaType) {
    const [horas, minutos] = String(body.tempo).split(":").map(Number);
    const tempoEmMinutos = horas * 60 + minutos;

    const result = await api.patch(`/tarefas/${id_tarefa}`, {
      ...body,
      data: new Date(body.data),
      tempo: body.tempo.includes(":")
        ? Number(tempoEmMinutos)
        : Number(body.tempo),
    });

    return result;
  }

  async function deleteTarefa(id: number) {
    const result = await api.delete(`/tarefas/${id}`);

    return result;
  }

  async function listCategorias(user_id: string) {
    const result = await api.get<listCategoriesType[]>(
      `tarefas/list-categorias/${user_id}`,
    );

    return result;
  }

  async function graficoCategorias(user_id: string) {
    const result = await api.get<
      { nome: string; total: number; cor: string }[]
    >(`/tarefas/grafico-categorias/${user_id}`);

    return result;
  }

  async function createCategoria(body: listCategoriesType) {
    const result = await api.post("/tarefas/create-categoria", body);

    return result;
  }

  async function deleteCategoria(id_categoria: number) {
    const result = await api.delete(
      `/tarefas/delete-categoria/${id_categoria}`,
    );

    return result;
  }

  async function editCategoria(id_categoria: number, body: listCategoriesType) {
    const result = await api.patch(
      `/tarefas/patch-categoria/${id_categoria}`,
      body,
    );

    return result;
  }

  return {
    editTarefa,
    listTarefas,
    createTarefa,
    deleteTarefa,
    editCategoria,
    listCategorias,
    deleteCategoria,
    createCategoria,
    listCardsTarefas,
    listTarefaPorDia,
    graficoCategorias,
  };
}
