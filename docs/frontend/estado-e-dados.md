# Estado e dados

Estado atual do código. **(a confirmar)** = depende do backend ou não é verificável só pelo front.

## 1. Estado global

Só existe **um** estado global de aplicação: o `AuthContext` (`src/contexts/AuthContext.tsx`), acessado por `useAuthContext()`.

| Campo | Tipo | Observação |
|---|---|---|
| `user` | `{ id, name, email, roles: {id,name}[], profilePicture? } \| null` | Preenchido por `auth/me`, `auth/refresh` ou `auth/login` (`response.data.user`) |
| `isAuthenticated` | `boolean` | `!!user` |
| `loading` | `boolean` | `true` até o bootstrap terminar; os guards renderizam `null` enquanto isso |
| `signIn(data)` | `Promise<void>` | `POST auth/login` |
| `signOut()` | `Promise<void>` | `POST auth/logout` e depois `setUser(null)` |
| `updateUser(partial)` | `void` | merge local (usado pelo perfil após trocar nome/foto) |

Outros estados "globais" que não são do app:
- **Cache do react-query**: um único `QueryClient` criado no módulo de `src/app/layout.tsx`, com opções **padrão** da v3 (`staleTime: 0`, `cacheTime: 5 min`, `retry: 3`, `refetchOnWindowFocus: true`, `refetchOnMount: true`).
- **Color mode do Chakra**: `useColorMode()`, persistido pelo gerenciador padrão do Chakra.

Não há Redux, Zustand, Jotai nem outro context. Nada é gravado diretamente em `localStorage`/`sessionStorage`/`document.cookie` pelo código do app.

## 2. Estado local (por tela/componente)

Padrões recorrentes:

| O quê | Como |
|---|---|
| Abrir/fechar modal | `useDisclosure()` do Chakra, ou `useState<ModalType>` (`"newPanel" \| "editPanel" \| ...`), ou "item selecionado ≠ null" (`movementToDelete`, `categoriaParaExcluir`, `editingMovement`) |
| Item em edição | `useState<T \| undefined>` passado como prop ao modal |
| Formulário | `useFormik({ initialValues, enableReinitialize: true })`; no perfil e em papéis, `useState` simples |
| Loading de escrita | `useState(false)` → `isLoading` do `DefaultButton`/`Button` |
| Filtros e paginação | `useState` (`filtros`, `actualPage`) em movimentações |
| Mês/ano navegável | `useState` em `GraficoGastosMes`, `GraficoSalarioDespesas`, calendário |
| Parâmetros de URL | `useSearchParams()`: `id_panel` (movimentações, categorias financeiras), `date` (tarefas-semanais) |
| Etapa de wizard | `useState<Step>` em recuperar-senha |

## 3. Como a API é consumida

### Cliente HTTP (`src/services/apiSetup.ts`, exportado por `src/services/api.ts`)
- `axios.create({ baseURL: NEXT_PUBLIC_API_URL, withCredentials: true, headers: { "X-API-Key": NEXT_PUBLIC_API_KEY } })`.
- Interceptor de resposta: em 401 tenta `POST auth/refresh` uma vez e repete a requisição, com fila para chamadas concorrentes (detalhes em `arquitetura.md`).
- Não há interceptor de request, nem timeout, nem transformação global de erro.

### Hooks de domínio (`src/hooks/`)
São fábricas de funções async: chame `const { listX } = useX()` no componente. Exceto onde indicado, as funções retornam o **`AxiosResponse` inteiro** (o dado fica em `.data`).

