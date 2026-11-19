# Conector do Claude (abrir casos pelo chat)

> **Estado: planejado.** Especificado em 2026-11-19 num chat de planejamento, com protótipo em
> [`prototipo/`](prototipo/) e decisões em [`decisoes.md`](decisoes.md). Ainda não implementado.
> Implementar com `/implementar conector-claude`, começando pela Fase 0.

## Objetivo

Boa parte do planejamento da squad acontece hoje num chat do Claude (skill `planejar-softcom`,
Brainiac, protótipos). No fim do planejamento, o PO copia o texto e abre o caso à mão em
`/casos/novo`. O passo 7 da skill diz isso: *"ainda manual; a integração por API é uma evolução
futura"*.

Esta mudança faz o Softflow expor um **servidor MCP** (`/api/mcp`) que cada pessoa adiciona ao
Claude como **conector personalizado** na própria conta (decisão #12). Cada pessoa da squad conecta a própria
conta do Softflow uma vez e, a partir daí, o Claude consegue, em nome dela e com as permissões
dela:

- consultar os catálogos que a abertura de caso exige (produto, versão, módulo, projeto, pessoas,
  categoria, importância e origem), por nome;
- montar uma **prévia** do caso com os nomes resolvidos e o que falta;
- **abrir o caso** depois da confirmação da pessoa no chat;
- consultar um caso pelo número.

Fora do escopo desta entrega (decisão #2): reports, edição de caso, mudança de status, anexos e
produção. O conector nasce só com abertura e consulta de caso.

## Como fica para quem usa

Uma vez, por pessoa:

1. A squad usa contas pessoais do Claude (Pro ou Max), não um plano Team/Enterprise. Cada
   pessoa abre **Customize → Connectors → Add custom connector** e informa o endereço
   `https://softflow.hostsoftcom.cloud/api/mcp`, com Authentication **Sign in now** e OAuth client
   **Register automatically** (DCR), se o diálogo perguntar (decisão #12).
2. Ao clicar em **Add** (ou em **Connect** no conector), a pessoa é levada para a tela
   **Conectar o Claude ao Softflow** (`/oauth/autorizar`). Se não estiver logada, passa pelo
   login do Softflow antes e volta para essa tela.
3. Confere quem está conectando e o que o Claude vai poder fazer e clica em **Permitir acesso**.
   O Softflow devolve a pessoa ao Claude, já conectada.

No dia a dia (roteiro da conversa, sem tela nova no Softflow):

1. No fim do planejamento, a pessoa pede: "abre o caso disso no Softflow, produto Smart, versão
   8.44, dev Fulano".
2. O Claude busca os IDs pelo nome (`softflow_buscar_opcoes`) e chama `softflow_preparar_caso`.
   A ferramenta devolve a prévia em texto: cada campo com o nome resolvido, os padrões aplicados
   (importância, categoria, origem, relator) e os campos que faltam ou ficaram ambíguos (ex.:
   dois "Fulano" no catálogo).
3. O Claude mostra a prévia e pergunta se pode abrir. Ajustes geram uma prévia nova.
4. Com o "pode abrir", o Claude chama `softflow_abrir_caso` com o código da prévia. O caso é
   criado exatamente como na prévia (decisão #6), o dev recebe a DM no Discord como na tela, e a
   ferramenta devolve o número e o link `https://softflow.hostsoftcom.cloud/casos/<registro>`.
5. Com o número, o Claude pode seguir a skill `planejar-softcom` e atualizar a linha "Caso" da
   Ficha no Brainiac.

No Softflow, a pessoa vê e desfaz a conexão pelo menu do usuário (header): item **Claude**, que
abre o modal **Conexão com o Claude** (decisão #10).

## Protótipo

[`prototipo/conector-claude-prototipo.html`](prototipo/conector-claude-prototipo.html) é um
protótipo autocontido (abrir direto do disco). Tem um seletor de cenário no topo. As telas são:

| Tela | Onde fica no app |
|------|------------------|
| Conectar o Claude ao Softflow (autorização) | `/oauth/autorizar`, fora do shell, no layout do login |
| Menu do usuário com o item **Claude** | `components/header/user-dropdown.tsx` |
| Modal **Conexão com o Claude** | aberto pelo item do menu |

Capturas em [`prototipo/capturas/`](prototipo/capturas/) (1440×900, tema claro, e 390px):

| Arquivo | Estado |
|---------|--------|
| `01-autorizar.png` | Autorização: pessoa logada, com permissão de abrir caso |
| `02-autorizar-sem-permissao.png` | Autorização: pessoa sem `create-case` (aviso, mas pode conectar para consultar) |
| `03-autorizar-erro.png` | Autorização: pedido inválido (cliente desconhecido ou endereço de retorno fora da lista) |
| `04-menu-usuario.png` | Menu do usuário com o item **Claude** ("Conectado") |
| `05-modal-conectado.png` | Modal com a conexão ativa, último uso e **Desconectar** |
| `06-modal-desconectar.png` | Confirmação de desconectar |
| `07-modal-sem-conexao.png` | Modal sem conexão, com o passo a passo para conectar |
| `08-autorizar-mobile.png` | Autorização em 390px |

O protótipo é referência de **estrutura e hierarquia**. Cores e estilos inline dele não entram no
código: traduzir para tokens e componentes do repositório ([`design-system.md`](../design-system.md)
e o layout de [`components/login/login.tsx`](../../components/login/login.tsx)).

### Tela de autorização (`/oauth/autorizar`)

- Layout do login (decisão #9): no desktop, banner à esquerda e conteúdo à direita; no mobile,
  só o conteúdo. Sem sidebar nem header do dashboard.
- Card central: logos Claude ↔ Softflow, título **Conectar o Claude ao Softflow**, texto
  "O Claude vai acessar o Softflow em seu nome, com as suas permissões."
- Bloco da pessoa: avatar, nome, e-mail, setor e o link **Não é você? Entrar com outra conta**
  (faz logout e volta ao login com o mesmo `callbackUrl`).
- Lista **O Claude vai poder:** "Consultar produtos, versões, projetos e pessoas", "Consultar
  casos pelo número", "Abrir casos em seu nome, depois que você confirmar no chat". Abaixo,
  **Não vai poder:** "Editar, mudar status ou excluir casos", "Ver sua senha".
- Sem `create-case`: a linha "Abrir casos" aparece riscada, com o aviso "Seu perfil não permite
  abrir casos. Você pode conectar, mas o Claude só vai consultar." (decisão #5).
- Ações: **Cancelar** (outline; volta ao Claude com `error=access_denied`) e **Permitir acesso**
  (CTA amarelo de marca, como o botão do login).
- Rodapé: "Você pode desconectar quando quiser pelo menu do seu usuário no Softflow."
- Erro (cliente ou `redirect_uri` inválido, PKCE ausente): card com o ícone de alerta, "Não foi
  possível conectar", a causa em uma linha e "Volte ao Claude e tente conectar de novo". Nunca
  redireciona para um endereço que não esteja na lista (decisão #4).
- Estados: carregando (spinner do `PublicRoute`), enviando ("Conectando..." no botão).

### Modal "Conexão com o Claude"

- Item novo no menu do usuário, entre "Notificações no Discord" e "Sair", no mesmo formato
  (ícone `Plug` em círculo, título e subtítulo): **Claude**, subtítulo "Abrir casos pelo chat do
  Claude" e, à direita, a pílula "Conectado" (verde) ou "Não conectado" (cinza).
- Conectado: quadro com "Conectado desde 19/11/2026 16:50", "Último uso há 5 minutos", "Pode
  abrir casos: Sim/Não" (tem ou não `create-case`) e
  **Desconectar** (destrutivo `destructive/10`). Desconectar pede confirmação ("Desconectar o
  Claude? O Claude não vai mais abrir nem consultar casos em seu nome até você conectar de
  novo.") e revoga todos os tokens da pessoa na hora.
- Não conectado: passo a passo curto (Customize → Connectors → Add custom connector → colar o
  endereço → Permitir acesso) e o endereço do conector com botão de copiar, que é o passo
  principal em contas pessoais (decisão #12).
- Carregando: skeleton das duas linhas. Erro: mensagem com "Tentar de novo".

## Arquitetura

### Visão geral

```text
Claude (claude.ai / app)                    Softflow (Next)                     API Soft Flow
─────────────────────────                   ───────────────                     ─────────────
descobre metadados  ─────────────────────►  /.well-known/oauth-protected-resource
                                            /.well-known/oauth-authorization-server
registra cliente (DCR) ──────────────────►  POST /api/oauth/register
abre o navegador da pessoa ──────────────►  /oauth/autorizar  (login + consentimento)
                                              └─ cria a conexão com um token Soft Flow próprio ─► POST /auth/refresh
troca o código (PKCE) ───────────────────►  POST /api/oauth/token
chama ferramentas (Bearer) ──────────────►  POST /api/mcp  ──── token Soft Flow da conexão ──► /auxiliar/*, /projeto-casos, /projeto-memoria/{id}
```

O Softflow faz dois papéis (decisão #3): **servidor de autorização OAuth 2.1** (só para o Claude)
e **servidor MCP**. A API Soft Flow não muda.

### Requisitos do Claude

Conferidos na documentação do Claude em 2026-11-19 (reconfirmar na Fase 0):

- Transporte **Streamable HTTP** num único endpoint (`/api/mcp`).
- OAuth 2.1 com **Dynamic Client Registration** (RFC 7591), **PKCE S256**,
  `token_endpoint_auth_methods_supported: ["none"]`, metadados RFC 9728 (recurso protegido) e
  RFC 8414 (servidor de autorização). O `401` do `/api/mcp` sem token traz
  `WWW-Authenticate: Bearer resource_metadata="<url do oauth-protected-resource>"`.
- Callback do Claude: `https://claude.ai/api/mcp/auth_callback` e
  `https://claude.com/api/mcp/auth_callback` (os dois na lista permitida). Nome do cliente:
  `Claude`.
- O Claude também oferece o modo "Use Claude's published identity" (Client ID Metadata Document,
  recomendado pela documentação). Esta especificação usa DCR ("Register automatically"); a Fase 0
  avalia se vale aceitar também o CIMD.
- Credenciais de OAuth e cabeçalhos não mudam depois que o conector é adicionado: para trocar, a
  pessoa remove e adiciona de novo.
- Contas pessoais: Pro e Max adicionam conectores personalizados na própria conta; o plano Free
  aceita **um** só (se a pessoa já usa outro personalizado, não cabe o Softflow). Nos planos Team e
  Enterprise, um Owner adiciona para a organização e cada membro conecta; o servidor é o mesmo
  nos dois casos, então migrar para um plano de organização no futuro não muda o Softflow.

### Rotas novas

| Rota | Papel |
|------|-------|
| `app/.well-known/oauth-protected-resource/route.ts` | Metadados do recurso: `resource`, `authorization_servers` |
| `app/.well-known/oauth-authorization-server/route.ts` | Metadados do servidor: endpoints, `code_challenge_methods_supported: ["S256"]`, `grant_types_supported: ["authorization_code","refresh_token"]` |
| `app/api/oauth/register/route.ts` | DCR. Aceita só `redirect_uris` da lista do Claude (decisão #4) |
| `app/oauth/autorizar/page.tsx` | Tela de consentimento (fora de `(dashboard)`, dentro do `PublicRoute` invertido: exige login) |
| `app/api/oauth/autorizar/route.ts` | Recebe o "Permitir acesso": valida o pedido, cria a conexão, gera o código e devolve a URL de retorno |
| `app/api/oauth/token/route.ts` | `authorization_code` (com PKCE) e `refresh_token`, com rotação |
| `app/api/mcp/route.ts` | Servidor MCP (Streamable HTTP, sem estado de sessão) |
| `app/api/db/claude-conexao/route.ts` | `GET` (status da conexão da pessoa logada) e `DELETE` (desconectar) |

Biblioteca: `@modelcontextprotocol/sdk` (servidor e tipos), no runtime Node. A escolha fina
(SDK puro × adaptador para Next) é da Fase 0.

### Sessão do conector e token Soft Flow

O Softflow não guarda senha. No "Permitir acesso", a rota usa o token do cookie `casos_token` da
pessoa para pedir um **token Soft Flow próprio da conexão** (`POST /auth/refresh`), separado da
sessão do navegador, e grava esse token **cifrado** (AES-256-GCM, chave em
`CLAUDE_CONECTOR_CHAVE`) na conexão (decisão #7). Cada chamada do `/api/mcp`:

1. valida o access token do Claude (hash em Postgres, expiração, conexão não revogada);
2. decifra o token Soft Flow da conexão e monta `{ Authorization: "Bearer ..." }`;
3. recalcula as permissões com `syncAppUserAndPermissions(authorizationHeader)`, como o
   `withPermission` (decisão #5);
4. chama a API Soft Flow; se ela responder 401, tenta uma vez `POST /auth/refresh` com o token
   da conexão, grava o novo e repete. Se o refresh falhar, marca a conexão como expirada e devolve
   `401` com `WWW-Authenticate`, e o Claude pede para reconectar.

Tokens do Claude: access token opaco de 1 hora e refresh token de 30 dias com rotação, guardados
só como hash SHA-256. Código de autorização de uso único, 5 minutos.

### Tabelas novas (Postgres, `db/schema.ts`)

```text
oauth_clientes        id (client_id, texto aleatório) · nome · redirect_uris (text[]) · criado_em
oauth_codigos         codigo_hash (pk) · cliente_id · conexao_id · redirect_uri · code_challenge ·
                      expira_em · usado_em
claude_conexoes       id (uuid) · app_user_id (fk app_users) · cliente_id · legacy_token_cifrado ·
                      legacy_token_atualizado_em · access_token_hash · access_expira_em ·
                      refresh_token_hash · refresh_expira_em · criado_em · ultimo_uso_em ·
                      revogado_em · motivo_revogacao ('usuario' | 'expirado' | 'reconectou')
claude_previas_caso   id (código da prévia) · conexao_id · payload (jsonb) · resumo (jsonb) ·
                      expira_em · caso_registro (preenchido ao abrir) · criado_em
```

Uma conexão ativa por pessoa (decisão #11): conectar de novo revoga a anterior (`motivo_revogacao =
'reconectou'`). Migração em `db/migrations/` no padrão do repositório.

### Ferramentas do MCP

Nomes com prefixo `softflow_`, descrições em pt-BR e vocabulário do produto (caso, nunca
"ticket"). Respostas em texto curto e legível para o Claude repetir à pessoa, com os IDs entre
parênteses. Todas com `readOnlyHint` correto (só `softflow_abrir_caso` escreve).

| Ferramenta | Entrada | O que faz | Permissão |
|------------|---------|-----------|-----------|
| `softflow_eu` | — | Nome, registro, setor, se pode abrir caso, e os projetos abertos do setor (para sugerir o padrão) | conexão válida |
| `softflow_buscar_opcoes` | `tipo` (`produto` \| `versao` \| `modulo` \| `projeto` \| `pessoa` \| `categoria` \| `importancia` \| `origem`), `busca?`, `produto_id?` (obrigatório em `versao` e `modulo`) | Até 15 opções com id e nome, a partir das rotas `/auxiliar/*` que a tela usa | conexão válida |
| `softflow_preparar_caso` | campos do caso (abaixo) | Resolve e valida, aplica os padrões, grava a prévia e devolve o texto da prévia + `codigo_previa` (15 min). Não cria nada | `create-case` |
| `softflow_abrir_caso` | `codigo_previa` | Cria o caso com o payload da prévia, dispara a DM do Discord e devolve número e link. Código já usado devolve o mesmo caso, sem criar outro (decisão #6) | `create-case` |
| `softflow_consultar_caso` | `registro` | Resumo do caso: produto, versão, projeto, status, dev, QA, resumo e link (`/projeto-memoria/{id}`) | `list-case` |

Campos de `softflow_preparar_caso` (espelham o `casoCreateFormSchema`):

| Campo | Obrigatório | Padrão |
|-------|-------------|--------|
| `produto_id`, `versao`, `projeto_id`, `dev_id`, `resumo`, `descricao` | sim | — |
| `importancia_id` | não | `3`, o mesmo da tela |
| `categoria_id` | não | `4`, o mesmo da tela |
| `origem_id` | não | `4`, o mesmo da tela |
| `relator_id` | não | a pessoa conectada |
| `modulo`, `qa_id`, `informacoes_adicionais` | não | vazio |
| `nao_planejado` | não | `false` |

A prévia confere: cada id existe no catálogo (versão e módulo do produto informado), o resumo não
passa do limite do legado e a descrição não está vazia. Campo inválido não para a prévia: volta
listado em "Falta resolver", e `softflow_abrir_caso` recusa uma prévia que tenha pendência.

O campo **Informações adicionais** recebe no fim a linha
`Aberto pelo Claude (conector Softflow) por <nome>.` (decisão #8).

### Reaproveitamento e refatoração necessária

- **Criação do caso:** extrair o corpo de `app/api/projeto-casos/route.ts` (POST na API Soft
  Flow + `scheduleDiscordCasoNotify`) para `lib/casos/criar-caso.ts`, usado pela rota e pelo MCP.
  A rota fica só com `withPermission` e orquestração.
- **Payload:** `buildCasoCreatePayload` (`components/casos/shared/payload.ts`) é a fonte do
  formato; o MCP monta `CasoBaseFormInput` e chama ele. Ele importa
  `resolveVersaoProdutoForApi` de `components/casos/shared/versao-combobox`: mover os helpers
  puros (payload e versão) para `lib/casos/` para o servidor não importar de `components/`
  (a Fase 0 confere se há `"use client"` no caminho).
- **Catálogos:** as rotas de `app/api/auxiliar/*` já sabem os endpoints e parâmetros do legado.
  Extrair a chamada de cada uma para funções em `lib/` (ou `services/server/`) que recebem o
  `authorizationHeader`, usadas pela rota e pelo MCP.
- **Permissões:** `syncAppUserAndPermissions` (`lib/auth/sync-app-user`) aceita qualquer
  `authorizationHeader`. Criar `withConectorPermission` em `lib/api-db/` no espelho do
  `withPermission`, partindo do Bearer do Claude em vez do cookie.
- **Consulta de caso:** o mesmo `GET /projeto-memoria/{id}` de `app/api/projeto-memoria/[id]`.
- **Menu do usuário:** o item novo segue o botão de "Notificações no Discord" em
  `components/header/user-dropdown.tsx`; dados por hook em `hooks/claude-conexao/`.
- **Tela de autorização:** reaproveita o layout de `components/login/login.tsx` (banner +
  `main`). O guard é o inverso do `PublicRoute`: sem login, `router.push("/login?callbackUrl=
  /oauth/autorizar?...")` (o `getSafeInternalReturnPath` precisa aceitar esse caminho com query).

### Segurança

- `redirect_uri` só da lista do Claude, comparada por igualdade exata (decisão #4).
- PKCE S256 obrigatório; sem `plain`.
- Tokens do Claude e código de autorização guardados só como hash; token Soft Flow cifrado em
  repouso, nunca devolvido ao Claude nem ao browser.
- `/oauth/autorizar` com proteção contra clickjacking (`X-Frame-Options: DENY` /
  `frame-ancestors 'none'`) e o "Permitir acesso" por POST com o cookie `SameSite=Lax`.
- Rate limit simples por conexão no `/api/mcp` (ex.: 60 chamadas/min) e no `register`.
- Log de cada `softflow_abrir_caso` (conexão, pessoa, registro criado) no log do servidor.

## O que já existe, o que é parcial, o que é novo

| Peça | Situação |
|------|----------|
| Criação de caso na API Soft Flow (`POST /projeto-casos`) e DM no Discord | Existe; extrair para `lib/` |
| Catálogos (`/auxiliar/*`) | Existe; extrair a chamada para `lib/` |
| Permissões recalculadas no servidor | Existe (`syncAppUserAndPermissions`) |
| Login e `callbackUrl` seguro | Existe; aceitar `/oauth/autorizar` com query |
| OAuth (metadados, DCR, autorizar, token) | Novo |
| Servidor MCP e ferramentas | Novo |
| Tabelas `oauth_*`, `claude_*` | Novo |
| Item e modal "Conexão com o Claude" | Novo |

## Perguntas em aberto

Respostas na Fase 0 ou durante a implementação, pelo fluxo de "Perguntas do Claude Code".

1. **(dev)** Qual a validade do token da API Soft Flow e do `POST /auth/refresh`? O refresh
   aceita um token já expirado? Isso define por quanto tempo a conexão dura sem a pessoa
   reconectar. Se o refresh não aceitar token expirado, avaliar um job que renova os tokens das
   conexões ativas antes de vencerem.
2. **(dev)** O `POST /auth/refresh` emite um token novo sem invalidar o anterior? Se invalidar, a
   sessão do navegador da pessoa cai ao conectar o Claude, e a decisão #7 precisa de outro
   caminho (ex.: endpoint do legado que emite token para integração).
3. **(dev)** O logout do Softflow (`/api/auth/logout`) invalida o token no legado ou só apaga o
   cookie? Se invalidar todos os tokens da pessoa, sair do Softflow derruba o conector.
4. **(dev)** Qual o limite de caracteres do `DescricaoResumo` e da `DescricaoCompleta` no legado?
   A prévia precisa validar antes de chamar a API.
5. **(dev)** O deploy em Docker Swarm roda mais de uma réplica? As prévias e os códigos já vão
   para o Postgres por isso; conferir se o rate limit também precisa ser compartilhado.
6. **(dev)** O proxy da VPS deixa passar `/.well-known/*` e respostas de streaming do `/api/mcp`
   sem buffer?

## Fase 0 — conferência do plano contra o código (2026-11-19)

Resolvido pelo código ou decidido pelo Claude Code (detalhe técnico, não muda decisão):

- **Pergunta 3 (logout):** `app/api/auth/logout/route.ts` só apaga o cookie `casos_token`; não
  chama o legado. Sair do Softflow não derruba o conector.
- **Pergunta 5 (réplicas):** `docker-compose.yml` tem `replicas: 1`. O rate limit em memória
  (mesmo padrão de `lib/api-public/rate-limit.ts`) basta; prévias e códigos ficam no Postgres de
  qualquer forma.
- **Pergunta 6 (proxy):** o Traefik roteia por `Host(...)` sem filtro de caminho, então
  `/.well-known/*` passa. Para não depender de streaming pelo Cloudflare Tunnel, o `/api/mcp` roda
  sem estado e com resposta JSON (`enableJsonResponse`), sem SSE.
- **Biblioteca:** `@modelcontextprotocol/sdk` com o transporte Web Standard (Request/Response) dentro
  do route handler, sem adaptador extra.
- **Requisitos do Claude reconfirmados** (claude.com/docs/connectors, 2026-11-19): Streamable HTTP
  em HTTPS 443; DCR aceito; CIMD só é usado se o servidor anunciar
  `client_id_metadata_document_supported`, então **não anunciamos CIMD** e fica DCR, como
  especificado; PKCE S256; `resource` do RFC 9728 igual ao endereço do MCP; token endpoint aceita
  `application/x-www-form-urlencoded`, refresh com rotação e falha como `invalid_grant`; o Claude
  renova até 5 min antes de vencer. A documentação atual só cita
  `https://claude.ai/api/mcp/auth_callback`; mantemos também o `claude.com` da decisão #4 (inofensivo).
  O Claude Code usa callback em `localhost`, que a decisão #4 deixa de fora (o conector é para o
  app do Claude). Tráfego do Claude sai de `160.79.104.0/21`.
- **Anotações das ferramentas:** consultas e `softflow_preparar_caso` com `readOnlyHint: true` (a
  prévia não muda nada visível); `softflow_abrir_caso` com `readOnlyHint: false`, para o Claude
  pedir confirmação antes de chamar.
- **Volta do login para `/oauth/autorizar`:** `getSafeInternalReturnPath` (`lib/safe-callback-url.ts`)
  decodifica o `callbackUrl` e recusa qualquer `://`, o que barra o `redirect_uri=https://claude.ai/...`
  da query. Na Parte 3, `/oauth/autorizar?` passa a ser aceito com o `://` só dentro da query; o
  resto da validação continua.
- **Refatoração (Parte 1):** `components/casos/shared/payload.ts` e `versao-combobox.ts` não têm
  `"use client"`, mas se importam mutuamente e `versao-combobox.ts` importa tipo de
  `components/ui/combobox`. Os helpers puros (payload, `extractVersaoProduto`,
  `resolveVersaoProdutoForApi`) vão para `lib/casos/`, e os arquivos de `components/` reexportam.
- **Padrões da tela conferidos:** `importancia "3"`, `categoria "4"`, `origem "4"`, relator = pessoa
  logada (`components/casos/cadastro/caso-create/index.tsx`). `POST /api/projeto-casos` aceita
  `create-report` **ou** `create-case`; o conector exige `create-case`, como a decisão #5.
- **`/auxiliar/projetos`** exige `usuario_id`: o conector usa o id da pessoa conectada.
- **Clickjacking:** `next.config.js` não tem `headers()` hoje; a Parte 3 acrescenta
  `X-Frame-Options`/`frame-ancestors` só para `/oauth/autorizar`.

## Perguntas do Claude Code

### P1 — Comportamento do `POST /auth/refresh` do legado · aberta

Fase: Fase 0 (2026-11-19). Contexto: perguntas em aberto 1 e 2. O código só usa o refresh em
`app/api/auth/refresh/route.ts` (troca o cookie pelo token novo) e não dá pista de validade nem de
invalidação. A decisão #7 depende disso; sem a resposta não dá para fechar a Parte 2.
Preciso saber: (a) validade do token; (b) se o refresh aceita token já expirado; (c) se o refresh
invalida o token anterior.
Opções: **A)** o refresh **não** invalida o anterior → segue a decisão #7 como está (token próprio
da conexão, renovado sob demanda; se (b) for "não", um job renova as conexões ativas antes de
vencer). **B)** o refresh invalida o anterior → conectar derrubaria a sessão do navegador; seria
preciso um endpoint de integração no legado (muda a decisão #3) ou aceitar que a pessoa seja
deslogada do navegador ao conectar.
Recomendação do Claude Code: confirmar com quem mantém a API Soft Flow (ou testar com um token de
dev) antes da Parte 2. A Parte 1 não depende disso e pode começar.

### P2 — Limites de `DescricaoResumo` e `DescricaoCompleta` · aberta

Fase: Fase 0 (2026-11-19). Contexto: pergunta em aberto 4. O `casoCreateFormSchema`
(`components/casos/cadastro/caso-create/schema.ts`) só exige `min(1)`; não há limite no front.
Opções: **A)** informar os limites do legado e a prévia valida com eles. **B)** sem limite na
prévia; se o legado recusar, `softflow_abrir_caso` devolve o erro dele e o Claude gera nova prévia.
Recomendação do Claude Code: A, se o limite existir, porque a decisão #6 promete que o caso sai
igual à prévia. Só bloqueia a Parte 4.

### P3 — Endereço público do conector · respondida → decisão #13

Fase: Fase 0 (2026-11-19). Contexto: a especificação usa `https://softflow.softcom.services/api/mcp`
(e `contexto-projeto-softflow.md` e os links do Discord usam esse domínio), mas `docs/deploy/` e o
`docker-compose.yml` publicam o app em `https://softflow.hostsoftcom.cloud`. O Claude exige que o
`resource` dos metadados seja exatamente o endereço cadastrado, então só um vale como canônico.
Opções: **A)** `softflow.softcom.services` (o da especificação). **B)** `softflow.hostsoftcom.cloud`.
Em qualquer caso o valor vem de uma variável nova (`SOFTFLOW_PUBLIC_URL`), não fica fixo no código.
Recomendação do Claude Code: A, se os dois domínios chegam no mesmo serviço, porque é o domínio
que a squad já vê nos links; confirmar também que ele aceita tráfego de `160.79.104.0/21` sem WAF
bloqueando.

Resposta (2026-11-19, Claude Code): B. O endereço atual é `https://softflow.hostsoftcom.cloud`;
`softflow.softcom.services` é o antigo. Ver decisão #13.

## Andamento da implementação

- [x] Fase 0 (2026-11-19); P3 respondida, P1 e P2 abertas
- [x] Parte 1: refatoração sem mudança de comportamento (2026-11-19). `lib/casos/versao-produto.ts`, `lib/casos/payload.ts` (os arquivos de `components/casos/shared/` reexportam), `lib/casos/criar-caso.ts` e `lib/auxiliar/catalogos.ts`. Abertura de caso pela tela com DM no Discord ainda não conferida no navegador
- [ ] Parte 2: banco e OAuth (depende da P1)
- [ ] Parte 3: tela de autorização
- [ ] Parte 4: servidor MCP e ferramentas (depende da P2)
- [ ] Parte 5: menu do usuário e modal "Conexão com o Claude"
- [ ] Parte 6: publicação e orientação

## Plano de implementação

Um commit por parte, na `dev`, com escopo `(conector-claude)`.

1. **Refatoração sem mudança de comportamento.** `lib/casos/criar-caso.ts`, helpers puros de
   payload e versão em `lib/casos/`, chamadas dos catálogos em `lib/`. A rota
   `POST /api/projeto-casos` e as rotas `/auxiliar/*` passam a usar as funções novas. Conferir a
   abertura de caso pela tela (com DM no Discord) na API de dev.
2. **Banco e OAuth.** Tabelas, migração, metadados `.well-known`, `register`, `token`,
   `POST /api/oauth/autorizar`, cifra do token Soft Flow e `withConectorPermission`. Testar o
   fluxo com o MCP Inspector (`npx @modelcontextprotocol/inspector`) apontando para o ambiente
   local.
3. **Tela de autorização** (`/oauth/autorizar`): layout do login, estados do protótipo, guard de
   login com volta, "Não é você?", cancelar e erro.
4. **Servidor MCP e ferramentas.** As cinco ferramentas, prévia com pendências, abertura
   idempotente, linha de origem, refresh do token Soft Flow e `401` com `WWW-Authenticate`.
   Testar com o MCP Inspector e depois no Claude com o conector personalizado de uma conta
   de teste, abrindo um caso de teste num projeto de teste da API de dev.
5. **Menu do usuário e modal "Conexão com o Claude"**, com `GET`/`DELETE` em
   `/api/db/claude-conexao`. Desconectar e conferir que a ferramenta seguinte pede reconexão.
6. **Publicação e orientação.** Variáveis novas (`CLAUDE_CONECTOR_CHAVE`, URL pública) no
   `docs/deploy/`, passo a passo para cada pessoa adicionar o conector na própria conta, e atualização
   desta pasta no formato padrão. Avisar o usuário para ajustar o passo 7 da skill
   `planejar-softcom` (abrir o caso pelo conector em vez de entregar o texto para colar).
