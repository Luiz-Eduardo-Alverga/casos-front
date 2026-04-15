# Modal Produtos do Desenvolvedor

Esta pasta contém o modal **Produtos do Desenvolvedor** (Figma: estados `375:517` e `376:312`) e seus subcomponentes.

## Entrypoint

- `index.tsx`: exporta `PainelKanbanProdutosModal` (com hooks, estado e handlers).

## Subcomponentes

- `produtos-modal-add-form.tsx`: formulário de adicionar (reusa `CasoFormProduto` e `CasoFormVersao`).
- `produtos-modal-list.tsx`: lista com `dnd-kit` + container de scroll.
- `sortable-row.tsx`: linha ordenável + modo edição inline.
- `produtos-modal-skeleton.tsx`: skeleton exibido durante o loading.

## Utilitários/Tipos

- `utils.ts`: helpers (`parseVersaoFieldValue`, `toSortableId`).
- `types.ts`: tipos do feature.

