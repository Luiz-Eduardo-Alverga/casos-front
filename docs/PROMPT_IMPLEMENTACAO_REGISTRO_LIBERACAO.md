# Prompt — Implementação do Módulo Registro de Liberação (Claude Code)

> Cole este prompt no Claude Code. Ele deve importar o protótipo via MCP Claude Design e implementar o módulo no Casos Front / Softflow.

---

## Missão

Implementar o módulo **Registro de Liberação** no repositório Casos Front.

Use o **protótipo Claude Design** como fonte da **estrutura de telas, navegação, comportamento e hierarquia de informação**.

Use os **padrões do Softflow** (pasta `docs/`) como fonte **obrigatória do layout, componentes, espaçamentos e tokens visuais**.

**Regra de ouro:** o protótipo define *o quê* e *como o usuário opera*; o Softflow define *como isso aparece e é construído no código*. Não portar CSS/HTML do protótipo pixel a pixel. Traduza a experiência para os componentes e padrões já existentes no app.

---

## Passo 0 — Importar o protótipo (Claude Design MCP)

Use the claude_design MCP (`https://api.anthropic.com/v1/design/mcp`, auth via `/design-login`) to import this project:

https://claude.ai/design/p/cf2e67ac-e379-406d-aafb-a1fd243bdbc5?file=Registro+de+Libera%C3%A7%C3%A3o.html

Focus on these files (the whole project is readable):

- `Registro de Liberação.html`

Also read these files the selection imports:

- `tweaks-panel.jsx`

Implement: `Registro de Liberação.html`

Antes de codar:

1. Autentique o MCP se necessário (`/design-login`).
2. Importe/leia o projeto acima.
3. Extraia do HTML: telas, estados (listagem / criação / detalhe ABERTO / detalhe FECHADO), abas, ações, campos e fluxos.
4. Ignore estilos, tipografia custom e layout “solto” do HTML quando conflitarem com Softflow.
5. Só então implemente no app.

---

## O que pegar do protótipo vs. o que pegar do Softflow

| Do protótipo (estrutura / UX) | Do Softflow (layout / código) |
|-------------------------------|-------------------------------|
| Fluxo listagem → criar → detalhe | Cards, tabs, filtros, tabelas, badges |
| Abas (Liberação, Casos da versão, etc.) | Shell de edição com abas (padrão Projetos/Casos) |
| Agrupamento lógico de campos/seções | Densidade, paddings, tipografia Softflow |
| Ações (criar, editar, fechar, add/remove versão) | Botões, dialogs, forms shadcn do projeto |
| Estados ABERTO / FECHADO e empty | Skeletons, EmptyState, tokens semânticos |
| Comportamento de filtros e navegação | Sidebar/header já existentes da app |

**Não fazer:**

- Copiar classes/cores/fontes do HTML do Claude Design
- Inventar design system paralelo
- Implementar sidebar/header do zero (já existem no layout do dashboard)
- Hardcodar hex — usar tokens (`bg-card`, `text-foreground`, `border-border-divider`, etc.)

---

## Documentação obrigatória (ler antes de implementar)

Leia e siga, nesta ordem:

1. `docs/BRIEF_CLAUDE_DESIGN.md` — shell visual Softflow
2. `docs/PADRAO_ESPACAMENTOS.md` — paddings, gaps, shell com abas
3. `docs/PADRAO_COMPONENTES.md` — cards, cores/tokens, skeletons, empty states
4. `docs/PADRAO_COMPONENTES_GRANDES.md` — feature folders
5. `docs/PADRAO_PROJETOS.md` — **modelo de pastas mais próximo** (listagem + cadastro + edição com abas)
6. `docs/PADRAO_REQUISICOES.md` — arquitetura de requests (já parcialmente pronta)
7. `docs/PADRAO_CASOS.md` — se precisar espelhar padrões de casos/tabelas
8. `docs/PROMPT_DESIGN_REGISTRO_LIBERACAO.md` — escopo funcional e campos do domínio

Espelhe a organização do módulo **Projetos** (`components/projetos/`), adaptada para liberações.

---

## Camada de dados — JÁ IMPLEMENTADA (reutilizar)

Não recriar services/hooks/API routes. Use o que já existe:

### Interfaces

- `interfaces/liberacao.ts`

### Services (`services/sprint/`)

| Função | Arquivo |
|--------|---------|
| `getLiberacoes` | `get-liberacoes.ts` |
| `getLiberacaoByRegistro` | `get-liberacao-by-registro.ts` |
| `createLiberacao` | `create-liberacao.ts` |
| `updateLiberacao` | `update-liberacao.ts` |
| `fecharLiberacao` | `fechar-liberacao.ts` |
| `addLiberacaoVersoes` | `add-liberacao-versoes.ts` |
| `deleteLiberacaoVersao` | `delete-liberacao-versao.ts` |

### Hooks (`hooks/liberacoes/`)

| Hook | Uso |
|------|-----|
| `useLiberacoes` / `useLiberacoesInfinite` | Listagem |
| `useLiberacaoByRegistro` | Detalhe |
| `useCreateLiberacao` | Criar |
| `useUpdateLiberacao` | Atualizar (PATCH) |
| `useFecharLiberacao` | Fechar (PUT) |
| `useAddLiberacaoVersoes` | Adicionar versões |
| `useDeleteLiberacaoVersao` | Remover versão |

