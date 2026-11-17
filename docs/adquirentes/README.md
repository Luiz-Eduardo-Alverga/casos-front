# Adquirentes (Kanban de status e página pública)

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo. Protótipo da página pública em
> [`prototipo/painel_de_adquirentes.tsx`](prototipo/painel_de_adquirentes.tsx) (estava solto na
> raiz do repositório; é referência visual com dados mockados, não é importado pelo app). O
> cadastro em si fica em [`cadastros-smart/`](../cadastros-smart/README.md).

## O que é

Duas telas sobre o andamento de homologação/integração das adquirentes (Cielo, Rede, Stone…):

1. **Kanban Adquirentes** (`/cadastros/adquirentes/status`, `list-acquirer`): board com as
   colunas Em homologação, Em desenvolvimento, Em teste, Em certificação e Concluído (enum
   `status_type`). Cada card mostra versão atual, próxima versão e dispositivos; o sheet de
   detalhe edita o status.
2. **Página pública** (`/adquirentes`, fora do shell autenticado): lista as adquirentes com
   filtros de busca e status (na query string), cards de status e um sheet com a documentação
   pública de cada adquirente.

## Arquitetura

```text
components/cadastros/status-adquirentes/
├── index.tsx
├── kanban/   board, corpo do card, colunas (status-adquirentes-columns.ts), mapeamento
├── fields/   campos do sheet (adquirente, status, versões, dispositivos)
├── sheet/    sheet de detalhe/edição
└── layout/   coluna vazia, skeleton
components/public/
├── adquirentes-page.tsx
└── adquirentes/   header, filtros, card de status, sheet de documentação, skeletons
```

- Kanban: `/api/db/acquirer-status` e `/api/db/acquirers` (Drizzle). Usa a camada genérica de
  Kanban de [`painel-desenvolvedor/`](../painel-desenvolvedor/README.md) (`components/kibo-ui/kanban`).
- Pública: `/api/public/acquirers` e `/api/public/acquirers/[id]/documentacao`, sem sessão, com
  rate limit (120 req/min), cache público (`s-maxage=300`) e ids opacos
  (`PUBLIC_OPAQUE_ID_SECRET`; sem ele a rota não responde). Hooks em `hooks/publico/`.
- Documentação pública vem do módulo [`documentacao/`](../documentacao/README.md): o documento
  com status `publicado`, categoria de slug `configuracao` e vínculo (`doc_links`) com
  `entityType = "acquirer"` para aquela adquirente (`getPublishedConfigDocByAcquirer` em
  `lib/db/docs.ts`).

## Lacunas do levantamento

- `status-adquirentes-columns.ts` usa cores cruas do Tailwind (`bg-blue-400`, `bg-blue-100`…),
  contra a regra de tokens de [`design-system.md`](../design-system.md). Migrar para tokens
  quando a tela for mexida.
