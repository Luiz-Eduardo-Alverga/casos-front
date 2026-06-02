# Padrão de Pastas — Módulo Casos

Este documento descreve a organização de pastas do módulo **Casos** (`components/casos/`). Segue o mesmo modelo do [PADRAO_PROJETOS.md](./PADRAO_PROJETOS.md) e complementa o [PADRAO_COMPONENTES.md](./PADRAO_COMPONENTES.md).

---

## 1. Visão Geral

| Fluxo | Rota | Entrypoint |
| ----- | ---- | ---------- |
| **Listagem** | `/casos` | `components/casos/index.tsx` → `Casos` |
| **Cadastro** | `/casos/novo` | `components/casos/cadastro/index.tsx` → `CasoCreateForm` |
| **Cadastro Report** | `/reports/novo` | `components/casos/cadastro/report-create/index.tsx` → `ReportCreateForm` |
| **Edição** | `/casos/[id]` | `components/casos/edicao/index.tsx` → `CasoEditView` |
| **Edição Report (sem list-case)** | `/casos/[id]` | `components/casos/report/index.tsx` → `ReportEditView` |

Hooks de dados ficam em `hooks/casos/`.

---

## 2. Árvore de Pastas

```
components/casos/
├── index.tsx                          # Listagem: filtros + tabela + ações
├── casos-tabela.tsx                   # Card de listagem com infinite scroll
│
├── filtros/                           # Filtros da listagem
│   ├── casos-filtros.tsx
│   ├── casos-filtros.types.ts
│   ├── casos-filtros-mappers.ts
│   ├── casos-filtros-parsers.ts
│   ├── casos-filtros-badge-labels.ts
│   ├── casos-filtros-aplicados-badges.tsx
│   ├── casos-filtros-campos-expandidos.tsx
│   ├── casos-filtros-animated-content.tsx
│   └── constants.ts
│
├── tabela/                            # Tabela de listagem
│   ├── casos-tabela-table.tsx
│   ├── categoria-badge.tsx
│   └── caso-producao-indicador.tsx
│
├── layout/                            # Skeletons compartilhados
│   └── casos-tabela-skeleton.tsx
│
├── transferencia/                     # Feature: transferência em lote
│   ├── casos-transferencia-modal.tsx
│   ├── types.ts
│   └── utils.ts
│
├── shared/                            # Compartilhado entre cadastro e edição
│   ├── payload.ts                     # Builders de payload create/update
│   ├── create-form-header.tsx
│   └── assistant-modal.tsx
│
├── cadastro/                          # Fluxos de criação
│   ├── index.tsx                      # Barrel: CasoCreateForm, ReportCreateForm
│   ├── caso-create/                   # Cadastro de caso
│   │   ├── index.tsx
│   │   ├── schema.ts
│   │   ├── utils.ts
│   │   ├── caso-create-left-column.tsx
│   │   ├── caso-create-right-column.tsx
│   │   └── caso-create-modals.tsx
│   ├── report-create/                 # Cadastro de report
│   │   ├── index.tsx
│   │   ├── schema.ts
│   │   ├── utils.ts
│   │   └── ...
│   ├── reports/                       # Variante Reports (reuso de colunas/modais)
│   │   ├── schema.ts
│   │   ├── utils.ts
│   │   └── ...
│   └── anexos/                        # Upload de anexos no cadastro
│       ├── index.tsx
│       ├── types.ts
│       └── utils.ts
│
├── report/                            # Edição de report (layout alternativo, sem list-case)
│   ├── index.tsx                      # ReportEditView
│   ├── report-edit-form.tsx
│   ├── report-edit-header.tsx
│   ├── report-edit-rodape-acoes.tsx
│   ├── report-edit-coluna-direita.tsx
│   ├── report-edit-skeleton.tsx
│   ├── schema.ts
│   ├── utils.ts
│   └── abas/
│       └── aba-inicial.tsx
│
└── edicao/                            # Fluxo de edição (abas)
    ├── index.tsx                      # Fetch do caso + skeleton + 404
    ├── caso-edit-form.tsx             # Orquestrador de abas + form
    ├── caso-edit-context.tsx
    ├── caso-edit-header.tsx
    ├── caso-edit-rodape-acoes.tsx
    ├── caso-edit-skeleton.tsx
    ├── caso-nao-encontrado.tsx
    ├── caso-edit-coluna-direita.tsx
    ├── caso-edit-card-header.tsx
    ├── caso-edit-card-classificacao.tsx
    ├── aba-inicial.tsx                # Ponte → abas/aba-inicial.tsx
    │
    ├── abas/                          # Adaptadores finos para cada aba
    │   ├── aba-inicial.tsx
    │   ├── aba-anotacoes.tsx
    │   ├── aba-relacoes.tsx
    │   ├── aba-clientes.tsx
    │   ├── aba-producao.tsx
    │   ├── aba-anexos.tsx
    │   └── aba-historico.tsx
    │
    ├── save/                          # Lógica de persistência da edição
    │   ├── edit-snapshot.ts
    │   └── compute-caso-edit-save.ts
    │
    ├── fields/                        # Campos específicos da edição
    │   ├── caso-edit-cliente-combobox.tsx
    │   └── tamanho-combobox.tsx
    │
    ├── report-analise-modal/          # Modal de análise de report
    │
    ├── anotacoes/                     # Feature: aba Anotações
    ├── anexos/                        # Feature: aba Anexos
    ├── clientes/                      # Feature: aba Clientes
    ├── historico/                     # Feature: aba Histórico
    ├── producao/                      # Feature: aba Produção
    └── relacoes/                      # Feature: aba Relações
```

