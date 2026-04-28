# Arquitetura da API interna Postgres (`/api/db`)

Este documento descreve como a aplicação expõe dados do **Supabase (Postgres)** via **Next.js Route Handlers**, usando **Drizzle ORM**. Complementa o fluxo descrito em [PADRAO_REQUISICOES.md](./PADRAO_REQUISICOES.md), que cobre **front → API Next → API externa Soft Flow**.

## Objetivo

- Centralizar leitura/escrita no Postgres do projeto sem expor `DATABASE_URL` ao browser.
- Separar claramente rotas **proxy da API externa** (`/api/projeto-casos`, `/api/auxiliar/*`, …) das rotas que usam **Drizzle** (`/api/db/*`).

## Fluxo

```
Componente / Hook
    → fetchWithAuth (credentials: include)
    → Route Handler /api/db/...
    → requireSessionAuth (cookie casos_token)
    → Zod (validação)
    → lib/db/*.ts (Drizzle)
    → Postgres (Supabase)
```

## Usuários e permissões (RBAC)

Tabelas em [`db/schema.ts`](../db/schema.ts): `app_users` (espelho do usuário Soft Flow por `legacy_user_id` único), **`permission_modules`** (agrupamento da matriz na UI: slug, nome, ordem), **`permissions`** (`module_id`, `code`, `label`, `sort_order`, `description`), **`roles`**, **`role_permissions`**, **`user_roles`**. Permissões efetivas vêm sempre do join papel → permissão; usuários novos podem ficar sem papéis até atribuição em `user_roles` (lista de códigos vazia).

**Cliente:** [`services/db-api/rbac.ts`](../services/db-api/rbac.ts) — chamadas `fetchWithAuth` para CRUD de módulos, permissões, papéis, vínculos papel↔permissão e usuário↔papel.

- **Login:** [`POST /api/login`](../app/api/login/route.ts) autentica na Soft Flow, **só então** grava o cookie `casos_token` e responde com `user`, `permissions` (códigos) e `appUser` (resumo do registro em `app_users`), após upsert via [`lib/auth/sync-app-user.ts`](../lib/auth/sync-app-user.ts). Se o sync com o Postgres falhar, o cookie **não** é definido.
- **Re-sync:** `POST /api/db/users/sync` com sessão chama `GET /auth/me` na Soft Flow, valida com Zod ([`lib/validators/db/legacy-user.ts`](../lib/validators/db/legacy-user.ts)), faz o mesmo upsert e devolve `appUser` + `permissions`. O cliente pode usar [`services/db-api/sync-app-user.ts`](../services/db-api/sync-app-user.ts) (ex.: [`ProtectedRoute`](../components/protected-route.tsx) quando ainda não há permissões no `localStorage`).

## Telas de cadastro (UI)

Listagem com busca (`?search=`) e **novo registro** em modal estão em:

- **`/cadastros/adquirentes`** — `GET/POST` via `/api/db/acquirers`
- **`/cadastros/versoes`** — `GET/POST` via `/api/db/versions`
- **`/cadastros/dispositivos`** — `GET/POST` via `/api/db/devices`

A **listagem** (incluindo busca com debounce e `?search=` via `history.replaceState`) é feita no **cliente** com **`fetchWithAuth`** e **TanStack React Query** (chaves `db-acquirers`, `db-devices`, `db-versions`; adquirentes usa `expand=status`). As páginas RSC só repassam `searchParams` iniciais — sem `fetch` no servidor para esses dados. As **mutações** usam **Server Actions** em [`app/(dashboard)/cadastros/_actions/cadastros-db.ts`](../app/(dashboard)/cadastros/_actions/cadastros-db.ts) (`POST` na mesma API, cookies repassados), depois `revalidateTag` no servidor e invalidação das mesmas queries no cliente.

## Prefixo e convenções

| Item | Convenção |
|------|-----------|
| URL base | `/api/db` |
| Listagens (`GET` em `acquirers`, `devices`, `versions`) | Query opcional `search` — `ILIKE` case-insensitive; versões filtram por `name` ou por `id` (texto do UUID) |
| Recursos | kebab-case nos paths (`acquirer-status`, `compatible-devices`) |
| Autenticação | Sessão do login externo: cookie HttpOnly `casos_token` (mesmo das demais rotas Next) |
| Respostas de sucesso (JSON) | Envelope `{ "data": T }` via `jsonOk` |
| Respostas de erro (JSON) | Envelope `{ "error": { "message": string } }` via `jsonError` / `requireSessionAuth` |
| DELETE bem-sucedido | `204 No Content` sem corpo |

## Camadas (obrigatório para novos endpoints)

