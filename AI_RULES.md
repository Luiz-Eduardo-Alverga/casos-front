# AI_RULES.md

## Stack do Projeto

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- React Query
- react-hook-form

---

## Regras Gerais

Sempre seguir os padrões definidos em:

- /docs/PADRAO_COMPONENTES.md
- /docs/PADRAO_ESPACAMENTOS.md

Esses documentos contêm os padrões completos de UI e layout da aplicação.

---

## Arquitetura de Componentes

- Componentes devem ter **responsabilidade única**
- Componentes complexos devem ser divididos
- Componentes relacionados ficam na mesma pasta

Exemplo:

components/
feature/
feature.tsx
feature-skeleton.tsx
empty-state.tsx

yaml
Copiar código

---

## Padrão de Cards

Todo card deve usar:

- `Card`
- `CardHeader`
- `CardContent`

Header deve conter:

- ícone
- título

Content deve suportar scroll interno em desktop.

---

## Loading e Empty State

Sempre implementar:

- skeleton para loading
- empty state quando não houver dados

Skeleton deve replicar a estrutura do componente final.

---

## Cores

Nunca usar cores hardcoded.

Sempre usar variáveis do Tailwind definidas no projeto.

Exemplo correto:

bg-card
text-text-primary
border-border-divider

yaml
Copiar código

---

## Hooks e Dados

Buscar dados usando **hooks customizados**.

Exemplo:

useProjetoMemoria
useAgendaDev

yaml
Copiar código

Sempre:

- usar `enabled` nas queries
- tratar paginação com `flatMap`

---

## Formulários

Sempre usar:

- react-hook-form
- FormProvider
- Controller ou useFormContext

Evitar estado local para campos de formulário.

---

## Layout

Layout padrão:

- sidebar
- header fixo
- cards com scroll interno em desktop

Responsividade:

- mobile: coluna única
- desktop: múltiplas colunas

---

## Espaçamentos

Sempre seguir os padrões definidos em:

/docs/PADRAO_ESPACAMENTOS.md

yaml
Copiar código

Valores principais:

- card container: `p-6`
- card header: `p-5 pb-2`
- card content: `p-6 pt-3`
- gap entre cards: `gap-6`

Nunca usar espaçamentos arbitrários sem necessidade.

---

## Geração de Código

Ao gerar código:

1. Seguir padrões de componentes do projeto
2. Usar Tailwind conforme definido
3. Criar skeleton se houver loading
4. Criar empty state se necessário
5. Tipar props com TypeScript
