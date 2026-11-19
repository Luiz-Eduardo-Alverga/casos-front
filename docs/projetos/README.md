# Projetos

> **Estado: implementado.** É o modelo de organização de pastas seguido por Casos e Produtos.
> Padrões gerais em [`padrao-front/`](../padrao-front/README.md).

> **Próxima mudança planejada: clonar projeto.** Especificada em 2026-11-19 e ainda não
> implementada. Ver a seção [Próxima mudança planejada](#próxima-mudança-planejada-clonar-projeto),
> as decisões em [`decisoes.md`](decisoes.md) e o protótipo em [`prototipo/`](prototipo/).

## O que é

Cadastro SGP de projeto: listagem em `/projetos`, cadastro em `/projetos/novo` e edição em
`/projetos/[id]` com as abas Abertura, Escopo, Risco, Stakeholders e Cronograma. O Escopo lista
casos e reports da memória do projeto. Dados da API Soft Flow (`sgp-*`, `projeto-memoria`).

Abaixo, a organização de `components/projetos/`. Para aba nova, seção 11; campo novo na Abertura,
seção 12; feature nova, checklist da seção 14.

### Duplicar casos (aba Escopo)

Quem tem `edit-case` ou `edit-report` vê o botão "Duplicar casos" e checkboxes na tabela. O modal
escolhe o projeto destino e chama `POST /api/projeto-casos/transferir-proximo-projeto`
(`services/projeto-casos/transferir-proximo-projeto.ts`).

- Nenhum caso marcado: o body vai só com `cronograma_origem` e `cronograma_destino`. A API duplica
  os elegíveis do projeto (Aberto e Em desenvolvimento; bloqueados ficam de fora). Os filtros da aba
  não entram nessa chamada.
- Casos marcados: o body inclui `registros` com os ids dos casos (`caso.id`). O checkbox do
  cabeçalho marca só as linhas já carregadas (a lista pagina de 15 em 15). Casos que saem da lista
  carregada (filtro ou troca de projeto) deixam de estar marcados.

## Próxima mudança planejada: clonar projeto

### Objetivo

Criar um projeto novo a partir de um existente informando só **nome, data de início e data de
fim**. Setor, PDV, classe, tipo e cliente vêm do projeto de origem. O uso principal é abrir a
próxima sprint sem recadastrar tudo (ex.: `Squad XP 2026 - 11.02` → `Squad XP 2026 - 12.01`).
Decisões #1 a #9 em [`decisoes.md`](decisoes.md).

### Contrato da API Soft Flow

`POST /sgp-cadastros/{registro}/clonar`, em que `{registro}` é o projeto de origem.

```json
{
  "nome_projeto": "Squad XP 2026 - 11.02 - Clone",
  "data_inicio": "2027-11-01 00:00:00",
  "data_fim": "2027-11-30 00:00:00"
}
```

Resposta 200 (testada pelo usuário com a origem 3278):

```json
{
  "success": true,
  "message": "Projeto clonado com sucesso",
  "data": { "registro": 3311, "nome_projeto": "Squad XP 2026 - 11.02 - Clone", "status": "ABERTO",
            "data_inicio": "2027-11-01 00:00:00", "data_fim": "2027-11-30 00:00:00",
            "datas": "2027-11-01 00:00:00", "data_desativado": "2027-11-30 00:00:00",
            "cliente": 293, "usuario": 816, "tipo": "PROJETO", "classe_projeto": "ESTRATEGICO",
            "pdv": "JOAO PESSOA", "setor": "SQUAD XP", "...": "demais campos de SgpCadastroData" }
}
```

O `data` tem o mesmo formato de `SgpCadastroData` (`interfaces/sgp-cadastro.ts`). No exemplo,
`necessidades`, `expectativas`, `objetivo` e os checklists (usabilidade, confiabilidade etc.)
vieram vazios. A resposta de erro ainda não foi vista (pergunta 5).

### Protótipo

[`prototipo/softflow-prototipo.html`](prototipo/softflow-prototipo.html), menu **Projetos**. A
listagem do protótipo imita a do app (ID/Nome, Data de início, Data de fim, Status, Ações). A
lógica está em `pjVals` e `pjAbrirClone`, e a marcação em `<sc-if value="{{ isProjetos }}">` e
`<sc-if value="{{ pjcOn }}">`. Clonar com o nome de um projeto que já existe simula um erro da
API, só para mostrar o estado de erro (no app, quem decide é o backend, decisão #5).

| Captura | Estado |
|---------|--------|
| `capturas/01-projetos-listagem.png` | Listagem com o botão Clonar (ícone de cópia) antes do Editar |
| `capturas/02-clonar-modal-padrao.png` | Modal aberto com os padrões: nome "… - Clone", próximo período e duração |
| `capturas/03-clonar-modal-data-invalida.png` | Data de fim anterior ao início, com o erro no campo |
| `capturas/04-clonar-modal-erro-api.png` | Erro da API acima do rodapé, dados preservados, toast de erro |
| `capturas/05-projeto-clonado.png` | Depois do sucesso: toast e linha nova destacada com "Novo" e "Clonado do projeto #…" |
| `capturas/06-clonar-modal-mobile.png` | 390px: o modal ocupa a largura toda e fica preso embaixo, como os outros |

### Comportamento

1. **Ponto de entrada:** botão de ícone `Copy` na coluna Ações de
   `projetos-tabela-row-listagem.tsx`, antes do `SquarePen`, com `aria-label="Clonar o projeto
   {nome}"` e tooltip "Clonar projeto". A coluna Ações cresce o suficiente para os dois ícones.
   Sem permissão, o botão não aparece (pergunta 1).
2. **Modal "Clonar projeto"** (`Dialog`, mesmo visual do `EscopoDuplicarCasosModal`: header com
   ícone escuro, título e subtítulo "Cria um novo projeto com o mesmo cadastro do projeto de
   origem."):
   - Bloco de leitura "Projeto de origem": `#registro`, nome, setor · PDV, classe e período.
   - **Nome do novo projeto** \*: padrão `"{nome} - Clone"`, máximo de 120 caracteres.
   - **Data de início** \* e **Data de fim** \*, lado a lado (empilham no mobile), com o
     `DatePicker` do repositório. Padrões na decisão #3.
   - Linha "Duração do novo projeto: N dias", com "—" quando as datas não fecham.
   - Texto informativo (ícone `Info`): "O novo projeto copia setor, PDV, classe, tipo e cliente do
     projeto de origem e começa com status Aberto. O projeto de origem não é alterado. Para levar
     casos, use "Duplicar casos" na aba Escopo do projeto de origem." Ajustar conforme a pergunta 4.
   - Rodapé: **Cancelar** (outline) e **Clonar projeto** (primário, ícone `Copy`), que vira
     "Clonando...".
3. **Validação** (react-hook-form + Zod): nome obrigatório após `trim`, as duas datas
   obrigatórias e fim maior ou igual ao início. Os erros de obrigatório aparecem no envio, e o de
   ordem das datas aparece assim que as duas estão preenchidas. Sem checagem de nome duplicado no
   front (decisão #5).
4. **Envio:** datas com `formatDateTimeSgp`. Durante a chamada, botões desabilitados, e Esc, X e
   clique fora não fecham (decisão #8).
5. **Sucesso** (decisão #7): fecha o modal, mostra o toast "{message} · #{registro} {nome}",
   invalida `["sgp-cadastros"]` e destaca a linha do `registro` novo com `bg` de destaque e o selo
   "Novo" enquanto a tela estiver montada. Se a linha não estiver nas páginas carregadas, fica só o
   toast.
6. **Erro** (decisão #8): o modal fica aberto com os dados, mostra a mensagem da API acima do
   rodapé (ícone `AlertTriangle`, `text-destructive`) e um `toast.error`. Mudar qualquer campo
   apaga a mensagem.

### O que reaproveitar

- Rota: copiar o padrão de `app/api/sgp-cadastros/route.ts` (`withPermission`,
  `getAuthorizationHeader`, `extractApiError`) e de `app/api/projeto-casos/clonar/[id]/route.ts`.
- Service e hook: mesmo formato de `services/sgp-cadastros/update-sgp-cadastro.ts` (`fetchWithAuth`)
  e de `hooks/casos/use-clonar-caso.tsx` (`useMutation`).
- Tipos: `SgpCadastroData` para o `data` da resposta.
- Datas: `parseSgpDateToDate` e `formatDateTimeSgp` de `components/projetos/cadastro/utils.ts`;
  `formatSgpDateTimeToPt` de `components/projetos/utils.ts` para o período no bloco de origem.
- Modal: estrutura de `components/projetos/edicao/escopo/escopo-duplicar-casos-modal.tsx` e
  `DatePicker` de `components/ui/date-picker.tsx` (ou `date-picker-input.tsx`, o que o cadastro
  usar).
- Permissão: `hasPermission` / `permissionsLoaded` de `lib/rbac-client`, decidida no entrypoint
  `components/projetos/index.tsx`, como o `canCreateProject`.

### Arquitetura proposta

```text
app/api/sgp-cadastros/[id]/clonar/route.ts      POST → API externa POST /sgp-cadastros/{id}/clonar (withPermission)
interfaces/sgp-cadastro.ts                      + ClonarSgpCadastroRequest / ClonarSgpCadastroResponse
services/sgp-cadastros/clonar-sgp-cadastro.ts   fetchWithAuth para /api/sgp-cadastros/{id}/clonar
hooks/projetos/use-clonar-sgp-cadastro.tsx      useMutation + invalidate ["sgp-cadastros"]
components/projetos/clonar/
├── index.tsx                  ProjetoClonarModal: useForm, mutation, sucesso/erro
├── schema.ts                  Zod (nome, dataInicio, dataFim, fim ≥ início)
└── utils.ts                   padrões do clone (nome, próximo período) e duração em dias (funções puras)
components/projetos/index.tsx                   canCloneProject + estado do modal e do registro destacado
components/projetos/projetos-tabela.tsx         repassa onClonar e registroDestacado para a tabela
components/projetos/tabela/projetos-tabela-types.ts  + onClonar?, registroDestacado? na variante listagem
components/projetos/tabela/projetos-tabela-row-listagem.tsx  + botão Clonar e destaque "Novo"
```

O botão só aparece quando `onClonar` é passado. Assim a permissão fica no entrypoint e a linha
não conhece RBAC (regra da seção 10 deste README).

### Perguntas em aberto (resolver na Fase 0)

1. **Permissão:** usar `create-project` (recomendado: clonar cria um projeto, e não precisa de
   permissão nova nem seed) ou criar `clone-project` com seed em `db/scripts/`? Decisão do usuário.
2. **Nome duplicado:** o backend recusa um nome que já existe? Com que status e mensagem? Se não
   recusar, o usuário decide se isso fica assim.
3. **Usuários autorizados:** o cadastro faz `POST /sgp-usuarios` logo depois de
   `POST /sgp-cadastros` (`app/api/sgp-cadastros/route.ts`). O clone já vincula usuários ao projeto
   novo (o logado ou os da origem)? Conferir na aba de usuários do projeto clonado. Se não vincular,
   a rota de clonar faz o mesmo `POST /sgp-usuarios` com o usuário logado, e isso vira decisão nova.
4. **O que mais é copiado:** cronograma, riscos, stakeholders, usuários e casos da origem vêm para
   o projeto novo? Conferir clonando um projeto de teste que tenha esses dados. O texto informativo
   do modal e a decisão #9 dependem disso.
5. **Erro:** formato e status da resposta de erro da API (`success: false` com `message`? 4xx?).

### Perguntas do Claude Code

#### P1 — Permissão do clone · aberta

Fase: Fase 0 (2026-11-19). Contexto: é a pergunta 1 do planejamento. Hoje o módulo usa
`create-project` (`components/projetos/index.tsx`, `app/api/sgp-cadastros/route.ts`, seed em
`db/scripts/seed-create-project-rbac.sql`) e `edit-project`.
Opções: **A)** usar `create-project` no botão e no `withPermission` da rota nova. **B)** criar
`clone-project` com seed `db/scripts/seed-clone-project-rbac.sql` e atribuição aos papéis na UI.
Recomendação do Claude Code: **A**, porque clonar cria um projeto e quem pode cadastrar já pode
fazer o mesmo à mão; não exige seed nem configuração de papéis.

#### P2 — Tokens do destaque da linha nova e do selo "Novo" · aberta

Fase: Fase 0 (2026-11-19). Contexto: o protótipo (captura 05, `pjVals`) pinta a linha clonada com
`--yellow-soft` e o selo "Novo" com fundo amarelo. Não há token semântico de "linha em destaque" em
`app/globals.css`, e o `CLAUDE.md` restringe o amarelo a CTA de marca. Os amarelos que existem são
do painel (`panel-badge-importance-yellow` / `-bg`) e da marca (`brand-yellow`).
Opções: **A)** criar tokens novos `row-highlight` (fundo da linha) e `badge-new` / `badge-new-bg`
(selo), light e `.dark`, num amarelo suave como o do protótipo, e registrar no `design-system.md`.
**B)** reaproveitar `panel-badge-importance-yellow-bg` na linha e `panel-badge-importance-yellow`
no selo, sem token novo. **C)** destaque neutro/azul com os tokens existentes (`bg-muted` na linha
e selo com `status-info`), sem amarelo.
Recomendação do Claude Code: **A**, porque mantém o visual aprovado no protótipo com nome
semântico próprio, sem amarrar a listagem de projetos a tokens do painel.

#### P3 — Onde conferir as perguntas 2 a 5 da API · aberta

Fase: Fase 0 (2026-11-19). Contexto: o plano manda conferir na Parte 1, "clonando um projeto de
teste". Cada teste cria um projeto de verdade na API Soft Flow apontada pelo `.env`, e não há
rota de exclusão de projeto no app. As respostas mudam a rota (vínculo em `/sgp-usuarios`,
pergunta 3), o texto do modal e a decisão #9 (pergunta 4).
Opções: **A)** o usuário indica um projeto de teste (registro) e autoriza o Claude Code a cloná-lo
pela rota nova, logado no app local, duas vezes (uma com sucesso, outra com nome repetido/datas
inválidas para ver o erro). **B)** o usuário faz os testes no Postman/Insomnia e responde as
perguntas 2 a 5 aqui. **C)** implementar as Partes 1 e 2 sem conferir: a rota repassa o erro da
API como vier (`extractApiError`), não faz `POST /sgp-usuarios` e o texto do modal fica como está;
corrige-se depois se o teste mostrar diferença.
Recomendação do Claude Code: **A**, porque responde tudo de uma vez pelo mesmo caminho que o
usuário final vai usar, com o mínimo de projetos criados.

