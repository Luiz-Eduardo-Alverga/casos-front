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
- **Liberações:** próximas e últimas, com badge de tipo de liberação.
- **Painel de ideias** (mesma fonte de [`melhorias/`](../melhorias/README.md)).

Filtros: setor, produto, projeto e versão.

## Arquitetura

```text
components/minha-visão/          (pasta com acento no nome)
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

- Card novo: feature folder em `components/minha-visão/<card>/` com `index.tsx` + skeleton, hook
  `use-visao-*` e service em `services/sprint/`.

## Lacunas do levantamento

- A pasta `components/minha-visão/` tem acento no nome, diferente do resto do repositório.
  Renomear exige atualizar imports; não foi feito.
