# Padrão de Pastas — Módulo Projetos

Este documento descreve a organização de pastas e arquivos do módulo **Projetos** (`components/projetos/`). Ele complementa o [PADRAO_COMPONENTES.md](./PADRAO_COMPONENTES.md) (padrões visuais e de UI) e o [PADRAO_COMPONENTES_GRANDES.md](./PADRAO_COMPONENTES_GRANDES.md) (decomposição de componentes grandes).

Use este guia ao criar novas telas, abas ou subfeatures dentro do módulo.

---

## 1. Visão Geral

O módulo Projetos cobre três fluxos principais:

| Fluxo | Rota | Entrypoint |
| ----- | ---- | ---------- |
| **Listagem** | `/projetos` | `components/projetos/index.tsx` → `Projetos` |
| **Cadastro** | `/projetos/novo` | `components/projetos/cadastro/index.tsx` → `ProjetoCreateForm` |
| **Edição** | `/projetos/[id]` | `components/projetos/edicao/index.tsx` → `ProjetoEditView` |

Cada fluxo tem sua própria subpasta. Componentes reutilizados entre fluxos ficam em `shared/` (no nível raiz ou dentro de `edicao/`).

---

## 2. Árvore de Pastas

```
components/projetos/
├── index.tsx                      # Listagem: orquestra filtros + tabela + ações
├── projetos-tabela.tsx            # Card de listagem com fetch e infinite scroll
├── utils.ts                       # Utilitários compartilhados do módulo (ex.: formatSgpDateTimeToPt)

├── filtros/                       # Filtros da listagem
│   ├── projetos-filtros.tsx
│   ├── projetos-filtros.types.ts
│   ├── projetos-filtros-mappers.ts
│   └── projetos-filtros-parsers.ts

├── tabela/                        # Tabela reutilizável (listagem e escopo)
│   ├── projetos-tabela-table.tsx
│   ├── projetos-tabela-types.ts
│   ├── projetos-tabela-row-listagem.tsx
│   ├── projetos-tabela-row-escopo.tsx
│   ├── projetos-tabela-escopo-badges.tsx
│   └── projeto-status-badge.tsx

├── layout/                        # Skeletons de layout compartilhados
│   ├── projetos-tabela-skeleton.tsx
│   └── projetos-tabela-escopo-skeleton-rows.tsx

├── shared/                        # Formulários/comp. usados em cadastro + edição
│   └── projeto-abertura-form.tsx

├── cadastro/                      # Fluxo de criação
│   ├── index.tsx                  # Entrypoint: ProjetoCreateForm
│   ├── schema.ts                  # Zod schema + ProjetoFormData
│   ├── constants.ts               # Valores padrão (status, tipo, etc.)
│   ├── utils.ts                   # Builders de payload, mappers API ↔ form
│   ├── projeto-create-header.tsx
│   └── projeto-create-footer.tsx

└── edicao/                        # Fluxo de edição (abas)
    ├── index.tsx                  # Entrypoint: fetch do projeto + estados de erro
    ├── projeto-edit-form.tsx      # Orquestrador de abas + form de abertura
    ├── projeto-edit-header.tsx
    ├── projeto-edit-rodape-acoes.tsx
    ├── projeto-edit-skeleton.tsx
    ├── projeto-nao-encontrado.tsx

    ├── abas/                      # Adaptadores finos para cada aba (TabsContent)
    │   ├── aba-abertura.tsx
    │   ├── aba-escopo.tsx
    │   ├── aba-risco.tsx
    │   ├── aba-stakes.tsx
    │   ├── aba-cronograma.tsx
    │   └── aba-placeholder.tsx

    ├── shared/                    # Utilitários compartilhados entre abas de edição
    │   └── sgp-tipos-utils.ts

    ├── escopo/                    # Feature: aba Escopo
    ├── risco/                     # Feature: aba Risco
    ├── stakes/                    # Feature: aba Stakeholders
    └── cronograma/                # Feature: aba Cronograma
```

Hooks de dados ficam em `hooks/projetos/` (não dentro de `components/projetos/`).

---

## 3. Responsabilidades por Camada

### 3.1. Entrypoints (`index.tsx`)

Cada fluxo expõe **um componente principal** via `index.tsx`:

- **`Projetos`** — monta layout de listagem, delega filtros e tabela, gerencia permissões e navegação.
- **`ProjetoCreateForm`** — `useForm`, mutation de criação, header/footer, modal de sucesso.
- **`ProjetoEditView`** — fetch inicial (`useSgpCadastroById`), skeleton, 404 e delegação ao `ProjetoEditForm`.

**Regra:** o entrypoint concentra hooks de dados de alto nível, estados globais do fluxo e composição. Evite JSX profundo — delegue para subcomponentes.

### 3.2. Orquestradores intermediários

Alguns fluxos têm um segundo nível de orquestração:

| Arquivo | Papel |
| ------- | ----- |
| `projetos-tabela.tsx` | Card + fetch infinito + empty states da listagem |
| `projeto-edit-form.tsx` | Tabs, form de abertura compartilhado, permissões de edição, submit |

Esses arquivos **não** devem conter lógica de subfeatures (risco, escopo, etc.) — apenas coordenam abas e passam props (`projetoId`, `enabled`).

### 3.3. Adaptadores de aba (`edicao/abas/`)

Arquivos em `edicao/abas/` são **adaptadores finos** entre o sistema de tabs e a feature folder:

```tsx
// edicao/abas/aba-escopo.tsx
import { AbaEscopo } from "@/components/projetos/edicao/escopo";

export function AbaEscopoTab({ projetoId, enabled }: AbaEscopoTabProps) {
  return <AbaEscopo projetoId={projetoId} enabled={enabled} />;
}
```

**Regra:** `abas/` não contém lógica de negócio. Toda implementação fica na pasta da feature (`escopo/`, `risco/`, etc.).

### 3.4. Feature folders (abas complexas)

Abas com CRUD, modais, grids e múltiplos estados seguem o padrão de **feature folder** descrito em [PADRAO_COMPONENTES_GRANDES.md](./PADRAO_COMPONENTES_GRANDES.md).

Estrutura típica (ex.: `edicao/risco/`):

```
edicao/risco/
├── index.tsx                      # Entrypoint: AbaRisco (queries, modais, handlers)
├── utils.ts                       # Funções puras (sem React)
├── aba-risco-skeleton.tsx           # Skeleton da carga inicial
├── riscos-identificados-card.tsx  # Card/seção de UI
├── riscos-ocorrencias-card.tsx
├── risco-card.tsx                 # Item individual
├── riscos-grid.tsx                # Grid/lista
├── risco-form-modal.tsx           # Modal de criação/edição
├── risco-form-schema.ts           # Zod do formulário
├── risco-form-utils.ts            # Normalização/parse do form
├── risco-form-constants.ts        # Opções fixas, labels
├── risco-prioridade-badge.tsx     # Badge visual
└── risco-historico-*.tsx          # Subfeature de histórico/ocorrências
```

**Regra:** cada feature folder exporta seu componente principal pelo `index.tsx` (ex.: `AbaRisco`, `AbaEscopo`, `AbaStakes`, `AbaCronograma`).

---

## 4. Convenções de Nomenclatura

### 4.1. Arquivos

| Sufixo / padrão | Uso | Exemplo |
| --------------- | --- | ------- |
| `index.tsx` | Entrypoint do fluxo ou feature | `cadastro/index.tsx`, `edicao/risco/index.tsx` |
| `*.types.ts` | Interfaces e tipos do domínio local | `projetos-filtros.types.ts`, `projetos-tabela-types.ts` |
| `*-mappers.ts` | Conversão form ↔ API ↔ filtros | `projetos-filtros-mappers.ts` |
| `*-parsers.ts` | Parse de query string / URL | `projetos-filtros-parsers.ts` |
| `schema.ts` / `*-schema.ts` | Schemas Zod + tipos inferidos | `cadastro/schema.ts`, `risco-form-schema.ts` |
| `utils.ts` / `*-utils.ts` | Funções puras (sem hooks) | `escopo/utils.ts`, `risco-form-utils.ts` |
| `constants.ts` / `*-constants.ts` | Valores fixos, defaults | `cadastro/constants.ts` |
| `*-config.ts` | Mapas de configuração (badges, cores) | `stake-tipo-badge-config.ts` |
| `aba-*-skeleton.tsx` | Skeleton da carga inicial da aba | `aba-risco-skeleton.tsx` |
| `*-content-skeleton.tsx` | Skeleton de refetch (filtros aplicados) | `escopo-content-skeleton.tsx` |
| `*-modal.tsx` | Modais de formulário ou confirmação | `risco-form-modal.tsx` |
| `*-card.tsx` | Seções encapsuladas em Card | `stakes-card.tsx` |
| `*-badge.tsx` | Badges visuais isolados | `projeto-status-badge.tsx` |
| `*-row.tsx` | Linha de tabela ou lista | `projetos-tabela-row-listagem.tsx` |
| `projeto-create-*` / `projeto-edit-*` | Peças do layout de cadastro/edição | `projeto-edit-header.tsx` |

