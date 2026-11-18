# Avisos

> **Estado: implementado** (lista e leitura). README inicial escrito em 2026-11-17 a partir do
> código (levantamento, sem verificação no navegador). Completar ao mexer no módulo.
>
> **Próxima mudança planejada: envio de avisos (tela "Novo aviso").** Especificada em
> 2026-11-18 num chat de planejamento, com protótipo em [`prototipo/`](prototipo/) e decisões em
> [`decisoes.md`](decisoes.md). Ainda não implementada. Ver a seção
> [Próxima mudança planejada](#próxima-mudança-planejada-envio-de-avisos).

## O que é

Notificações internas do usuário. `/avisos` tem lista + detalhe com filtro por período, e o
header tem um dropdown de avisos que leva à tela. No detalhe, o aviso mostra o remetente e o
selo "Lido" ou o botão "Marcar como lido".

É a tela de destino padrão de quem não tem nenhuma outra permissão de "home"
(`lib/post-login-redirect.ts`), por isso não exige permissão própria.

## Arquitetura

```text
components/avisos/
├── avisos.tsx              entrypoint (filtro de período, lista, detalhe)
├── avisos-lista.tsx · avisos-detalhe.tsx · skeletons
└── avisos-dropdown.tsx     dropdown do header
```

- Dados: API Soft Flow via `/api/mensagens` (`hooks/mensagens/use-mensagens`,
  `use-marcar-mensagem-lida`). O legado só expõe leitura (`GET /mensagens`) e marcar como lido
  (`PUT /mensagens/{id}/lido`). A query usa a chave `["mensagens", ...]`.

## Como estender

- Tipo novo de aviso: o conteúdo vem do legado; a tela só lista. Mudança de origem exige API.

---

## Próxima mudança planejada: envio de avisos

### Objetivo

Hoje o Softflow só mostra avisos. A API Soft Flow ganhou o envio de **comunicados**. Esta
mudança adiciona a tela **Novo aviso** (`/avisos/novo`): quem tem permissão escreve título e
descrição, escolhe os destinatários (toda a empresa, filtros por PDV, setor, nível e função, e/ou
usuários específicos) e envia ou salva como rascunho.

### Protótipo

[`prototipo/softflow-prototipo.html`](prototipo/softflow-prototipo.html) é o protótipo navegável
do Softflow inteiro, com `support.js` (runtime) e `softflow-shell.js` (ícones e tema) ao lado.
Abrir o HTML no navegador direto do disco funciona. As telas desta mudança são **Avisos**
(menu lateral) e **Novo aviso** (botão no topo da tela de Avisos). No `<script data-dc-script>`
do HTML, a lógica está em `avVals` (lista), `anVals` (Novo aviso) e `avFechar`, e os dados
mockados em `AV_FILTROS`, `AV_USERS` e `AV_MSGS`.

Capturas em [`prototipo/capturas/`](prototipo/capturas/) (1440×900, tema claro):

| Arquivo | Estado |
|---------|--------|
| `01-avisos-lista-detalhe.png` | Lista com o botão **Novo aviso** no topo (referência; a lista já existe) |
| `02-novo-aviso-validacao.png` | Tentativa de envio vazio: erros inline nos três blocos |
| `03-novo-aviso-filtro-aberto.png` | Multi-select de PDV aberto, com busca, "Selecionar todos" e "Limpar" |
| `04-novo-aviso-filtrado.png` | PDV + Setor filtrados, lista de usuários marcados |
| `05-novo-aviso-adicionar-usuario.png` | Busca de "Adicionar usuário específico" aberta |
| `06-novo-aviso-usuario-adicionado.png` | Usuário adicionado fora dos filtros, com selo "Adicionado" |
| `07-novo-aviso-todos.png` | Modo "Todos os usuários" (filtros escondidos) |
| `08-novo-aviso-mobile.png` | 390px: colunas empilhadas, página rola |

O protótipo é referência de **estrutura e hierarquia**. As cores e estilos inline dele não
entram no código: traduzir para tokens e componentes do repositório
([`design-system.md`](../design-system.md)). Onde o protótipo divergir de
[`decisoes.md`](decisoes.md), as decisões vencem.

### Fluxo da tela

1. Em `/avisos`, o botão primário **Novo aviso** (ícone `Plus`) fica à direita do filtro de
   período. Só aparece com a permissão `create-aviso` (decisão #8).
2. `/avisos/novo` abre dentro do shell (sidebar com **Avisos** ativo). Topo: título "Novo aviso",
   subtítulo "Escreva o comunicado e escolha quem vai recebê-lo." e, à direita, os botões
   **Voltar** (outline), **Salvar rascunho** (outline) e **Enviar aviso** (primário, ícone
   `Send`). Não há breadcrumb (decisão #7).
3. Dois cards lado a lado, proporção ~3:2 (decisão #2):
   - **1 · Conteúdo**: Título* (máx. 120), Descrição* (textarea que ocupa a altura que sobra do
     card) e o switch **Exibir automaticamente** (campo `auto`, ligado por padrão).
   - **2 · Destinatários** (com o selo "N destinatários" ao lado do título):
     1. Escolha em dois cartões de rádio: **Todos os usuários** ("Envia para toda a empresa (N
        usuários)") ou **Filtrar destinatários** (padrão; decisão #3).
     2. No modo Filtrar: grid 2×2 com os multi-selects **PDV**, **Setor**, **Nível** e
        **Função**, cada um com busca (quando há mais de 8 opções), "Selecionar todos" e
        "Limpar". O gatilho mostra "Todos", o valor único ou "VALOR +N". Link
        **Limpar filtros** no header do card quando há filtro.
     3. Campo **Adicionar usuário específico** (combobox por nome ou registro, até 8 sugestões,
        ignora os filtros; decisão #6).
     4. Lista de usuários: barra com checkbox mestre ("X de Y usuários selecionados", com estado
        parcial) e busca local por nome; cada linha com checkbox, avatar de iniciais, nome, selo
        "Adicionado" quando veio do passo 3, "PDV · SETOR · NÍVEL" e "#registro". A lista
        recarrega sozinha quando um filtro muda (skeleton de 4 linhas enquanto carrega).
     5. Bloco recolhível "Payload enviado para a API" existe só no protótipo, como referência
        para o dev. **Não implementar.**
4. **Enviar aviso** / **Salvar rascunho**: valida (decisão #9), envia o `POST comunicados` com
   `enviado: true` / `false`, mostra toast ("Aviso enviado para N destinatários." / "Rascunho
   salvo. O aviso ainda não foi enviado."), invalida a query `["mensagens"]` e volta para
   `/avisos`.
5. **Voltar** com algo preenchido (título, descrição, filtro ou usuário adicionado) abre a
   confirmação "Descartar aviso?" (destrutiva). Sem nada preenchido, volta direto.

Estados obrigatórios (regra do `CLAUDE.md`): skeleton dos filtros enquanto
`comunicado-filtros` carrega; skeleton da lista de usuários; empty state da lista ("Escolha um
filtro ou adicione usuários específicos acima." / "Nenhum usuário encontrado com esses filtros." /
"Nenhum usuário com esse nome entre os filtrados."); erro de carregamento com opção de tentar de
novo; botões desabilitados com "Enviando..." / "Salvando..." durante o envio.

### API (legado Soft Flow)

Base `NEXT_PUBLIC_API_BASE_URL` (a mesma de `/mensagens`). Exemplos fornecidos pelo usuário em
2026-11-18. O token nunca vai ao browser: chamar sempre por route handler com
`getAuthorizationHeader()` (decisão #10).

**1. Opções dos filtros**: `GET /auxiliar/comunicado-filtros`

```json
{
  "success": true,
  "data": {
    "pdv": ["ARACAJU", "ARAPIRACA", "...", "TERESINA"],
    "setor": ["ADMINISTRATIVO", "Assistentes", "...", "SQUAD XP", "TELEMARKETING", "UNIVERSIDADE", "UPGRADE"],
    "nivel": ["ADMINISTRATIVO", "COMERCIAL", "DESATIVADO", "DIRETORIA", "EXTERNO", "FABRICA", "INTERNO", "RELACIONAMENTO"],
    "funcao": ["1"]
  }
}
```

Hoje são 21 PDVs, 36 setores, 8 níveis e 1 função. A lista completa está em `AV_FILTROS` no
protótipo, mas a tela deve usar o que a API devolve.

**2. Usuários para os filtros**: `POST /auxiliar/usuarios-comunicado`

```json
// request
{ "pdv": ["JOAO PESSOA"], "setor": ["SQUAD XP"], "nivel": ["ADMINISTRATIVO", "...", "RELACIONAMENTO"], "funcao": ["1"] }
// response
{
  "success": true,
  "data": [
    { "registro": 816, "nome_suporte": "Mendonça", "pdv": "JOAO PESSOA", "setor": "SQUAD XP", "nivel": "INTERNO", "funcao": "1" }
  ],
  "total": 1
}
```

**3. Criar comunicado**: `POST /comunicados`

```json
// request
{
  "titulo": "Liberação do Smart Teste",
  "descricao": "Prezados, ...",
  "pdv": ["JOAO PESSOA"],
  "setor": ["SQUAD XP"],
  "nivel": ["ADMINISTRATIVO", "COMERCIAL", "DESATIVADO", "DIRETORIA", "EXTERNO", "FABRICA", "INTERNO", "RELACIONAMENTO"],
  "funcao": ["1"],
  "suporte_ids": [816],
  "auto": true,
  "enviado": false
}
// response
{
  "success": true,
  "message": "Comunicado criado com sucesso",
  "data": {
    "id": 7755, "titulo": "...", "descricao": "...", "enviado_por": "Luiz", "id_tipo": 1,
    "enviado": false, "enviar_discord": false,
    "datas": { "msg": "2026-11-18 11:21:00", "hora": "2026-11-18 11:21:00", "enviado": null, "inicio": null, "prazo_limite": null },
    "pdv": ["JOAO PESSOA"], "setor": ["SQUAD XP"], "nivel": ["..."], "funcao": ["1"],
    "total_destinatarios": 1,
    "usuarios": [{ "suporte_id": 816, "lido": false, "auto": true, "data_lido": null }]
  }
}
```

Montagem do payload (decisões #3, #4 e #6):

- Modo **Todos**: `pdv`, `setor`, `nivel` e `funcao` com **todos** os valores de
  `comunicado-filtros`; `suporte_ids` = todos os usuários, menos os desmarcados.
- Modo **Filtrar**: cada grupo leva os valores marcados; grupo sem seleção leva todos os valores
  do grupo. `suporte_ids` = (usuários que batem nos filtros + usuários adicionados), menos os
  desmarcados.
- `titulo` e `descricao` com `trim()`.

### O que reaproveitar

- **Tela de Avisos** (`components/avisos/avisos.tsx`): só ganha o botão no topo. Lista,
  detalhe, dropdown e hooks de leitura não mudam.
- **Multi-select de filtro**: `Combobox` multiple de `@/components/ui/v2/combobox2`, no mesmo
  padrão de `components/fields/status-multi-select.tsx`. O gatilho precisa caber em 36px com o
  resumo ("Todos" / valor / "VALOR +N"), não com chips quebrando linha. Se o combobox2 não der
  conta do "Selecionar todos / Limpar", a alternativa é `Popover` + `Command` + `Checkbox`.
- **Adicionar usuário**: `Combobox` single (ou `Popover` + `Command`) com busca local.
- `Textarea`, `Input`, `Switch` (ou `switch-choice-card.tsx`, se encaixar no bloco "Exibir
  automaticamente"), `Checkbox`, `Badge`, `Skeleton`, `EmptyState`
  (`@/components/painel/empty-state`).
- Confirmação de descarte: não há componente de confirmação compartilhado (levantamento de
  2026-11-18). Montar com `Dialog` de `@/components/ui/dialog`, ação destrutiva no padrão
  `destructive/10` + texto vermelho. Na Fase 0, conferir se alguma tela já tem um dialog de
  confirmação que valha extrair.
- Layout: título + ações como nas telas de listagem; colunas com scroll interno nos cards
  (`flex min-h-0 flex-1 ... overflow-auto`, ver seções 5 e 7 do design-system). Cards com
  header `p-4 pb-2 border-b border-border-divider`.
- Cores do protótipo → tokens: botão primário escuro = `Button` padrão; selo "N destinatários"
  = `status-info` / `panel-badge-open(-bg)`; selo "Adicionado" = `panel-badge-fixed(-bg)`;
  erro = `text-error`; cartão de rádio selecionado = borda `primary` + fundo do token de info.
  Se faltar token para o fundo do cartão selecionado, **parar e perguntar** (regra do
  design-system).

### Arquitetura proposta

```text
app/(dashboard)/avisos/novo/page.tsx        RequirePermission("create-aviso") → <NovoAviso />
components/avisos/novo/
├── index.tsx                  entrypoint: form (react-hook-form + Zod), header com ações
├── novo-aviso.types.ts
├── schema.ts                  Zod: titulo, descricao, auto, modo, filtros, extras, excluidos
├── utils.ts                   puro: montarPayload, resumoFiltro, usuariosSelecionados
├── conteudo-card.tsx
├── destinatarios-card.tsx     modo, filtros, adicionar usuário, lista
├── filtro-multi-select.tsx
├── adicionar-usuario.tsx
├── lista-destinatarios.tsx    + skeleton e empty
└── confirmar-descarte.tsx
components/avisos/avisos.tsx                + botão "Novo aviso" (hasPermission)
app/api/auxiliar/comunicado-filtros/route.ts    GET  → /auxiliar/comunicado-filtros
app/api/auxiliar/usuarios-comunicado/route.ts   POST → /auxiliar/usuarios-comunicado
app/api/comunicados/route.ts                    POST → /comunicados, com withPermission("create-aviso")
services/comunicados/                           fetchWithAuth + tipos
hooks/comunicados/
├── use-comunicado-filtros.ts
├── use-usuarios-comunicado.ts    debounce ~300ms, chave com os filtros; desligado sem filtro no modo Filtrar
├── use-todos-usuarios-comunicado.ts   base da busca de "Adicionar usuário" (decisão #6)
└── use-criar-comunicado.ts       mutation; invalida ["mensagens"]
db/scripts/seed-create-aviso-rbac.sql
```

`withPermission` vem de `@/lib/api-db/with-permission`, como em `app/api/produtos/`.

### Perguntas em aberto (resolver na Fase 0 com o usuário)

1. **`auto`**: o protótipo chama de "Exibir automaticamente" (o aviso abre sozinho quando o
   destinatário entra no Softflow). Confirmar o significado e o texto.
2. **`enviado: false`**: foi tratado como rascunho. Confirmar. Se for, onde o remetente vê e
   retoma os rascunhos? Isso está fora desta entrega; se `enviado: false` não for rascunho, o
   botão "Salvar rascunho" sai.
3. **`suporte_ids` é a lista final de destinatários?** Usuários adicionados fora dos filtros
   e usuários desmarcados só funcionam se a API usar `suporte_ids` e não recalcular pelos
   filtros.
4. **Grupo sem seleção**: o front manda todos os valores do grupo (como no exemplo de `nivel`).
   Confirmar se a API aceita/prefere array vazio.
5. **Função `"1"`**: existe um nome para exibir no lugar do número?
6. **Quem recebe `create-aviso`**: quais papéis entram no seed.
7. **Título**: limite de 120 caracteres no protótipo. Confirmar o limite real da API e se a
   descrição tem limite.
8. **Base da busca "Adicionar usuário"**: a proposta é chamar `usuarios-comunicado` com todos os
   valores de cada filtro (o mesmo do modo Todos) e buscar localmente. Confirmar que o volume de
   usuários permite, ou se existe/existirá endpoint de busca.

## Perguntas do Claude Code

Fase 0 feita em 2026-11-18. Os arquivos citados existem (`components/avisos/*`,
`hooks/mensagens/*`, `app/api/mensagens/route.ts`, `combobox2`, `status-multi-select`,
`switch-choice-card`, `EmptyState`, `Dialog`, `withPermission`, `getAuthorizationHeader`).
Decididos pelo Claude Code, sem pergunta:

- **Seed (pergunta 6 do planejamento):** os seeds `seed-*-rbac.sql` só criam a permissão
  (módulo + `permissions`); a atribuição a papéis é feita na UI de Configurações. O
  `seed-create-aviso-rbac.sql` segue esse padrão.
- **Base da busca "Adicionar usuário" (pergunta 8):** `POST usuarios-comunicado` com todos os
  valores de cada grupo, como no plano. É a mesma consulta que dá o "N usuários" e o
  `suporte_ids` do modo Todos, e já traz PDV/setor/nível para a linha.
  `GET /auxiliar/usuarios` (que tem `search`) não traz PDV nem nível.
- **Multi-select dos filtros:** `Popover` + `Command` + `Checkbox`. O `combobox2` multiple
  renderiza chips que quebram linha, e o gatilho precisa ficar em 36px com o resumo.
- **Confirmação de descarte:** não há dialog de confirmação compartilhado (só `window.confirm` em
  `components/docs/formulario/index.tsx`). Monta-se `confirmar-descarte.tsx` com `Dialog`.
- `withPermission` também é usado em rotas de proxy fora de `/api/db` (`app/api/produtos/`,
  `app/api/painel-ideias/`), então serve para `app/api/comunicados/route.ts`. Sessão e token vêm
  dele (`session.authorizationHeader`).

### P1 — Significado de `auto` · respondida → decisão #12

Fase: Fase 0 (2026-11-18). Contexto: o protótipo chama o switch de "Exibir automaticamente" (o
aviso abre sozinho quando o destinatário entra no Softflow), ligado por padrão. Hoje a leitura
(`components/avisos/`) não usa `auto` para nada.
Opções: **A)** é isso mesmo: manter o texto "Exibir automaticamente" e o padrão ligado. **B)**
significa outra coisa: dizer o quê, e eu ajusto o texto e o padrão.
Recomendação do Claude Code: A, se o legado já abre o aviso sozinho com `auto: true`.

Resposta (2026-11-18, Claude Code): A — manter "Exibir automaticamente", ligado por padrão.

### P2 — `enviado: false` é rascunho? · respondida → decisão #13

Fase: Fase 0 (2026-11-18). Contexto: decisão #7 liga "Salvar rascunho" a `enviado: false`. Não
existe no app lugar para ver ou retomar rascunho, e listar/editar comunicado está fora do
escopo. Um rascunho salvo hoje ficaria inacessível pelo Softflow.
Opções: **A)** é rascunho e o botão fica, mesmo sem tela para retomá-lo por enquanto (vira item
no backlog). **B)** é rascunho, mas o botão sai até existir a tela de rascunhos. **C)** não é
rascunho: o botão sai e sempre vai `enviado: true`.
Recomendação do Claude Code: B, porque salvar algo que o usuário não consegue reabrir parece
perda de texto; o botão volta junto com a listagem de enviados/rascunhos.

Resposta (2026-11-18, Claude Code): B — o botão "Salvar rascunho" sai até existir a tela de rascunhos; envio sempre `enviado: true`.

### P3 — Contrato de destinatários do `POST /comunicados` · respondida → decisão #14

Fase: Fase 0 (2026-11-18). Contexto: decisões #4, #5 e #6 dependem de a API usar
`suporte_ids` como lista final (usuário adicionado fora dos filtros entra, usuário desmarcado
sai) e aceitar grupo sem seleção mandado com todos os valores. Não testei contra a API porque
criaria comunicado real (e o token dos exemplos não deve ser usado, decisão #10).
Opções: **A)** `suporte_ids` é a lista final e os arrays de filtro são só registro; mandar todos
os valores do grupo sem seleção está certo. **B)** a API recalcula pelos filtros (ou prefere
array vazio): dizer como, e eu ajusto `montarPayload`.
Recomendação do Claude Code: confirmar A com quem mantém a API; se não der, eu valido na Parte 1
com um comunicado de teste com `enviado: false` mandado a você só, com o seu ok.

Resposta (2026-11-18, Claude Code): A — `suporte_ids` é a lista final; validar na Parte 1 contra a API de teste (`.env` local).

### P4 — Nome da função `"1"` · respondida → decisão #15

Fase: Fase 0 (2026-11-18). Contexto: `comunicado-filtros` devolve `funcao: ["1"]`. O
multi-select e a linha do usuário mostrariam "1".
Opções: **A)** existe um nome (diga qual, ou o endpoint que o traz) e eu mapeio. **B)** não há
nome: esconder o filtro Função enquanto houver só um valor (vai no payload com todos os valores
mesmo assim) e não mostrar a função na linha.
Recomendação do Claude Code: B, se não houver nome, porque um filtro com uma única opção "1" não
ajuda ninguém.

Resposta (2026-11-18, Claude Code): A API passou a devolver `funcao: ["LIDER", "OPERACIONAL"]`; o filtro Função aparece normalmente.

### P5 — Limites de título e descrição · respondida → decisão #16

Fase: Fase 0 (2026-11-18). Contexto: o protótipo limita o título a 120 caracteres; a descrição
não tem limite.
Opções: **A)** 120 no título e sem limite na descrição está certo. **B)** a API tem outros
limites: diga quais.
Recomendação do Claude Code: A, se ninguém souber outro limite. O erro da API, se houver, vira
toast.