**`useAuth`** (`useAuth.tsx`; retorna `response.data`, menos `firstAccess`, que retorna o `AxiosResponse`)
| Função | Método e endpoint | Body/params |
|---|---|---|
| `login` (não usado) | `POST auth/login` | `{ email, password }` |
| `firstAccess` | `POST auth/register` | `{ name, email, password }` |
| `sendPasswordRecoveryEmail` | `POST auth/send-email-password-recovery` | `{ email }` |
| `validateRecoveryCode` | `POST auth/validate-code` | `{ email, code }` |
| `resetPassword` | `POST auth/reset-password` | `{ newPassword }` |
| `updateUsername` | `PATCH auth/me` | `{ name }` |
| `changePassword` | `POST auth/change-password` | `{ currentPassword, newPassword }` |
| `uploadProfilePicture` | `POST auth/me/picture` | `FormData { file }` (multipart); resposta tem `profilePicture` |
| `deleteAccount` | `DELETE auth/me` | `data: { currentPassword }` |

O `AuthContext` usa ainda `GET auth/me`, `POST auth/refresh` e `POST auth/logout`.

**`usePanels`** (`usePanels.ts`)
| Função | Endpoint | Notas |
|---|---|---|
| `listPanels(user_id)` | `GET /financial-panel/list/` | o `user_id` recebido **não** é enviado (o backend deve identificar pela sessão, **a confirmar**) |
| `createPanel(params)` | `POST financial-panel/create` | `{ user_id, name, initial_value }` |
| `editPanel({id, panel, value})` | `PATCH financial-panel/update/:id` | `{ name, initial_value: parseCurrencyInput(value) }` |
| `deletePanel(id)` | `DELETE financial-panel/delete/:id` | |
| `expensesGraphics(id, month, year)` | `GET /financial-panel/expenses-graphics/:id?month&year` | **retorna `.data`**: `{ categories: {x,y,color}[], total_expenses }` |
| `feesByMonth(id)` | `GET financial-panel/fees/:id` | `{ year, month, total }[]` |
| `totalSalary(id, month, year)` | `GET /financial-panel/salary/:id?month&year` | **retorna `.data`**: `{ total_salary }` |

**`useMovements`** (`useMovements.ts`): usa `useQueryClient`
| Função | Endpoint | Notas |
|---|---|---|
| `listMovements(id_panel, filtros, page)` | `GET financial-movement/list/:id_panel?name&order_date&movement_type&category_id&page` | `{ movements, pagination: { totalPages, page } }` |
| `createMovement(body)` | `POST financial-movement/create` | converte `category_id → Number`, `value → parseCurrencyInput`, `date → new Date()`; depois `refreshGraphics()` |
| `updateMovement(id, body)` | `PATCH financial-movement/update/:id` | mesmas conversões, só nos campos presentes; `refreshGraphics()` |
| `deleteMovement(id, panel_id, movement_value)` | `DELETE financial-movement/delete/:id` | `data: { panel_id, movement_value }`; `refreshGraphics()` |
| `listExpensesByMonth(panel_id, month)` | `GET financial-movement/expenses/:panel_id?month` | não é usado por nenhuma tela |

`refreshGraphics()` = `invalidateQueries("graphics")` + `invalidateQueries("salary")`.

**`useCategoies`** (`useCategories.ts`, nome com erro de digitação)
| Função | Endpoint |
|---|---|
| `listCategories(id_panel)` | `GET financial-category/list?painel_id=` |
| `createCategory({ name, color, panel_id })` | `POST financial-category/create` |
| `updateCategory(id, body)` | `PATCH financial-category/update/:id` |
| `deleteCategory(id)` | `DELETE financial-category/delete/:id` |

