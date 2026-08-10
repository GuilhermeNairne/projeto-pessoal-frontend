export type RoleType = {
  id: number;
  name: string;
  created_at?: string;
};

export type AdminUserType = {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  roles: RoleType[];
  createdAt: string;
};
