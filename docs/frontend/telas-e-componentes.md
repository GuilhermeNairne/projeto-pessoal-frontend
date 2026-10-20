# Telas e componentes

Estado atual do código. **(a confirmar)** = comportamento que depende do backend ou que não está claro pelo código.

## Mapa de rotas

| Rota | Arquivo | Guard | Resumo |
|---|---|---|---|
| `/` | `app/page.tsx` | — | `redirect("/login")` |
| `/login` | `app/login/page.tsx` | público | Login por e-mail/senha |
| `/modules/primeiro-acesso` | `app/modules/primeiro-acesso/page.tsx` | público | Cadastro de conta |
| `/modules/recuperar-senha` | `app/modules/recuperar-senha/page.tsx` | público | Recuperação de senha em 4 etapas |
| `/home` | `app/home/page.tsx` | `Protected` | Painel inicial com os módulos liberados |
| `/modules/perfil` | `app/modules/perfil/page.tsx` | `Protected` | Dados da conta, senha, foto, exclusão |
| `/modules/financeiro` | `app/modules/financeiro/page.tsx` | `Protected` + módulo `financeiro` | Painéis (contas) e últimos movimentos |
| `/modules/financeiro/movimentacoes?id_panel=` | `.../movimentacoes/page.tsx` | idem (+ `Protected` redundante) | Lista paginada e filtrável de movimentos |
| `/modules/financeiro/graficos` | `.../graficos/page.tsx` | idem (+ `Protected` redundante) | Gráficos por painel |
| `/modules/financeiro/categorias?id_panel=` | `.../categorias/page.tsx` | `Protected` + `financeiro` | CRUD de categorias financeiras |
| `/modules/tarefas/calendario` | `.../tarefas/calendario/page.tsx` | `Protected` + `tarefas` | Calendário mensal de tarefas |
| `/modules/tarefas/tarefas-semanais?date=YYYY-MM-DD` | `.../tarefas-semanais/page.tsx` | `Protected` + `tarefas` | Semana com cards de tarefas |
| `/modules/tarefas/categorias` | `.../tarefas/categorias/page.tsx` | `Protected` + `tarefas` | Categorias de tarefa e gráfico de concluídas |
| `/modules/notificacoes` | `.../notificacoes/page.tsx` | `Protected` + `notificacoes` | Cadastro de notificações |
| `/modules/admin/usuarios` | `.../admin/usuarios/page.tsx` | `Protected` + `RequireAdmin` | Atribuir/remover papéis de usuários |
| `/modules/admin/papeis` | `.../admin/papeis/page.tsx` | `Protected` + `RequireAdmin` | CRUD de papéis |

Não existem `/modules/tarefas` nem `/modules/admin` como página (só `layout.tsx`); o menu sempre aponta para as subrotas.

---

## Telas

### Autenticação (layout em duas colunas)
As três telas usam `FirstScreen` à esquerda (oculta abaixo de `lg`) e um formulário à direita, com `Input`s do Chakra (não `DefaultInput`) e `DefaultButton`.

**`/login`**
- Formik sem schema (`email`, `password`). Envia via `useAuthContext().signIn`.
- Sucesso: `router.push("/home")` + toast. Erro 429: aviso "Muitas tentativas"; outros erros: toast genérico. O form é resetado no `finally`.
- Links: "Esqueci a senha" (`/modules/recuperar-senha`) e "Cadastre-se" (`/modules/primeiro-acesso`).

**`/modules/primeiro-acesso`**
- Formik + `registerSchema` (Yup): `email` contém `@`, `password` ≥ 6, `password_repetead` igual. O campo `name` não tem validação.
- O campo "Repita sua senha" atualiza no `onBlur`, não no `onChange`.
- `useAuth().firstAccess` → `POST auth/register`. Sucesso: `router.push("/modules/financeiro")`. O `AuthContext` não é atualizado nesse fluxo; se o usuário chega logado ou é mandado ao `/login` pelo guard: **(a confirmar)**.