Resposta (2026-11-18, Claude Code): A — título até 120, descrição sem limite.

### P6 — Token do cartão de rádio selecionado · respondida → decisão #17

Fase: Fase 0 (2026-11-18). Contexto: o cartão "Todos os usuários" / "Filtrar destinatários"
selecionado tem borda e fundo azulados. Não há token genérico de fundo "selecionado"; os mais
próximos são `papeis-perm-selected-bg/-border` (específicos de Papéis), `public-info-bg` (página
pública) e `panel-badge-open-bg` (selo). Pela regra do design-system, paro e pergunto.
Opções: **A)** sem token novo: borda `border-primary` e fundo `bg-primary/5` (opacidade sobre
token existente). **B)** reaproveitar `papeis-perm-selected-bg/-border`, renomeando-os para algo
genérico (`selected-bg` / `selected-border`) e registrando no design-system. **C)** token novo
`selected-bg` só para isto.
Recomendação do Claude Code: A, porque não cria cor nova e o primário com 5% fica discreto nos
dois temas. Obs.: `switch-choice-card.tsx` usa `zinc-*` literal (fora da regra de tokens); se
for usado no "Exibir automaticamente", troco por tokens no mesmo commit.

Resposta (2026-11-18, Claude Code): A — `border-primary` + `bg-primary/5`, sem token novo.