### Plano de implementação

1. **Parte 1: dados.** Rota `app/api/sgp-cadastros/[id]/clonar/route.ts`, tipos, service e hook.
   Conferir as perguntas 2 a 5 na API de teste, clonando um projeto de teste (não usar projetos
   reais de sprint).
2. **Parte 2: tela.** `components/projetos/clonar/` (modal, schema, utils), botão na linha, permissão
   no entrypoint, destaque da linha nova. Conferir no navegador: padrões do modal, erro de datas,
   erro da API, sucesso com destaque, tema escuro e 390px.
3. **Parte 3: fechamento.** README (tirar "Próxima mudança planejada" e documentar o clone no
   formato padrão), decisões, contexto, status e `docs/rbac/` se a permissão mudar.

### Fora do escopo

Editar outros campos no clone, clonar vários projetos de uma vez, copiar casos (existe "Duplicar
casos"), clonar a partir da tela de edição e mudanças no backend.

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

Abas com CRUD, modais, grids e múltiplos estados seguem o padrão de **feature folder** descrito em [docs/padrao-front/README.md](../padrao-front/README.md).

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

- Quando um arquivo cresce e vira pasta, manter **arquivo ponte** no path antigo (re-export) para não quebrar imports existentes — ver [docs/padrao-front/README.md](../padrao-front/README.md).

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
| [docs/padrao-front/README.md](../padrao-front/README.md) | Cards, cores, skeletons, empty states, layout responsivo |
| [docs/padrao-front/README.md](../padrao-front/README.md) | Quando e como decompor em feature folders |
| [docs/camada-de-dados/README.md](../camada-de-dados/README.md) | Padrões de chamadas à API |
| [docs/rbac/README.md](../rbac/README.md) | Permissões do sistema |

---

**Última atualização**: Junho 2025  
**Versão**: 1.0
