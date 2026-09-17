# Padrão de Pastas — Módulo Produtos

Este documento descreve a organização do módulo **Produtos** (`components/produtos/`). Ele complementa o [PADRAO_COMPONENTES.md](./PADRAO_COMPONENTES.md) e segue o modelo do [PADRAO_PROJETOS.md](./PADRAO_PROJETOS.md).

Vocabulário da UI: **Produto**, **Versão**, **Módulo**, **Checklist**, **Script**. Nunca chamar produto de "projeto".

---

## 1. Visão Geral

| Fluxo | Rota | Entrypoint |
| ----- | ---- | ---------- |
| **Listagem** | `/produtos` | `components/produtos/index.tsx` → `Produtos` |
| **Cadastro** | `/produtos/novo` | `components/produtos/cadastro/index.tsx` → `ProdutoCreateForm` |
| **Edição** | `/produtos/[id]` | `components/produtos/edicao/index.tsx` → `ProdutoEditView` |

Abas do detalhe: **Dados gerais**, **Versões**, **Módulos**, **Checklist**, **Scripts**. A aba ativa fica em `?aba=` (nuqs). Após criar um produto, a navegação vai para `/produtos/{id}?aba=versoes`.

Permissões: `list-product`, `create-product`, `edit-product`, `delete-product`. Páginas usam `RequirePermission`; ações usam `useProdutoPermissoes` (`hasPermission`). Sem a permissão, o botão/menu some — não fica desabilitado nem vazio.

---

## 2. Árvore de Pastas

```
components/produtos/
├── index.tsx                      # Listagem: filtros + tabela
├── constants.ts                   # Labels pt-BR
├── utils.ts                       # Funções puras (datas, vacaLeiteira)
├── dialog-classes.ts              # Classe compartilhada dos modais
├── produtos-carregando-mais.tsx   # Indicador de infinite scroll

├── filtros/
│   ├── produtos-filtros.tsx
│   ├── produtos-filtros.types.ts
│   └── produtos-filtros-aplicados-badges.tsx

├── tabela/
│   ├── produtos-tabela.tsx        # Card + fetch infinito + empty/error
│   ├── produtos-tabela-table.tsx
│   ├── produtos-tabela-row.tsx
│   ├── produtos-tabela-skeleton.tsx
│   ├── produto-status-badge.tsx
│   └── produto-pessoa-chip.tsx

├── cadastro/                      # Schema/utils reusados na edição
│   ├── index.tsx
│   ├── schema.ts
│   ├── utils.ts                   # Payload create/update, merge PUT
│   ├── produto-dados-form.tsx
│   ├── produto-exibicao-switches.tsx
│   ├── produto-vinculado-field.tsx
│   ├── produto-create-header.tsx
│   └── produto-create-footer.tsx

└── edicao/
    ├── index.tsx                  # Fetch → skeleton | 404 | form
    ├── produto-edit-form.tsx      # Abas + form Dados gerais + guard
    ├── produto-edit-header.tsx
    ├── produto-edit-footer.tsx
    ├── produto-edit-skeleton.tsx
    ├── produto-nao-encontrado.tsx
    ├── produto-resumo-card.tsx
    ├── produto-acoes-card.tsx
    ├── produto-edit-url-parsers.ts
    ├── produto-conflito-dialog.tsx
    ├── abas/
    │   └── aba-dados-gerais.tsx
    ├── versoes/
    ├── modulos/
    ├── checklist/
    └── scripts/
```

Hooks em `hooks/produtos/`. Services em `services/produtos/`. Fachada HTTP em `app/api/produtos/**` → legado `projeto-versoes*`.

---

## 3. Responsabilidades

### Entrypoints (`index.tsx`)

O entrypoint concentra hooks, estados de tela e composição. Sem JSX profundo.

| Arquivo | Papel |
| ------- | ----- |
| `Produtos` | Layout de listagem, filtros, permissão de criar |
| `ProdutoCreateForm` | `useForm` + mutation + header/footer |
| `ProdutoEditView` | Fetch, skeleton, 403/404, delega ao form |
| `produto-edit-form.tsx` | Tabs, guard de dirty, submit de Dados gerais |
| `edicao/<feature>/index.tsx` | Queries, mutations, modais da aba |

### Feature folders

Abas com CRUD seguem trio de formulário:

```
*-form-schema.ts    → Zod
*-form-utils.ts     → parse/normalize + PUT merge
*-form-modal.tsx    → UI + useForm + mutation
```

Checklist edita inline (sem modal). Não há DnD nem `PUT /checklist/ordem`: a ordem na tela é `Ordenacao`; item novo usa `max+1`.

Scripts usam Accordion + texto puro (`whitespace-pre-wrap`, `font-mono`). Não usar `MarkdownView`.

---

## 4. Dados e HTTP

### Camadas