**`/modules/recuperar-senha`**
- Máquina de estados local `step: "email" | "code" | "newPassword" | "success"`, com três `useFormik` (`recoveryEmailSchema`, `recoveryCodeSchema`, `recoveryNewPasswordSchema`).
- `email` → `POST auth/send-email-password-recovery`; `code` (6 inputs de 1 dígito com foco automático) → `POST auth/validate-code`; `newPassword` → `POST auth/reset-password` enviando só `{ newPassword }`. A ligação entre a etapa do código e o reset (cookie/sessão do backend) é **(a confirmar)**.
- Status 429 tem mensagem própria; nos outros erros aparece `error.response.data.message`.

### `/home`
- Saudação por horário + primeiro nome + data abreviada (fonte Geist).
- Lista os módulos de `config/modules-nav.ts` filtrados por `hasModuleAccess`, com animação de entrada (framer-motion `motion(Box)`, respeitando `useReducedMotion`). Sem módulos, mostra a mensagem "Você não possui permissões...".
- Cada módulo mostra uma estatística vinda do próprio `useQuery` (só habilitado se houver acesso):
  - financeiro: soma de `initial_value` dos painéis (`listPanels`)
  - tarefas: `totalPendente` (`listCardsTarefas` do mês atual)
  - notificações: quantidade (`listNotifications`)
  - admin: quantidade de usuários (`listUsers`)
- Atalhos: "Novo lançamento" abre `ModalRegistrarMovimento` em modo **seletor de painel** (`paineis`); "Nova tarefa" abre `TarefaModal`.

### `/modules/perfil`
- Estado todo local (`useState`), sem Formik.
- **Foto**: `<input type=file hidden>`; valida `image/*` e ≤ 5 MB (`MAX_PROFILE_PICTURE_SIZE`); mostra preview com `URL.createObjectURL`; `POST auth/me/picture` (multipart); depois `updateUser({ profilePicture })`. Em caso de 413, toast próprio.
- **Nome**: edição inline → `PATCH auth/me` + `updateUser({ name })`.
- **Senha**: validação manual (campos preenchidos, ≥ 6, confirmação igual) → `POST auth/change-password`; 400/401 = "Senha atual incorreta".
- **Excluir conta**: `AlertDialog` pede a senha → `DELETE auth/me` com `{ currentPassword }` → `signOut()` (erro ignorado) → `window.location.href = "/login"`.
- Avatar padrão: URL externa do Shutterstock (a mesma constante é repetida em `menu.tsx` e `menu-mobile.tsx`).

### `/modules/financeiro` (Contas financeiras)
- `useQuery(["panels", user.id], listPanels)`. Cada painel vem com `categories` e `movements` embutidos.
- Topo: link "Novo painel" (`ModalNovoPainel`) e `PainelContas` (cards de saldo + card "Total").
- Para cada painel: título com lápis (`EditPanelModal`), "Registrar movimento" (`ModalRegistrarMovimento` com `painel_id` e `categorys` do painel), `ComponenteMovimentos` (os 5 primeiros movimentos, **oculto no mobile** via `useBreakpointValue`), `GraficoGastosMes` e o link "Gerenciar categorias" (`/modules/financeiro/categorias?id_panel=`).
- Os modais são controlados por `activeModal: ModalType` (`types/financial-types.ts`) e por um objeto `openTransactionModal`.

### `/modules/financeiro/movimentacoes?id_panel=`
- `useQuery(["movements", id_panel, actualPage], () => listMovements(id_panel, filtros, actualPage))`. Resposta: `{ movements, pagination: { totalPages, page } }`.
- "Filtrar por" abre o `Filtros` (Collapse). Os filtros ficam em `useState`, **fora** da `queryKey`; o `Filtros` chama `refetch` depois de `setTimeout(500)`.
- Linhas: nome, categoria, valor (`formatarValorBR`), data (`ConvertDataToBR`) e ícone IN/OUT, com lixeira (abre `ModalConfirmarExclusaoMovimento`) e lápis (abre `ModalRegistrarMovimento` em edição, com as categorias de `useQuery(["categories", id_panel])`).
- Paginação manual: botões numerados mais anterior/próximo. Os botões não bloqueiam ir abaixo de 1 nem acima de `totalPages`; só mudam de cor.