### API Routes

- `app/api/sprint/liberacoes/route.ts` — GET list + POST create
- `app/api/sprint/liberacoes/[registro]/route.ts` — GET detalhe + PATCH + PUT fechar
- `app/api/sprint/liberacoes/[registro]/versoes/route.ts` — POST versões
- `app/api/sprint/liberacoes/[registro]/versoes/[sequencia]/route.ts` — DELETE versão

Para a aba **Casos da versão**, use `useProjetoMemoria` / `getProjetoMemoria` com filtros `produto_id` + `versao_produto` (e demais filtros do protótipo se existirem).

---

## Estrutura de código sugerida

Espelhar Projetos:

```
app/(dashboard)/liberacoes/page.tsx              # Listagem
app/(dashboard)/liberacoes/novo/page.tsx         # Criação (se for página)
app/(dashboard)/liberacoes/[registro]/page.tsx  # Detalhe/edição com abas

components/liberacoes/
├── index.tsx                         # Listagem
├── liberacoes-tabela.tsx
├── filtros/
├── tabela/
├── layout/                           # skeletons
├── cadastro/                         # ou modal, se o protótipo/Softflow indicar
└── edicao/
    ├── index.tsx                     # fetch + estados
    ├── liberacao-edit-form.tsx       # tabs shell
    ├── liberacao-edit-header.tsx
    ├── abas/
    │   ├── aba-liberacao.tsx
    │   └── aba-casos-versao.tsx
    ├── liberacao/                    # feature da aba principal
    └── casos-versao/                 # feature da aba de casos
```

Ajuste nomes se o protótipo sugerir melhor IA, mas **mantenha o padrão de pastas Softflow**.

Integre navegação no menu/sidebar do dashboard se houver padrão de links de módulos (seguir como Projetos/Casos/Reports entram no menu).

---

## Escopo funcional a cobrir

Com base no protótipo + domínio:

1. **Listagem** — filtros (produto, status, tipo, versão, sort), tabela, infinite/cursor, CTA criar, abrir detalhe
2. **Criação** — produto, tipo, status, data prevista versão final, observação, versões[]
3. **Detalhe / edição (aba Liberação)** — formulário agrupado em cards Softflow; PATCH via `useUpdateLiberacao`
4. **Fechar liberação** — confirmação + PUT via `useFecharLiberacao` (`status: FECHADO` + `versao_final_data_liberacao`)
5. **Versões** — listar, adicionar (`useAddLiberacaoVersoes`), remover (`useDeleteLiberacaoVersao` com confirm)
6. **Aba Casos da versão** — listagem via projeto-memória filtrada pela versão/produto do registro
7. Estados: loading (skeleton espelhando layout), empty, erro, ABERTO vs FECHADO (readonly/ações restritas quando fechado)

### Campos do registro (referência)

`registro`, `produto_id`, `datas`, `tipo_liberacao`, `status`, `liberacao`, `observacao`, `link_video`, `link_pdf`, `previsao_liberacao`, `previsao_piloto`, `piloto_data_prevista`, `piloto_data_liberacao`, `versao_final_data_prevista`, `versao_final_data_liberacao`, `melhorias_data_inicial`, `melhorias_data_final`, `gerar_ocorrencias_liberacao`, `url_versao_piloto`, `ja_liberado`, `versoes[]`.

Valores: status `ABERTO` | `FECHADO`; tipo ex. `COMPLETA`; versão `X.Y.Z.W`.

---

## Critérios de aceite

- [ ] Protótipo lido via Claude Design MCP
- [ ] UI visualmente alinhada a Softflow (`BRIEF_CLAUDE_DESIGN` + espaçamentos + cards)
- [ ] Estrutura de pastas alinhada a `PADRAO_PROJETOS` / feature folders
- [ ] Hooks/services existentes reutilizados (sem duplicar camada de API)
- [ ] Listagem + criar + editar + fechar + versões funcionando
- [ ] Aba Casos da versão consumindo projeto-memória
- [ ] Skeletons e empty states
- [ ] Tokens semânticos (sem cores hardcoded)
- [ ] Desktop-first; integrado ao layout dashboard existente
- [ ] Sem inventar endpoints; sem inventar design system

---

## Ordem de implementação recomendada

1. Importar e mapear telas/estados do protótipo
2. Rotas Next.js do módulo
3. Listagem (filtros + tabela + hooks de listagem)
4. Criação
5. Shell de edição com abas + header de contexto
6. Aba Liberação (form + versões + fechar)
7. Aba Casos da versão (projeto-memória)
8. Estados ABERTO/FECHADO, skeletons, empty, confirmações
9. Entrada no menu/navegação
10. Revisão visual contra `docs/BRIEF_CLAUDE_DESIGN.md` e `docs/PADRAO_ESPACAMENTOS.md`

---

## Tom

Implementação pragmática, consistente com o código existente. Prefira reutilizar componentes shadcn e padrões de Projetos/Casos a criar abstrações novas. Quando o protótipo e o Softflow divergirem no visual, **vence o Softflow**. Quando divergirem no fluxo útil, **vence o protótipo** (desde que caiba nos padrões de UI).