| Camada | Onde |
| ------ | ---- |
| Tipos da API | `services/produtos/types.ts` |
| Cliente HTTP | `services/produtos/*.ts` + `request.ts` (`fetchWithAuth`) |
| Erro | `services/produtos/api-error.ts` → `ApiError { status, message }` |
| Query keys | `hooks/produtos/produtos-query-keys.ts` |
| Hooks | `hooks/produtos/` (nunca dentro de `components/`) |
| Proxy | `app/api/produtos/**` com `withPermission` |

### PUT merge

Toda atualização envia o objeto completo: mesclar o registro atual da API com os campos editados. Versão no legado: fachada PUT → `PATCH /projeto-versoes-sub/{seq}`.

`vacaLeiteira`: UI boolean; API `0` = não, ≠ `0` (ex.: `-1`) = sim.

`VinculadoA`: `0` = nenhum. No combobox de edição, excluir o próprio produto.

### Paginação

Cursor (`per_page` + `cursor`). Sem contador de total. Infinite scroll com IntersectionObserver. Próxima página mostra **Carregando mais…** (`ProdutosCarregandoMais`).

### Invalidação

Mutations invalidam o prefixo da query da entidade (`produtosKeys.versoes(id)`, `scripts(id)`, etc.) e, no produto, também `produtosKeys.all` + `detail`.

---

## 5. Abas e navegação

- URL: `produtoEditTabParser` (`?aba=dados|versoes|modulos|checklist|scripts`). Default `dados` (query omitida).
- Lazy-load: cada aba recebe `enabled={activeTab === "..."}`. Só a aba ativa monta (`TabsContent` sem `forceMount`, exceto Dados gerais). O fetch não dispara até a visita.
- Guard: alterações não salvas em Dados gerais bloqueiam troca de aba **e** o botão Voltar (`ConfirmacaoModal`).
- Sem `edit-product`: Dados gerais em texto (não input disabled); switches como **Sim/Não**; badge "Somente leitura"; card Ações oculto.

Colaboradores nunca aparecem como número cru: `ProdutoPessoaChip` (iniciais + nome, ou `"#<id>"`).

Exclusão com HTTP 409 abre diálogo bloqueado (`ProdutoConflitoDialog` / equivalentes de versão e módulo).

---

## 6. UI

- Tokens semânticos apenas (sem hex/rgb em `components/produtos`).
- Card: header `p-4 pb-2` + `border-border-divider`; conteúdo `px-6 pb-6 pt-2`. Ícone do header 14px, `text-muted-foreground`.
- Espaçamento 8 / 16 / 24. Entre cards na coluna: `gap-2`. Entre colunas: `gap-6`. Lateral ~360px, `sticky` no desktop.
- Listagem e versões: tabela no `md+`, cards abaixo.
- Botão primário: `primary` (escuro). Botões de ação: `w-full` no mobile, `sm:w-auto`.
- Modais de formulário: tela cheia no mobile (`PRODUTO_FORM_DIALOG_CLASS`).
- Toda lista/aba: skeleton que espelha o layout, `EmptyState`, erro com "Tentar novamente".

---

## 7. Como adicionar uma aba

1. Pasta `edicao/<feature>/` com `index.tsx` exportando `Aba<Feature>`.
2. Registrar em `produto-edit-form.tsx` (`TABS` + `TabsContent` com `enabled`).
3. Incluir o valor em `produto-edit-url-parsers.ts`.
4. Hooks em `hooks/produtos/` e chave em `produtos-query-keys.ts`.
5. Se houver modal: trio schema + utils + modal.
6. Skeleton de carga inicial + empty + erro.

---

## 8. Checklist — nova feature

- [ ] Feature folder com `index.tsx`?
- [ ] Vocabulário Produto/Versão/Módulo/Checklist/Script (nunca "projeto")?
- [ ] Hooks em `hooks/produtos/` e query keys registradas?
- [ ] PUT envia objeto completo (merge)?
- [ ] Skeleton, vazio, erro, "Carregando mais…" (se paginado)?
- [ ] Ações somem sem permissão?
- [ ] 409 de exclusão com diálogo bloqueado?
- [ ] Colaborador via chip, nunca id cru?
- [ ] Labels em `constants.ts`?

---

## 9. Referências

| Documento | Conteúdo |
| --------- | -------- |
| [PADRAO_COMPONENTES.md](./PADRAO_COMPONENTES.md) | Cards, skeletons, empty states |
| [PADRAO_PROJETOS.md](./PADRAO_PROJETOS.md) | Modelo de feature folders |
| [PADRAO_REQUISICOES.md](./PADRAO_REQUISICOES.md) | Chamadas HTTP |
| [RBAC_PERMISSOES.md](./RBAC_PERMISSOES.md) | Permissões |
| [PRODUTO_DADOS_PROTOTIPO.md](./PRODUTO_DADOS_PROTOTIPO.md) | Contrato das APIs do legado |
| `.cursor/rules/produtos.mdc` | Regras do agente no módulo |

**Última atualização**: Setembro 2026