### `/modules/financeiro/graficos`
- Mostra os painéis como cards selecionáveis (`useQuery(["panels", user.id])`). A seleção fica em estado local.
- Com um painel selecionado: `GraficoGastosMes`, `GraficoSalarioDespesas`, `GraficoJurosMensais`.

### `/modules/financeiro/categorias?id_panel=`
- Sem `id_panel` na URL, usa o primeiro painel. Os botões de painel fazem `router.replace` com o novo `id_panel`.
- `useQuery(["categories", id_panel], listCategories, { enabled: !!id_panel })`.
- `ModalCategoria` cria/edita (nome + `SketchPicker`). A exclusão vai por `ModalConfirmarExclusaoCategoria`, chamado pela lixeira da linha ou pelo botão "Excluir" do modal (via `onDelete`). O erro de exclusão sugere que a categoria pode ter movimentos vinculados.

### `/modules/tarefas/calendario`
- Grade mensal de 7 colunas, montada à mão (`getDaysInMonth` + padding pelo dia da semana do dia 1).
- `useQuery(["tarefas", month, year], listTarefas)` e `useQuery(["cards", month, year], listCardsTarefas)` (a `queryKey` não inclui `user.id`).
- No mobile, cada dia mostra pontos coloridos pela cor da categoria; no desktop, mini-cards com cor clareada (`lightenColor` adiciona canal alfa ao hex).
- O dia atual tem destaque roxo. Clicar num dia leva a `/modules/tarefas/tarefas-semanais/?date=YYYY-MM-DD`. O código soma `+1` ao dia (compensação de fuso com o `new Date("YYYY-MM-DD")` da tela semanal).
- `Quadros` no topo: horas concluídas, pendentes e total do mês.

### `/modules/tarefas/tarefas-semanais?date=`
- Calcula domingo–sábado da semana de `date` (ou de hoje).
- `useQuery(["tarefas-semana", startOfWeek, endOfWeek, user.id], listTarefaPorDia)`. As datas vão no formato `dd/mm/aaaa` (`ConvertDataToBR`). A resposta é um objeto indexado pelo dia do mês (`String(day.getUTCDate())`) com `{ tarefas, tempoRestante, totalTarefas, totalConcluidas }`.
- Desktop: `DayPicker` (react-day-picker, locale `ptBR`) na primeira célula; clicar em qualquer dia volta ao calendário.
- Um card por dia com progresso (conic-gradient) ou check verde quando tudo está concluído, e a lista de `CardTarefa`.
- "Adicionar tarefa" e o lápis do card abrem o `TarefaModal`.

### `/modules/tarefas/categorias`
- `useQuery(["categorias", user.id], listCategorias)`: tabela com nome, cor e `tarefasPendentes`; o lápis abre o `CategoriaModal`.
- `useQuery(["grafico", user.id], graficoCategorias)`: `VictoryBar` com o total de concluídas por categoria, colorido pela cor da categoria.

### `/modules/notificacoes`
- Bloco "Dados para envio": e-mail (pré-preenchido com `user.email`) e telefone (input **desabilitado**). O botão "Salvar" **só mostra um toast**; nenhuma API é chamada.
- `useQuery(["notificacoes", user.id], listNotifications)` (o `enabled` está comentado). Tabela: título, descrição, data ("Dia N" se recorrente), canal (`Badge` EMAIL/WHATSAPP/BOTH), recorrente.
- `NotificacaoModal` cria/edita/exclui. As opções WhatsApp e Ambos estão desabilitadas no radio.