**`useTarefas`** (`useTarefas.tsx`)
| Função | Endpoint | Notas |
|---|---|---|
| `listTarefas({ user_id, month, year })` | `GET /tarefas` | `ListTarefasReturnType[]` |
| `listCardsTarefas({ user_id, month, year })` | `GET /tarefas/list-cards` | `{ totalPendente, totalMes, totalMinutosConcluidos }` |
| `listTarefaPorDia(primeiroDia, ultimoDia, user_id)` | `GET /tarefas/semana` | datas `dd/mm/aaaa`; resposta indexada pelo dia do mês |
| `createTarefa(body)` | `POST /tarefas` | `tempo "HH:MM" → minutos` (0 se vazio); `categoriaId → Number` |
| `editTarefa(id, body)` | `PATCH /tarefas/:id` | `data → new Date()`; `tempo` converte se contém `:`, senão `Number(tempo)` |
| `deleteTarefa(id)` | `DELETE /tarefas/:id` | |
| `listCategorias(user_id)` | `GET tarefas/list-categorias/:user_id` | inclui `tarefasPendentes` |
| `graficoCategorias(user_id)` | `GET /tarefas/grafico-categorias/:user_id` | `{ nome, total, cor }[]` |
| `createCategoria(body)` | `POST /tarefas/create-categoria` | `{ user_id, nome, cor }` |
| `editCategoria(id, body)` | `PATCH /tarefas/patch-categoria/:id` | |
| `deleteCategoria(id)` | `DELETE /tarefas/delete-categoria/:id` | |

**`useNotifications`** (`useNotifications.ts`)
| Função | Endpoint | Body |
|---|---|---|
| `listNotifications(userId)` | `GET /notifications/:userId` | |
| `createNotification(body)` | `POST /notifications` | `{ userId, title, description, date: "aaaa-mm-dd", isCurrent, method: "EMAIL" \| "WHATSAPP" \| "BOTH" }` |
| `editNotification(id, body)` | `PATCH /notifications/:id` | parcial |
| `deleteNotification(id)` | `DELETE /notifications/:id` | |

**`useAdmin`** (`useAdmin.ts`)
| Função | Endpoint |
|---|---|
| `listUsers()` | `GET admin/users` |
| `listRoles()` | `GET admin/roles` |
| `createRole(name)` | `POST admin/roles` |
| `renameRole(id, name)` | `PATCH admin/roles/:id` |
| `deleteRole(id)` | `DELETE admin/roles/:id` |
| `addRole(userId, role)` | `POST admin/users/:userId/roles` `{ roleId }` |
| `removeRole(userId, role)` | `DELETE admin/users/:userId/roles/:roleId` |

Os caminhos misturam `/` inicial e sem barra; com `baseURL` o axios resolve os dois do mesmo jeito.

### Tipos
- `src/types/financial-types.ts`: `PanelsType`, `CategoriesType`, `MovementsType` (`movement_type: "IN" | "OUT"` como string), `MovementsPaginaionType`, `ModalType`, `EditPanelType`, `ExpensesGraphicsType`, `FeesByMonthType`, `TotalSalaryType`, entre outros.
- `src/types/admin-types.ts`: `RoleType`, `AdminUserType`.
- Tarefas e notificações: tipos exportados dos próprios hooks (`ListTarefasReturnType`, `listCategoriesType`, `ListCardsTarefasType`, `NotificacaoType`).
- Convenção de nomes: financeiro em inglês/snake_case (`initial_value`, `category_id`); tarefas em português/camelCase (`categoriaId`, `tempo`, `cor`); notificações em inglês/camelCase.

## 4. Cache (react-query v3)