---

## 3. Caminhos legados (pontes)

Para não quebrar imports existentes, as pastas antigas permanecem como **re-exportadores**:

| Caminho legado | Destino canônico |
| -------------- | ---------------- |
| `@/components/caso-edit/*` | `@/components/casos/edicao/*` |
| `@/components/caso-form/*` | `@/components/casos/cadastro/*` ou `@/components/casos/shared/*` |

**Novos arquivos** devem importar diretamente de `@/components/casos/...`.

> As pastas legadas `components/caso-edit/` e `components/caso-form/` foram removidas após a migração dos imports.

---

## 4. Responsabilidades por Camada

### 4.1. Listagem (`index.tsx` + `casos-tabela.tsx`)

- `index.tsx` — layout, filtros, ações de navegação.
- `casos-tabela.tsx` — fetch infinito, empty states, modal de transferência.
- Estado de filtros via `useCasosFiltros` (`hooks/casos/`).

### 4.2. Cadastro (`cadastro/`)

- `caso-create/` — formulário principal de abertura de caso.
- `report-create/` — fluxo específico de report.
- `reports/` — reutiliza colunas e modais do `caso-create`.
- `anexos/` — componente de upload reutilizado também na edição.
- Schema Zod centralizado em `caso-create/schema.ts`.

### 4.3. Edição (`edicao/`)

- `index.tsx` — fetch via `useProjetoMemoriaById`, skeleton, 404.
- `caso-edit-form.tsx` — tabs, `FormProvider`, submit, contexto `CasoEditProvider`.
- Feature folders (`anotacoes/`, `producao/`, etc.) — implementação de cada aba.
- `abas/` — adaptadores finos que re-exportam as features (padrão Projetos).

### 4.4. Compartilhado (`shared/`)

- `payload.ts` — `buildCasoCreatePayload`, `buildCasoUpdatePayload`, helpers de versão.
- `create-form-header.tsx` — header reutilizado em cadastro e report.
- `assistant-modal.tsx` — modal do assistente de IA.

---

## 5. Convenções de Nomenclatura

| Sufixo / padrão | Uso |
| --------------- | --- |
| `index.tsx` | Entrypoint de fluxo ou feature |
| `*.types.ts` | Props e tipos locais |
| `*-mappers.ts` | Conversão form ↔ API ↔ filtros |
| `*-parsers.ts` | Parse de query string |
| `schema.ts` | Zod + tipos inferidos |
| `utils.ts` | Funções puras |
| `aba-*-skeleton.tsx` | Skeleton da carga inicial da aba |
| `*-modal.tsx` | Modais de formulário |
| `caso-edit-*` | Shell da edição (header, footer, skeleton) |
| `caso-create-*` | Peças do layout de cadastro |

Prefixos de componentes:

| Prefixo | Significado |
| ------- | ----------- |
| `Casos*` | Listagem |
| `CasoCreate*` | Cadastro |
| `CasoEdit*` | Shell de edição |
| `Aba*` | Conteúdo de aba |
| `Aba*Tab` | Adaptador em `edicao/abas/` (quando aplicável) |

---

## 6. Padrões de Feature Folder (abas de edição)

Cada aba complexa segue:

```
edicao/<feature>/
├── index.tsx              # Entrypoint: queries, modais, handlers
├── types.ts               # Props da aba
├── utils.ts               # Helpers puros
├── aba-<feature>-skeleton.tsx   # (quando aplicável)
├── *-form.tsx / *-modal.tsx     # Formulários
├── *-table.tsx / *-card.tsx     # UI de listagem
└── ...
```

Props padrão das abas:

```tsx
interface AbaFeatureProps {
  // props específicas da aba
  enabled?: boolean;   // lazy-load quando aba ativa
  isTabActive?: boolean;
}
```

---

## 7. Como Adicionar uma Nova Aba de Edição

1. Criar `edicao/<feature>/` com `index.tsx` exportando `Aba<Feature>`.
2. Adicionar adaptador em `edicao/abas/aba-<feature>.tsx`.
3. Registrar a aba em `caso-edit-form.tsx` (`TabsContent` + prop `enabled`).
4. Criar hooks em `hooks/casos/`.
5. Criar skeleton se houver fetch inicial.

---

## 8. Checklist — Nova Feature no Módulo

### Estrutura
- [ ] Arquivo canônico em `components/casos/...`?
- [ ] Tipos em `*.types.ts`, utils puros em `utils.ts`?
- [ ] Adaptador em `edicao/abas/` (se for aba)?
- [ ] Ponte legada criada (se path antigo ainda for usado)?

### Dados
- [ ] Hooks em `hooks/casos/`?
- [ ] Mutations invalidam queries relacionadas?

### UI
- [ ] Skeleton de carga inicial?
- [ ] EmptyState quando lista vazia?
- [ ] Permissões verificadas no entrypoint?

---

## 9. Referências

| Documento | Conteúdo |
| --------- | -------- |
| [PADRAO_PROJETOS.md](./PADRAO_PROJETOS.md) | Modelo base de organização |
| [PADRAO_COMPONENTES.md](./PADRAO_COMPONENTES.md) | Padrões visuais e de UI |
| [PADRAO_COMPONENTES_GRANDES.md](./PADRAO_COMPONENTES_GRANDES.md) | Decomposição de componentes grandes |

---

**Última atualização**: Junho 2025  
**Versão**: 1.0