### 4.2. Componentes exportados

| Prefixo | Significado |
| ------- | ----------- |
| `Projetos*` | Listagem (`Projetos`, `ProjetosTabela`, `ProjetosFiltros`) |
| `ProjetoCreate*` | Cadastro |
| `ProjetoEdit*` | Edição (shell: header, footer, skeleton) |
| `Aba*` | Conteúdo de uma aba (`AbaEscopo`, `AbaRisco`) |
| `Aba*Tab` | Adaptador fino em `edicao/abas/` |

### 4.3. Props comuns em abas

Todas as abas de edição recebem:

```tsx
interface AbaFeatureProps {
  projetoId: number | string;
  enabled?: boolean; // lazy-load quando a aba está ativa
}
```

---

## 5. Separação de Concerns

### 5.1. O que fica em `components/projetos/`

| Responsabilidade | Onde |
| ---------------- | ---- |
| UI, composição, estado local de tela | Componentes |
| Schemas Zod de formulários | `*-schema.ts` na feature |
| Mappers form ↔ payload API | `utils.ts`, `*-utils.ts`, `*-mappers.ts` |
| Tipos locais de props/form | `*.types.ts` |
| Config visual (badges, labels) | `*-config.ts`, `*-constants.ts` |

### 5.2. O que fica fora (`hooks/`, `interfaces/`, `services/`)

| Responsabilidade | Onde |
| ---------------- | ---- |
| Queries e mutations (React Query) | `hooks/projetos/` |
| Query keys centralizadas | `hooks/projetos/sgp-projeto-query-keys.ts` |
| Tipos da API | `interfaces/sgp-*.ts` |
| Chamadas HTTP | `services/` |

**Regra:** subcomponentes de UI **não** conhecem `queryKey` nem invalidam cache diretamente. Callbacks e dados vêm do entrypoint da feature (`index.tsx`).

### 5.3. Utilitários compartilhados

| Escopo | Local |
| ------ | ----- |
| Todo o módulo Projetos | `components/projetos/utils.ts` |
| Cadastro + edição (form de abertura) | `components/projetos/shared/` |
| Schema e payload create/update | `components/projetos/cadastro/schema.ts` e `cadastro/utils.ts` |
| Múltiplas abas de edição | `components/projetos/edicao/shared/` |

O form de abertura (`projeto-abertura-form.tsx`) é compartilhado entre cadastro e aba Abertura. O schema Zod (`cadastro/schema.ts`) é reutilizado na edição.

---

## 6. Padrões por Subpasta

### 6.1. `filtros/`

Responsável pela UI de filtros da listagem e pela conversão de valores.

```
filtros/
├── projetos-filtros.tsx           # UI (react-hook-form + CasoFormProvider)
├── projetos-filtros.types.ts      # ProjetosFiltrosAplicados, ProjetosFiltersForm
├── projetos-filtros-mappers.ts    # formToFiltrosAplicados, filtrosToSgpCadastrosParams
└── projetos-filtros-parsers.ts    # Parse de query string (URL ↔ filtros)
```

Estado dos filtros aplicados é gerenciado pelo hook `useProjetosFiltros` (`hooks/projetos/use-projetos-filtros.ts`).

### 6.2. `tabela/` + `layout/`

A tabela suporta **variantes** via prop discriminated union:

```tsx
<ProjetosTabelaTable variant="listagem" itens={...} />
<ProjetosTabelaTable variant="escopo" itens={...} />
```

