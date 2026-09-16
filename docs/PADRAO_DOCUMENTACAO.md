# Padrão de Pastas — Módulo Documentação

Este documento descreve a organização do módulo **Documentação**. Ele segue os padrões de Casos e Projetos, com separação obrigatória entre banco, API, cliente de dados e componentes.

## 1. Visão geral

| Fluxo | Rota | Entrypoint |
| --- | --- | --- |
| Listagem | `/documentacao` | `components/docs/index.tsx` → `Docs` |
| Detalhe | `/documentacao/[id]` | `components/docs/detalhe/index.tsx` → `DocDetalhe` |
| Cadastro | `/documentacao/novo` | `components/docs/formulario/index.tsx` → `DocForm` |
| Edição | `/documentacao/[id]/editar` | `components/docs/formulario/index.tsx` → `DocForm` |

O detalhe abre em modo de leitura. Cadastro e edição compartilham o formulário, mas usam permissões e rotas distintas.

## 2. Árvore de pastas

```text
components/docs/
├── index.tsx
├── docs-lista.tsx
├── filtros/
│   ├── docs-filtros.tsx
│   ├── docs-filtros.types.ts
│   ├── docs-filtros-aplicados-badges.tsx
│   └── constants.ts
├── lista/
│   ├── docs-lista-item.tsx
│   ├── doc-status-badge.tsx
│   └── doc-categoria-badge.tsx
├── layout/
│   └── docs-lista-skeleton.tsx
├── detalhe/
│   ├── index.tsx
│   ├── doc-detalhe-skeleton.tsx
│   ├── doc-anexos.tsx
│   ├── doc-anexos-upload.tsx
│   ├── doc-anexos-dropzone.tsx
│   ├── doc-anexos-skeleton.tsx
│   └── doc-anexos-utils.ts
├── formulario/
│   ├── index.tsx
│   ├── schema.ts
│   ├── markdown-editor.tsx
│   ├── tags-field.tsx
│   ├── links-field.tsx
│   └── shared/payload.ts
└── shared/
    └── markdown-view.tsx

hooks/docs/
├── use-docs.tsx
├── use-doc.tsx
├── use-doc-activity.tsx
├── use-doc-categories.tsx
├── use-doc-tags.tsx
├── use-docs-filtros.tsx
├── use-create-doc.tsx
├── use-update-doc.tsx
├── use-delete-doc.tsx
└── use-doc-attachments.tsx
```

Dados:

```text
db/schema.ts
db/schema-doc-attachments.ts
lib/validators/db/doc.ts
lib/validators/db/doc-attachments.ts
lib/db/docs-utils.ts
lib/db/docs.ts
lib/db/doc-attachments.ts
app/api/db/docs/**
app/api/db/doc-categories/route.ts
app/api/db/doc-tags/route.ts
services/db-api/docs.ts
services/db-api/doc-attachments.ts
```

## 3. Responsabilidades

- `components/docs/index.tsx`: orquestra filtros, permissões de ação e listagem.
- `docs-lista.tsx`: infinite query, contador, skeleton e empty state.
- `detalhe/index.tsx`: leitura, abas, ficha, tags, vínculos e ações.
- `detalhe/doc-anexos.tsx`: listagem e upload de anexos no mesmo bucket `casos-anexos`.
- `formulario/index.tsx`: RHF, estado de create/edit, submit e proteção contra saída.
- `shared/markdown-view.tsx`: única implementação de renderização Markdown; sempre usa `remark-gfm` e `rehype-sanitize`.
- `services/db-api/docs.ts`: único acesso do browser a `/api/db/docs`.
- `services/db-api/doc-attachments.ts`: único acesso do browser a `/api/db/docs/[id]/anexos`.
- `hooks/docs/`: cache TanStack Query; hooks nunca ficam em `components/`.
- `lib/db/docs.ts`: somente Drizzle e transações; rotas não contêm queries.

## 4. Convenções

- Prefixos de componente: `Docs*` para listagem e `Doc*` para uma entidade.
- Tipos do contrato HTTP ficam em `services/db-api/docs.ts`; tipos de formulário ficam em `formulario/schema.ts`.
- Tags são persistidas normalizadas em minúsculo, sem acento e com hífen.
- Filtros são refletidos na query string e fazem parte da chave `["docs", filtros]`.
- Histórico e anexos só buscam dados quando a aba está ativa.
- Anexos de documento usam o bucket `casos-anexos` com path `docs/{docId}/…`; metadados ficam em `doc_attachments`.
- Markdown escrito por usuário nunca é renderizado sem sanitização.
- Vínculos legados guardam `entityId` como texto e `entityLabel` como cache.

## 5. Permissões

| Código | Uso |
| --- | --- |
| `list-doc` | Listagem, detalhe, categorias, tags, histórico e anexos |
| `create-doc` | Novo documento e duplicação |
| `edit-doc` | Edição, mudança de status e gestão de anexos |
| `delete-doc` | Exclusão (também remove anexos do Storage) |
| `manage-doc-category` | Cadastro de categorias |

As páginas usam `RequirePermission`; as ações usam `hasPermission`; todas as rotas usam `withPermission`.

## 6. Estados obrigatórios

- Listagens e detalhe devem manter skeleton alinhado à estrutura final.
- Listagem vazia apresenta CTA apenas quando o usuário possui `create-doc`.
- Erro 404 no detalhe tem estado dedicado.
- Em desktop, o scroll principal fica dentro do card; no mobile, o layout vira coluna única.