## Andamento da implementação

- [x] Parte 1: dados e permissão (2026-11-18). Rotas `app/api/auxiliar/comunicado-filtros`,
  `app/api/auxiliar/usuarios-comunicado`, `app/api/comunicados` (`withPermission("create-aviso")`),
  `services/comunicados/`, `hooks/comunicados/` e `db/scripts/seed-create-aviso-rbac.sql`.
  Conferido na API de teste (`91.99.191.233:8083`):
  - `usuarios-comunicado`: formato igual ao exemplo, mas **`funcao` vem numérico** (1 = LIDER,
    0 = OPERACIONAL, inferido filtrando por cada nome). Empresa inteira = 469 usuários, ~54 KB,
    ~5 s: a busca local de "Adicionar usuário" se sustenta.
  - Grupo com array vazio dá **422** ("The funcao field is required."): confirma a decisão #4
    (grupo sem seleção vai com todos os valores).
  - `comunicado-filtros` devolve **503** ("Serviço temporariamente indisponível") na API de
    teste; os outros endpoints respondem. A tela trata como erro com "Tentar de novo".
  - Seed aplicado no Postgres em 2026-11-18, com `create-aviso` atribuída ao papel
    "PM/PO Squad Xp" (a pedido do usuário).
  - `POST /comunicados` testado (comunicado 7757, `auto: false`): filtros que batem em 5
    usuários + `suporte_ids: [2384]` geraram `total_destinatarios: 1`. **Decisão #14
    confirmada:** `suporte_ids` é a lista final, e a API não recalcula pelos filtros. A resposta
    tem também `link: null`, e o aviso aparece em `GET /mensagens` (campo `msg_texto`).
