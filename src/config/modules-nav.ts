import { IconType } from "react-icons";
import { MdOutlineAttachMoney } from "react-icons/md";
import { FaBook, FaBell, FaUserShield } from "react-icons/fa";
import { ModuleKey } from "@/config/module-access";

export const modulesNav: {
  nome: string;
  descricao: string;
  icon: IconType;
  moduleKey: ModuleKey;
  rota: string;
}[] = [
  {
    nome: "Financeiro",
    descricao: "Contas, lançamentos e gráficos",
    icon: MdOutlineAttachMoney,
    moduleKey: "financeiro",
    rota: "modules/financeiro",
  },
  {
    nome: "Tarefas",
    descricao: "Calendário, categorias e acompanhamento",
    icon: FaBook,
    moduleKey: "tarefas",
    rota: "modules/tarefas/calendario",
  },
  {
    nome: "Notificações",
    descricao: "Avisos por e-mail e WhatsApp",
    icon: FaBell,
    moduleKey: "notificacoes",
    rota: "modules/notificacoes",
  },
  {
    nome: "Admin",
    descricao: "Usuários e papéis de acesso",
    icon: FaUserShield,
    moduleKey: "admin",
    rota: "modules/admin/usuarios",
  },
];
