# Reports

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo. Protótipo da refatoração da
> listagem em [`prototipo/`](prototipo/) (referência visual; onde diverge do código, o código vence).

## O que é

Report é a ocorrência que vem de cliente ou suporte, com SLA e análise. É um caso com
`tipo_abertura = REPORT` no backend `projeto-casos` (ver [`casos/`](../casos/README.md)). A tela
`/reports` é a fila de análise de QA / Product Owner; `/reports/novo` é a abertura pelo suporte.

- **Fila** (`/reports`, `list-report`): lista ou tabela + detalhe, filtros, ordenação,
  totalizador e transferência de casos em lote.
- **Ações de análise:** aprovar, marcar incompleto e suspender, com anotação. Aprovar reabre o
  report quando ele estava Incompleto/Suspenso.
- **Abertura** (`/reports/novo`, `create-report`): produto, categoria, prioridade/SLA, ocorrência
  inicial, PO/QA, responsável de suporte e vínculo com cliente. Data limite em dias úteis, fuso
  de São Paulo.
- **Edição:** `/casos/[id]` reutiliza a tela de caso com layout de report
  (`CasoOuReportEditView`); acesso com `list-case` ou `list-report`.
- **Discord:** report concluído gera aviso (`lib/discord/build-report-concluido-message.ts`).

## Arquitetura

```text
components/reports/
├── index.tsx              entrypoint da fila (filtros, ações, lista/tabela)
├── filtros/               filtros, chips, mappers e parsers da query string
├── hooks/                 dados, filtros locais e ações (use-report-acoes, use-reports-acoes-modais)
├── lista/ · tabela/       as duas visualizações + skeletons
├── detalhe/               painel de detalhe do report
├── modais/                aprovar e anotação de ação
└── layout/                badges, ordenação, totalizador
components/reports-form/   peças do formulário de abertura
```

- Dados: `hooks/casos/use-projeto-memoria` (listagem), `use-update-caso`,
  `use-bulk-update-casos`, `anotacoes/use-create-anotacao`; catálogos de categorias, setores e
  versões.
- Ações mudam o status do caso: aprovar (20/22), incompleto (21), suspender (23). Os ids ficam em
  constantes (`CASO_STATUS_*_ID`).

## O que é reaproveitável

- `use-report-acoes` concentra as rotinas de análise; a tela de edição usa as mesmas.
- O padrão filtros → `*-mappers.ts` / `*-parsers.ts` com estado na URL serve para outras filas.

## Como estender

- Ação nova de análise: rotina em `hooks/use-report-acoes.tsx` + modal em `modais/`.
- Filtro novo: tipo e parser em `filtros/`, refletido na chave da query.

## Lacunas do levantamento

- Os arquivos na raiz de `components/reports/` (`report-acao-anotacao-modal.tsx`,
  `report-badges.tsx`, `use-report-acoes.tsx`) são pontes de re-export para as subpastas; código
  novo importa direto da subpasta.
- Regras de SLA (dias úteis, feriados) não foram levantadas aqui.
