# CLAUDE.md

Guia rápido para agentes de IA. Detalhes em `docs/frontend/`.

> Este repositório **é** o front-end (não há `apps/web`). O backend (NestJS) fica em outro repo.

## Front-end

### Stack (versões instaladas)
- **Next.js 16.0.10** (App Router) + **React 19.2.0** + TypeScript 5 (`strict`). React Compiler ligado (`next.config.ts` → `reactCompiler: true`).
- **Chakra UI 2.10.9** (+ Emotion, framer-motion 12) — tema em `src/app/mytheme.ts`.
- **react-query 3.39.3** (a v3, pacote `react-query`, **não** é TanStack Query v4/v5).
- **axios 1.13** — cliente único em `src/services/api.ts`.
- **Formik 2 + Yup 1** (Yup só nas telas de autenticação).
- Gráficos: **Victory 37**. Calendário: **react-day-picker 9** + `date-fns/locale`. Cor: `react-color` (`SketchPicker`). Ícones: `react-icons`.
- Declaradas mas **não usadas** no código: `aws-amplify`, `oidc-client-ts`, `react-oidc-context`, `@aws-sdk/client-cognito-identity-provider`.

### Comandos
```bash
npm run dev     # next dev -p 3001
npm run build   # next build
npm run start   # next start -p 4002
npm run lint    # eslint (config fica em src/eslint.config.mjs — a confirmar se é encontrada a partir da raiz)
```
Existem `package-lock.json` **e** `yarn.lock` (gerenciador oficial: a confirmar). Não há testes; `jest.config.js` existe, mas `jest`/`ts-jest` não estão instalados.

### Variáveis de ambiente (`.env`, ignorado pelo git)
- `NEXT_PUBLIC_API_URL`: baseURL do axios.
- `NEXT_PUBLIC_API_KEY`: enviado como header `X-API-Key` (fica exposto no bundle do browser).
- `PORT`: presente no `.env`, mas os scripts fixam as portas 3001/4002.

### Estrutura
```
src/
  app/            rotas (App Router); todas as páginas são "use client"
    login/ home/ modules/{financeiro,tarefas,notificacoes,admin,perfil,primeiro-acesso,recuperar-senha}
    layout.tsx    providers: AuthProvider > QueryClientProvider > ChakraProvider
    mytheme.ts    tema Chakra (cores, semanticTokens, dark mode)
  componnents/    componentes (sim, com "nn" — mantenha o nome nos imports)
  hooks/          useX() = funções que chamam a API (useAuth, usePanels, useMovements, ...)
  services/       axios + interceptor de refresh de token
  contexts/       AuthContext (único estado global)
  config/         module-access.ts (papéis → módulos), modules-nav.ts (cards da home)
  types/ schemas/ utils/
```

### Convenções observadas
- Alias `@/*` → `src/*`.
- Toda página monta o próprio shell: `<Flex>` raiz + `<MenuMobile />` + `<Menu />` + conteúdo. Não existe layout de shell compartilhado.
- Controle de acesso fica no `layout.tsx` de cada módulo: `<Protected>` + `<RequireModuleAccess module="...">` (ou `<RequireAdmin>`). Só no cliente: não há `middleware`.
- Leitura: `useQuery({ queryKey: [...], queryFn: () => hook.listX(...) })`. O hook devolve o `AxiosResponse`, então o dado fica em `data?.data` (exceções: `usePanels.expensesGraphics` e `totalSalary` já devolvem `.data`).
- Escrita: sem `useMutation`. Chame a função async em `try/catch`, controle `isLoading` com `useState`, mostre `useToast({ position: "top", isClosable: true, status })` e depois chame o `refetch`/`reload` recebido por props.
- Modais recebem `isOpen`, `onClose` e `reload`/`refetch`. O mesmo modal cria e edita (decide pelo `id` do item recebido).
- Formulários usam `useFormik` com `enableReinitialize: true` e `initialValues` vindos das props.
- Cores: prefira os tokens semânticos (`surface.card`, `surface.canvas`, `text.primary`, `text.muted`, `border.default`, `accent.text`) para o dark mode funcionar.
- Textos de UI, nomes de componentes e de variáveis majoritariamente em português.
- Moeda: `maskCurrencyInput` no input e `parseCurrencyInput` antes de enviar (já feito em `usePanels`/`useMovements`); exibição com `formatarValorBR`.

### Armadilhas
- **Novo módulo** exige mexer em: `config/module-access.ts`, `config/modules-nav.ts`, **e nos dois arrays duplicados** `menuOpcoes` em `componnents/menu.tsx` **e** `componnents/menu-mobile.tsx`, além de um `layout.tsx` com os guards.
- O item ativo do menu é detectado por `pathname.includes(item.nome.toLowerCase())`. Por isso o `nome` precisa bater com o segmento da rota (ex.: `"Notificacoes"` sem acento).
- Os filtros de movimentações **não** fazem parte da `queryKey`; o componente usa `setTimeout(refetch, 500)`.
- Datas: há compensações de fuso espalhadas (`getTimezoneOffset`, `getUTC*`, `+1` dia no calendário). Não "conserte" um lado sem revisar o outro.
- Status de tarefa: `"Concluida"` / `"Pendente"` (sem acento).
- `src/app/layout.tsx` é `"use client"`, então não dá para exportar `metadata` dali.
- Os guards retornam `null` enquanto `loading` (a tela fica em branco até `auth/me` responder).
- Nomes com erro de digitação que são API pública interna: `useCategoies`, `DefatultTextarea`, prop `categorys`. Não renomeie sem atualizar todos os usos.
- Sem WebSocket/SSE/polling: os dados só atualizam via `refetch`, invalidação ou o refetch padrão do react-query (foco da janela).
