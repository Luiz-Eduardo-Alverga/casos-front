# Avisos

Notificações internas do Softflow: leitura em `/avisos` e envio de comunicados em
`/avisos/novo`. O envio e o aviso automático foram especificados num chat de planejamento e implementados em
2026-11-18
(decisões em [`decisoes.md`](decisoes.md), protótipo em [`prototipo/`](prototipo/), histórico das
perguntas e do andamento no fim deste arquivo).

## O que é

- **Leitura (`/avisos`)**: lista + detalhe com filtro por período; o header tem um dropdown de
  avisos que leva à tela. No detalhe, o aviso mostra o remetente e o selo "Lido" ou o botão
  "Marcar como lido". É a tela de destino de quem não tem outra permissão de "home"
  (`lib/post-login-redirect.ts`), por isso não exige permissão própria.
- **Envio (`/avisos/novo`)**: quem tem `create-aviso` vê o botão **Novo aviso** em `/avisos` e
  abre uma tela própria (decisão #1) com dois cards lado a lado (~3:2, decisão #2):
  - **1 · Conteúdo**: título (obrigatório, até 120), descrição (obrigatória, ocupa a altura que
    sobra) e o switch **Exibir automaticamente** (`auto`, ligado por padrão, decisão #12).
  - **2 · Destinatários**: modo **Todos os usuários** ou **Filtrar destinatários** (padrão,
    decisão #3); no modo Filtrar, multi-selects de PDV, Setor, Nível e Função (OR dentro do
    grupo, AND entre grupos, decisão #4); **Adicionar usuário específico** na empresa inteira
    (decisão #6); lista com checkbox por usuário, checkbox mestre com estado parcial e busca
    local (decisão #5).
  - Ações no topo: **Voltar** (com "Descartar aviso?" se algo foi preenchido) e **Enviar aviso**.
    Não há "Salvar rascunho" (decisão #13). Erros inline aparecem depois da primeira tentativa
    (decisão #9). Sucesso: toast "Aviso enviado para N destinatários.", invalida `["mensagens"]`
    e volta para `/avisos`.
- No desktop a página não rola: rolam a descrição e a lista de usuários. No mobile os cards
  empilham e a página rola.
- **Aviso automático (bloqueante)**: aviso não lido com `status_leitura.auto = true`, enviado
  nos últimos 7 dias (decisão #25), abre sozinho numa janela sobre qualquer tela do dashboard,
  inclusive `/avisos` e por cima de outro modal (decisões #18 e #24). Sem X, Esc e clique fora
  não fecham: só **Marcar como lido** (decisão #19). Com mais de um, aparece um por vez, do mais
  antigo para o mais novo, com "Mais N aviso(s) depois deste" e o botão "Marcar como lido e ver o
  próximo" (decisão #20); no fim, toast "Aviso marcado como lido.". Consulta ao abrir o Softflow
  e a cada 5 minutos das 6h às 23h59, a mesma regra do sino (decisão #22). Erro ao marcar: a
  janela fica, com toast e mensagem inline; erro ao consultar: a janela não abre (decisão #23).
  No mobile vira folha presa embaixo, com o texto rolando.

## Arquitetura

```text
app/(dashboard)/avisos/page.tsx            leitura (sem permissão)
app/(dashboard)/avisos/novo/page.tsx       RequirePermission("create-aviso") → <NovoAviso />
app/(dashboard)/layout.tsx                 /avisos e /avisos/novo em ROUTES_WITH_INTERNAL_SCROLL;
                                           monta <AvisoAutomatico /> ao lado do CasoAbertoMiniPlayer
components/avisos/
├── avisos.tsx              entrypoint da leitura + botão "Novo aviso" (hasPermission)
├── avisos-lista.tsx · avisos-detalhe.tsx · skeletons
├── avisos-dropdown.tsx     dropdown do header (usa use-janela-consulta-avisos)
├── aviso-link-confirmacao.tsx  link de confirmação de presença (detalhe e aviso automático)
├── aviso-automatico/
│   ├── index.tsx               fila (tira na hora os marcados), marcar como lido, erro
│   └── aviso-automatico-dialog.tsx  alertdialog sem X, Esc/clique fora bloqueados, z-[80],
│                                    folha embaixo no mobile
└── novo/
    ├── index.tsx               entrypoint: react-hook-form + Zod, consultas, montagem da lista, envio
    ├── novo-aviso.types.ts     Destinatario, ModoDestinatarios, GRUPOS_FILTRO, FILTROS_VAZIOS
    ├── schema.ts               titulo, descricao, auto, modo, filtros, extras, excluidos
    ├── utils.ts                puro: montarFiltrosPayload, montarListaDestinatarios,
    │                           idsSelecionados, montarPayload, resumoFiltro, nomeFuncao, buscas
    ├── conteudo-card.tsx
    ├── destinatarios-card.tsx  header com selo "N destinatários", cartões de modo, slot do resto
    ├── filtro-multi-select.tsx Popover + Command (busca com mais de 8 opções, Selecionar todos/Limpar)
    ├── adicionar-usuario.tsx   busca local por nome ou registro, até 8 sugestões
    ├── lista-destinatarios.tsx lista + skeleton + empty + erro
    └── confirmar-descarte.tsx  Dialog destrutivo
app/api/mensagens/…                         GET /mensagens, PUT /mensagens/{id}/lido
app/api/auxiliar/comunicado-filtros/route.ts   GET  → /auxiliar/comunicado-filtros
app/api/auxiliar/usuarios-comunicado/route.ts  POST → /auxiliar/usuarios-comunicado
app/api/comunicados/route.ts                   POST → /comunicados, withPermission("create-aviso")
services/comunicados/       index.ts (3 chamadas), request.ts (fetchWithAuth + erro), types.ts
hooks/mensagens/            use-mensagens, use-marcar-mensagem-lida,
                            use-janela-consulta-avisos (6h–23h59, 5 min; sino e aviso automático),
                            use-avisos-automaticos (fila)
lib/mensagens/              formatar.ts (data longa, iniciais), sort-por-data-envio.ts
                            (decrescente e crescente), avisos-automaticos.ts (intervalo + filtro)
components/ui/dialog.tsx    DialogContent com showCloseButton (padrão true) e overlayClassName
hooks/comunicados/          use-comunicado-filtros, use-usuarios-comunicado (debounce 300ms),
                            use-todos-usuarios-comunicado, use-criar-comunicado
db/scripts/seed-create-aviso-rbac.sql       módulo `notices` + permissão `create-aviso`
```

Estado do formulário: `modo`, `filtros` (valores marcados por grupo), `extras` (usuários
adicionados) e `excluidos` (registros desmarcados). A lista é calculada: base (empresa inteira
no modo Todos, ou o resultado de `usuarios-comunicado` com os filtros) + `extras`, sem
duplicar; `suporte_ids` = lista − `excluidos`. Desmarcar um usuário adicionado o tira de
`extras`. Trocar de modo zera `excluidos`.

### Contrato da API (Soft Flow, conferido em 2026-11-18 na API de teste)

- `GET /auxiliar/comunicado-filtros` → `{ data: { pdv, setor, nivel, funcao } }` (listas de
  strings; `funcao` = `["LIDER", "OPERACIONAL"]`).
- `POST /auxiliar/usuarios-comunicado` com `{ pdv, setor, nivel, funcao }` → `{ data: [{ registro,
  nome_suporte, pdv, setor, nivel, funcao }], total }`. **`funcao` volta numérica** (1 = LIDER,
  0 = OPERACIONAL; `nomeFuncao` em `utils.ts`). Grupo com array vazio dá **422**, por isso grupo
  sem seleção vai com todos os valores. Empresa inteira: 469 usuários, ~54 KB.
- `POST /comunicados` com `{ titulo, descricao, pdv, setor, nivel, funcao, suporte_ids, auto,
  enviado }` → 201 com `data.total_destinatarios` e `data.usuarios`. **`suporte_ids` é a lista
  final** (decisão #14, confirmada): a API não recalcula pelos filtros. O aviso aparece em
  `GET /mensagens` (texto em `msg_texto`).
- `GET /mensagens?lido=false` aceita a consulta sem datas, mas devolve o histórico inteiro (para
  o registro 2384: 389 não lidos, 375 automáticos desde 2023, 538 KB, ~22 s). O aviso
  automático pede 30 dias por `data_msg` (que pode ser anterior ao envio) e corta 7 dias em
  `datas.enviado` no front. `status_leitura.auto` reflete o `auto` do envio (comunicado 8011).
- O token nunca vai ao browser: tudo passa por route handler (decisão #10).

## O que é reaproveitável

- `services/comunicados` e `hooks/comunicados` servem para qualquer tela que precise listar
  usuários por PDV/setor/nível/função (ex.: escolher destinatários de outra notificação).
- `FiltroMultiSelect` (`components/avisos/novo/filtro-multi-select.tsx`): multi-select compacto
  com resumo no gatilho ("Todos" / valor / "VALOR +N"), busca e "Selecionar todos / Limpar".
  Se outra tela precisar, mover para `components/fields/`.
- `ConfirmarDescarte`: dialog de "descartar alterações" no padrão destrutivo do design-system
  (`destructive/10` + texto vermelho). Hoje é o único no app; extrair para `components/ui/` se
  uma segunda tela precisar.
- `ListaDestinatarios`: lista selecionável com checkbox mestre parcial e busca local.
- `DialogContent` com `showCloseButton={false}` + `preventDefault` em `onEscapeKeyDown` /
  `onPointerDownOutside` / `onInteractOutside`: receita de janela bloqueante para outros casos.
- `useJanelaConsultaAvisos`: qualquer outra consulta periódica de avisos deve usar a mesma regra.
- `lib/mensagens/formatar.ts` e `AvisoLinkConfirmacao` para mostrar um aviso em outro lugar.

## Como estender

- **Rascunho / avisos enviados**: o botão "Salvar rascunho" saiu (decisão #13). Volta junto com
  uma tela de enviados/rascunhos; `montarPayload` hoje fixa `enviado: true`.
- **Novo grupo de filtro**: acrescentar em `ComunicadoFiltroGrupo` (`services/comunicados/types.ts`),
  em `GRUPOS_FILTRO`/`FILTROS_VAZIOS` (`novo-aviso.types.ts`), no schema e no `GRUPOS` de
  `utils.ts`.
- **Agendamento, Discord, link, anexos**: fora do escopo desta entrega (`datas.inicio`,
  `prazo_limite`, `enviar_discord`, `link`); o payload aceitaria os campos, a tela não.
- Permissão: `create-aviso` só cobre o envio; atribuir a papéis na UI de Configurações.
- Tipo novo de aviso na leitura: o conteúdo vem do legado; a tela só lista.
- **Janela de dias do aviso automático**: `DIAS_AVISO_AUTOMATICO` em
  `lib/mensagens/avisos-automaticos.ts` (decisão #25). Se a janela passar de ~25 dias, aumentar
  também `DIAS_CONSULTA_API`.
- Adiar ("ver depois"), lembrete por e-mail/Discord, aceite com assinatura e relatório de quem
  leu ficaram fora do escopo (a decisão #19 descarta o adiar).

## Pendências

- `GET /auxiliar/comunicado-filtros` respondia **503** na API de teste em 2026-11-18 (os outros
  endpoints respondiam). Sem ele a tela mostra erro com "Tentar de novo" e não envia. A UI dos
  filtros foi conferida com a resposta simulada no navegador; falta ver com o endpoint real.

## Histórico da implementação

### Aviso automático (2026-11-18)

Especificado com protótipo (`prototipo/capturas/09` a `11`) e decisões #18 a #25; plano em 3
partes (dados; janela; fechamento), um commit por parte com escopo `(avisos)`.

#### Perguntas do Claude Code (aviso automático)

Fase 0 feita em 2026-11-18. O plano bate com o código. Decididos pelo Claude Code, sem
pergunta: a regra do sino (6h às 23h59, 5 min) vai como está para
`hooks/mensagens/use-janela-consulta-avisos.ts`; `formatarDataLonga` e as iniciais saem de
`avisos-detalhe.tsx` para `lib/mensagens/formatar.ts`; o bloco do link vira
`components/avisos/aviso-link-confirmacao.tsx` (trocando `text-blue-600` cru por `status-info`);
`sortMensagensPorDataEnvioCrescente` entra ao lado da ordenação atual; a janela usa `z-[80]`,
acima do mini-player do caso (`z-[60]`/`z-[70]`) e dos `Dialog`/`Sheet` (`z-50`).

Conferido na API de dev (`91.99.191.233:8083`, base aparentemente renovada: o 7757 não existe
mais):

- **Pergunta 2 do planejamento, respondida:** `status_leitura.auto` reflete o envio. O
  comunicado 8011, mandado com `auto: true` só ao registro 2384, volta em `GET /mensagens` com
  `auto: true, lido: false`.
- **Pergunta 1 do planejamento:** a API aceita `lido=false` sem datas e devolve tudo, mas o
  volume muda o desenho (P7 abaixo).

##### P7 — Avisos automáticos antigos não lidos · respondida → decisão #25

Fase: Fase 0 (2026-11-18). Contexto: `GET /mensagens?lido=false` sem período devolveu, para o
registro 2384, **389 não lidos, 375 com `auto: true`**, enviados de fevereiro de 2023 a novembro
de 2026 (90 de 2023, 184 de 2024, 98 de 2025, 3 de 2026). Resposta de **538 KB em ~22 s**. Os
automáticos de novembro de 2026 estão quase todos lidos (o legado os mostra). Com as decisões #19
a #21 como estão, o usuário teria que clicar 375 vezes em "Marcar como lido" antes de usar o
Softflow, e cada consulta a cada 5 minutos traria meio megabyte. Nenhum dos 375 tem
`prazo_limite` no futuro; um tem `datas.enviado: null`.
Opções: **A)** janela móvel: só entram automáticos enviados nos últimos 30 dias (resolve a
virada do mês que motivou a #21, sem trazer o passivo; a consulta usa `data_msg_inicio` = hoje
− 30 dias). **B)** a partir de uma data de corte fixa (ex.: a data em que o aviso automático for
para produção): nada anterior bloqueia. **C)** manter a #21 (sem período) e aceitar o passivo,
talvez com uma limpeza no legado antes (marcar os antigos como lidos no banco).
Recomendação do Claude Code: A, porque não depende de limpeza no legado, mantém a consulta leve
e um aviso de 30 dias atrás ainda é recente o bastante para cobrar a leitura. Em qualquer
opção, ignorar avisos com `datas.enviado` nulo (não foram enviados).

Resposta (2026-11-18, Claude Code): janela móvel de **7 dias** (variação da opção A), contada de
`datas.enviado`; avisos sem `datas.enviado` não entram.

#### Andamento (aviso automático)

- [x] Parte 1: dados (2026-11-18). `hooks/mensagens/use-janela-consulta-avisos.ts` (o
  `AvisosDropdown` passou a usar), `hooks/mensagens/use-avisos-automaticos.ts`,
  `lib/mensagens/avisos-automaticos.ts` (consulta dos últimos 30 dias por `data_msg` + corte de 7
  dias em `datas.enviado`, decisão #25), `lib/mensagens/formatar.ts`,
  `components/avisos/aviso-link-confirmacao.tsx`. Na API de dev, para o registro 2384, a fila
  ficou só com o 8011 (resposta de 7 KB, ~2 s).
- [x] Parte 2: janela (2026-11-18). Prop `showCloseButton` (padrão `true`) e `overlayClassName`
  no `DialogContent`; `components/avisos/aviso-automatico/` montado no layout do dashboard.
  Conferido no navegador com os avisos de teste 8011, 8012 e 8013 (só para o registro 2384): abre
  sobre `/casos` com foco no botão, Esc e clique fora não fecham, erro simulado no `PUT` mostra a
  mensagem inline e o botão volta, a fila avança ("Mais 1 aviso depois deste" → "Marcar como
  lido"), o sino cai e o toast aparece no fim; mobile 390px vira folha presa embaixo, com o texto
  rolando. Não exercitado: a janela por cima de outro modal já aberto.
- [x] Parte 3: fechamento (2026-11-18). README no formato padrão, contexto, status e design-system.

### Envio de avisos (2026-11-18)

Plano executado em 4 partes (dados e permissão; rota e conteúdo; destinatários; fechamento), um
commit por parte com escopo `(avisos)`. As perguntas abaixo e o andamento ficam como referência.

### Perguntas do Claude Code

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

#### P1 — Significado de `auto` · respondida → decisão #12

Fase: Fase 0 (2026-11-18). Contexto: o protótipo chama o switch de "Exibir automaticamente" (o
aviso abre sozinho quando o destinatário entra no Softflow), ligado por padrão. Hoje a leitura
(`components/avisos/`) não usa `auto` para nada.
Opções: **A)** é isso mesmo: manter o texto "Exibir automaticamente" e o padrão ligado. **B)**
significa outra coisa: dizer o quê, e eu ajusto o texto e o padrão.
Recomendação do Claude Code: A, se o legado já abre o aviso sozinho com `auto: true`.

Resposta (2026-11-18, Claude Code): A — manter "Exibir automaticamente", ligado por padrão.

#### P2 — `enviado: false` é rascunho? · respondida → decisão #13

Fase: Fase 0 (2026-11-18). Contexto: decisão #7 liga "Salvar rascunho" a `enviado: false`. Não
existe no app lugar para ver ou retomar rascunho, e listar/editar comunicado está fora do
escopo. Um rascunho salvo hoje ficaria inacessível pelo Softflow.
Opções: **A)** é rascunho e o botão fica, mesmo sem tela para retomá-lo por enquanto (vira item
no backlog). **B)** é rascunho, mas o botão sai até existir a tela de rascunhos. **C)** não é
rascunho: o botão sai e sempre vai `enviado: true`.
Recomendação do Claude Code: B, porque salvar algo que o usuário não consegue reabrir parece
perda de texto; o botão volta junto com a listagem de enviados/rascunhos.

Resposta (2026-11-18, Claude Code): B — o botão "Salvar rascunho" sai até existir a tela de rascunhos; envio sempre `enviado: true`.

#### P3 — Contrato de destinatários do `POST /comunicados` · respondida → decisão #14

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

#### P4 — Nome da função `"1"` · respondida → decisão #15

Fase: Fase 0 (2026-11-18). Contexto: `comunicado-filtros` devolve `funcao: ["1"]`. O
multi-select e a linha do usuário mostrariam "1".
Opções: **A)** existe um nome (diga qual, ou o endpoint que o traz) e eu mapeio. **B)** não há
nome: esconder o filtro Função enquanto houver só um valor (vai no payload com todos os valores
mesmo assim) e não mostrar a função na linha.
Recomendação do Claude Code: B, se não houver nome, porque um filtro com uma única opção "1" não
ajuda ninguém.

Resposta (2026-11-18, Claude Code): A API passou a devolver `funcao: ["LIDER", "OPERACIONAL"]`; o filtro Função aparece normalmente.

#### P5 — Limites de título e descrição · respondida → decisão #16

Fase: Fase 0 (2026-11-18). Contexto: o protótipo limita o título a 120 caracteres; a descrição
não tem limite.
Opções: **A)** 120 no título e sem limite na descrição está certo. **B)** a API tem outros
limites: diga quais.
Recomendação do Claude Code: A, se ninguém souber outro limite. O erro da API, se houver, vira
toast.

Resposta (2026-11-18, Claude Code): A — título até 120, descrição sem limite.

#### P6 — Token do cartão de rádio selecionado · respondida → decisão #17

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

### Andamento da implementação

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
- [x] Parte 4: fechamento (2026-11-18). README no formato padrão, contexto e status atualizados.