- [x] Parte 2: rota e conteúdo (2026-11-18). `/avisos/novo` com `RequirePermission`, botão
  "Novo aviso" em `/avisos`, card Conteúdo, modo Todos com a lista, validação, envio, toast e
  "Descartar aviso?". `/avisos/novo` entrou em `ROUTES_WITH_INTERNAL_SCROLL`
  (`app/(dashboard)/layout.tsx`). O "Exibir automaticamente" foi montado com tokens no próprio
  card, sem `switch-choice-card` (que usa `zinc-*` e tem 4 usos em outras telas).
  Conferido no navegador: botão, layout 3:2, validação inline, descarte e estado de erro. O
  envio pela tela ficou sem teste porque `comunicado-filtros` dá 503 na API de teste.
  Obs.: `npm run lint` (`next lint`) não roda no Next 16; a validação foi feita com `npx eslint`.
- [x] Parte 3: destinatários (2026-11-18). Quatro multi-selects (`Popover` + `Command`, busca
  com mais de 8 opções, "Selecionar todos" / "Limpar", gatilho com resumo), "Adicionar usuário
  específico" (busca por nome ou registro na empresa inteira, Enter adiciona a 1ª sugestão),
  skeleton dos filtros. Conferido no navegador com `comunicado-filtros` simulado no próprio
  navegador (o endpoint segue com 503 na API de teste): PDV JOAO PESSOA → 334 usuários
  marcados; "Limpar filtros"; usuário adicionado com selo "Adicionado"; envio real só para o
  registro 2384 (201, `suporte_ids: [2384]`, `auto: false`), volta para `/avisos` com o aviso
  na lista. Mobile 390px: cards empilhados, página rola, sem scroll horizontal.