| Arquivo | Papel |
| ------- | ----- |
| `projetos-tabela-table.tsx` | Table shell + switch de variante |
| `projetos-tabela-types.ts` | Props tipadas por variante |
| `projetos-tabela-row-*.tsx` | Renderização de cada linha |
| `layout/*-skeleton*.tsx` | Skeletons reutilizados pela tabela |

Skeletons de layout ficam em `layout/` porque são compartilhados entre listagem e escopo.

### 6.3. `cadastro/`

```
cadastro/
├── index.tsx          # useForm + mutation + SuccessModal
├── schema.ts          # projetoFormSchema, ProjetoFormData, defaultValues
├── constants.ts       # DEFAULT_STATUS_PROJETO, DEFAULT_TIPO_PROJETO
├── utils.ts           # buildCreateSgpProjetoPayload, sgpCadastroToFormValues
├── projeto-create-header.tsx
└── projeto-create-footer.tsx
```

**Regra:** schema e utils de form ficam em `cadastro/` mesmo quando reutilizados na edição — a edição importa de lá.

### 6.4. `edicao/` — shell

```
edicao/
├── index.tsx                  # Fetch → skeleton | 404 | ProjetoEditForm
├── projeto-edit-form.tsx      # Tabs + FormProvider + submit abertura
├── projeto-edit-header.tsx    # Cabeçalho com metadados do projeto
├── projeto-edit-rodape-acoes.tsx
├── projeto-edit-skeleton.tsx
└── projeto-nao-encontrado.tsx
```

`projeto-edit-form.tsx` controla a aba ativa e passa `enabled={activeTab === "..."}` para lazy-load das abas.

### 6.5. Feature folders — padrão CRUD

Abas com listagem + modais (Risco, Stakes, Cronograma) seguem este fluxo no `index.tsx`:

1. Queries infinitas (`useSgp*ByProjetoInfinite`)
2. Mutations de delete (`useDeleteSgp*`)
3. Estado de modais (`modalOpen`, `modalMode`, `itemEmEdicao`)
4. Handlers (`handleCriar`, `handleEditar`, `handleExcluir`)
5. Skeleton na carga inicial (`if (isLoading && !data) return <Aba*Skeleton />`)
6. Composição de cards + modais + `ConfirmacaoModal`

Formulários de modal seguem trio:

```
*-form-schema.ts    → Zod
*-form-utils.ts     → parse/normalize valores
*-form-modal.tsx    → UI + useForm + mutation create/update
```

---

## 7. Loading States

O módulo usa **dois níveis de skeleton** onde aplicável:

| Cenário | Componente |
| ------- | ---------- |
| Carga inicial (sem dados, sem filtros) | `aba-*-skeleton.tsx` ou `projetos-tabela-skeleton.tsx` |
| Refetch com filtros aplicados | `*-content-skeleton.tsx` (mantém filtros montados) |
| Próxima página (infinite scroll) | Rows skeleton dentro da tabela (`isFetchingNextPage`) |

Exemplo na aba Escopo:

```tsx
const isInitialLoading =
  enabled && escopoQuery.isLoading && !escopoQuery.data && !hasFiltrosAplicados;

const isRefetchingComFiltros =
  hasFiltrosAplicados &&
  (escopoQuery.isFetching || escopoQuery.isLoading) &&
  !escopoQuery.isFetchingNextPage;

if (isInitialLoading) return <AbaEscopoSkeleton />;
// ...
{isRefetchingComFiltros ? <EscopoContentSkeleton /> : /* conteúdo */}
```

---

## 8. Paginação Infinita

Listagem e abas usam **IntersectionObserver** com ref sentinela:

```tsx
const loadMoreRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const el = loadMoreRef.current;
  if (!el || !hasNextPage || isFetchingNextPage) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) fetchNextPage();
    },
    { root: null, rootMargin: "100px", threshold: 0 },
  );
  observer.observe(el);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

// No JSX:
{hasNextPage && <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />}
```

Dados paginados são achatados com `flatMap`:

```tsx
const itens = data?.pages.flatMap((p) => p.data) ?? [];
```

---

## 9. Formulários

| Contexto | Padrão |
| -------- | ------ |
| Filtros da listagem | `useForm` + `FormProvider`, submit via botão "Filtrar" (`getValues`) |
| Cadastro / abertura | `useForm` + `zodResolver` + `CasoFormProvider` + `FormProvider` |
| Modais de feature | `useForm` local no modal, schema em `*-form-schema.ts` |

