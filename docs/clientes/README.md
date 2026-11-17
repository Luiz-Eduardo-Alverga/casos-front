# Clientes

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

Consulta dos clientes Softcom (empresas). Em `/clientes` a busca por nome é **obrigatória** para
listar (sem termo, o card mostra "Busque um cliente"). O detalhe em `/clientes/[id]` mostra dados
gerais, contato, endereço, produtos/URLs e as abas **Casos** e **Tickets** do cliente; o ticket
abre num sheet de detalhe.

"Ticket" só existe aqui, como aba do cliente; caso nunca é chamado de ticket (ver
[`casos/decisoes.md`](../casos/decisoes.md)).

## Arquitetura

```text
components/clientes/
├── index.tsx · clientes-table.tsx · -skeleton   busca + tabela
└── visualizacao/
    ├── index.tsx · cliente-view-header · -skeleton · cliente-nao-encontrado
    └── sections/   cards (dados gerais, contato, endereço, produtos/URLs),
                    abas de casos e tickets, ticket-detalhe-sheet
```

- Dados: API Soft Flow. Busca em `/api/clientes` (`hooks/clientes/use-softcom-clientes`),
  detalhe em `catalogos/use-cliente-by-id`, produtos/URLs em `/api/clientes/produtos-enderecos-url`,
  casos via `projeto-memoria`, tickets em `/api/tickets` (`hooks/tickets/`).
- Busca com debounce (`shared/use-debounced-value`).

## O que é reaproveitável

- `ticket-status-config.ts`, `ticket-flag-badges.tsx` e `cliente-situacao-badge-config.ts` para
  mostrar estado de ticket/cliente em outras telas.

## Como estender

- Seção nova no detalhe: card em `visualizacao/sections/` e entrada no `visualizacao/index.tsx`.

## Lacunas do levantamento

- A página não usa `RequirePermission` e `canAccessPath` não restringe `/clientes`: qualquer
  usuário logado acessa. Confirmar se é intencional.