- [ ] Parte 4: fechamento

### Plano de implementação

1. **Parte 1: dados e permissão.** Os três route handlers, `services/comunicados`, os hooks e o
   seed `create-aviso`. Conferir as respostas reais da API contra os exemplos acima.
2. **Parte 2: rota e conteúdo.** `/avisos/novo` com `RequirePermission`, botão "Novo aviso" em
   `/avisos`, header com as ações, card Conteúdo, schema Zod, envio/rascunho funcionando com o
   modo **Todos**, toasts, invalidação de `["mensagens"]` e confirmação de descarte.
3. **Parte 3: destinatários.** Modo Filtrar com os quatro multi-selects, lista com seleção e
   checkbox mestre, "Adicionar usuário específico", busca local, skeleton/empty/erro e o layout
   sem rolagem da página no desktop.
4. **Parte 4: fechamento.** README no formato padrão, `decisoes.md` atualizado,
   `contexto-projeto-softflow.md` e `status-projeto-softflow.md`.

Validação de cada parte: `npm run lint`, `npm run build` e conferência no navegador (desktop
1440px e mobile 390px).

### Fora do escopo

Listar avisos enviados ou rascunhos, editar ou excluir comunicado, agendamento (`datas.inicio`,
`prazo_limite`), envio ao Discord (`enviar_discord`), anexos e link de confirmação na criação.