### `/modules/admin/usuarios`
- `useQuery(["admin-users"], listUsers)` + `useQuery(["admin-roles"], listRoles)`.
- Para cada usuário, chips dos papéis atuais (× remove) e chips tracejados dos papéis que faltam (+ adiciona). A cor do chip vem de `roleColor` (`ADMIN`, `USER`).

### `/modules/admin/papeis`
- `useQuery(["admin-roles"], listRoles)`. Input + "Adicionar" (Enter também cria). Edição inline (Enter salva, Esc cancela). A lixeira exclui **sem confirmação**.
- 409 = "Já existe um papel com esse nome"; 404 = "Papel não encontrado".

---

## Catálogo de componentes reutilizáveis

### Genéricos (`src/componnents/`)

| Componente | Props principais | Onde é usado |
|---|---|---|
| `DefaultButton` (`default-button.tsx`) | `icon` (obrigatório, componente de ícone), `title`, `w?` (padrão `200px`), `h?` (`40px`), `bg?` (gradiente Chakra, ex. `"linear(to-r, #a, #b)"`), `titleColor?`, `mt?`, `isLoading?`, `onClick?` | Praticamente todas as telas e modais |
| `DefaultInput` (`default-input.tsx`) | `position: "cima" \| "lado"` (rótulo acima ou ao lado), `title`, `placeholder`, `value?`, `onChange?`, `type?` (padrão `"string"`), `w?`, `mt?`, `isDisabled?` | Modais financeiros, de tarefas e de notificações; `Filtros`, perfil, notificações |
| `DefatultTextarea` (`financial/default-textarea.tsx`, nome com erro de digitação) | `title`, `placeholder`, `value?`, `onChange?`, `w?`, `mt?`; `position` e `type` são aceitos e ignorados | `TarefaModal` |
| `Menu` (`menu.tsx`) | — (lê `AuthContext`, `usePathname`) | Todas as telas autenticadas; visível a partir de `lg` |
| `MenuMobile` (`menu-mobile.tsx`) | — | Todas as telas autenticadas; barra + `Drawer` abaixo de `lg` |
| `Protected` | `children` | `layout.tsx` de home, perfil e módulos |
| `RequireModuleAccess` | `module: ModuleKey`, `children` | layouts de financeiro, tarefas, notificações |
| `RequireAdmin` | `children` | layout de admin |
| `FirstScreen` (`auth/first-screen.tsx`) | — | login, primeiro-acesso, recuperar-senha |

`Menu` e `MenuMobile` têm cada um sua cópia do array `menuOpcoes` (módulo → subpáginas, filtrado por `hasModuleAccess`) e mostram avatar, Home, os acordeões dos módulos, Perfil, Sair e o switch de modo escuro (que só funciona no desktop).

### Financeiro (`src/componnents/financial/`)

