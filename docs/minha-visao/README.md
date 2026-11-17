# Painel Minha Visão

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

Visão gerencial em `/painel/minha-visao` (`list-minha-visao`): "acompanhamento diário de prazos,
liberações e carga de trabalho dos squads". Sem filtro selecionado, mostra "Selecione um
filtro". Cards:

- **KPIs** do recorte filtrado.
- **Casos para testar:** distribuição por responsável e por versão, com menu de contexto para
  ordenar campos.
- **Casos em produção.**
- **Prazos de clientes** pendentes.
- **Liberações** (card "Pipeline de liberações"): próximas e últimas, com badge de tipo de
  liberação. Cada item de "Próximas liberações" é um link que abre o registro da liberação em
  **nova aba**, no modo standalone (`buildLiberacaoHrefForNewTab` → `/liberacoes/{registro}?standalone=1`,
  o mesmo do ícone de nova aba da listagem de Liberações). Item sem `registro` não vira link.
- **Painel de ideias & feedback** (mesma fonte de [`melhorias/`](../melhorias/README.md)): tabela
  por mês e produto. A linha inteira abre a tela de Melhorias filtrada (produto, período e setor)
  em **nova aba**; no hover a linha escurece e aparece o ícone de link externo, que também é um
  link de verdade para teclado e leitor de tela (mesmo efeito das próximas liberações).
  O período do filtro é o **mês da competência** (`"2026/09"` → 01/09 a 30/09). A API agrupa por
  `competencia`; `dt_inicial`/`dt_final` de cada item são uma data solta (ou `null`) e só são
  usados se a competência não vier no formato `AAAA/MM`.

Filtros: setor, produto, projeto e versão.

## Arquitetura

```text
components/minha-visao/
├── minha-visao.tsx              entrypoint (filtros + grid de cards)
├── minha-visao-filtros.tsx · minha-visao-kpis.tsx · -skeleton · utils.ts
├── casos-para-testar/ · casos-em-producao/ · prazos-clientes/
└── liberacoes/ · painel-ideias/
```

- Dados: API Soft Flow via `services/sprint/get-visao-*` e hooks `hooks/painel/use-visao-*`
  (geral, distribuição, casos em produção, prazos de clientes, próximas/últimas liberações,
  painel de ideias).
- Cada card tem skeleton e empty state próprios.

## Como estender

- Card novo: feature folder em `components/minha-visao/<card>/` com `index.tsx` + skeleton, hook
  `use-visao-*` e service em `services/sprint/`.

## Histórico

- 2026-11-17: a pasta era `components/minha-visão/` (com acento); renomeada para
  `components/minha-visao/` e imports atualizados.