### Inventário de `queryKey`
| queryKey | Onde | Fonte |
|---|---|---|
| `["home-panels", userId]` | home | `listPanels` |
| `["home-tarefas-cards", userId]` | home | `listCardsTarefas` (mês atual) |
| `["home-notificacoes", userId]` | home | `listNotifications` |
| `["home-admin-users", userId]` | home | `listUsers` |
| `["panels", userId]` | financeiro, gráficos, categorias financeiras | `listPanels` |
| `["movements", id_panel, page]` | movimentações | `listMovements` (os **filtros não entram na key**) |
| `["categories", id_panel]` | movimentações, `Filtros`, categorias financeiras | `listCategories` |
| `["graphics", mes, ano, painelId]` | `GraficoGastosMes`, `GraficoSalarioDespesas` (compartilhada) | `expensesGraphics` |
| `["salary", mes, ano, painelId]` | `GraficoSalarioDespesas` | `totalSalary` |
| `["fees", painelId]` | `GraficoJurosMensais` | `feesByMonth` |
| `["tarefas", month, year]` | calendário | `listTarefas` (sem `userId`) |
| `["cards", month, year]` | calendário | `listCardsTarefas` (sem `userId`) |
| `["tarefas-semana", startOfWeek, endOfWeek, userId]` | tarefas-semanais | `listTarefaPorDia` (objetos `Date` na key) |
| `["categorias", userId]` | categorias de tarefa, `TarefaModal` (compartilhada) | `listCategorias` |
| `["grafico", userId]` | categorias de tarefa | `graficoCategorias` |
| `["notificacoes", userId]` | notificações | `listNotifications` |
| `["admin-users"]` | admin/usuários | `listUsers` |
| `["admin-roles"]` | admin/usuários, admin/papéis (compartilhada) | `listRoles` |

`enabled` só é usado na home (por acesso ao módulo), em categorias financeiras (`!!id_panel`) e em tarefas-semanais (`!!user?.id`). Nas outras telas a query dispara mesmo com `user?.id` indefinido (na prática os guards só montam a página com `user` presente).

### Atualização após escrita
- **Padrão**: o componente que escreveu chama o `refetch` da query da tela, recebido via prop (`reload`, `refetch`).
- **Invalidação**: só `useMovements` (`"graphics"`, `"salary"`, por prefixo). Criar/editar painel ou categoria **não** invalida `["home-panels"]`, `["categories"]` etc. em outras telas; elas atualizam no próximo mount ou foco da janela (comportamento padrão da v3).
- Caches paralelos do mesmo recurso: `["home-panels"]` × `["panels"]`, `["home-notificacoes"]` × `["notificacoes"]`, `["home-admin-users"]` × `["admin-users"]`, `["home-tarefas-cards"]` × `["cards", m, a]`.
- **Filtros de movimentações**: o `Filtros` chama `filtrosValues(values)` (setState no pai) e `setTimeout(refetch, 500)`, para dar tempo do estado propagar antes do refetch.

### Loading e erro
- Leitura: `isLoading` → `<Center><Spinner/></Center>`; lista vazia → texto em `text.muted`. Erros de leitura não são exibidos (não se usa `isError`/`error`); o react-query tenta de novo 3 vezes por padrão.
- Escrita: `try/catch` → `toast` (`status: "success" | "error" | "warning"`, `position: "top"`). Mensagens específicas por status HTTP em login/recuperação (429), papéis (409/404), perfil (413, 400/401).

## 5. Formulários e validação
- **Formik** em quase todos os formulários; `enableReinitialize: true` para modais de edição. Muitos têm `onSubmit` vazio e um `handleClick`/`handleSave` próprio que lê `values`.
- **Yup** só em `src/schemas/auth.schema.ts`: `registerSchema`, `recoveryEmailSchema`, `recoveryCodeSchema`, `recoveryNewPasswordSchema`. Os erros aparecem como `Text` vermelho abaixo do campo.
- Nos outros formulários a validação é manual e mínima (ex.: nome de categoria não vazio, painel selecionado, regras de senha no perfil).
- Moeda: inputs mascarados com `maskCurrencyInput`; a conversão para número acontece no hook.
- Datas: inputs `type="date"` (`aaaa-mm-dd`); `type="time"` para o tempo da tarefa.

## 6. Tempo real

**Não existe.** Não há WebSocket, Socket.IO, SSE (`EventSource`), `setInterval` nem `refetchInterval` no código. Os dados só atualizam por:
1. `refetch()` manual após mutações;
2. `invalidateQueries` (apenas gráficos financeiros);
3. o refetch padrão do react-query v3 ao montar a query e ao focar a janela.

O envio de notificações (e-mail/WhatsApp) acontece no backend; o front só cadastra as regras.