| Componente | Props | Faz chamada à API? | Usado em |
|---|---|---|---|
| `PainelContas` | `paineis: PanelsType[]`, `isLoading` | não | `/modules/financeiro` |
| `ComponenteMovimentos` | `panel: PanelsType`, `refetch`, `navigate` | sim (`deleteMovement`) | `/modules/financeiro` (desktop) |
| `Filtros` | `open`, `id_panel?`, `refetch`, `filtrosValues(values)`; exporta o tipo `FiltrosMovementsType { name?, order_date?, movement_type?, category_id? }` | sim (`useQuery(["categories", id_panel])`) | movimentações |
| `GraficoGastosMes` | `painelSelecionado: number` | sim (`["graphics", mes, ano, painel]`); navegação de mês interna | financeiro, gráficos |
| `GraficoSalarioDespesas` | `painelSelecionado` | sim (`["salary", ...]` + `["graphics", ...]`) | gráficos |
| `GraficoJurosMensais` | `painelSelecionado` | sim (`["fees", painel]`); barras feitas com `Box` (altura = `total/10`) | gráficos |
| `ModalNovoPainel` | `isOpen`, `onClose` (a página faz o refetch no `onClose`) | sim (`createPanel`) | financeiro |
| `EditPanelModal` | `isOpen`, `onClose`, `refetch`, `panelValues: EditPanelType` | sim (`editPanel`, `deletePanel` com `AlertDialog`) | financeiro |
| `ModalRegistrarMovimento` | `isOpen`, `onClose`, `refetch`, `movement?` (edição), `painel?`, `painel_id?`, `categorys?`, `paineis?` (se informado, mostra um `Select` de painel e usa as categorias dele) | sim (`createMovement`/`updateMovement`) | financeiro, movimentações, `ComponenteMovimentos`, home |
| `ModalCategoria` | `isOpen`, `onClose`, `reload`, `onDelete(categoria)`, `panel_id`, `categoria?` | sim (`createCategory`/`updateCategory`) | categorias financeiras |
| `ModalConfirmarExclusaoCategoria` | `categoria \| null` (abre quando não é nulo), `isLoading`, `onClose`, `onConfirm` | não | categorias financeiras |
| `ModalConfirmarExclusaoMovimento` | `movement \| null`, `isLoading`, `onClose`, `onConfirm` | não | movimentações, `ComponenteMovimentos` |
| `ModalCategorias` | `isOpen`, `onClose`, `categorias` | não | **não é usado** (UI sem ações implementadas) |

### Tarefas (`src/componnents/atividades/`)

| Componente | Props | API | Usado em |
|---|---|---|---|
| `Quadros` | `totalMes`, `totalPendente`, `totalMinutosConcluidos` (= `ListCardsTarefasType`) | não | calendário |
| `CardTarefa` | `dadosTarefa: ListTarefasReturnType`, `onClick` (editar), `refetch` | sim: o checkbox alterna `status` entre `"Concluida"` e `"Pendente"` via `editTarefa` | tarefas-semanais |
| `TarefaModal` | `isOpen`, `onClose`, `tarefa?`, `reload` | sim (`createTarefa`/`editTarefa`/`deleteTarefa`; `useQuery(["categorias", user.id])` para o select) | tarefas-semanais, home |
| `CategoriaModal` | `isOpen`, `onClose`, `categoria?`, `reload` | sim (`createCategoria`/`editCategoria`/`deleteCategoria`) | categorias de tarefas |

### Notificações (`src/componnents/notificacoes/`)

| Componente | Props | API | Usado em |
|---|---|---|---|
| `NotificacaoModal` | `isOpen`, `onClose`, `notificacao?`, `reload` | sim (`createNotification`/`editNotification`/`deleteNotification`). Recorrente: `Select` "Dia 1..31" e `buildDate()` calcula a próxima data com esse dia. | notificações |

### Utilitários (`src/utils/`)

| Função | Faz |
|---|---|
| `formatarValorBR(v)` | número/string → `"1.234,56"` (sem `R$`; o prefixo é escrito no JSX) |
| `maskCurrencyInput(s)` | só dígitos → `"R$ 1.234,56"` (centavos) para inputs controlados |
| `parseCurrencyInput(s)` | `"R$ 1.234,56"` → `1234.56` |
| `brToIso("dd/mm/aaaa")` | → `"aaaa-mm-dd"` |
| `ConvertDataToBR(iso)` | ISO → `dd/mm/aaaa`, compensando o fuso (`getTimezoneOffset`) |
| `ScrollBarcss` | objeto CSS que esconde a scrollbar |

## Inconsistências observadas (não corrigidas)
- `CardTarefa` compara `status === "Concluido"` para o fundo, mas `"Concluida"` no resto do componente.
- `ComponenteMovimentos` mostra `R$ {occ.value}` sem `formatarValorBR`; a tela de movimentações formata.
- O `Switch` de modo escuro do `MenuMobile` não tem `onChange`.
- Em `Menu` (desktop), os `AccordionItem` e os botões das subpáginas não recebem `key`.
- `useAuth().login` existe, mas não é usado (o login usa `AuthContext.signIn`).