1. **`db/schema.ts`** — definição das tabelas/colunas alinhada ao banco; após alterar, rodar migração (`drizzle-kit generate` / aplicar SQL no Supabase).
2. **`lib/db/<recurso>.ts`** — apenas queries Drizzle (`select`, `insert`, `update`, `delete`). Sem `Response`, sem Zod.
3. **`lib/validators/db/<recurso>.ts`** — schemas Zod (`create` / `update`); tipos exportados com `z.infer`.
4. **`app/api/db/.../route.ts`** — orquestração: `withSession`, parse JSON, `safeParse` Zod, chama `lib/db`, retorna `jsonOk` / erros.

**Não** colocar SQL/Drizzle direto na rota além do necessário (orquestração).

### Utilitários compartilhados

| Arquivo | Função |
|---------|--------|
| [`lib/api-db/with-session.ts`](../lib/api-db/with-session.ts) | `withSession(handler)` — exige sessão ou `401`. |
| [`lib/api-db/responses.ts`](../lib/api-db/responses.ts) | `jsonOk`, `jsonError`, `handleDbRouteError`, `conflictOrNull` (Postgres `23503`/`23505` → `409`). |
| [`lib/api-db/parse.ts`](../lib/api-db/parse.ts) | `badRequestFromZod` — `400` a partir de `ZodError`. |
| [`lib/validators/db/shared.ts`](../lib/validators/db/shared.ts) | `uuidSchema`, `statusTypeSchema`, `isoDateStringSchema` (`YYYY-MM-DD`). |

## Autenticação e testes (Postman)

1. `POST /api/login` com `{ "usuario", "senha" }` — após sucesso na Soft Flow e sync com o Postgres, o cookie `casos_token` é definido e o corpo inclui `permissions` e `appUser`.
2. Chamadas a `/api/db/...` na mesma origem (Postman com cookie jar para `localhost`).

A Soft Flow deve expor **`GET /auth/me`** com o mesmo formato de objeto `user` do login; o servidor usa `NEXT_PUBLIC_API_BASE_URL` ([`lib/axios.ts`](../lib/axios.ts)).

Variável de ambiente necessária no servidor: **`DATABASE_URL`** (connection string do Postgres do Supabase).

## Documentação OpenAPI / Swagger

