import { api } from "@/services/api";

export type NotificacaoType = {
  id: number;
  userId: string;
  title: string;
  description: string;
  date: string;
  isCurrent: boolean;
  method: "EMAIL" | "WHATSAPP" | "BOTH";
  createdAt: string;
  updatedAt: string;
};

type CreateNotificacaoType = {
  userId: string;
  title: string;
  description: string;
  date: string;
  isCurrent: boolean;
  method: "EMAIL" | "WHATSAPP" | "BOTH";
};

export function useNotifications() {
  async function listNotifications(userId: string) {
    const result = await api.get<NotificacaoType[]>(`/notifications/${userId}`);

    return result;
  }

  async function createNotification(body: CreateNotificacaoType) {
    const result = await api.post("/notifications", body);

    return result;
  }

  async function editNotification(
    id: number,
    body: Partial<CreateNotificacaoType>,
  ) {
    const result = await api.patch(`/notifications/${id}`, body);

    return result;
  }

  async function deleteNotification(id: number) {
    const result = await api.delete(`/notifications/${id}`);

    return result;
  }

  return {
    listNotifications,
    createNotification,
    editNotification,
    deleteNotification,
  };
}
