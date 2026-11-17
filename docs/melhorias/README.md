# Melhorias

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

Tela de ideias e melhorias em `/melhorias` (`list-improvement`): "acompanhe ideias e melhorias do
painel por produto, setor e período". Tabela filtrável com badges de situação e modal de
**avaliação** (`edit-improvement`), que define a melhoria como aprovada ("SIM"), recusada ("NÃO")
ou pendente (vazio).

As ideias são as mesmas do card "Painel de ideias" de [`minha-visao/`](../minha-visao/README.md).

## Arquitetura

```text
components/melhorias/
├── index.tsx              entrypoint
├── filtros/               filtros com estado na URL (mappers, parsers, types)
├── tabela/                tabela, linha, badges de situação, skeleton
├── avaliar-modal/         modal de avaliação
└── melhoria-status.ts     normalização do status (SIM / NÃO / vazio)
```

- Dados: API Soft Flow via `/api/painel-ideias` (`services/painel-ideias/*`,
  `hooks/painel/use-painel-ideias`, `use-update-painel-ideia`).
- Permissões em `hooks/melhorias/use-melhoria-permissoes`; seed em
  `db/scripts/seed-melhorias-rbac.sql`.

## Como estender

- Status novo: ajustar `melhoria-status.ts` (o legado guarda texto livre, por isso a normalização).
