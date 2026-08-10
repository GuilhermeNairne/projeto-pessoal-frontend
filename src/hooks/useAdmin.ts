import { api } from "@/services/api";
import { AdminUserType, RoleType } from "@/types/admin-types";

export function useAdmin() {
  async function listUsers() {
    const result = await api.get<AdminUserType[]>("admin/users");

    return result;
  }

  async function listRoles() {
    const result = await api.get<RoleType[]>("admin/roles");

    return result;
  }

  async function createRole(name: string) {
    const result = await api.post<RoleType>("admin/roles", { name });

    return result;
  }

  async function renameRole(roleId: number, name: string) {
    const result = await api.patch<RoleType>(`admin/roles/${roleId}`, {
      name,
    });

    return result;
  }

  async function deleteRole(roleId: number) {
    const result = await api.delete<RoleType>(`admin/roles/${roleId}`);

    return result;
  }

  async function addRole(userId: string, role: RoleType) {
    const result = await api.post<AdminUserType>(
      `admin/users/${userId}/roles`,
      { roleId: role.id },
    );

    return result;
  }

  async function removeRole(userId: string, role: RoleType) {
    const result = await api.delete<AdminUserType>(
      `admin/users/${userId}/roles/${role.id}`,
    );

    return result;
  }

  return {
    listUsers,
    listRoles,
    createRole,
    renameRole,
    deleteRole,
    addRole,
    removeRole,
  };
}
