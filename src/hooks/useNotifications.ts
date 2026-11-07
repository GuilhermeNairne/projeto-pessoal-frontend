import { api } from "@/services/api";

export type NotificacaoType = {
  id: number;
  userId: string;
  title: string;
  description: string;
  date: string;
  isCurrent: boolean;
  method: "EMAIL" | "WHATSAPP" | "BOTH";
  tarefaId: number | null;
  recurring: boolean;
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

export type ContatoNotificacaoType = {
  notificationEmail: string | null;
  loginEmail: string;
};

export function useNotifications() {
  async function getContact() {
    const result = await api.get<ContatoNotificacaoType>(
      "/notifications/contact",
    );

    return result.data;
  }

  async function updateContact(notificationEmail: string | null) {
    const result = await api.put<ContatoNotificacaoType>(
      "/notifications/contact",
      { notificationEmail },
    );

    return result.data;
  }

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
    getContact,
    updateContact,
    listNotifications,
    createNotification,
    editNotification,
    deleteNotification,
  };
}
