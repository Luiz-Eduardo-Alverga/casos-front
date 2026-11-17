# Indicadores

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

"Premiação e metas do período" em `/painel/indicadores`, no menu como **Indicadores**. Mostra os
indicadores do colaborador em colunas (no celular, em abas), o resumo de premiação (valor
garantido e em aberto), o detalhe de cada indicador, a atualização de baseline e o recálculo
(individual ou de todos).

- Acesso à rota segue o prefixo `/painel` (`list-painel-dev`, em `canAccessPath`).
- Ver indicadores de outros colaboradores exige `list-indicadores-all` (seed em
  `db/scripts/seed-list-indicadores-all-rbac.sql`).

## Arquitetura

```text
components/indicadores/
├── index.tsx                         entrypoint (filtros, colunas, premiação, recálculo)
├── indicadores-coluna · -item · -mobile-tabs · -filtros · -skeleton
├── indicadores-premiacao.tsx         resumo de valores (computePremiacao em utils.ts)
├── indicadores-detalhe-dialog.tsx
└── indicadores-recalcular-todos-dialog.tsx
```

- Dados: API Soft Flow (RH) via `services/rh/*` → `/rh/colaboradores/indicadores`,
  `/rh/colaboradores/indicadores/atualizar-baseline`, `/rh/auxiliar/indicadores/{id}`; hooks em
  `hooks/rh/`.

## Lacunas do levantamento

- Não está no `contexto-projeto-softflow.md` original; regras de cálculo da premiação e das
  metas não foram levantadas.
- A página não usa `RequirePermission`; depende do bloqueio por prefixo `/painel`.
