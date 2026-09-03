import { SignInData } from "@/contexts/AuthContext";
import { api } from "@/services/api";

export function useAuth() {
  async function login(values: SignInData) {
    const response = await api.post("auth/login", {
      email: values.email,
      password: values.password,
    });

    return response.data;
  }

  async function firstAccess(values: {
    email: string;
    password: string;
    name: string;
  }) {
    const response = await api.post("auth/register", {
      name: values.name,
      email: values.email,
      password: values.password,
    });

    return response;
  }

  async function sendPasswordRecoveryEmail(email: string) {
    const response = await api.post("auth/send-email-password-recovery", {
      email,
    });

    return response.data;
  }

  async function validateRecoveryCode(email: string, code: string) {
    const response = await api.post("auth/validate-code", { email, code });

    return response.data;
  }

  async function resetPassword(newPassword: string) {
    const response = await api.post("auth/reset-password", { newPassword });

    return response.data;
  }

  async function updateUsername(name: string) {
    const response = await api.patch("auth/me", { name });

    return response.data;
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string,
  ) {
    const response = await api.post("auth/change-password", {
      currentPassword,
      newPassword,
    });

    return response.data;
  }

  async function uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("auth/me/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  }

  async function deleteAccount() {
    const response = await api.delete("auth/me");

    return response.data;
  }

  return {
    login,
    firstAccess,
    sendPasswordRecoveryEmail,
    validateRecoveryCode,
    resetPassword,
    updateUsername,
    changePassword,
    uploadProfilePicture,
    deleteAccount,
  };
}
