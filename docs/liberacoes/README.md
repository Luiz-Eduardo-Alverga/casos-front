# Liberações

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

Registro de release de um produto: versão piloto, versão final, flags, checklist e os casos da
versão. Listagem em `/liberacoes` ("Registro de Liberação") e detalhe em `/liberacoes/[registro]`
com as abas:

- **Liberação:** identidade, versões, piloto, versão final, flags e encerrar ("fechar
  liberação", sem volta no fluxo normal).
- **Casos da versão:** casos vinculados, com **descrição gerada** por IA (release notes em
  streaming a partir do Assistant, usando o prompt do tipo `RELEASE_NOTES` de
  [`configuracoes/`](../configuracoes/README.md)).
- **Checklist:** itens carregados do checklist do produto (ver [`produtos/`](../produtos/README.md))
  e marcados por liberação.

Permissões: `list-release`, `create-release`, `edit-release`, `delete-release`; editar caso a
partir da aba exige `edit-case` ou `edit-report` (`hooks/liberacoes/use-liberacao-permissoes`).

## Arquitetura

```text
components/liberacoes/
├── index.tsx · liberacoes-tabela.tsx · tabela/ · layout/   listagem
├── filtros/            filtros com estado na URL (mappers, parsers, types)
├── cadastro/           modal de criação (schema, utils)
└── edicao/
    ├── index.tsx · liberacao-edit-form.tsx · -header · -skeleton · liberacao-nao-encontrada
    ├── abas/           adaptadores das três abas
    ├── liberacao/      cards da aba Liberação + fechar-liberacao-dialog
    ├── casos-versao/   linhas, descrição gerada, hook use-casos-versao
    └── checklist/      linhas e skeleton
```

- Dados: API Soft Flow via `services/sprint/*` (liberações, itens, checklist, fechar, versões)
  e hooks em `hooks/liberacoes/`.
- Release notes: `app/api/release-notes/[liberacaoId]` (+ `/stream`), com `withPermission("edit-release")`,
  repassando ao Assistant (`NEXT_PUBLIC_ASSISTANT_API_URL`).

## O que é reaproveitável

- `VersaoChip` e `LiberacaoStatusBadge` para mostrar versão/estado em outras telas.
- O padrão de streaming de texto gerado (`use-generate-release-notes-stream`).

## Como estender

- Aba nova: adaptador em `edicao/abas/` + feature folder em `edicao/<feature>/`, seguindo
  [`projetos/`](../projetos/README.md).
- Flag nova: `edicao/liberacao/flags-card.tsx` e schema em `edicao/schema.ts`.

## Lacunas do levantamento

- Regras de "fechar liberação" (o que trava depois) e a relação piloto → final não foram
  detalhadas.
- Seed de permissões: `db/scripts/seed-liberacoes-rbac.sql`.