- **Especificação:** [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) em [`public/openapi.yaml`](../public/openapi.yaml) (servida em **`/openapi.yaml`**).
- **UI:** página **`/api-docs`** — [Swagger UI](https://github.com/swagger-api/swagger-ui) **5.31.0** via CDN (unpkg), com `credentials: include` no *Try it out* para enviar o cookie de sessão.
- Após alterar contratos da API, atualize o `openapi.yaml` junto com as rotas.

## Migrações Drizzle (Supabase)

O histórico foi consolidado em **uma** migração inicial — apenas `public` (sem `auth.users` / `profiles`), compatível com projeto Supabase novo.

| Comando / arquivo | Uso |
|-------------------|-----|
| `npm run db:migrate` | Gera novo SQL a partir de `db/schema.ts` (`drizzle-kit generate`). |
| `npm run db:apply` | Aplica migrações pendentes (`drizzle-kit migrate`), lendo `DATABASE_URL` de `.env.local` ou `.env`. |
| [`db/scripts/reset-supabase-dev.sql`](../db/scripts/reset-supabase-dev.sql) | Em dev: apaga tabelas da app, tipo `status_type` e schema `drizzle`. Rode no SQL Editor do Supabase se quiser recriar do zero; em seguida `npm run db:apply`. |

Conferência: `SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;` deve listar pelo menos `0000_initial_supabase_public` após o primeiro `db:apply` bem-sucedido.

## Rotas implementadas

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/api/db/ping` | Sessão + `select 1` (sanidade auth + banco) |
| POST | `/api/db/users/sync` | Upsert em `app_users` via `GET /auth/me` + lista de códigos de permissão |
| GET | `/api/db/permission-modules` | Lista módulos; `?search=`; `?expand=permissions` inclui permissões por módulo |
| POST | `/api/db/permission-modules` | Cria módulo |
| GET | `/api/db/permission-modules/[id]` | Detalhe; `?expand=permissions` |
| PATCH | `/api/db/permission-modules/[id]` | Atualização parcial |
| DELETE | `/api/db/permission-modules/[id]` | Remove (409 se houver permissões com `module_id`) |
| GET | `/api/db/permissions` | Lista; `?search=`; `?moduleId=` |
| POST | `/api/db/permissions` | Cria permissão (`moduleId`, `code`, `label`, …) |
| GET | `/api/db/permissions/[id]` | Detalhe; `?expand=module` |
| PATCH | `/api/db/permissions/[id]` | Atualização parcial |
| DELETE | `/api/db/permissions/[id]` | Remove |
| GET | `/api/db/roles` | Lista papéis; `?search=`; `?expand=permissionsCount` adiciona `permissionsCount` por papel |
| POST | `/api/db/roles` | Cria papel |
| GET | `/api/db/roles/[id]` | Detalhe |
| PATCH | `/api/db/roles/[id]` | Atualização parcial |
| DELETE | `/api/db/roles/[id]` | Remove |
| GET | `/api/db/roles/[id]/permissions` | Lista permissões do papel com dados do módulo |
| POST | `/api/db/roles/[id]/permissions` | Vincula `{ permissionId }` ou `{ permissionIds: uuid[] }` (lote) |
| PUT | `/api/db/roles/[id]/permissions` | Sincroniza matriz: recebe `{ permissionIds: uuid[] }` e retorna `{ added, removed, current }` |
| DELETE | `/api/db/roles/[id]/permissions/[permissionId]` | Remove vínculo |
| GET | `/api/db/app-users` | Lista `app_users`; `?search=`; inclui `roleName` (papel atual) |
| GET | `/api/db/app-users/[id]` | Detalhe; `?expand=roles` |
| GET | `/api/db/app-users/[id]/roles` | Lista papéis do usuário |
| POST | `/api/db/app-users/[id]/roles` | Atribui `{ roleId }` |
| PUT | `/api/db/app-users/[id]/roles` | Substitui perfil: remove vínculos atuais e atribui `{ roleId }` |
| DELETE | `/api/db/app-users/[id]/roles/[roleId]` | Remove atribuição |
| GET | `/api/db/acquirers` | Lista adquirentes |
| POST | `/api/db/acquirers` | Cria adquirente |
| GET | `/api/db/acquirers/[id]` | Detalhe |
| PATCH | `/api/db/acquirers/[id]` | Atualização parcial |
| DELETE | `/api/db/acquirers/[id]` | Remove |
| GET | `/api/db/devices` | Lista dispositivos |
| POST | `/api/db/devices` | Cria dispositivo |
| GET | `/api/db/devices/[id]` | Detalhe |
| PATCH | `/api/db/devices/[id]` | Atualização parcial |
| DELETE | `/api/db/devices/[id]` | Remove |
| GET | `/api/db/versions` | Lista versões |
| POST | `/api/db/versions` | Cria versão |
| GET | `/api/db/versions/[id]` | Detalhe |
| PATCH | `/api/db/versions/[id]` | Atualização parcial |
| DELETE | `/api/db/versions/[id]` | Remove |
| GET | `/api/db/acquirer-status` | Lista status de adquirentes |
| POST | `/api/db/acquirer-status` | Cria status |
| GET | `/api/db/acquirer-status/[id]` | Detalhe |
| PATCH | `/api/db/acquirer-status/[id]` | Atualização parcial |
| DELETE | `/api/db/acquirer-status/[id]` | Remove |
| GET | `/api/db/acquirer-status/[id]/compatible-devices` | Lista dispositivos compatíveis do status |
| POST | `/api/db/acquirer-status/[id]/compatible-devices` | Associa dispositivo (`deviceId`, `androidVersion` opcional) |
| DELETE | `/api/db/acquirer-status/[id]/compatible-devices/[deviceId]` | Remove associação |
| GET | `/api/db/acquirer-compatible-devices?statusId=` | Lista por `statusId` (equivalente ao GET aninhado) |
| POST | `/api/db/acquirer-compatible-devices` | Vincula com corpo `{ statusId, deviceId, androidVersion? }` |
| DELETE | `/api/db/acquirer-compatible-devices?statusId=&deviceId=` | Remove vínculo |

## Códigos HTTP

| Status | Uso |
|--------|-----|
| 401 | Sem cookie de sessão / não autenticado |
| 400 | JSON inválido ou falha de validação Zod |
| 404 | Recurso não encontrado |
| 409 | Violação de FK ou unique (Postgres) |
| 500 | Erro interno não mapeado |
| 502 | Resposta inválida da Soft Flow ou validação do usuário em `/api/db/users/sync` |
| 503 | Usado em `/api/db/ping` quando a query ao banco falha |

Corpos de erro seguem `{ "error": { "message": "..." } }` (exceto `204`).

## Enum `status_type` e migrações

- O tipo Postgres `status_type` e o `pgEnum` em `db/schema.ts` devem permanecer **alinhados**.
- Ao adicionar valor novo: alterar enum no SQL (migração), atualizar `statusTypeSchema` e `statusTypeEnum` em `schema.ts`, e documentar aqui.

## Checklist: novo endpoint `/api/db`

1. Ajustar banco (SQL / migração) e **`db/schema.ts`**.
2. Criar ou estender **`lib/db/<nome>.ts`** com funções puras Drizzle.
3. Criar **`lib/validators/db/<nome>.ts`** (create/update conforme necessário).
4. Adicionar **`app/api/db/.../route.ts`** usando `withSession`, Zod e `handleDbRouteError`.
5. Atualizar a tabela **Rotas implementadas** neste arquivo.
6. No front, seguir [PADRAO_REQUISICOES.md](./PADRAO_REQUISICOES.md): service com `fetchWithAuth` apontando para a nova URL.

## Escopo fora deste padrão (fases futuras)

- Paginação e filtros avançados em listagens.
- Row Level Security (RLS) com role por requisição.
- OpenAPI/Swagger gerado automaticamente.
