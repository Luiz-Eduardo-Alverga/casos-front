# Auditoria de horas

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

"Acompanhamento de horas e inconsistências" em `/auditoria/horas-colaboradores` (título da tela:
Auditoria Squad). Analisa a produção (horas lançadas) por projeto e colaborador num período:
cards de resumo, tabela por colaborador e diálogo de detalhe, com classificação conforme / alerta
leve / alerta crítico / inconsistência (tokens `audit-*` em [`design-system.md`](../design-system.md)).

- `audit-user`: audita só a si mesmo.
- `audit-all-users`: escolhe qualquer colaborador (seed em
  `db/scripts/seed-audit-all-users-rbac.sql`). A mesma permissão libera o "ver como" do
  [`painel-desenvolvedor/`](../painel-desenvolvedor/README.md).

## Arquitetura

```text
components/auditoria-squad/
├── index.tsx                         entrypoint (filtros, resumo, tabela)
├── auditoria-filtros · -summary-cards · -colaboradores-table · -colaborador-row
├── auditoria-detail-dialog.tsx
└── skeletons, empty state, types.ts, utils.ts
```

- Dados: `hooks/producao/use-production-analysis` → `services/ia/get-production-analysis`, que
  chama **direto o Assistant** (`apiAssistant`, `GET /api/production-analysis` no host do
  Assistant). Catálogos de projetos e usuários vêm da API Soft Flow.

## Lacunas do levantamento

- A chamada ao Assistant sai do browser, sem passar por Route Handler do Next, diferente da regra
  de [`camada-de-dados/decisoes.md`](../camada-de-dados/decisoes.md) #1. A pasta vazia
  `app/api/ia/production-analysis/` sugere que um proxy foi planejado. Confirmar com o usuário.
- Os critérios de cada classificação (conforme, alertas, inconsistência) não foram levantados.
