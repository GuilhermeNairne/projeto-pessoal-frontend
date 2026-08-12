export type ModuleKey = "financeiro" | "tarefas" | "notificacoes" | "admin";

type UserRole = { id: number; name: string };
type UserWithRoles = { roles: UserRole[] } | null | undefined;

const ADMIN_ROLE = "ADMIN";

export const MODULE_ROLES: Record<ModuleKey, string[]> = {
  financeiro: ["FINANCEIRO"],
  tarefas: ["TAREFAS"],
  notificacoes: ["NOTIFICACOES"],
  admin: [ADMIN_ROLE],
};

export function hasModuleAccess(user: UserWithRoles, moduleKey: ModuleKey) {
  const roleNames = user?.roles?.map((role) => role.name) ?? [];

  if (roleNames.includes(ADMIN_ROLE)) return true;

  return MODULE_ROLES[moduleKey].some((role) => roleNames.includes(role));
}
