# Padrão — Componentes grandes (feature folder)

Quando um componente começa a ficar grande (muitas responsabilidades, muitos handlers, muito JSX), o padrão do projeto é **separar em subcomponentes** dentro de uma pasta de feature, parecido com o que já acontece em partes do `painel-kanban`.

## Quando aplicar

- Arquivo com **muito JSX** (difícil de escanear).
- Mistura de **UI + regras de negócio + hooks + utilitários** no mesmo arquivo.
- Muitos estados (`useState`) e callbacks (`useCallback`) no mesmo lugar.
- Reuso parcial desejável (ex.: `Row`, `List`, `Skeleton`, `Form`).

## Estrutura recomendada

Crie uma pasta em torno da feature e mantenha um **entrypoint** (geralmente `index.tsx`) que coordena hooks, estado e handlers.

Exemplo:

```
components/<area>/<feature>/
  index.tsx                 # entrypoint: hooks + estado + handlers + composição
  types.ts                  # tipos do feature (props, estados)
  utils.ts                  # helpers puros (sem React)
  <feature>-skeleton.tsx    # skeleton do layout
  <feature>-list.tsx        # lista/área rolável
  <feature>-row.tsx         # item/linha
  <feature>-form.tsx        # formulário/entrada de dados
  README.md                 # (opcional) nota rápida do feature
```

## Regras práticas

- **EntryPoint (`index.tsx`)**:
  - centraliza `useQuery`/`useMutation`, `useForm`, estado e side-effects
  - passa callbacks e dados para os subcomponentes
  - evita JSX profundo demais: priorize composição por subcomponentes

- **Subcomponentes**:
  - recebem props simples
  - não conhecem detalhes de cache/queryKey (deixe isso no entrypoint)
  - devem ser fáceis de testar/ler isoladamente

- **`utils.ts`**:
  - apenas funções puras (sem hooks/sem `window`)
  - bom lugar para parse/normalização (ex.: `parseVersaoFieldValue`)

- **Compatibilidade de imports**:
  - quando já existe um import espalhado no app, crie um “arquivo ponte” que re-exporta o componente (para evitar quebrar import paths).  
    Ex.: `components/.../painel-kanban-produtos-modal.tsx` pode virar somente:
    - `export { PainelKanbanProdutosModal } from "./produtos-modal";`

## Skeleton

Sempre que o componente fizer fetch inicial, prefira um skeleton que **imita a estrutura** (título, área de filtros, lista, rodapé), para reduzir layout shift e manter a UI consistente.

## DnD / Listas grandes

Em listas, garanta:

- container com altura fixa (ex.: `h-[360px]`) para permitir rolagem
- `ScrollArea` com `overflow-hidden` e conteúdo interno com padding para não “cortar” itens

