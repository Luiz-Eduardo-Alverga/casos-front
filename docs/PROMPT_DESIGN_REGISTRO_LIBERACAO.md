# Prompt — Módulo Registro de Liberação (Soft Flow / Casos Front)

> Prompt para envio ao Claude Design.
>
> **Liberdade criativa:** na experiência (fluxos, hierarquia de informação, agrupamento de campos, estados e interações).
>
> **UI obrigatória:** seguir o padrão visual Softflow / Casos Front — não inventar um visual novo.
>
> Referências de UI do repositório: `docs/BRIEF_CLAUDE_DESIGN.md`, `docs/PADRAO_ESPACAMENTOS.md`, `docs/PADRAO_COMPONENTES.md`, `docs/PADRAO_PROJETOS.md`.

---

## Contexto do produto

Quero o design de uma tela web para o módulo **Registro de Liberação**, dentro do Soft Flow (Casos Front) — sistema interno de gestão de desenvolvimento. O público são PMs, líderes técnicos e QA que acompanham o ciclo de release (versões, piloto, versão final, casos vinculados).

### O que é livre vs. o que é fixo

| Livre (experiência) | Fixo (UI Softflow) |
|---------------------|--------------------|
| Como o usuário navega entre listagem → detalhe → abas | Sidebar + header fixo + cards brancos |
| Como agrupar campos e seções na aba Liberação | Tipografia, espaçamentos, densidades e tokens |
| Quando usar modal vs. página vs. confirmação | Badges pílula, tabelas, filtros em grid |
| Como comunicar status ABERTO/FECHADO e empty states | Shell de edição com abas (padrão Projetos/Casos) |
| Quais ações priorizar no header vs. no rodapé | Sem hero, sem marketing, sem visual “AI template” |

O resultado deve **parecer uma tela nativa do Softflow**, não um redesign do produto. A criatividade está em tornar o fluxo de release claro e eficiente **dentro** desse sistema visual.

---

## Padrão visual Softflow (obrigatório)

Use como base o brief em `docs/BRIEF_CLAUDE_DESIGN.md`. Resumo:

### Shell da aplicação

- **Sidebar** à esquerda (expandida ~256px / colapsada ~64px)
- **Header fixo** no topo: altura **64px**, fundo branco, borda inferior sutil, sombra leve
- Conteúdo: padding **24px** (`px-6`), topo **80px** (`pt-20`) para não ficar sob o header
- Desktop: scroll preferencialmente **dentro dos cards** / área de conteúdo, não página “marketing”
- Visual: limpo, denso, corporativo — fundo de página cinza bem claro, cards brancos

### Cards (padrão visual obrigatório)

```
┌───────────────────────────────┐
│ [ícone 14px] Título sm/semibold │  ← header: p-4 pb-2, borda inferior
├───────────────────────────────┤
│  campos / tabela / lista      │  ← content: p-6 pt-2, space-y-2
└───────────────────────────────┘
```

- Fundo branco (`bg-card`), `rounded-lg`, sombra sutil (`shadow-card`)
- Entre cards na mesma coluna: **8px** (`gap-2`)
- Entre colunas: **24px** (`gap-6`)
- Entre seções principais: **24px**
- Densidade preferida para edição: **compacta** (padrão atual de edição de caso/projeto)

### Tipografia

- Título de página: **2xl / bold**
- Subtítulo: **sm**, texto secundário
- Título de card: **sm / semibold** + ícone **14×14**
- Texto de tabela/lista: **xs / semibold** quando for o padrão da app

### Filtros e tabelas

- Filtros em card com grid **1 → 2 (sm) → 4 (lg)**, gap **16px**
- Tabelas: fundo branco, separadores sutis, células `py-3 px-2.5`, sem hover colorido chamativo
- Badges pílula (`rounded-full`): azul (aberto), verde (concluído/corrigido), laranja/vermelho (alerta/retorno), amarelo (importância) — usar de forma sóbria

### Cores

- Não inventar hex soltos nem temas purple/cream/neon
- Paleta semântica Softflow: cinza claro / branco / cinza escuro / badges + destructive vermelho com fundo suave

### O que NÃO fazer na UI

- Não redesenhar o design system
- Não usar cards com sombra forte, cantos exagerados ou estilo dashboard genérico
- Não colocar hero, marketing, stats strips ou badges decorativos em excesso
- Não copiar “espaçamentos bonitos” fora da tabela Softflow

---

## Conceito estrutural obrigatório: abas

A experiência principal deve ser **dividida em abas**, no mesmo shell usado em **Edição de Projeto / Edição de Caso** (`docs/PADRAO_ESPACAMENTOS.md`, `docs/PADRAO_PROJETOS.md`):

- Tabs no topo
- Header/contexto da página (produto, versão(ões), status) **visível ao trocar de aba**
- Área rolável abaixo das tabs (`mt-2`)
- Conteúdo da aba em cards empilhados (`gap-2`) ou layout 2 colunas (`gap-6`) quando fizer sentido
- Rodapé fixo de ações se necessário (reserva `pb-24`); senão `pb-12`

Sugestão de abas (nomes podem ser ajustados se a experiência pedir):

1. **Liberação** — gestão do registro (foco desta entrega)
2. **Casos da versão** — lista de casos filtrados por produto/versão (projeto-memória)
3. (Opcional) placeholders leves para abas futuras (Histórico, Anexos, etc.) — só se ajudar o shell

---

## Fluxos e funcionalidades

### 1) Listagem de liberações

Seguir layout Softflow de **listagem / painel**:

- Header da página (título + CTA criar)
- Card de filtros
- Card de tabela/lista com paginação cursor
- Filtros: produto, status, tipo de liberação, versão, ordenação
- Ações: criar, abrir detalhe/edição, fechar
- Estados: skeleton, empty, erro

### 2) Criar liberação

Pode ser **página de cadastro** (padrão criar caso/projeto) ou **modal** (padrão CRUD de subfeature em Projetos). Escolha o que melhor servir a experiência, mas mantenha componentes Softflow.

Campos:

- produto (obrigatório)
- tipo de liberação (ex.: `COMPLETA`)
- status (ex.: `ABERTO`)
- data prevista da versão final
- observação
- uma ou mais versões (lista, ex.: `8.0.1.0`)

### 3) Detalhe / edição da liberação (aba Liberação)

Visualizar e editar o registro. Agrupe campos em **cards/seções Softflow** (você decide o agrupamento — isso é parte da experiência).

| Campo | Tipo | Notas |
|-------|------|-------|
| registro | number | Somente leitura |
| produto_id | number | Produto |
| datas | datetime | Criação/registro |
| tipo_liberacao | string | Ex.: COMPLETA |
| status | string | ABERTO / FECHADO |
| liberacao | string | Escopo/flag |
| observacao | text | Livre |
| link_video | url/null | |
| link_pdf | url/null | |
| previsao_liberacao | date/null | |
| previsao_piloto | date/null | |
| piloto_data_prevista | date/null | |
| piloto_data_liberacao | date/null | |
| versao_final_data_prevista | date/null | |
| versao_final_data_liberacao | date/null | |
| melhorias_data_inicial | date/null | |
| melhorias_data_final | date/null | |
| gerar_ocorrencias_liberacao | boolean | |
| url_versao_piloto | url/null | |
| ja_liberado | boolean | Somente leitura |
| versoes[] | lista | `{ sequencia, registro, versao }` |

Sugestão de agrupamento (opcional — pode melhorar):

- Identidade (registro, produto, tipo, status, observação)
- Datas de piloto
- Datas de versão final
- Janela de melhorias
- Links / mídia / URL piloto
- Flags (gerar ocorrências, já liberado)
- Card de versões vinculadas

### 4) Fechar liberação

Ação explícita com confirmação Softflow (dialog). Payload:

- `status: "FECHADO"`
- `versao_final_data_liberacao` (obrigatória)

Comunique visualmente o estado encerrado (badge, campos readonly, CTA sumindo/desabilitado) **sem sair do visual Softflow**.

### 5) Gestão de versões

No detalhe:

- listar versões (chips ou tabela compacta Softflow)
- adicionar uma ou mais versões
- remover versão (com confirmação)
- feedback de sucesso/erro

### 6) Aba “Casos da versão”

Layout da aba com tabela/lista no padrão Softflow, dados de projeto-memória filtrados por produto + versão.

Colunas úteis (não precisa mostrar tudo):

- ID do caso
- resumo/descrição
- status
- prioridade
- produto / versão
- responsável(is) (dev, QA)
- datas relevantes
- flags (não planejado, liberação)

Inclua filtros leves e empty state (“nenhum caso para esta versão”).

---

## Valores de domínio

- **status**: `ABERTO` | `FECHADO`
- **tipo_liberacao**: `COMPLETA` (enum expansível)
- **versão**: `X.Y.Z.W` (ex.: `7.1.3.0`, `8.0.1.0`)
- **produto**: id + nome
- Datas backend: `"YYYY-MM-DD HH:mm:ss"` → date pickers amigáveis no UI

---

## Telas / artefatos

1. **Listagem** (filtros + tabela + CTA criar)
2. **Criação** (página ou modal Softflow)
3. **Detalhe/edição** na aba Liberação (versões + fechar)
4. **Aba Casos da versão** (mesmo shell)
5. Variação **ABERTO** vs **FECHADO**
6. Skeleton + empty + confirmação destrutiva

Desktop-first. Mobile não é prioridade.

---

## Tom da experiência (livre)

Operacional e confiável. O usuário precisa:

1. achar a liberação do produto/versão
2. entender se está aberta ou fechada
3. ajustar datas de piloto/versão final
4. gerenciar versões
5. saltar para os casos daquela versão sem sair do contexto

Otimize essa jornada. Não otimize inventando um novo visual.

---

## Entregável

Protótipo de alta fidelidade **no visual Softflow**, pronto para implementação em React + shadcn/ui + Tailwind, alinhado a:

- `docs/BRIEF_CLAUDE_DESIGN.md`
- `docs/PADRAO_ESPACAMENTOS.md`
- `docs/PADRAO_COMPONENTES.md`
- `docs/PADRAO_PROJETOS.md` (shell com abas / feature folders)

Não inventar specs de API.

---

## Referência técnica (backend já implementado)

| Ação | Método | Path |
|------|--------|------|
| Listar | GET | `/api/sprint/liberacoes` |
| Detalhe | GET | `/api/sprint/liberacoes/{registro}` |
| Criar | POST | `/api/sprint/liberacoes` |
| Atualizar | PATCH | `/api/sprint/liberacoes/{registro}` |
| Fechar | PUT | `/api/sprint/liberacoes/{registro}` |
| Adicionar versões | POST | `/api/sprint/liberacoes/{registro}/versoes` |
| Remover versão | DELETE | `/api/sprint/liberacoes/{registro}/versoes/{sequencia}` |

Hooks: `hooks/liberacoes/*` · Interfaces: `interfaces/liberacao.ts`
