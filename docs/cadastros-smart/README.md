# Cadastros Smart

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo. Kanban de status e página pública
> das adquirentes em [`adquirentes/`](../adquirentes/README.md).

## O que é

Grupo "Cadastros Smart" da sidebar: CRUD de **Adquirentes** (`/cadastros/adquirentes`),
**Versões** (`/cadastros/versoes`) e **Dispositivos** (`/cadastros/dispositivos`) do contexto
Smart POS. São dados nativos do Softflow, no Postgres. Todo o grupo exige `list-acquirer`;
criar/editar/excluir usam `create-acquirer`, `edit-acquirer`, `delete-acquirer`.

Adquirente tem dispositivos compatíveis (`acquirer-compatible-devices`) e status (ver
[`adquirentes/`](../adquirentes/README.md)).

## Arquitetura

```text
components/cadastros/
├── adquirentes/ · versoes/ · dispositivos/   tabela + modal de novo/edição + skeletons por cadastro
├── cadastro-filtros-card.tsx · cadastro-listagem-card.tsx · cadastro-list-skeleton.tsx  (compartilhados)
├── status-filter-select.tsx · format-display.ts · types.ts
└── status-adquirentes/                       kanban (documentado em adquirentes/)
```

- Dados: `/api/db/acquirers`, `/api/db/versions`, `/api/db/devices`,
  `/api/db/acquirer-compatible-devices` (Drizzle; ver [`camada-de-dados/`](../camada-de-dados/README.md),
  seção "Telas de cadastro"). Hooks em `hooks/cadastros/` (`use-db-cadastro-list`,
  `use-db-cadastro-detail`, `use-create-*`).
- Listagem no cliente com TanStack Query e `?search=`; mutações por Server Actions em
  `app/(dashboard)/cadastros/_actions/cadastros-db.ts` + `revalidateTag` + invalidação das queries.
- Status das tabelas usa o enum Postgres `status_type` (`db/schema.ts`).

## O que é reaproveitável

- `CadastroFiltrosCard` + `CadastroListagemCard` + `CadastroListSkeleton`: base para qualquer
  cadastro simples novo.

## Como estender

- Cadastro novo: tabela em `db/schema.ts` + `lib/db/` + validador + rota `/api/db/...` (checklist
  em [`camada-de-dados/`](../camada-de-dados/README.md)), pasta em `components/cadastros/<nome>/`
  com tabela e modal, página em `app/(dashboard)/cadastros/<nome>/` e subitem em
  `CADASTROS_SUBITEMS` da sidebar.