Campos reutilizáveis vêm de `@/components/fields/caso-form-*` via `CasoFormProvider`.

---

## 10. Permissões (RBAC)

Verificações de permissão ficam nos **entrypoints**, não nos subcomponentes:

```tsx
const canCreateProject = !permissionsLoaded() || hasPermission("create-project");
const canEditProject = !rbacReady || hasPermission("edit-project");
```

Códigos usados no módulo: `create-project`, `edit-project`.

---

## 11. Como Adicionar uma Nova Aba de Edição

1. Criar pasta `edicao/<feature>/` com `index.tsx` exportando `Aba<Feature>`.
2. Adicionar adaptador fino em `edicao/abas/aba-<feature>.tsx` exportando `Aba<Feature>Tab`.
3. Registrar a aba em `projeto-edit-form.tsx` (tab trigger + `TabsContent` com `enabled`).
4. Criar hooks em `hooks/projetos/` (`use-sgp-<feature>-by-projeto`, mutations).
5. Se houver formulário modal: criar `*-form-schema.ts`, `*-form-utils.ts`, `*-form-modal.tsx`.
6. Criar `aba-<feature>-skeleton.tsx` para carga inicial.
7. Abas ainda não implementadas usam `aba-placeholder.tsx` como referência.

---

## 12. Como Adicionar um Campo ao Form de Abertura

1. Atualizar `cadastro/schema.ts` (Zod + tipo).
2. Atualizar `cadastro/utils.ts` (payload create/update).
3. Adicionar campo em `shared/projeto-abertura-form.tsx`.
4. Se necessário, ajustar `cadastro/constants.ts` (defaults).

---

## 13. Imports e Compatibilidade

- Preferir imports absolutos: `@/components/projetos/...`
- Feature folders exportam pelo `index.tsx`; consumidores importam da pasta:

  ```tsx
  import { AbaEscopo } from "@/components/projetos/edicao/escopo";
  ```

- Quando um arquivo cresce e vira pasta, manter **arquivo ponte** no path antigo (re-export) para não quebrar imports existentes — ver [PADRAO_COMPONENTES_GRANDES.md](./PADRAO_COMPONENTES_GRANDES.md).

---

## 14. Checklist — Nova Feature no Módulo

### Estrutura
- [ ] Feature folder criada com `index.tsx` como entrypoint?
- [ ] Tipos em `*.types.ts`, utils puros em `utils.ts`?
- [ ] Schema Zod separado em `*-schema.ts` (se houver form)?
- [ ] Adaptador fino em `edicao/abas/` (se for aba de edição)?

### Dados
- [ ] Hooks criados em `hooks/projetos/` (não dentro de components)?
- [ ] Query keys registradas em `sgp-projeto-query-keys.ts`?
- [ ] Mutations invalidam queries relacionadas?

### UI
- [ ] Skeleton de carga inicial (`aba-*-skeleton.tsx`)?
- [ ] Skeleton de refetch (se houver filtros)?
- [ ] EmptyState quando lista vazia?
- [ ] Modais seguem trio schema + utils + modal?
- [ ] Permissões verificadas no entrypoint?

### Reutilização
- [ ] Componente compartilhado entre fluxos está em `shared/`?
- [ ] Tabela reutiliza `tabela/projetos-tabela-table.tsx` (se aplicável)?
- [ ] Form de abertura reutiliza `cadastro/schema.ts`?

---

## 15. Referências Cruzadas

| Documento | Conteúdo |
| --------- | -------- |
| [PADRAO_COMPONENTES.md](./PADRAO_COMPONENTES.md) | Cards, cores, skeletons, empty states, layout responsivo |
| [PADRAO_COMPONENTES_GRANDES.md](./PADRAO_COMPONENTES_GRANDES.md) | Quando e como decompor em feature folders |
| [PADRAO_REQUISICOES.md](./PADRAO_REQUISICOES.md) | Padrões de chamadas à API |
| [RBAC_PERMISSOES.md](./RBAC_PERMISSOES.md) | Permissões do sistema |

---

**Última atualização**: Junho 2025  
**Versão**: 1.0
