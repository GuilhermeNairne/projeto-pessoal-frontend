import * as Yup from "yup";

export const registerSchema = Yup.object({
  password: Yup.string()
    .min(6, "A senha precisa ter no mínimo 6 caracteres")
    .required("Senha é obrigatório"),

  password_repetead: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas precisam ser iguais")
    .required("Confirmação de senha é obrigatória"),

  email: Yup.string()
    .matches(/@/, "Email inválido")
    .required("Email é obrigatório"),
});

export const recoveryEmailSchema = Yup.object({
  email: Yup.string()
    .matches(/@/, "Email inválido")
    .required("Email é obrigatório"),
});

export const recoveryCodeSchema = Yup.object({
  code: Yup.string()
    .length(6, "O código precisa ter 6 dígitos")
    .required("Código é obrigatório"),
});

export const recoveryNewPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "A senha precisa ter no mínimo 6 caracteres")
    .required("Senha é obrigatório"),

  newPasswordRepeated: Yup.string()
    .oneOf([Yup.ref("newPassword")], "As senhas precisam ser iguais")
    .required("Confirmação de senha é obrigatória"),
});
