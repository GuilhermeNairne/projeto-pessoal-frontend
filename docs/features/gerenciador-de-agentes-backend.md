# Especificação: Gerenciador de agentes de IA (back-end)

> Status: **proposta (não implementada)**. Base: `CLAUDE.md`, `docs/backend/*.md` e o código em `src/` (estado de 2026-10-19).
> Itens marcados como _a confirmar_ são suposições que precisam de validação (sua ou da documentação de terceiros).
> A seção 9 (contrato da API) é a fonte de verdade para o front-end.

## Sumário

1. [Visão geral, objetivos e fora da v1](#1-visão-geral-objetivos-e-fora-da-v1)
2. [Encaixe na arquitetura existente](#2-encaixe-na-arquitetura-existente)
3. [Modelo de dados](#3-modelo-de-dados)
4. [Máquina de estados da task](#4-máquina-de-estados-da-task)
5. [Fila e concorrência](#5-fila-e-concorrência)
6. [Execução dos agentes](#6-execução-dos-agentes)
7. [Eventos e tempo real](#7-eventos-e-tempo-real)
8. [Fluxo de aprovação](#8-fluxo-de-aprovação)
9. [Contrato da API](#9-contrato-da-api)
10. [Segurança](#10-segurança)
11. [Riscos, decisões em aberto e perguntas](#11-riscos-decisões-em-aberto-e-perguntas)
12. [Plano de implementação](#12-plano-de-implementação)

---

## 1. Visão geral, objetivos e fora da v1

O usuário cadastra um repositório git (o servidor faz o clone), cria **tasks** em linguagem natural para esse repositório e
cada task é executada por um **agente de IA de código** em segundo plano. Cada task roda num **git worktree próprio**
(diretório e branch exclusivos), então várias tasks do mesmo repositório não conflitam. Tudo o que o agente faz vira um
**evento** salvo no banco e transmitido em tempo real. Quando o agente precisa de permissão ou de uma resposta, ele
**pausa** e espera o usuário. Um **controlador de admissão** decide quantos agentes rodam ao mesmo tempo com base num
limite fixo e no uso de CPU e memória da máquina.

### Objetivos da v1

| # | Objetivo | Critério observável |
|---|---|---|
| O1 | Importar repositório via `git clone` (HTTPS) | Repositório passa de `cloning` para `ready` e lista as branches remotas |
| O2 | CRUD de tasks com máquina de estados explícita | Transições inválidas retornam `409 INVALID_TRANSITION` |
| O3 | Fila com limite de agentes simultâneos | Nunca há mais tasks `running` + `waiting_approval` do que o limite efetivo |
| O4 | Execução isolada por worktree | Cada task tem branch `agent/<id>` e diretório próprio; worktrees são limpos |
| O5 | Eventos persistidos e em tempo real (SSE) | Reconectar com `Last-Event-ID` entrega todos os eventos perdidos, sem duplicar |
| O6 | Aprovação humana (pausa e retomada) | O agente para numa ferramenta sensível, o usuário responde e o agente continua |
| O7 | Métricas de CPU e memória em tempo real, usadas na admissão | Sob pressão de recursos, novas tasks ficam em `queued` com motivo visível |
| O8 | Timeout, cancelamento e recuperação após reinício | `kill -9` no servidor não deixa task presa em `running` |

### Fora da v1

- Push da branch, criação de pull request e merge (a branch fica só local; o usuário vê o diff pela API).
- Credenciais para repositórios privados (_a confirmar_: ver D5 na seção 11; o desenho está na seção 10).
- Sandbox por agente em container ou VM, ou com usuário de sistema separado (a v1 depende de aprovações e de regras de caminho; ver seção 10).
- Vários servidores ou runners (escala horizontal); a v1 é **uma instância**.
- Streaming token a token da resposta do modelo (`includePartialMessages`); a v1 transmite mensagens completas.
- Continuar a conversa de uma task `done` com novas instruções (follow-up).
- Agendamento de tasks (cron), dependência entre tasks e prioridade dinâmica.
- Notificação por e-mail ou WhatsApp quando uma aprovação estiver pendente (o `MailService` pode ser reaproveitado depois).
- Edição dos limites de concorrência pela API (a v1 usa variáveis de ambiente).
- Histórico persistido de métricas de CPU e memória (só a amostra atual e um buffer em memória).
- Preempção, isto é, pausar ou matar agentes em execução por falta de recursos.
- Outros provedores de agente além do escolhido em D1 (a interface `AgentRunner` deixa isso possível depois).

---

## 2. Encaixe na arquitetura existente

### 2.1 Novo módulo

`src/modules/agents/`, registrado no `AppModule` (`src/app.module.ts`) e organizado como os módulos existentes
(controller → service → `PrismaService`), com subpastas por subdomínio, como `src/modules/financial/`:

```
src/modules/agents/
  agents.module.ts
  agents.config.ts            # lê e valida as variáveis AGENTS_* no boot (ver 2.4)
  repos/                      # repositórios git importados ("repos" para não confundir com a camada repositories/ do auth)
    repos.controller.ts  repos.service.ts  repos.dto.ts
  tasks/
    tasks.controller.ts  tasks.service.ts  tasks.dto.ts
    task-state-machine.ts     # tabela de transições + transição atômica (seção 4)
  queue/
    scheduler.service.ts      # laço de admissão (seção 5)
    admission.service.ts      # cálculo do limite efetivo
  runner/
    agent-runner.interface.ts # porta: start/cancel/answer, emite eventos normalizados
    claude-agent.runner.ts    # implementação com o Claude Agent SDK (D1)
    fake.runner.ts            # runner roteirizado para testes e para a fase 4
    process-registry.ts       # mapa taskId → processo, AbortController, resolvers de aprovação
  git/
    git.service.ts            # clone/fetch/worktree via execFile (sem shell)
  events/
    events.service.ts         # persiste e publica (writer único + Subject do RxJS)
    events.controller.ts      # SSE + histórico
  approvals/
    approvals.controller.ts  approvals.service.ts  approvals.dto.ts
  system/
    metrics.service.ts        # amostragem de CPU e memória (máquina e por agente)
    system.controller.ts
  recovery/
    recovery.service.ts       # reconciliação no boot e limpeza periódica
```

### 2.2 O que é reaproveitado

| Necessidade | Reaproveita | Arquivo |
|---|---|---|
| Acesso ao banco | `PrismaModule` global e `PrismaService` (adapter `PrismaPg`) | `src/modules/prisma/prisma.service.ts` |
| Novos modelos e migrations | Schema e pasta de migrations; o client é gerado em `src/generated/prisma` | `prisma/schema.prisma`, `prisma/migrations/` |
| API key em toda rota (inclusive SSE) | `ApiKeyGuard` global, que também aceita `?api_key=` | `src/guards/apiKey.guard.ts` |
| Usuário autenticado | `JwtAuthGuard` + `JwtStrategy` (cookie `accessToken` → `req.user`) | `src/modules/auth/guards/jwt-auth.guard.ts`, `src/modules/auth/strategies/jwt.strategy.ts` |
| Permissão por módulo | `RolesGuard` + `@Roles('ADMIN', 'Agentes')` | `src/modules/auth/guards/roles.guard.ts`, `src/modules/auth/decorators/roles.decorator.ts` |
| Gestão da nova role | `POST /admin/roles` e `POST /admin/users/:id/roles` | `src/modules/admin/admin.controller.ts` |
| Rate limit por rota | `ThrottlerModule` global + `@Throttle` (como no login) | `src/app.module.ts`, `src/modules/auth/controllers/auth.controller.ts` |
| Jobs periódicos | `ScheduleModule.forRoot()` já registrado; `@Interval`/`@Cron` como em `NotificationService` | `src/modules/notification/notification.service.ts` |
| Validação | `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) | `src/main.ts` |
| Checagem de dono | Padrão `assertPanelOwnership` (compara com `req.user.id`) | `src/modules/financial/panel/panel.service.ts` |
| Tradução de erros do Prisma | `P2002` → 409, `P2025` → 404 | `src/modules/admin/admin.service.ts` |
| Streams reativos | `rxjs` já é dependência (`Subject`/`Observable` para `@Sse`) | `package.json` |
| Logs | `Logger` do Nest com contexto (como `NotificationService`) | — |
| Exclusão de conta | `deleteAccountCascade` precisa considerar os dados novos (ver 3.6) | `src/modules/auth/repositories/user.repository.ts` |
| CORS com credenciais | Já configurado; o SSE usa a mesma origem e cookies | `src/main.ts` |

### 2.3 Armadilhas documentadas que o módulo novo deve evitar

As armadilhas abaixo estão descritas em `docs/backend/arquitetura.md`. O módulo novo segue o padrão bom, sem alterar o código antigo:

- **Nada de `Partial<Dto>` em PATCH**: o body não seria validado. Use classes `Update…Dto` explícitas com `@IsOptional()`
  (`@nestjs/mapped-types` não está instalado).
- **O dono vem sempre de `req.user.id`**, nunca de `userId` enviado pelo cliente (diferente de tarefas e notificações).
- **Erros**: relance `HttpException` como está (`if (error instanceof HttpException) throw error`), traduza códigos do Prisma
  e use `Logger` em vez de `console.log`. Nunca passe o objeto de erro como corpo da resposta.
- **Query com DTO de classe + `forbidNonWhitelisted`** rejeita `?api_key=`. Nas rotas que usam API key por query (SSE),
  leia os parâmetros individualmente com `@Query('x')` ou declare `api_key` no DTO.
- **BigInt**: o id dos eventos é `BigInt`, e `JSON.stringify` falha com BigInt. Serialize como string no mapper.

### 2.4 Configuração nova (variáveis de ambiente)

| Variável | Padrão sugerido | Uso |
|---|---|---|
| `AGENTS_ENABLED` | `false` | Liga o módulo. Desligado: as rotas `/agents/*` respondem `503` e o scheduler não inicia (deploy atual não muda) |
| `AGENTS_DATA_DIR` | — (obrigatória se habilitado) | Raiz dos clones e worktrees, **fora** da pasta da aplicação |
| `ANTHROPIC_API_KEY` | — | Credencial do agente (D1); nunca exposta ao front nem aos eventos |
| `AGENTS_DEFAULT_MODEL` | `claude-opus-5-5` | Modelo padrão das tasks |
| `AGENTS_ALLOWED_MODELS` | `claude-opus-5-5,claude-sonnet-5-5,claude-haiku-5-5` | Lista aceita em `model` na criação de task |
| `AGENTS_MAX_CONCURRENT` | `2` | Teto rígido de agentes ativos (`running` + `waiting_approval`) |
| `AGENTS_MAX_CONCURRENT_PER_USER` | = `AGENTS_MAX_CONCURRENT` | Teto por usuário |
| `AGENTS_CPU_HIGH_WATERMARK` | `75` | % de CPU (média móvel) acima da qual não se admitem novos agentes |
| `AGENTS_CPU_RESUME_WATERMARK` | `65` | Histerese: volta a admitir abaixo deste valor |
| `AGENTS_MEM_RESERVE_MB` | `1024` | Memória que nunca é dada a agentes |
| `AGENTS_MEM_PER_AGENT_MB` | `800` | Estimativa inicial de memória por agente (ajustada pelo observado) |
| `AGENTS_MEM_CRITICAL_PERCENT` | `95` | Acima disso: alerta de pressão e admissão bloqueada |
| `AGENTS_START_COOLDOWN_S` | `20` | Intervalo mínimo entre duas admissões |
| `AGENTS_METRICS_INTERVAL_MS` | `2000` | Período de amostragem e do SSE de métricas |
| `AGENTS_TASK_TIMEOUT_S` | `3600` | Timeout padrão de execução ativa (não conta espera de aprovação) |
| `AGENTS_INACTIVITY_TIMEOUT_S` | `600` | Sem nenhum evento por esse tempo em `running` → falha |
| `AGENTS_APPROVAL_TIMEOUT_S` | `86400` | Tempo máximo de espera por resposta (D9) |
| `AGENTS_MAX_TURNS` | `200` | Teto de turnos do agente por execução |
| `AGENTS_MAX_AUTO_RESUME` | `1` | Retomadas automáticas após reinício (seção 6.7) |
| `AGENTS_WORKTREE_RETENTION_DAYS` | `7` | Worktrees de tasks terminadas são removidos depois disso (a branch fica) |
| `AGENTS_EVENT_PAYLOAD_MAX_KB` | `64` | Tamanho máximo do payload de um evento; o excedente é truncado |

---

## 3. Modelo de dados

### 3.1 Convenções

- Os nomes seguem o modelo mais recente do projeto (`notifications`): modelo em snake_case plural e campos em camelCase.
- IDs em **UUID** (como `users.id`): não são enumeráveis e são seguros para virar nome de diretório. A exceção é
  `agent_events.id`, um `BigInt` autoincrement usado como cursor do SSE.
- Diferente do resto do projeto, as tabelas novas têm **FK real para `users`** com `ON DELETE CASCADE` (ver 3.6).
- Timestamps em UTC (`TIMESTAMP(3)`); valores monetários em `Decimal`, serializados como string, como no módulo financeiro.

### 3.2 Diagrama

```mermaid
erDiagram
    users ||--o{ agent_repositories : "userId (CASCADE)"
    users ||--o{ agent_tasks : "userId (CASCADE)"
    users ||--o{ agent_events : "userId (CASCADE)"
    users ||--o{ agent_approvals : "userId (CASCADE)"
    agent_repositories ||--o{ agent_tasks : "repositoryId (CASCADE)"
    agent_repositories ||--o{ agent_events : "repositoryId (SET NULL)"
    agent_tasks ||--o{ agent_events : "taskId (CASCADE)"
    agent_tasks ||--o{ agent_approvals : "taskId (CASCADE)"
    agent_events |o--o| agent_approvals : "requestEventId"
```

### 3.3 Enums

```prisma
enum AgentRepositoryStatus { cloning ready fetching error }
enum AgentTaskStatus { pending queued running waiting_approval done failed cancelled }
enum AgentApprovalKind { tool_permission question }
enum AgentApprovalStatus { pending approved denied answered expired cancelled }
enum AgentPermissionPreset { safe edits autonomous }
```

### 3.4 Entidades (esboço em Prisma; os nomes finais podem mudar na implementação)

```prisma
model agent_repositories {
  id                  String                @id @default(uuid())
  userId              String
  name                String                // exibição; padrão = último segmento da URL
  gitUrl              String                // somente https:// (seção 10)
  defaultBranch       String?               // detectada após o clone (HEAD remoto)
  status              AgentRepositoryStatus @default(cloning)
  statusMessage       String?               // erro do clone/fetch, já sanitizado
  allowedBashCommands Json                  @default("[]") // regras de auto-aprovação, ex.: ["Bash(npm test:*)"] (sintaxe a confirmar)
  sizeBytes           BigInt?
  lastFetchedAt       DateTime?
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt
  user                User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks               agent_tasks[]
  events              agent_events[]

  @@unique([userId, gitUrl])
  @@index([userId, createdAt])
}

model agent_tasks {
  id                String                @id @default(uuid())
  userId            String
  repositoryId      String
  title             String
  prompt            String                // instrução do usuário (texto longo)
  status            AgentTaskStatus       @default(pending)
  statusReason      String?               // ver lista em 4.3
  errorMessage      String?
  priority          Int                   @default(0)  // maior primeiro
  baseBranch        String                // branch de origem do worktree
  branchName        String?               // agent/<id8>-<slug>, definida ao criar o worktree
  worktreePath      String?               // relativo a AGENTS_DATA_DIR; nunca exposto ao front
  worktreeRemovedAt DateTime?
  model             String
  permissionPreset  AgentPermissionPreset @default(safe)
  timeoutSeconds    Int
  maxTurns          Int
  attempt           Int                   @default(0)  // incrementa a cada entrada em running vinda de queued
  autoResumeCount   Int                   @default(0)
  sessionId         String?               // sessão do Agent SDK (para resume)
  runnerInstanceId  String?               // id do boot do processo que está executando
  pid               Int?                  // processo do agente (best effort)
  pidStartedAt      DateTime?             // evita matar outro processo por reuso de PID
  activeMs          Int                   @default(0)  // tempo em running acumulado (base do timeout)
  runningSince      DateTime?             // início do trecho running atual
  lastEventAt       DateTime?             // base do timeout de inatividade
  lastSeq           Int                   @default(0)  // último seq de evento da task
  numTurns          Int?
  costUsd           Decimal?              @db.Decimal(12, 6)
  resultSummary     String?               // texto final do agente
  cancelRequestedAt DateTime?
  queuedAt          DateTime?
  startedAt         DateTime?             // primeira vez em running
  finishedAt        DateTime?
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
  user              User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  repository        agent_repositories    @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  events            agent_events[]
  approvals         agent_approvals[]

  @@index([status, priority, queuedAt])   // seleção do scheduler
  @@index([userId, createdAt])            // listagem
  @@index([repositoryId, status])
}

model agent_events {
  id           BigInt   @id @default(autoincrement()) // cursor global do SSE (string no JSON)
  userId       String
  taskId       String?                                // null em eventos só de repositório
  repositoryId String?
  seq          Int?                                   // sequência por task, sem buracos (null se taskId null)
  type         String                                 // catálogo na seção 7 (string para não exigir migration por tipo novo)
  payload      Json
  createdAt    DateTime @default(now())
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  task         agent_tasks?        @relation(fields: [taskId], references: [id], onDelete: Cascade)
  repository   agent_repositories? @relation(fields: [repositoryId], references: [id], onDelete: SetNull)

  @@unique([taskId, seq])
  @@index([userId, id])     // replay do stream do usuário
  @@index([taskId, id])     // histórico da task
}

model agent_approvals {
  id              String              @id @default(uuid())
  userId          String
  taskId          String
  kind            AgentApprovalKind
  status          AgentApprovalStatus @default(pending)
  toolName        String?
  toolUseId       String?
  request         Json                // entrada da ferramenta / perguntas (sanitizado)
  response        Json?               // decisão, mensagem, respostas
  requestEventId  BigInt?             // evento approval.requested / agent.question
  expiresAt       DateTime
  respondedAt     DateTime?
  createdAt       DateTime            @default(now())
  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  task            agent_tasks         @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId, status])
  @@index([userId, status])
}
```

O modelo `User` ganha os campos de relação inversa (`agentRepositories`, `agentTasks`, `agentEvents`, `agentApprovals`).
Isso não cria colunas na tabela `users`.

### 3.5 Regras relevantes

- `agent_tasks.status` só muda pela `TaskStateMachine` (seção 4), com update condicional `WHERE id = ? AND status = ?`.
  Em cada mudança, um evento `task.status_changed` é gravado na mesma transação.
- `agent_events.seq` é atribuído pelo writer único (7.4) a partir de `agent_tasks.lastSeq`; o `@@unique([taskId, seq])` garante a ordem.
- `worktreePath` e o caminho do clone são **derivados de UUIDs** (`<AGENTS_DATA_DIR>/repos/<repoId>.git` e
  `<AGENTS_DATA_DIR>/worktrees/<taskId>`), nunca de texto do usuário.
- Retenção: os eventos vivem enquanto a task existir; apagar a task apaga os eventos (cascade).

### 3.6 Exclusão de conta e de usuário

- Com FK + cascade, `DELETE /auth/me` (`deleteAccountCascade`) e `DELETE /auth/:id` apagam as linhas novas automaticamente.
- O que fica no disco e nos processos **não** é apagado pelo banco. É preciso um passo de aplicação antes do delete:
  `AgentsCleanupService.purgeUser(userId)`, que cancela os agentes ativos e remove os clones e worktrees.
  Ele deve ser chamado em `AuthService.deleteAccount` e `AuthService.delete` (`src/modules/auth/services/auth.service.ts`).
  Essa é a única alteração prevista em código existente fora do `AppModule` e do schema.

### 3.7 Migrations necessárias (uma por fase, ver seção 12)

| Migration | Conteúdo |
|---|---|
| `add_agent_repositories` | enum `AgentRepositoryStatus`, tabela `agent_repositories`; insert idempotente da role `Agentes` em `roles` (`ON CONFLICT ("name") DO NOTHING`, como no backfill de `20260810190000_add_roles_table`) |
| `add_agent_tasks` | enums `AgentTaskStatus` e `AgentPermissionPreset`, tabela `agent_tasks` e índices |
| `add_agent_events` | tabela `agent_events` e índices |
| `add_agent_approvals` | enums `AgentApprovalKind` e `AgentApprovalStatus`, tabela `agent_approvals` |

Depois de cada uma: `npx prisma migrate dev --name <nome>`, `npx prisma generate` e commit de `src/generated/prisma`.

---

## 4. Máquina de estados da task

### 4.1 Diagrama

```mermaid
stateDiagram-v2
    [*] --> pending: criar (autoStart=false)
    [*] --> queued: criar (autoStart=true)
    pending --> queued: enfileirar (usuário)
    queued --> pending: tirar da fila (usuário)
    queued --> running: admitir (scheduler)
    running --> waiting_approval: pedir aprovação/pergunta (runner)
    waiting_approval --> running: última aprovação respondida (usuário)
    running --> done: resultado com sucesso (runner)
    running --> failed: erro / timeout / inatividade / processo morreu (runner, watchdog)
    waiting_approval --> failed: aprovação expirou (watchdog)
    running --> queued: reinício do servidor com retomada (recovery)
    waiting_approval --> queued: reinício do servidor com retomada (recovery)
    pending --> cancelled: cancelar (usuário)
    queued --> cancelled: cancelar (usuário)
    running --> cancelled: cancelar (usuário)
    waiting_approval --> cancelled: cancelar (usuário)
    failed --> queued: tentar de novo (usuário)
    cancelled --> queued: tentar de novo (usuário)
    queued --> failed: repositório indisponível / worktree falhou (scheduler)
    done --> [*]
```

### 4.2 Tabela de transições

| De | Para | Disparado por | Gatilho | Efeitos colaterais |
|---|---|---|---|---|
| — | `pending` | Usuário | `POST /agents/tasks` com `autoStart: false` | evento `task.created` |
| — | `queued` | Usuário | `POST /agents/tasks` (padrão `autoStart: true`) | `queuedAt`; eventos `task.created`, `task.status_changed`; acorda o scheduler |
| `pending` | `queued` | Usuário | `POST /agents/tasks/:id/enqueue` | `queuedAt`; acorda o scheduler |
| `queued` | `pending` | Usuário | `POST /agents/tasks/:id/dequeue` | limpa `queuedAt` |
| `queued` | `running` | Scheduler | slot livre + admissão aprovada (seção 5) | `attempt++`, `runningSince`, `runnerInstanceId`; cria ou reaproveita o worktree; inicia o agente |
| `queued` | `failed` | Scheduler | repositório não `ready`, falha ao criar o worktree | `statusReason` = `repository_unavailable` / `worktree_failed` |
| `running` | `waiting_approval` | Runner | o agente chamou uma ferramenta que exige aprovação, ou `AskUserQuestion` | cria `agent_approvals`; acumula `activeMs`; evento `approval.requested` / `agent.question` |
| `waiting_approval` | `running` | Usuário | `POST /agents/approvals/:id/respond` resolveu a **última** aprovação pendente | `runningSince = now`; evento `approval.resolved`; o agente continua |
| `waiting_approval` | `failed` | Watchdog | `expiresAt` da aprovação vencido (D9) | aprovação → `expired`; aborta o agente; `statusReason = approval_timeout` |
| `running` | `done` | Runner | mensagem `result` com `subtype: "success"` e `is_error: false` | `costUsd`, `numTurns`, `resultSummary`; auto-commit (D11); evento `agent.result` |
| `running` | `failed` | Runner / Watchdog | `result` de erro, exceção do SDK, processo encerrado, `activeMs > timeout`, inatividade | aborta e mata a árvore de processos; `statusReason` (4.3) |
| `running` / `waiting_approval` | `queued` | Recovery | boot encontrou a task órfã, há `sessionId` e `autoResumeCount < AGENTS_MAX_AUTO_RESUME` | aprovações pendentes → `expired`; `autoResumeCount++`; a próxima execução usa `resume` |
| `pending` / `queued` | `cancelled` | Usuário | `POST /agents/tasks/:id/cancel` | `statusReason = user_cancelled` |
| `running` / `waiting_approval` | `cancelled` | Usuário | `POST /agents/tasks/:id/cancel` | `cancelRequestedAt`; nega as aprovações pendentes; aborta; mata após o prazo de tolerância; aprovações → `cancelled` |
| `failed` / `cancelled` | `queued` | Usuário | `POST /agents/tasks/:id/retry` | reaproveita a branch e o worktree se existirem (D10); `autoResumeCount = 0` |

Qualquer outra combinação → `409 INVALID_TRANSITION`. `done` é terminal na v1.
Se o boot encontra uma task órfã que não pode ser retomada (sem `sessionId` ou limite de retomadas atingido), ela vai
para `failed` com `statusReason = server_restart`.

### 4.3 Valores de `statusReason`

`user_cancelled`, `timeout`, `inactivity_timeout`, `approval_timeout`, `agent_error`, `max_turns`, `budget_exceeded`,
`process_crashed`, `server_restart`, `worktree_failed`, `repository_unavailable`, `resumed_after_restart` (em `queued`).

### 4.4 Implementação da transição (regra para quem implementar)

`TaskStateMachine.transition(taskId, from[], to, ctx)`:
1. Valida `(from → to)` na tabela acima (constante única, testada exaustivamente).
2. Numa transação: `UPDATE agent_tasks SET status = :to, … WHERE id = :id AND status IN (:from)`. Se nenhuma linha
   for afetada → `409 INVALID_TRANSITION` (outra ação chegou antes).
3. Na mesma transação: insere `task.status_changed` com `{ from, to, reason, actor }`.
4. Depois do commit: publica o evento no bus (7.4) e, se aplicável, acorda o scheduler.

---

## 5. Fila e concorrência

### 5.1 Tecnologia

| Opção | Prós | Contras | Veredito |
|---|---|---|---|
| **A. Fila no próprio Postgres** (`agent_tasks.status = queued` + scheduler em processo) | Sem infraestrutura nova; o banco já é a fonte de verdade; sobrevive a reinício; consultas simples de prioridade e fairness | Uma instância de scheduler (garantida por advisory lock); polling leve | **Recomendado para a v1** |
| B. BullMQ + Redis | Retries, delays e painéis prontos; distribuído | Infraestrutura nova (Redis); o estado fica dividido entre Redis e Postgres; o ganho distribuído não se aplica porque o worktree e o processo estão no disco local de **uma** máquina | Considerar só com vários runners |
| C. pg-boss (jobs em Postgres) | Biblioteca madura sobre o mesmo banco | Duplica a máquina de estados (estado do job × estado da task); dependência nova | Alternativa a A se a lógica de fila crescer |
| D. Fila em memória (ex.: `p-queue`) | Trivial | Perde a fila no reinício; não atende O8 | Rejeitada |

**Desenho recomendado (A):**
- `SchedulerService` roda um `tick()` a cada 2 s (`@Interval`) e também imediatamente em `enqueue`, `finish`, `cancel` e
  em resposta de aprovação.
- No boot, o processo tenta `pg_try_advisory_lock(<constante>)`. Só quem obtém o lock roda o scheduler e os runners. É uma
  proteção barata contra duas instâncias executando a mesma fila (por exemplo, durante um deploy com sobreposição).
- Seleção: `queued` ordenadas por `priority DESC, queuedAt ASC`, pulando usuários que já atingiram
  `AGENTS_MAX_CONCURRENT_PER_USER`. **No máximo uma admissão por tick** (ver cooldown).
- A admissão usa a transição condicional da seção 4.4. Com um único scheduler, `SKIP LOCKED` não é necessário.
- Neon: as consultas do scheduler são poucas e leves. O `tick` não consulta o banco se não houver slot livre,
  pois o contador fica em memória, no `ProcessRegistry`. Isso evita acordar o compute do Neon à toa (_a confirmar_: o
  plano Neon usado suspende por inatividade?).

### 5.2 Quem ocupa slot

Ocupam slot as tasks `running` e `waiting_approval`, porque nas duas o processo do agente continua vivo e consumindo memória (D8).
`queued` e `pending` não ocupam.

### 5.3 Limite dinâmico baseado em recursos

**Amostragem** (`MetricsService`, a cada `AGENTS_METRICS_INTERVAL_MS`):
- **CPU da máquina:** diferença entre duas leituras de `os.cpus()` (idle × total) → % de uso. Funciona no Windows, onde
  `os.loadavg()` retorna zeros. Média móvel exponencial (EMA) sobre ~30 s para decidir; o valor instantâneo vai para a UI.
- **Memória:** total e disponível. No Linux, ler `MemAvailable` de `/proc/meminfo`, porque `os.freemem()` ignora cache e
  subestima. Em container, usar os limites do cgroup (`memory.max`, `cpu.max`) em vez dos valores do host (_a confirmar_
  conforme a hospedagem, D3).
- **Por agente:** CPU e RSS da **árvore** de processos do agente (o CLI do agente mais os comandos que ele dispara) via
  `pidusage` + `pidtree` (dependências novas; alternativa: ler `/proc` no Linux). O PID raiz vem do spawn controlado (6.2).
- A estimativa de memória por agente começa em `AGENTS_MEM_PER_AGENT_MB` e passa a ser o **p90 do pico de RSS** das últimas
  20 execuções (em memória), com piso no valor configurado.

**Decisão de admissão** (a cada tick, para a próxima task candidata):

```
ativos            = running + waiting_approval
slotsPorMemoria   = floor((memDisponivel - AGENTS_MEM_RESERVE_MB) / estimativaPorAgente)
limiteEfetivo     = clamp(ativos + slotsPorMemoria, 0, AGENTS_MAX_CONCURRENT)
se cpuEma >= HIGH_WATERMARK (ou ainda não caiu abaixo de RESUME_WATERMARK desde que passou do HIGH):
    limiteEfetivo = min(limiteEfetivo, ativos)        # congela: não admite, não derruba
se memUsada% >= AGENTS_MEM_CRITICAL_PERCENT:
    limiteEfetivo = min(limiteEfetivo, ativos)        # e emite system.pressure
admitir = ativos < limiteEfetivo
          e ativosDoUsuario < AGENTS_MAX_CONCURRENT_PER_USER
          e agora - ultimaAdmissao >= AGENTS_START_COOLDOWN_S
```

- **Cooldown**: um agente recém-iniciado leva alguns segundos para mostrar seu consumo. Sem o intervalo, várias admissões
  seguidas superestimariam a capacidade.
- **Histerese** (HIGH/RESUME): evita alternar entre admitir e bloquear a cada amostra.
- **Sem preempção na v1**: sob pressão, o sistema só **para de admitir**. Agentes em execução nunca são mortos
  automaticamente, porque isso perderia trabalho. O usuário vê o alerta e pode cancelar.
- O motivo do bloqueio é exposto ao front (`admission.reason`: `ok`, `hard_limit`, `user_limit`, `cpu_high`,
  `memory_low`, `memory_critical`, `cooldown`, `runner_disabled`), tanto na métrica quanto na task em `queued`
  (`GET /agents/tasks/:id` → `queuePosition` e `blockedBy`).

---

## 6. Execução dos agentes

### 6.1 Runtime do agente (D1)

**Recomendado: Claude Agent SDK para TypeScript (`@anthropic-ai/claude-agent-sdk`).** Ele é o harness do Claude Code
empacotado como biblioteca, com ferramentas prontas (Read, Write, Edit, Bash, Glob, Grep, …), sessões, hooks e callback
de permissão. Isso cobre exatamente as necessidades da feature: eventos, aprovação, cancelamento e retomada. Pontos usados
(nomes conforme a referência TypeScript em `code.claude.com/docs/en/agent-sdk/typescript`, consultada em 2026-10-19; fixar
a versão do pacote e revalidar na implementação):

| Necessidade | Recurso do SDK |
|---|---|
| Iniciar | `query({ prompt, options })` → `Query` (async generator de `SDKMessage`) |
| Diretório de trabalho | `options.cwd = <worktree>` |
| Modelo | `options.model` (padrão `claude-opus-5-5`) |
| Política de permissão | `options.permissionMode` (`"default"`, `"acceptEdits"`, `"bypassPermissions"`, `"plan"`, `"dontAsk"`, `"auto"`), `allowedTools` (auto-aprova), `disallowedTools` (nega sempre) |
| Aprovação humana | `options.canUseTool(toolName, input, { signal, toolUseID, … })` → `Promise<{ behavior: "allow", updatedInput? } \| { behavior: "deny", message, interrupt? }>`; também é por onde passa `AskUserQuestion` |
| Regras que sempre executam | `options.hooks.PreToolUse` (pode responder `permissionDecision: "deny"`) e `PostToolUse` (captura arquivos alterados) |
| Cancelamento | `options.abortController` e `Query.close()` (encerra o subprocesso); `interrupt()` existe só em modo de input por streaming |
| Retomada | `options.resume = <sessionId>` (o id vem na mensagem `system`/`init` e em todas as mensagens) |
| Teto de turnos | `options.maxTurns` (resultado de erro `error_max_turns`) |
| Ambiente do processo | `options.env` **substitui** o ambiente do subprocesso (ver 10.3) |
| Configurações carregadas | `options.settingSources` (`[]` desliga as configurações de usuário, projeto e local; D12) |
| Controle do processo | `options.spawnClaudeCodeProcess` (spawn próprio → PID, grupo de processos, kill da árvore); `options.stderr` |
| Resultado | `SDKResultMessage`: `subtype` (`success` ou `error_*`), `is_error`, `num_turns`, `total_cost_usd`, `usage`, `session_id`, `result` |

Detalhes ainda _a confirmar_ na documentação do SDK:
- formato de `SpawnOptions`/`SpawnedProcess`;
- formato exato da resposta de `AskUserQuestion` (via `updatedInput.answers`; ver a seção "user input" da doc);
- existência de um teto de custo por execução (há o subtipo `error_max_budget_usd`, mas a opção não foi confirmada);
- o SDK depende de um binário nativo por plataforma (dev no Windows, produção provavelmente Linux).

Alternativas: chamar o CLI do Claude Code diretamente (`claude -p --output-format stream-json`), que dá controle total do
processo mas exige reimplementar o protocolo de permissão; ou montar um agente próprio com a Claude API e o Tool Runner, que
dá controle máximo mas exige reimplementar as ferramentas de arquivo e de shell. A interface `AgentRunner` isola essa escolha.

### 6.2 Gerenciamento de processos

- **Um processo de agente por task ativa**, iniciado pelo SDK dentro do processo Nest. O SDK já roda o CLI como
  subprocesso, então um crash do agente não derruba a API.
- O spawn é feito por nós via `spawnClaudeCodeProcess`, para:
  - registrar `pid` e `pidStartedAt` na task;
  - no Linux, criar um **grupo de processos próprio** (`detached: true`) e matar a árvore com `kill(-pgid)`; no Windows,
    usar `taskkill /PID <pid> /T /F`;
  - medir a árvore de processos (5.3).
- `ProcessRegistry` (memória): `taskId → { query, abortController, pid, resolvers de aprovação, timers }`. É a fonte do
  contador de slots.
- O loop do runner consome o async generator do SDK, **normaliza** cada `SDKMessage` em eventos do catálogo (7.2) e
  entrega ao `EventsService`.
- Heartbeat: `lastEventAt` é atualizado a cada evento persistido. Se não chega nenhum evento por
  `AGENTS_INACTIVITY_TIMEOUT_S` com a task em `running`, ela falha com `inactivity_timeout`.
- Alternativa considerada: rodar cada agente num worker Node separado (`child_process.fork`) para isolar vazamentos de
  memória do SDK. Fica para depois da v1, caso as métricas mostrem crescimento de RSS no processo da API.

### 6.3 Repositórios e git worktrees

Todas as operações git usam `execFile('git', [...args], { cwd, timeout, env })`, **nunca shell**, com
`GIT_TERMINAL_PROMPT=0`, `GIT_ALLOW_PROTOCOL=https` e `core.longpaths=true` (Windows).

**Importação (clone):**
1. Valida a URL (10.4). Cria a linha com `status = cloning` e responde `202`.
2. Em segundo plano: `git clone --bare <url> <DATA>/repos/<repoId>.git`, depois
   `git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"` e `git fetch origin --prune`.
   O clone `--bare` não tem working tree "principal" que possa ser editada por engano; os worktrees das tasks são
   os únicos checkouts.
3. Detecta a branch padrão (`git ls-remote --symref origin HEAD`) e calcula `sizeBytes`.
4. `status = ready` (ou `error` + `statusMessage`). Eventos `repository.status_changed`.
5. Não usar `--mirror`: o `fetch` com prune apagaria as branches `agent/*` locais.

**Criação do worktree** (na transição `queued → running`, antes de iniciar o agente):
1. Mutex **por repositório** (em memória): `fetch` e `worktree add` mexem no mesmo `.git` e não podem rodar em paralelo.
2. `git fetch origin <baseBranch>`.
3. Se a branch `agent/<id8>-<slug>` não existe:
   `git worktree add -b <branch> <DATA>/worktrees/<taskId> origin/<baseBranch>`.
   Se existe (retry ou resume), `git worktree add <DATA>/worktrees/<taskId> <branch>`, ou reaproveita o diretório se ainda
   estiver registrado (`git worktree list --porcelain`).
4. O nome da branch é validado com `git check-ref-format --branch`. O slug vem do título, só `[a-z0-9-]`, até 30 caracteres.
5. Evento `worktree.created { branch }`.

**Fim da execução:**
- Em `done`, se o auto-commit estiver ligado (D11): `git add -A` e
  `git commit -m "agent: <título>" --author="Agente <agent@localhost>"` no worktree, para o trabalho ficar
  na branch mesmo depois de o worktree ser removido. Evento `agent.changes_summary` com `git diff --numstat <base>...<branch>`.
- Em `failed` e `cancelled`, nada é commitado; o worktree fica para inspeção e para o retry.

**Limpeza:**
- `@Cron('0 3 * * *')`: para tasks terminadas há mais de `AGENTS_WORKTREE_RETENTION_DAYS`, roda
  `git worktree remove --force <path>` e `git worktree prune`, depois `worktreeRemovedAt = now` (a branch é mantida).
- `DELETE /agents/tasks/:id`: remove o worktree e, com `deleteBranch=true`, também a branch (`git branch -D`).
- `DELETE /agents/repositories/:id`: exige que não haja tasks ativas; remove os worktrees e o diretório `.git`.
- Reconciliação no boot (6.7): diretórios em `worktrees/` sem task correspondente são removidos.

### 6.4 Isolamento entre agentes

- Diretórios distintos (um worktree por task) e branches distintas, logo sem conflito de arquivos entre agentes.
- `cwd` do agente = worktree. Um hook `PreToolUse` **nega** Read/Write/Edit/Glob/Grep/NotebookEdit com caminho fora do
  worktree (resolve `realpath` para cobrir symlinks e `..`). O hook roda sempre, inclusive para ferramentas auto-aprovadas,
  ao contrário de `canUseTool`.
- O Bash não é confinável por análise de comando. Na v1 ele exige aprovação, exceto o que estiver na allowlist do repositório
  (`allowedBashCommands`). Isolamento real fica para depois (10.2).
- Ambiente mínimo e sem segredos do servidor (10.3).
- Mesmo dentro do worktree, comandos como `npm install` podem compartilhar caches globais (`~/.npm`). É aceitável na v1.

### 6.5 Timeout

- `activeMs` acumula só o tempo em `running`; o tempo em `waiting_approval` não conta, porque o usuário pode demorar.
- Watchdog a cada 10 s (`@Interval`) verifica:
  - `activeMs + (now - runningSince) > timeoutSeconds` → falha com `timeout`;
  - inatividade (6.2) → falha com `inactivity_timeout`;
  - aprovação vencida (`expiresAt`) → falha com `approval_timeout` (D9).
- Ao falhar por timeout: `abortController.abort()`, espera de 10 s, depois kill da árvore. O evento `agent.error` registra o motivo.
- `maxTurns` é aplicado pelo próprio SDK (resultado `error_max_turns` → falha com `max_turns`).

### 6.6 Cancelamento

`POST /agents/tasks/:id/cancel`:
1. `pending` ou `queued`: transição direta para `cancelled`.
2. `running` ou `waiting_approval`:
   1. grava `cancelRequestedAt` (idempotente: um segundo cancelamento devolve `202` com o mesmo estado);
   2. resolve as promessas de aprovação pendentes com `{ behavior: "deny", message: "Cancelado pelo usuário", interrupt: true }`;
   3. `abortController.abort()` e `Query.close()`;
   4. depois de 10 s sem encerrar: kill da árvore de processos;
   5. aprovações → `cancelled`; transição para `cancelled`.
3. Resposta `202` com a task. O estado final chega por SSE (`task.status_changed`).

### 6.7 Recuperação após reinício do servidor

Cada boot gera um `runnerInstanceId` (UUID). Em `onApplicationBootstrap`, se `AGENTS_ENABLED` e o advisory lock (5.1) foi obtido:
1. **Processos órfãos:** para cada task `running` ou `waiting_approval` com `runnerInstanceId` diferente do atual, se `pid`
   ainda existe **e** o horário de início do processo bate com `pidStartedAt`, mata a árvore. Com o grupo de processos do 6.2,
   o agente pode sobreviver à morte da API; sem essa checagem, ele continuaria editando o worktree.
2. **Aprovações pendentes** dessas tasks → `expired` (a promessa que as esperava morreu com o processo).
3. **Decisão por task:** se há `sessionId` e `autoResumeCount < AGENTS_MAX_AUTO_RESUME`, ela volta para `queued` com
   `statusReason = resumed_after_restart`. Na próxima admissão, o runner usa `resume: sessionId` com o prompt "O servidor
   foi reiniciado; continue a task de onde parou." Caso contrário, `failed` com `server_restart`.
   - A retomada depende de os arquivos de sessão do agente (em `~/.claude/` do usuário do sistema) persistirem entre reinícios
     e de o `cwd` ser o mesmo. Em hospedagem com disco efêmero, a retomada falha e a task cai em `failed` (D3, D14).
4. **Repositórios** em `cloning` ou `fetching` → `error` ("interrompido por reinício"; o usuário pode chamar `/fetch` ou recriar).
5. **Worktrees:** `git worktree prune` em cada repositório; diretórios órfãos em `worktrees/` são removidos; tasks que apontam
   para worktrees inexistentes ficam com `worktreeRemovedAt`.
6. Cada mudança gera eventos normais (`task.status_changed` com `actor: "recovery"`). Clientes que reconectarem recebem
   tudo pelo replay.

---

## 7. Eventos e tempo real

### 7.1 Transporte: SSE (recomendado) × WebSocket

| | SSE (`@Sse` do Nest) | WebSocket (`@nestjs/websockets` + socket.io) |
|---|---|---|
| Direção | servidor → cliente; as ações do usuário vão por REST | bidirecional |
| Auth | Reaproveita **sem mudanças** `ApiKeyGuard` + `JwtAuthGuard` (cookie) porque é HTTP | `ApiKeyGuard` usa `switchToHttp()`: precisa de guards novos para contexto WS e de auth no handshake (_a confirmar_ como `APP_GUARD` se comporta em gateways) |
| Reenvio | `Last-Event-ID` nativo do protocolo | protocolo próprio |
| Dependências | nenhuma nova | 2 ou mais pacotes novos |
| Proxies | HTTP comum (desligar buffering) | precisa de suporte a upgrade |

**Decisão recomendada: SSE.** Nenhum requisito precisa de canal cliente→servidor em tempo real; respostas de aprovação
e cancelamentos são REST.

### 7.2 Envelope e catálogo de eventos

Envelope (o mesmo no SSE e no histórico REST):

```json
{
  "id": "1042",
  "type": "agent.command",
  "taskId": "8b0c…",
  "repositoryId": "41aa…",
  "seq": 17,
  "createdAt": "2026-10-19T22:10:05.123Z",
  "payload": { }
}
```

`id` é string (BigInt), global e crescente. `seq` é a ordem por task, sem buracos; `seq` e `taskId` são `null` em eventos só de repositório.

| `type` | Origem | Persistido | `payload` |
|---|---|---|---|
| `repository.status_changed` | GitService | sim | `{ status, statusMessage?, defaultBranch? }` |
| `task.created` | TasksService | sim | `{ task: Task }` (objeto da seção 9) |
| `task.updated` | TasksService | sim | `{ changes: { title?, prompt?, priority?, … } }` |
| `task.status_changed` | StateMachine | sim | `{ from, to, reason?, actor: "user" \| "scheduler" \| "runner" \| "watchdog" \| "recovery", attempt }` |
| `worktree.created` | GitService | sim | `{ branch, baseBranch, reused: boolean }` |
| `worktree.removed` | GitService | sim | `{ branchKept: boolean }` |
| `agent.session_started` | Runner (`system`/`init`) | sim | `{ sessionId, model, permissionMode, tools: string[], resumed: boolean }` |
| `agent.message` | Runner (`assistant`, bloco `text`) | sim | `{ messageId, text }` (markdown) |
| `agent.tool_call` | Runner (bloco `tool_use`, exceto Bash) | sim | `{ toolUseId, tool, input }` (sanitizado e truncado) |
| `agent.command` | Runner (`tool_use` do Bash) | sim | `{ toolUseId, command, description? }` |
| `agent.command_result` | Runner (`tool_result` do Bash) | sim | `{ toolUseId, output, truncated, isError }` |
| `agent.tool_result` | Runner (`tool_result` de outras ferramentas) | sim | `{ toolUseId, tool, isError, summary }` |
| `agent.file_changed` | Hook `PostToolUse` (Write, Edit, MultiEdit, NotebookEdit) | sim | `{ toolUseId, path, changeType: "created" \| "modified" \| "deleted", tool }` (`path` relativo ao worktree) |
| `agent.changes_summary` | Runner (fim da execução, `git diff --numstat`) | sim | `{ files: [{ path, additions, deletions, status }], committed: boolean, commitSha? }` |
| `agent.question` | `canUseTool` com `AskUserQuestion` | sim | `{ approvalId, questions: [{ question, header, options: [{ label, description }], multiSelect }] }` |
| `approval.requested` | `canUseTool` (demais ferramentas) | sim | `{ approvalId, tool, input, reason?, expiresAt }` |
| `approval.resolved` | ApprovalsService | sim | `{ approvalId, status: "approved" \| "denied" \| "answered" \| "expired" \| "cancelled", message?, answers? }` |
| `agent.notice` | Runner (retry de API, rate limit, compactação de contexto) | sim | `{ kind, message }` |
| `agent.result` | Runner (`result`) | sim | `{ subtype, isError, numTurns, costUsd, durationMs, result? }` |
| `agent.error` | Runner/Watchdog | sim | `{ code, message }` (ex.: `timeout`, `process_crashed`, `sdk_error`) |
| `system.metrics` | MetricsService | **não** | ver `GET /agents/system/metrics` (só no stream de métricas) |
| `system.pressure` | AdmissionService | **não** | `{ level: "warning" \| "critical", reason, memPercent, cpuPercent }` (só no stream de métricas) |
| `stream.ready` | EventsController | **não** | `{ replayed: number, lastEventId }` (fim do replay) |
| `stream.resync_required` | EventsController | **não** | `{ reason: "too_many_missed" \| "cursor_unknown" }` |
| `stream.reauth` | EventsController | **não** | `{}` (o JWT vai expirar; reconecte após `/auth/refresh`) |

Regras do payload:
- Teto de `AGENTS_EVENT_PAYLOAD_MAX_KB`: saída de comando e entradas grandes são truncadas, com `truncated: true`.
  A saída completa não é guardada na v1.
- **Redação de segredos** antes de persistir: valores das variáveis do servidor e padrões conhecidos de token
  (`sk-ant-…`, `ghp_…`, `github_pat_…`, `AKIA…`) viram `[REDACTED]`.
- Pensamento do modelo (blocos `thinking`) não é exposto na v1.
- O stderr do CLI vai para o `Logger`, não para eventos. Em falha, as últimas 20 linhas entram em `agent.error.message`.

### 7.3 Persistir e depois publicar

```mermaid
flowchart LR
    R[Runner / StateMachine / GitService] -->|emit| Q[EventsService<br/>fila de escrita única]
    Q -->|INSERT + lastSeq++| DB[(agent_events)]
    DB -->|commit OK| BUS[Subject RxJS em memória]
    BUS --> S1[SSE do usuário A]
    BUS --> S2[SSE do usuário B]
```

- Um evento só é publicado **depois** do commit, para nenhum cliente ver um evento que não existe no banco.
- **Writer único em processo** (fila serial, opcionalmente agrupando inserts a cada 50 ms): garante que os `id` (BIGSERIAL)
  sejam commitados em ordem crescente. Sem isso, inserts concorrentes podem commitar fora de ordem: um cliente receberia o
  id 11 antes do 10 e, ao reconectar com `Last-Event-ID: 11`, perderia o 10.
- O bus filtra por `userId` (e por `taskId`/`repositoryId`, quando o stream pede), de modo que um usuário só recebe os próprios eventos.

### 7.4 Conexão, reconexão e reenvio

**Endpoint:** `GET /agents/events/stream` (detalhes na seção 9.6).

**Algoritmo no servidor ao conectar:**
1. Autentica (API key + JWT + role) como qualquer rota HTTP.
2. Lê o cursor: header `Last-Event-ID` (reconexão nativa) ou `?lastEventId=` (primeira conexão após carregar o histórico por REST).
3. **Assina o bus primeiro** e guarda os eventos ao vivo num buffer.
4. Consulta `agent_events WHERE userId = :me AND id > :cursor [AND taskId = …] ORDER BY id LIMIT 1000`.
   - Mais de 1000 pendentes → envia `stream.resync_required` e encerra. O cliente recarrega por REST e reconecta com o cursor novo.
   - Cursor maior que o último id existente → `stream.resync_required` com `cursor_unknown`.
5. Envia o replay, depois o buffer **sem duplicar** (descarta `id <= último enviado`) e então o fluxo ao vivo.
6. Envia `stream.ready`.
7. Comentário SSE `: ping` a cada 15 s (mantém proxies abertos). Headers `Cache-Control: no-cache` e `X-Accel-Buffering: no`.
8. No `exp` do access token (1 h, ver `docs/backend/arquitetura.md`), envia `stream.reauth` e fecha. O cliente chama
   `POST /auth/refresh` e reconecta com `Last-Event-ID`, sem perder eventos.

**Contrato para o cliente:**
- Guardar o maior `id` recebido; reconectar com ele. Deduplicar por `id`. Para a tela de uma task, `seq` contínuo permite
  detectar buracos (se `seq` pular, recarregar `GET /agents/tasks/:id/events?afterSeq=`).
- O `EventSource` nativo não envia headers customizados. Opções: `?api_key=` (aceito pelo `ApiKeyGuard`, mas a chave
  aparece em logs de proxy) ou, **recomendado**, um cliente SSE baseado em `fetch` (ex.: `@microsoft/fetch-event-source`),
  que envia o header da API key e `credentials: 'include'`. Com fetch, o cliente controla `Last-Event-ID` manualmente.
- Os cookies são `sameSite: none` + `partitioned` (CHIPS). O envio desses cookies num stream cross-site está _a confirmar_ nos
  navegadores-alvo.
- Backoff de reconexão: 1 s, 2 s, 5 s, 10 s (máximo). O campo `retry:` do SSE é enviado como 2000 ms.

---

## 8. Fluxo de aprovação

### 8.1 Política de permissões por preset

| Preset | `permissionMode` | Auto-aprovado (`allowedTools`) | Pede aprovação | Negado sempre |
|---|---|---|---|---|
| `safe` (padrão) | `default` | Read, Glob, Grep (dentro do worktree) | Write, Edit, Bash, WebFetch, WebSearch e qualquer outra | caminhos fora do worktree (hook) |
| `edits` | `acceptEdits` | leitura + edição dentro do worktree; `allowedBashCommands` do repositório | Bash fora da allowlist, WebFetch, WebSearch | caminhos fora do worktree |
| `autonomous` | `bypassPermissions` | tudo | nada (exceto `AskUserQuestion`) | caminhos fora do worktree (o hook continua valendo); **só `ADMIN`** pode escolher (D13) |

`AskUserQuestion` sempre vira uma pergunta ao usuário (`kind = question`), em qualquer preset.

### 8.2 Sequência

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário (front)
    participant API as ApprovalsController
    participant AS as ApprovalsService
    participant RN as Runner (canUseTool)
    participant SDK as Agent SDK / CLI
    participant SM as TaskStateMachine
    participant EV as EventsService
    participant DB as Postgres

    SDK->>RN: canUseTool("Bash", {command:"npm test"}, {signal, toolUseID})
    RN->>AS: createApproval(task, kind=tool_permission, input)
    AS->>DB: INSERT agent_approvals (pending, expiresAt)
    AS->>SM: transition(running → waiting_approval) [se for a 1ª pendente]
    SM->>DB: UPDATE status + INSERT task.status_changed
    AS->>EV: approval.requested {approvalId, tool, input}
    EV-->>U: SSE: task.status_changed, approval.requested
    RN->>RN: guarda resolver(approvalId) e espera a Promise
    Note over RN,SDK: o agente fica pausado; o processo continua vivo (ocupa slot)

    U->>API: POST /agents/approvals/:id/respond {decision:"approve"}
    API->>AS: respond(approvalId, req.user.id, body)
    AS->>DB: UPDATE agent_approvals SET status=approved WHERE id AND status=pending
    alt já resolvida / expirada
        AS-->>U: 409 APPROVAL_ALREADY_RESOLVED
    end
    AS->>EV: approval.resolved {status:"approved"}
    AS->>SM: transition(waiting_approval → running) [se não restam pendentes]
    AS->>RN: resolver({behavior:"allow", updatedInput})
    API-->>U: 200 {approval, task}
    RN-->>SDK: PermissionResult allow
    SDK->>SDK: executa a ferramenta
    SDK-->>RN: tool_result
    RN->>EV: agent.command_result
    EV-->>U: SSE: approval.resolved, task.status_changed, agent.command_result

    opt Usuário nega
        U->>API: respond {decision:"deny", message:"não rode testes agora"}
        AS->>RN: resolver({behavior:"deny", message})
        Note over SDK: o agente recebe a negativa como resultado e segue
    end
    opt Pergunta (AskUserQuestion)
        U->>API: respond {answers:{"Qual banco?":"Postgres"}}
        AS->>RN: resolver({behavior:"allow", updatedInput:{...input, answers}})
    end
    opt Expirou (watchdog) ou cancelamento
        AS->>RN: resolver({behavior:"deny", interrupt:true})
        SM->>DB: waiting_approval → failed (approval_timeout) / cancelled
    end
```

### 8.3 Regras

- A resposta é **idempotente pelo estado**: o update condicional `status = pending` garante que só a primeira resposta vale.
- Várias aprovações podem estar pendentes ao mesmo tempo (chamadas de ferramenta em paralelo). A task só volta para
  `running` quando **todas** forem resolvidas.
- `updatedInput` (aprovar com o comando editado) é aceito só quando `kind = tool_permission`, e o novo input passa pelas
  mesmas regras de caminho do hook.
- Se o `signal` do `canUseTool` for abortado (cancelamento), a aprovação vira `cancelled`.
- Se a resposta chegar e o resolver não estiver em memória (após um reinício, por exemplo), retorna `409 APPROVAL_NOT_ACTIVE`.
  A recuperação (6.7) já terá marcado a aprovação como `expired`.

---

## 9. Contrato da API

### 9.1 Convenções

- **Base:** `/agents` (sem prefixo global, como o resto da API).
- **Autenticação de todas as rotas:** API key (header `Authorization: Bearer <API_KEY>` ou `x-api-key`) + cookie `accessToken`
  + roles **`ADMIN` ou `Agentes`**. Abaixo, isso aparece como **AG**. Rotas com outra exigência estão indicadas.
- **Dono:** todo recurso pertence a `req.user.id`. Um recurso de outro usuário responde **`404`** (igual a inexistente,
  para não permitir enumeração). Isso diverge do financeiro, que usa 403 (D15).
- **Módulo desligado** (`AGENTS_ENABLED=false`): `503 { "statusCode": 503, "code": "AGENTS_DISABLED", "message": "Módulo de agentes desabilitado" }`.
- **Erros:** formato do Nest com um campo `code` estável para o front:
  ```json
  { "statusCode": 409, "error": "Conflict", "code": "INVALID_TRANSITION", "message": "Transição de running para pending não permitida" }
  ```
  Validação de DTO → `400` com `message: string[]` e `code: "VALIDATION_ERROR"`. 401, 403 e 429 seguem o padrão já documentado em `docs/backend/api.md`.
- **Datas:** ISO 8601 UTC. **Decimais:** string. **IDs:** UUID string; `event.id`: string numérica.
- **Paginação:** `?page=1&perPage=20` (máximo 100) → `{ items, pagination: { total, page, perPage, totalPages } }`
  (mesma forma de `pagination` do financeiro).

**Códigos de erro (`code`):**

| code | HTTP | Quando |
|---|---|---|
| `VALIDATION_ERROR` | 400 | DTO inválido |
| `GIT_URL_NOT_ALLOWED` | 400 | URL não é `https://`, aponta para host privado ou tem credenciais embutidas |
| `MODEL_NOT_ALLOWED` | 400 | `model` fora de `AGENTS_ALLOWED_MODELS` |
| `PRESET_NOT_ALLOWED` | 403 | `autonomous` sem role `ADMIN` |
| `NOT_FOUND` | 404 | inexistente ou de outro usuário |
| `REPOSITORY_ALREADY_EXISTS` | 409 | mesmo `gitUrl` para o mesmo usuário |
| `REPOSITORY_NOT_READY` | 409 | criar task ou dar fetch com o repositório em `cloning`, `fetching` ou `error` |
| `REPOSITORY_HAS_ACTIVE_TASKS` | 409 | apagar repositório com tasks `queued`, `running` ou `waiting_approval` |
| `BRANCH_NOT_FOUND` | 422 | `baseBranch` não existe no remoto |
| `INVALID_TRANSITION` | 409 | ação incompatível com o status atual |
| `TASK_NOT_EDITABLE` | 409 | PATCH fora de `pending` |
| `TASK_ACTIVE` | 409 | DELETE com a task ativa |
| `WORKTREE_UNAVAILABLE` | 409 | diff ou changes com o worktree e a branch já removidos |
| `APPROVAL_ALREADY_RESOLVED` | 409 | aprovação não está `pending` |
| `APPROVAL_NOT_ACTIVE` | 409 | aprovação sem agente esperando |
| `APPROVAL_RESPONSE_INVALID` | 400 | `answers` em `tool_permission`, `decision` em `question`, etc. |
| `AGENTS_DISABLED` | 503 | módulo desligado |

### 9.2 Tipos (TypeScript, para o front)

```ts
type RepositoryStatus = 'cloning' | 'ready' | 'fetching' | 'error';
type TaskStatus = 'pending' | 'queued' | 'running' | 'waiting_approval' | 'done' | 'failed' | 'cancelled';
type PermissionPreset = 'safe' | 'edits' | 'autonomous';
type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'answered' | 'expired' | 'cancelled';
type AdmissionReason = 'ok' | 'hard_limit' | 'user_limit' | 'cpu_high' | 'memory_low' | 'memory_critical' | 'cooldown' | 'runner_disabled';

interface Repository {
  id: string; name: string; gitUrl: string; defaultBranch: string | null;
  status: RepositoryStatus; statusMessage: string | null;
  allowedBashCommands: string[]; sizeBytes: string | null;   // BigInt como string
  lastFetchedAt: string | null; createdAt: string; updatedAt: string;
  taskCounts: Record<TaskStatus, number>;
}

interface Task {
  id: string; repositoryId: string; title: string; prompt: string;
  status: TaskStatus; statusReason: string | null; errorMessage: string | null;
  priority: number; baseBranch: string; branchName: string | null;
  model: string; permissionPreset: PermissionPreset;
  timeoutSeconds: number; maxTurns: number; attempt: number;
  activeMs: number; numTurns: number | null; costUsd: string | null; resultSummary: string | null;
  worktreeAvailable: boolean; pendingApprovals: number;
  lastEventId: string | null; lastSeq: number;
  queuePosition: number | null;            // só em queued (1 = próxima)
  blockedBy: AdmissionReason | null;       // só em queued
  allowedActions: Array<'edit' | 'enqueue' | 'dequeue' | 'cancel' | 'retry' | 'delete'>; // derivado da máquina de estados
  createdAt: string; queuedAt: string | null; startedAt: string | null; finishedAt: string | null; updatedAt: string;
}

interface Approval {
  id: string; taskId: string; kind: 'tool_permission' | 'question'; status: ApprovalStatus;
  toolName: string | null;
  request: { tool?: string; input?: Record<string, unknown>; reason?: string;
             questions?: Array<{ question: string; header: string; multiSelect: boolean;
                                 options: Array<{ label: string; description: string }> }> };
  response: { decision?: 'approve' | 'deny'; message?: string; answers?: Record<string, string> } | null;
  expiresAt: string; respondedAt: string | null; createdAt: string;
}

interface AgentEvent<T = Record<string, unknown>> {
  id: string; type: string; taskId: string | null; repositoryId: string | null;
  seq: number | null; createdAt: string; payload: T;
}

interface SystemMetrics {
  sampledAt: string;
  cpu: { percent: number; percentAvg: number; cores: number };
  memory: { totalMb: number; availableMb: number; usedPercent: number };
  agents: { running: number; waitingApproval: number; queued: number;
            hardLimit: number; effectiveLimit: number; perUserLimit: number;
            estimatedMbPerAgent: number };
  admission: { allowed: boolean; reason: AdmissionReason };
  perAgent: Array<{ taskId: string; cpuPercent: number; rssMb: number }>; // só tasks do usuário (ADMIN vê todas)
}
```

### 9.3 Repositórios

#### `POST /agents/repositories` — AG, throttle 10/h
Request:
```json
{ "gitUrl": "https://github.com/usuario/projeto.git", "name": "projeto", "allowedBashCommands": ["Bash(npm test:*)"] }
```
`name` e `allowedBashCommands` são opcionais.
Response `202`: `Repository` com `status: "cloning"`. O progresso chega por `repository.status_changed`.
Erros: `400 VALIDATION_ERROR | GIT_URL_NOT_ALLOWED` · `409 REPOSITORY_ALREADY_EXISTS`.

#### `GET /agents/repositories` — AG
Query: `page`, `perPage`. Response `200`: `{ items: Repository[], pagination }` (mais recentes primeiro).

#### `GET /agents/repositories/:id` — AG
Response `200`: `Repository`. Erros: `404`.

#### `PATCH /agents/repositories/:id` — AG
Request (todos opcionais): `{ "name": "novo-nome", "allowedBashCommands": ["Bash(npm run lint)"] }`
Response `200`: `Repository`. Erros: `400` · `404`.

#### `GET /agents/repositories/:id/branches` — AG
Response `200`: `{ "defaultBranch": "main", "branches": ["main", "develop", "feature/x"] }` (remotas, lidas do clone local).
Erros: `404` · `409 REPOSITORY_NOT_READY`.

#### `POST /agents/repositories/:id/fetch` — AG, throttle 30/h
Atualiza as refs remotas. Response `202`: `Repository` com `status: "fetching"`. Erros: `404` · `409 REPOSITORY_NOT_READY` (já em `cloning`/`fetching`).

#### `DELETE /agents/repositories/:id` — AG
Apaga o repositório, suas tasks e eventos (cascade) e os arquivos (clone e worktrees). Response `200`: `{ "deleted": true }`.
Erros: `404` · `409 REPOSITORY_HAS_ACTIVE_TASKS`.

### 9.4 Tasks

#### `POST /agents/tasks` — AG, throttle 60/h
Request:
```json
{
  "repositoryId": "41aa…",
  "title": "Corrigir validação do login",
  "prompt": "O endpoint POST /auth/login aceita e-mail sem domínio. Corrija e adicione teste.",
  "baseBranch": "develop",
  "model": "claude-opus-5-5",
  "permissionPreset": "safe",
  "timeoutSeconds": 3600,
  "maxTurns": 200,
  "priority": 0,
  "autoStart": true
}
```
Obrigatórios: `repositoryId`, `title` (1–200 caracteres), `prompt` (1–20 000 caracteres). Padrões: `baseBranch` = `defaultBranch`
do repositório, `model` = `AGENTS_DEFAULT_MODEL`, `permissionPreset` = `safe`, `timeoutSeconds` = `AGENTS_TASK_TIMEOUT_S`
(60–86 400), `maxTurns` = `AGENTS_MAX_TURNS` (1–1000), `priority` = 0 (−10 a 10), `autoStart` = `true`.
Response `201`: `Task` (`status: "queued"` ou `"pending"`).
Erros: `400 VALIDATION_ERROR | MODEL_NOT_ALLOWED` · `403 PRESET_NOT_ALLOWED` · `404` (repositório) · `409 REPOSITORY_NOT_READY` · `422 BRANCH_NOT_FOUND`.

#### `GET /agents/tasks` — AG
Query: `repositoryId?`, `status?` (lista separada por vírgula), `page`, `perPage`. Ordem: `createdAt DESC`.
Response `200`: `{ items: Task[], pagination }`.

#### `GET /agents/tasks/:id` — AG
Response `200`: `Task & { approvals: Approval[] }` (aprovações pendentes). Erros: `404`.

#### `PATCH /agents/tasks/:id` — AG
Só em `pending`. Request (todos opcionais): `title`, `prompt`, `baseBranch`, `model`, `permissionPreset`, `timeoutSeconds`, `maxTurns`, `priority`.
Exceção: `priority` também pode mudar em `queued`.
Response `200`: `Task`. Erros: `400` · `403 PRESET_NOT_ALLOWED` · `404` · `409 TASK_NOT_EDITABLE` · `422 BRANCH_NOT_FOUND`.

#### Ações de estado — AG
Todas sem body e com response `Task`. O estado final também chega por `task.status_changed`.

| Método | Rota | Transição | Sucesso | Erros |
|---|---|---|---|---|
| POST | `/agents/tasks/:id/enqueue` | `pending → queued` | `200` | `404`, `409 INVALID_TRANSITION`, `409 REPOSITORY_NOT_READY` |
| POST | `/agents/tasks/:id/dequeue` | `queued → pending` | `200` | `404`, `409 INVALID_TRANSITION` |
| POST | `/agents/tasks/:id/cancel` | `pending/queued → cancelled` (imediato); `running/waiting_approval → cancelled` (assíncrono) | `200` imediato / `202` assíncrono; repetir enquanto cancela → `202` | `404`, `409 INVALID_TRANSITION` (terminal) |
| POST | `/agents/tasks/:id/retry` | `failed/cancelled → queued` | `200` | `404`, `409 INVALID_TRANSITION`, `409 REPOSITORY_NOT_READY` |

#### `DELETE /agents/tasks/:id?deleteBranch=false` — AG
Só em `pending`, `done`, `failed` ou `cancelled`. Remove o worktree e, com `deleteBranch=true`, a branch. Apaga eventos e aprovações.
Response `200`: `{ "deleted": true }`. Erros: `404` · `409 TASK_ACTIVE`.

#### `GET /agents/tasks/:id/events?afterSeq=0&limit=200` — AG
Histórico paginado por `seq` (`limit` máximo 1000).
Response `200`:
```json
{ "events": [ { "id": "1026", "type": "task.status_changed", "taskId": "8b0c…", "repositoryId": "41aa…", "seq": 1,
                "createdAt": "…", "payload": { "from": null, "to": "queued", "actor": "user", "attempt": 0 } } ],
  "nextAfterSeq": 1, "hasMore": false, "lastEventId": "1026" }
```
Use `lastEventId` como cursor do SSE. Erros: `404`.

#### `GET /agents/tasks/:id/changes` — AG
Arquivos alterados na branch da task em relação à base, incluindo alterações ainda não commitadas no worktree.
Response `200`:
```json
{ "branch": "agent/8b0c1d2e-corrigir-validacao", "baseBranch": "develop", "committed": false,
  "files": [ { "path": "src/modules/auth/dto/login.dto.ts", "status": "modified", "additions": 3, "deletions": 1 } ] }
```
Erros: `404` · `409 WORKTREE_UNAVAILABLE`.

#### `GET /agents/tasks/:id/diff?path=<arquivo>` — AG
Response `200` `text/plain; charset=utf-8`: diff unificado (todo o diff, ou só de `path`), limitado a 1 MB com a linha final
`# diff truncado` quando ultrapassar. `path` é validado para ficar dentro do worktree.
Erros: `400` (path inválido) · `404` · `409 WORKTREE_UNAVAILABLE`.

### 9.5 Aprovações

#### `GET /agents/approvals?status=pending&taskId=` — AG
Response `200`: `{ items: Approval[], pagination }`, com as mais antigas primeiro quando `status=pending`.

#### `POST /agents/approvals/:id/respond` — AG, throttle 120/min
Request para `kind = tool_permission`:
```json
{ "decision": "approve", "message": "ok", "updatedInput": { "command": "npm test -- --runInBand" } }
```
Também pode ser `{ "decision": "deny", "message": "Não rode migrations" }`.
Request para `kind = question`:
```json
{ "answers": { "Qual banco usar nos testes?": "Postgres" }, "message": "opcional" }
```
Na pergunta, a chave é o texto de `question` e o valor é o `label` escolhido (vários labels separados por vírgula quando
`multiSelect`; _a confirmar_ contra o formato do SDK).
Response `200`: `{ "approval": Approval, "task": Task }`.
Erros: `400 VALIDATION_ERROR | APPROVAL_RESPONSE_INVALID` · `404` · `409 APPROVAL_ALREADY_RESOLVED | APPROVAL_NOT_ACTIVE`.

### 9.6 Eventos (tempo real)

#### `GET /agents/events/stream` — AG (SSE, `text/event-stream`)
Query (lida com `@Query('x')`, não com DTO de classe):
- `taskId?` e `repositoryId?` (filtros);
- `lastEventId?` (cursor inicial);
- `api_key?` (alternativa ao header, para `EventSource` nativo).

Header: `Last-Event-ID` (tem precedência sobre `lastEventId`).

Formato no fio: todos os eventos usam o tipo padrão `message`. O tipo real vai em `data.type`, então o cliente precisa de um
único listener. Eventos persistidos têm `id:`; os de controle (`stream.*`) não têm.
```
retry: 2000

id: 1042
data: {"id":"1042","type":"agent.command","taskId":"8b0c…","repositoryId":"41aa…","seq":17,"createdAt":"2026-10-19T22:10:05.123Z","payload":{"toolUseId":"toolu_01…","command":"npm test","description":"Rodar testes"}}

data: {"type":"stream.ready","payload":{"replayed":12,"lastEventId":"1042"}}

: ping
```
Erros antes de abrir o stream (resposta HTTP comum): `401` · `403` · `404` (`taskId`/`repositoryId` de outro usuário) · `503`.
Encerramentos do servidor: `stream.resync_required` e `stream.reauth` (seção 7.4).

O catálogo completo de tipos e payloads está na seção 7.2.

### 9.7 Sistema e métricas

#### `GET /agents/system/metrics` — AG
Response `200`: `SystemMetrics` (9.2). `perAgent` traz só as tasks do usuário; `ADMIN` vê todas.

#### `GET /agents/system/metrics/stream` — AG (SSE)
Um evento sem `id` a cada `AGENTS_METRICS_INTERVAL_MS`: `data: {"type":"system.metrics","payload":SystemMetrics}`.
Também envia `system.pressure` quando o nível muda. Não há replay (são métricas efêmeras).

#### `GET /agents/system/config` — JWT + roles `ADMIN`
Response `200`: os valores efetivos das variáveis `AGENTS_*`, exceto segredos e caminhos absolutos:
```json
{ "enabled": true, "maxConcurrent": 2, "maxConcurrentPerUser": 2, "cpuHighWatermark": 75, "cpuResumeWatermark": 65,
  "memReserveMb": 1024, "memPerAgentMb": 800, "taskTimeoutSeconds": 3600, "approvalTimeoutSeconds": 86400,
  "defaultModel": "claude-opus-5-5", "allowedModels": ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"] }
```

---

## 10. Segurança

### 10.1 Modelo de ameaça (resumo)

O agente **executa código arbitrário** (comandos e scripts do repositório) na máquina do back-end. Isso pode acontecer por
erro do modelo ou por **prompt injection** vinda do conteúdo do repositório: um README ou comentário que manda o agente
ler o `.env` e enviar o conteúdo para fora. É a maior superfície de risco do sistema.

### 10.2 Execução de comandos

- **Bash exige aprovação** nos presets `safe` e `edits`, exceto a allowlist explícita do repositório. `autonomous` é só para `ADMIN` (D13).
- WebFetch e WebSearch exigem aprovação por padrão (são o canal mais simples para exfiltrar dados).
- `disallowedTools` com padrões sempre negados, como defesa adicional (não como barreira principal), por exemplo
  `Bash(curl *)`, `Bash(wget *)`, `Bash(ssh *)`, `Bash(scp *)`, `Bash(sudo *)`, `Bash(rm -rf /*)` (sintaxe exata _a confirmar_).
- **Rodar o back-end como usuário de sistema sem privilégios**, numa máquina dedicada ao runner. Não rodar como root e
  não rodar na mesma máquina de serviços com dados sensíveis, já que o agente roda com o mesmo usuário do processo Nest.
- **Isolamento forte (pós-v1, recomendado antes de abrir para mais usuários):** um container por task (worktree montado,
  rede bloqueada ou com proxy de allowlist, CPU e memória limitadas por cgroup) via `spawnClaudeCodeProcess`, ou um usuário
  de sistema separado para os agentes.
- Todas as chamadas git e de sistema usam `execFile` com array de argumentos. Nunca interpolar entrada do usuário em string de shell.

### 10.3 Segredos

- O `options.env` do SDK **substitui** o ambiente do subprocesso. Por padrão ele herdaria `process.env`, que contém
  `DATABASE_URL`, `JWT_SECRET`, `API_KEY` e `RESEND_API_KEY`. **O runner monta um ambiente por allowlist**: `PATH`,
  `HOME`, `LANG`, `TMPDIR`, `ANTHROPIC_API_KEY`, `GIT_TERMINAL_PROMPT=0` e, quando existir, a credencial git do repositório.
- O `.env` da aplicação continua legível pelo mesmo usuário de sistema. Por isso:
  - `AGENTS_DATA_DIR` fica **fora** da pasta da aplicação;
  - o hook `PreToolUse` nega caminhos fora do worktree nas ferramentas de arquivo;
  - o Bash, que poderia ler qualquer arquivo, passa por aprovação.

  O risco residual só desaparece com o isolamento da 10.2.
- `ANTHROPIC_API_KEY` nunca aparece em respostas nem em eventos. A redação (7.2) cobre ecos acidentais em saídas de comando.
- **Repositórios privados** (pós-v1 ou v1, conforme D5): token por repositório, cifrado em repouso com AES-256-GCM e uma chave
  `AGENTS_SECRETS_KEY`; passado ao git via `GIT_ASKPASS` ou `http.extraHeader` no momento do comando. **Nunca** embutido na URL
  salva, porque a URL fica em `.git/config` e o agente pode lê-la.
- `settingSources: []` (D12): impede que um repositório malicioso traga `.claude/settings.json` com hooks que executam
  comandos ou permissões amplas, e impede o uso das configurações pessoais do usuário de sistema.

### 10.4 Acesso ao sistema de arquivos e git

- Caminhos sempre derivados de UUID e verificados com `realpath` para ficarem dentro de `AGENTS_DATA_DIR` (inclusive o `?path=` do diff).
- Validação da URL de clone:
  - só `https://`;
  - sem `user:senha@`;
  - host que não resolva para IP privado, loopback ou link-local (evita SSRF, por exemplo contra `169.254.169.254`);
  - `GIT_ALLOW_PROTOCOL=https` bloqueia `file://`, `ext::` e `ssh` também no nível do git.
- Os hooks git do repositório não são copiados no clone. Mesmo assim, o runner usa `core.hooksPath=/dev/null` (ou equivalente
  no Windows) nos comandos git que ele mesmo executa (checkout, commit), para que um hook criado pelo agente no worktree não
  rode com os comandos do runner.
- Limites de disco: tamanho máximo de repositório (`AGENTS_MAX_REPO_SIZE_MB`, _a confirmar_ o valor) verificado após o
  clone; alerta quando o disco livre de `AGENTS_DATA_DIR` estiver abaixo de um limiar.

### 10.5 Permissões e acesso

- Nova role **`Agentes`**, criada pela migration e **não** incluída nas roles padrão do cadastro
  (`DEFAULT_USER_ROLES` em `src/modules/auth/repositories/user.repository.ts`). Só um `ADMIN` concede, via `/admin/users/:id/roles` (D4).
- Todo acesso filtra por `req.user.id`; os IDs são UUID; recurso de outro usuário → 404.
- `ADMIN` não ganha acesso às tasks de outros usuários na v1, exceto nas métricas agregadas.
- Rate limits específicos: criação de repositório (10/h), fetch (30/h), criação de task (60/h), resposta de aprovação (120/min).
- Os limites de custo por task são `maxTurns` e o timeout. Um teto em USD por task/dia por usuário fica _a confirmar_ conforme o suporte do SDK.
- Prompts, saídas e trechos de código do repositório ficam gravados no Postgres (Neon). Considerar uma política de
  retenção (D16) e o fato de que o banco passa a guardar código de terceiros.

---

## 11. Riscos, decisões em aberto e perguntas

### 11.1 Riscos

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| R1 | Hospedagem atual desconhecida; a feature precisa de **disco persistente, git, binário do agente e processos longos** (incompatível com serverless ou disco efêmero) | bloqueante | D3; `AGENTS_ENABLED=false` mantém o deploy atual; runner numa VM dedicada |
| R2 | O agente executa código no mesmo host e com o mesmo usuário da API | alto (vazamento de segredos e do banco) | 10.2 e 10.3; máquina dedicada; isolamento forte antes de multiusuário |
| R3 | Custo de API do modelo em tasks longas | médio | `maxTurns`, timeout, `costUsd` visível por task, limite por usuário |
| R4 | Mudanças no Agent SDK (API recente, binário nativo por plataforma) | médio | Fixar a versão; `AgentRunner` como porta; testes contra o `FakeRunner` |
| R5 | Retomada após reinício depende de arquivos de sessão em disco | médio | Fallback para `failed` com `server_restart`; persistir `HOME` do usuário de sistema |
| R6 | Uso de disco (clones, worktrees, `node_modules` instalados pelo agente) | médio | Retenção de worktrees, limite de tamanho, alerta de disco |
| R7 | Neon: latência e limite de conexões com inserts frequentes de eventos; suspensão por inatividade | baixo/médio | Writer único com lote; o scheduler não consulta o banco sem slot livre |
| R8 | Cookies `partitioned` + SSE cross-site e expiração do JWT a cada 1 h no meio do stream | médio (UX) | `stream.reauth` + reconexão com `Last-Event-ID`; cliente fetch-based |
| R9 | Prompt injection a partir do conteúdo do repositório | alto | Aprovações, negação de rede por padrão, `settingSources: []`, redação |
| R10 | Uma instância só (sem alta disponibilidade) | baixo para uso pessoal | Advisory lock; recuperação no boot |
| R11 | Agente em `waiting_approval` segura um slot por muito tempo | médio | Timeout de aprovação; D8 (suspender e retomar por sessão fica para depois da v1) |

### 11.2 Decisões em aberto (com recomendação)

| # | Decisão | Opções | Recomendação |
|---|---|---|---|
| D1 | Runtime do agente | Claude Agent SDK · CLI direto · agente próprio com a Claude API · outro provedor | **Claude Agent SDK** |
| D2 | Modelo padrão | `claude-opus-5-5` · `claude-sonnet-5-5` (mais barato) · escolha por task | `claude-opus-5-5` como padrão, com escolha por task dentro da allowlist |
| D3 | Onde o runner roda | mesmo servidor da API · VM dedicada · máquina local do usuário | **VM ou máquina dedicada com disco persistente** |
| D4 | Quem pode usar | só `ADMIN` · role `Agentes` concedida por admin · todos no cadastro | **Role `Agentes` concedida por admin** |
| D5 | Repositórios privados na v1 | não (só públicos) · token por repositório cifrado | Depende do seu uso (pergunta P2) |
| D6 | Fila | Postgres · pg-boss · BullMQ/Redis | **Postgres** |
| D7 | Tempo real | SSE · WebSocket | **SSE** |
| D8 | `waiting_approval` ocupa slot | sim · não · suspender e retomar a sessão | **Sim na v1** |
| D9 | Aprovação sem resposta | falhar após `AGENTS_APPROVAL_TIMEOUT_S` · negar e seguir · esperar para sempre | **Falhar após 24 h** |
| D10 | Retry | reaproveitar branch e worktree · recomeçar da base | **Reaproveitar** (o agente vê o trabalho anterior) |
| D11 | Commit automático em `done` | sim · não | **Sim** (o trabalho sobrevive à limpeza do worktree) |
| D12 | Carregar `CLAUDE.md` e settings do repositório | `settingSources: []` · `["project"]` | **`[]`** por segurança. Custo: o agente não lê as instruções do repositório automaticamente; dá para injetar o `CLAUDE.md` no prompt como texto (_a confirmar_) |
| D13 | Preset `autonomous` | não existe · só `ADMIN` · qualquer usuário com a role | **Só `ADMIN`** |
| D14 | Reinício do servidor durante a execução | retomar automaticamente (1 vez) · sempre falhar | **Retomar uma vez** |
| D15 | Recurso de outro usuário | 404 · 403 (como o financeiro) | **404** |
| D16 | Retenção de eventos e worktrees | para sempre · N dias | Worktrees: 7 dias; eventos: enquanto a task existir |
| D17 | IDs das tabelas novas | UUID · SERIAL (como o resto) | **UUID** (+ BigInt nos eventos) |
| D18 | Streaming token a token | v1 · depois | **Depois** |

### 11.3 Perguntas para você

1. **P1 (D3):** onde o back-end roda hoje e onde o runner vai rodar? A máquina tem disco persistente e posso instalar git e o binário do agente?
2. **P2 (D5):** os repositórios que você vai importar são públicos ou privados (GitHub)? Se privados, a v1 precisa de token por repositório?
3. **P3 (D4):** a feature é só para você (ADMIN) ou para outros usuários da plataforma? A resposta muda o nível de isolamento exigido (10.2).
4. **P4 (D1/D2):** o agente será o Claude (via Agent SDK)? Qual modelo padrão: `claude-opus-5-5` (mais capaz) ou `claude-sonnet-5-5` (mais barato)? Há orçamento por task ou por mês?
5. **P5 (D11):** além do commit local, você quer push da branch ou PR automático numa versão futura? Isso define se a v1 já guarda credencial com escrita.
6. **P6:** quais máquinas e limites você imagina, por exemplo quantos agentes simultâneos e quanta RAM? Serve para calibrar os padrões da seção 2.4.
7. **P7 (D9/D8):** aprovações costumam ser respondidas na hora ou você quer deixar tasks esperando por horas? Isso decide se vale suspender a sessão para liberar slot.
8. **P8 (D12):** os repositórios têm `CLAUDE.md` ou configurações que o agente deveria seguir?

---

## 12. Plano de implementação

Cada fase termina com algo **executável e testável**, entra atrás de `AGENTS_ENABLED` e não altera o comportamento das
rotas existentes. Testes unitários seguem o padrão atual (Jest + mocks, `src/**/*.spec.ts`). Testes de git usam um
repositório bare **local** criado em diretório temporário. Para isso, `GIT_ALLOW_PROTOCOL` e a validação de URL aceitam
`file://` só quando `NODE_ENV=test`.

### Fase 0: Fundação do módulo
- `AgentsModule` vazio registrado no `AppModule`; `agents.config.ts` com leitura e validação das variáveis (falha no boot se
  habilitado sem `AGENTS_DATA_DIR`); guard que responde 503 com o módulo desligado.
- Migration `add_agent_repositories` só com a role `Agentes` (ou já com a tabela; ver fase 1).
- **Aceite:** com `AGENTS_ENABLED=false`, `GET /agents/system/config` → 503 e todos os testes existentes continuam como antes.
  Com `true` e sem `AGENTS_DATA_DIR`, o boot falha com mensagem clara. Usuário sem a role → 403.

### Fase 1: Repositórios (clone)
- Tabela `agent_repositories`; `GitService` (`execFile`, timeouts, protocolo restrito); endpoints da seção 9.3; clone em segundo
  plano; validação de URL (https, sem credenciais, sem IP privado).
- Eventos ainda só no `Logger` (a persistência vem na fase 3).
- **Aceite:** `POST` de um repositório público → `202 cloning` → `ready` com `defaultBranch` e `branches`. URLs `file://`,
  `http://`, `https://user:pw@…` e `https://127.0.0.1/…` → 400. Repositório de outro usuário → 404. `DELETE` remove o diretório.
  Testes unitários do validador de URL e do `GitService` (contra um bare repo local).

### Fase 2: Tasks e máquina de estados (sem execução)
- Tabela `agent_tasks`; `TaskStateMachine` com a tabela da seção 4.2; endpoints da seção 9.4, exceto `changes`/`diff`;
  `allowedActions` derivado da máquina.
- **Aceite:** teste unitário que percorre **todas** as combinações de status × ação (permitidas → sucesso; demais → `409
  INVALID_TRANSITION`). Teste de corrida: dois `cancel`/`dequeue` simultâneos → exatamente um vence. Os PATCH validam o body
  (sem `Partial<>`). Task de outro usuário → 404.

### Fase 3: Eventos persistidos e SSE
- Tabela `agent_events`; `EventsService` (writer único, publica após o commit, redação de segredos, truncamento); a máquina de
  estados e o `GitService` passam a emitir eventos; `GET /agents/tasks/:id/events`; `GET /agents/events/stream` com
  `Last-Event-ID`, replay, `stream.ready`, ping e `stream.reauth`.
- **Aceite:** `curl -N` no stream mostra `task.status_changed` ao enfileirar e cancelar. Teste: desconectar, gerar 5 eventos,
  reconectar com `Last-Event-ID` → recebe exatamente os 5, em ordem, sem duplicatas. Usuário B não recebe eventos do usuário A.
  Mais de 1000 eventos pendentes → `stream.resync_required`. O id BigInt sai como string.

### Fase 4: Scheduler, worktrees e FakeRunner
- `SchedulerService` com limite **fixo** (`AGENTS_MAX_CONCURRENT`, por usuário, cooldown) e advisory lock; `ProcessRegistry`;
  criação, reuso e limpeza de worktree (com mutex por repositório); `FakeRunner` que emite uma sequência roteirizada
  (mensagem, comando, arquivo alterado, resultado) e escreve um arquivo no worktree; watchdog de timeout e inatividade;
  cancelamento; `GET /changes` e `/diff`; cron de retenção.
- **Aceite:** enfileirar 5 tasks com limite 2 → no máximo 2 `running` em qualquer momento (verificado por eventos), as
  demais iniciam conforme as anteriores terminam. Cada task tem diretório e branch próprios; `changes` mostra o arquivo do
  FakeRunner. Cancelar durante a execução → `cancelled` em até 15 s e sem processo restante. Timeout curto → `failed/timeout`.
  Nenhum custo de API nesta fase.

### Fase 5: Runner real (Claude Agent SDK) sem aprovações
- `ClaudeAgentRunner`: `query()` com `cwd`, `model`, `maxTurns`, `env` por allowlist, `settingSources: []`, spawn próprio (PID,
  grupo de processos), hook `PreToolUse` de confinamento de caminho, hook `PostToolUse` → `agent.file_changed`; mapeamento
  `SDKMessage` → catálogo; `costUsd`/`numTurns`/`sessionId` gravados; auto-commit em `done`.
- Política temporária: só o preset `edits` sem Bash. Tudo que exigiria aprovação é **negado** com mensagem, até a fase 6.
- **Aceite:** task real ("adicione um comentário no README") num repositório de teste → `done`, commit na branch,
  `agent.message`/`agent.file_changed`/`agent.result` no stream, `costUsd` preenchido. Tentativa de ler `../../.env` →
  negada pelo hook (evento `agent.tool_result` com erro). Variáveis do servidor ausentes no ambiente do agente (teste com um
  comando de diagnóstico no FakeRunner e inspeção do `env` montado).

### Fase 6: Aprovações e perguntas
- Tabela `agent_approvals`; `canUseTool` → `approval.requested`/`agent.question`; transições `running ⇄ waiting_approval`;
  `POST /agents/approvals/:id/respond`; `GET /agents/approvals`; expiração pelo watchdog; presets `safe`, `edits` (com allowlist
  de Bash) e `autonomous` (só ADMIN).
- **Aceite:** preset `safe` + prompt que exige `npm test` → task em `waiting_approval` com o comando visível. Aprovar → volta a
  `running` e o resultado do comando aparece. Negar → o agente recebe a negativa e segue. Responder duas vezes → 409.
  `AskUserQuestion` respondida → o agente usa a resposta. Aprovação expirada → `failed/approval_timeout`. Cancelar em
  `waiting_approval` → `cancelled`.

### Fase 7: Métricas e limite dinâmico
- `MetricsService` (CPU por diferença de `os.cpus()`, `MemAvailable`/cgroup, árvore de processos por agente); `AdmissionService`
  com a fórmula da seção 5.3 (histerese, cooldown, memória crítica); `GET /agents/system/metrics`, SSE de métricas,
  `system.pressure`; `queuePosition` e `blockedBy` na task.
- **Aceite:** testes unitários da fórmula com amostras simuladas (CPU acima do HIGH bloqueia e só libera abaixo do RESUME;
  memória insuficiente reduz o `effectiveLimit`; cooldown respeitado). Com um `MetricsService` falso, uma task fica em `queued`
  com `blockedBy: "cpu_high"` e é admitida quando a CPU simulada cai. O stream de métricas emite no intervalo configurado.

### Fase 8: Recuperação após reinício e limpeza
- `RecoveryService` no boot (seção 6.7): processos órfãos, aprovações expiradas, retomada via `resume` ou falha, repositórios
  interrompidos, prune de worktrees; `AgentsCleanupService.purgeUser` chamado em `AuthService.deleteAccount` e `AuthService.delete`.
- **Aceite:** matar o servidor com a task em `running` → após o boot, a task vai para `queued (resumed_after_restart)` e
  conclui com `agent.session_started { resumed: true }`; na segunda vez, `failed/server_restart`. Nenhum processo do agente
  continua vivo após o boot (verificado por PID). Diretório órfão em `worktrees/` é removido. Excluir a conta remove as linhas
  e os arquivos do usuário.

### Fase 9: Endurecimento e documentação
- Rate limits da seção 10.5; limite de tamanho de repositório e alerta de disco; revisão da redação de segredos; atualização
  de `docs/backend/api.md`, `docs/backend/modelo-de-dados.md`, `docs/backend/arquitetura.md` e `CLAUDE.md`.
- **Aceite:** testes dos throttles. Repositório acima do limite → `error` com mensagem. Docs refletem os endpoints
  implementados (o contrato da seção 9 vira parte de `api.md`).

### Dependências entre fases

```mermaid
flowchart LR
    F0[F0 Fundação] --> F1[F1 Repositórios]
    F1 --> F2[F2 Tasks + estados]
    F2 --> F3[F3 Eventos + SSE]
    F3 --> F4[F4 Scheduler + worktrees + Fake]
    F4 --> F5[F5 Runner real]
    F5 --> F6[F6 Aprovações]
    F4 --> F7[F7 Métricas + limite dinâmico]
    F6 --> F8[F8 Recuperação]
    F7 --> F8
    F8 --> F9[F9 Endurecimento]
```

As fases 6 e 7 podem ser feitas em paralelo depois da 5 (a 7 só depende da 4). O front pode começar na fase 3, com
eventos reais e o FakeRunner a partir da 4, sem custo de API.
