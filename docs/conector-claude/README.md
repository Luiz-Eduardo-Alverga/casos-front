# Conector do Claude (abrir casos pelo chat)

> **Estado: em produção desde 2026-11-19** (`https://softflow.hostsoftcom.cloud/api/mcp`).
> Conferido no domínio público: metadados, `401` com `WWW-Authenticate`, registro do cliente,
> token endpoint com o banco de produção e a tela de autorização (cabeçalhos e volta pelo login).
> Testado no Claude de verdade em 2026-11-19 (caso 104203, aberto pelo conector). Decisões em
> [`decisoes.md`](decisoes.md); protótipo em [`prototipo/`](prototipo/).
>
> **Há uma [próxima mudança planejada](#próxima-mudança-planejada-contexto-do-brainiac-para-quem-conecta)**
> (2026-11-25): recomendar o Brainiac no modal e apontar a skill `xp-planejar` nas instruções do
> servidor. Implementar com `/implementar conector-claude`.

## O que é

O Softflow expõe um **servidor MCP** (`/api/mcp`) que cada pessoa da squad adiciona ao Claude como
**conector personalizado** na própria conta (decisão #12). Depois de conectar a conta do Softflow
uma vez, o Claude consegue, em nome dela e com as permissões dela:

- consultar os catálogos da abertura de caso (produto, versão, módulo, projeto, pessoas,
  categoria, importância e origem) por nome;
- montar uma **prévia** do caso com os nomes resolvidos, os padrões aplicados e o que falta;
- **abrir o caso** depois da confirmação da pessoa no chat (decisão #6);
- consultar um caso pelo número.

Fora do escopo (decisão #2): reports, edição de caso, mudança de status, anexos e produção.

### Como fica para quem usa

Uma vez, por pessoa (contas Pro ou Max; no Free cabe um só conector personalizado):

1. No Claude, **Customize → Connectors → Add custom connector**, endereço
   `https://softflow.hostsoftcom.cloud/api/mcp` (decisão #13). O endereço também aparece, com botão
   de copiar, no menu do usuário do Softflow → **Claude**.
2. O Claude abre **Conectar o Claude ao Softflow** (`/oauth/autorizar`). Sem sessão, a pessoa passa
   pelo login e volta para a mesma tela.
3. Confere os dados, **digita a senha do Softflow** (decisão #14) e clica em **Permitir acesso**.

No dia a dia: "abre o caso disso no Softflow, produto X, versão Y, dev Fulano" → o Claude busca os
IDs (`softflow_buscar_opcoes`), chama `softflow_preparar_caso`, mostra a prévia, e só com o "pode
abrir" chama `softflow_abrir_caso`. A resposta traz o número e o link
`https://softflow.hostsoftcom.cloud/casos/<registro>`. A DM do Discord segue a regra da tela: só
caso **não planejado**.

No Softflow, a conexão aparece e é desfeita pelo menu do usuário → **Claude** → modal
**Conexão com o Claude** (decisão #10).

## Próxima mudança planejada: contexto do Brainiac para quem conecta

> **Estado: planejado** (chat de planejamento, 2026-11-25). Decisões #16 a #18 em
> [`decisoes.md`](decisoes.md) (e #19 a #21); protótipo em
> [`prototipo/modal-duas-colunas.html`](prototipo/modal-duas-colunas.html) (capturas `11` a `13`).

### Problema

Quem conecta só o Softflow consegue abrir caso, mas o Claude dela não conhece os produtos, os
padrões da squad nem o jeito de planejar e escrever o caso. Esse contexto está no Brainiac: as notas
dos produtos e, a partir de agora, a skill **`xp-planejar`** no catálogo de skills de Engenharia
(proposta enviada em 2026-11-25, `e95ba449-2946-4520-8fdd-95c977fe2941`, aguardando revisão e
publicação). Cada pessoa usa conta pessoal do Claude (decisão #12), então não existe configuração
central que entregue isso: cada uma precisa conectar o Brainiac, e o Claude precisa saber que deve
ler a skill de lá.

### O que muda

1. **Instruções do servidor MCP** (`INSTRUCOES` em `lib/conector-claude/mcp/servidor.ts`), decisão
   #16. Acrescentar ao texto atual, sem mexer nas três linhas que já existem:

   ```text
   Para planejar uma funcionalidade ou escrever o texto de um caso, use a skill xp-planejar do
   catálogo do Brainiac: se as ferramentas do Brainiac estiverem na conversa, leia-a com
   brainiac_skills_list (vault "engenharia", busca "xp-planejar") e brainiac_skill_read antes de
   começar, e siga o passo 7 dela para abrir o caso. Se o Brainiac não estiver conectado, avise a
   pessoa uma vez que o planejamento fica sem o contexto dos produtos e que ela pode conectá-lo
   (o endereço está no Softflow, menu do usuário → Claude). Abrir um caso já planejado não depende
   do Brainiac.
   ```

   Se a skill ainda não estiver publicada no catálogo, a busca volta vazia e o Claude segue com as
   regras deste servidor; não há erro a tratar no Softflow.

2. **`softflow_eu`** (decisão #16): depois de "Pode abrir casos: …", uma linha fixa
   `Contexto dos produtos: conecte também o Brainiac e use a skill xp-planejar do catálogo dele.`
   É o lembrete que o Claude vê mesmo quando o cliente não repassa as instruções do servidor.

3. **Modal "Conexão com o Claude" em duas colunas** (`components/conector-claude/conexao-modal/index.tsx`),
   decisões #17 e #19. Protótipo: [`prototipo/modal-duas-colunas.html`](prototipo/modal-duas-colunas.html)
   (`?c=sem-conexao` / `?c=conectado`), capturas `11`, `12` e `13`. Mesmo padrão da tela de
   autorização: coluna escura que explica, coluna clara com as informações.
   - **Tamanho:** `w-[min(96vw,880px)]`; grade `grid-cols-[320px_1fr]`; altura máxima da tela com
     rolagem dentro de cada coluna.
   - **Coluna esquerda** (`bg-primary`, textos `text-primary-foreground` e `/70`, como
     `autorizar-cabecalho.tsx`; o quadro do Brainiac usa o mesmo painel da tela de autorização):
     - logos Claude ↔ Softflow (decisão #20);
     - título "Planeje no Claude e abra o caso sem sair do chat" e o texto "O Claude usa a sua conta
       do Softflow, com as suas permissões. Nada é criado sem você confirmar a prévia no chat.";
     - lista **Com o Softflow conectado**: "Busca produto, versão, projeto e pessoas pelo nome",
       "Mostra a prévia e abre o caso depois do seu ok", "Consulta casos pelo número";
     - quadro com ícone `Sparkles`: "**Com o Brainiac também,** o Claude conhece os produtos, os
       padrões da squad e a skill de planejamento (xp-planejar). Sem ele, abre casos, mas planeja
       sem esse contexto."
   - **Coluna direita** (`bg-card`): título **Conexão com o Claude** e duas seções separadas por
     `border-t border-border-divider`, cada uma com ícone em círculo, nome e pílula à direita.
     - **Softflow**, pílula "Conectado"/"Não conectado" (a de hoje):
       - sem conexão: os 3 passos de hoje e **Endereço do conector** com botão de copiar **só com o
         ícone** (`aria-label="Copiar endereço do Softflow"`);
       - conectado: o quadro de hoje (Conectado desde, Último uso, Pode abrir casos).
     - **Brainiac**, pílula "Recomendado" (sempre a mesma, decisão #17):
       - Softflow sem conexão: "Adicione do mesmo jeito. Em **Advanced settings**, informe o Client
         ID. Se você já conectou o Brainiac, não precisa fazer nada." (os passos do Softflow estão
         logo acima);
       - Softflow conectado: os passos próprios, porque os do Softflow somem: 1. "No Claude, abra
         **Customize → Connectors → Add custom connector**." 2. "Cole o endereço e, em **Advanced
         settings**, informe o Client ID. Clique em **Add**." 3. "Entre com seu e-mail e senha de
         colaborador Softcom e clique em **Entrar no Brainiac**." e a nota "Se você já conectou o Brainiac, não precisa fazer nada.";
       - nos dois: **Endereço** e **OAuth Client ID**, um abaixo do outro, cada um com copiar só com
         ícone (`EnderecoCopiavel`, componente único para os três campos).
     - Rodapé: **Desconectar o Softflow** (só conectado, mesmo estilo de hoje) e **Fechar**.
   - **Mobile (< 768px):** tela cheia, colunas empilhadas; da coluna escura ficam logos, título,
     texto e o quadro do Brainiac (a lista some); a direita vem abaixo e tudo rola junto.
   - Carregando e erro: os de hoje, na coluna direita; a esquerda não depende de dados.
   - Sem cor nova: só tokens que o modal e a tela de autorização já usam.
   - Alternativas descartadas (A abas, B lista recolhida, C faixa): [`prototipo/modal-propostas.html`](prototipo/modal-propostas.html), captura `10`.

4. **Endereço e Client ID do Brainiac por variável** (decisões #18 e #21): `BRAINIAC_MCP_URL`
   (`https://brainiac.softcomtecnologia.com/mcp`) e `BRAINIAC_OAUTH_CLIENT_ID` (`brainiac-claude-ai`) em
   `lib/conector-claude/config.ts` (`getBrainiacConector()`), expostos pelo `GET
   /api/db/claude-conexao` como `brainiac: { endereco, clientId }`. Sem uma das variáveis, o campo
   correspondente some e o texto continua. Documentar as duas em
   [`deploy/`](../deploy/README.md#conector-do-claude-apimcp).

5. **Logos** (decisão #20): no lugar do "C", o logo oficial do Claude; no lugar do "S", o ícone do
   Softflow (`public/images/icon.png`). Vale para a tela de autorização (`autorizar-cabecalho.tsx`) e
   para o modal. O arquivo do Claude é baixado pelo dev do kit de imprensa oficial da Anthropic
   (newsroom) e salvo em `public/images/claude.svg`, sem redesenhar, recolorir nem distorcer, e
   seguindo as diretrizes de marca da Anthropic. Se o arquivo oficial não estiver disponível, fica o
   "C" de hoje.

6. **Protótipo**: o endereço antigo (`softflow.softcom.services`) do protótipo foi trocado pelo atual
   (decisão #13) neste planejamento.

### Fora do escopo

- Detectar se a pessoa conectou o Brainiac (o Softflow não tem como saber; decisão #17).
- Instalar a skill na conta da pessoa: ela é lida do catálogo do Brainiac pelo próprio Claude.
- Publicar a `xp-planejar` no Brainiac: é revisão e publicação administrativa do Brainiac, fora deste
  repositório.

### Perguntas em aberto

1. ~~Endereço do MCP do Brainiac~~: respondida em 2026-11-25 (`https://brainiac.softcomtecnologia.com/mcp`,
   Client ID `brainiac-claude-ai`).
2. ~~Rótulo do login do Brainiac~~: respondida em 2026-11-25 com a tela de login dele (e-mail e senha
   de colaborador Softcom, botão **Entrar no Brainiac**); entrou no passo 3.

### Plano de implementação

Um commit, na `dev`, escopo `(conector-claude)`:

1. `BRAINIAC_MCP_URL`, `BRAINIAC_OAUTH_CLIENT_ID` e `getBrainiacConector()`; `brainiac` no `GET
   /api/db/claude-conexao` e no tipo `ClaudeConexaoStatus`.
2. `INSTRUCOES` e a linha do `softflow_eu`.
3. `public/images/claude.svg` (arquivo oficial) e os logos no `autorizar-cabecalho.tsx` e no modal.
4. Modal em duas colunas com `EnderecoCopiavel`, nos dois estados e no mobile.
5. Conferir: `npm run lint`, `npm run build`, modal nos dois estados com e sem as variáveis do
   Brainiac (desktop e 390px), tela de autorização com os logos e o texto novo do `softflow_eu` pelo
   cliente MCP do SDK.
6. Ao concluir: integrar esta seção ao README no formato padrão (O que é / Ferramentas / Como fica
   para quem usa), tirar o "Estado: planejado" e mover o item no status.

## Arquitetura

```text
Claude (claude.ai)                          Softflow (Next)                          API Soft Flow
──────────────────                          ───────────────                          ─────────────
metadados  ───────────────────────────────► /.well-known/oauth-protected-resource[/api/mcp]
                                            /.well-known/oauth-authorization-server
registro (DCR) ───────────────────────────► POST /api/oauth/register
navegador da pessoa ──────────────────────► /oauth/autorizar ── POST /api/oauth/autorizar
                                              └─ senha → token próprio da conexão ───────► POST /auth/login
troca do código (PKCE S256) ──────────────► POST /api/oauth/token
ferramentas (Bearer) ─────────────────────► POST /api/mcp ── token da conexão ───────────► /auxiliar/*, /projeto-casos,
                                                              (renova com POST /auth/refresh)  /projeto-memoria/{id}
```

O Softflow é servidor de autorização OAuth 2.1 (só para o Claude) e servidor MCP (decisão #3). A
API Soft Flow não mudou.

### Rotas

| Rota | Papel |
|------|-------|
| `app/.well-known/oauth-protected-resource/[[...path]]/route.ts` | RFC 9728: `resource` = `<SOFTFLOW_PUBLIC_URL>/api/mcp` |
| `app/.well-known/oauth-authorization-server/route.ts` | RFC 8414: endpoints, só `S256`, `token_endpoint_auth_methods_supported: ["none"]`; não anuncia CIMD |
| `app/api/oauth/register/route.ts` | DCR; só aceita os callbacks do Claude (decisão #4); rate limit por IP |
| `app/oauth/autorizar/page.tsx` | Tela de consentimento (fora do shell, layout do login); o servidor valida o pedido e a sessão |
| `app/api/oauth/autorizar/route.ts` | "Permitir acesso"/"Cancelar": login com a senha, cria a conexão (revoga a anterior), gera o código; senha errada = 422 |
| `app/api/oauth/token/route.ts` | `authorization_code` (PKCE S256) e `refresh_token` com rotação; form ou JSON; erros OAuth (`invalid_grant`...) |
| `app/api/mcp/route.ts` | MCP Streamable HTTP sem estado, resposta JSON (sem SSE); GET/DELETE = 405 |
| `app/api/db/claude-conexao/route.ts` | `GET` status da conexão da pessoa logada; `DELETE` desconectar |

### Código

| Onde | O que faz |
|------|-----------|
| `lib/conector-claude/config.ts` | `SOFTFLOW_PUBLIC_URL`, endereço do MCP, callbacks permitidos, TTLs (código 5 min, access 1 h, refresh 30 dias, prévia 15 min) |
| `lib/conector-claude/crypto.ts` | Tokens aleatórios, hash SHA-256, PKCE S256, AES-256-GCM com `CLAUDE_CONECTOR_CHAVE` |
| `lib/conector-claude/legacy-token.ts` | Login do token da conexão, `comTokenDaConexao` (em 401 renova uma vez; falhou = conexão expirada) |
| `lib/conector-claude/pedido-autorizacao.ts` | Valida o pedido OAuth (cliente, `redirect_uri`, PKCE, `resource`); usado pela tela e pela rota |
| `lib/api-db/with-conector-permission.ts` | Espelho do `withPermission` a partir do Bearer do Claude: valida o access token, recalcula as permissões (`syncAppUserAndPermissions`), rate limit 60/min por conexão, `401` com `WWW-Authenticate` |
| `lib/conector-claude/mcp/servidor.ts` | `McpServer` por requisição com as 5 ferramentas e as instruções de uso |
| `lib/conector-claude/mcp/catalogos.ts` | Catálogos normalizados (id/nome), busca sem acento |
| `lib/conector-claude/mcp/caso.ts` | Prévia (resolução, padrões, pendências), abertura idempotente, consulta |
| `lib/db/claude-conector.ts` | Drizzle das tabelas novas |
| `lib/validators/db/claude-conector.ts` | Zod do DCR, do pedido/autorização e do token endpoint |
| `components/conector-claude/autorizar/` | Tela de autorização (layout, permissões, senha, erro, sem sessão) |
| `components/conector-claude/conexao-modal/` | Modal "Conexão com o Claude" e a pílula do menu |
| `services/conector-claude/`, `hooks/conector-claude/`, `hooks/claude-conexao/` | Front da autorização e da conexão |

### Tabelas (migração `0011_conector_claude`)

`oauth_clientes` (DCR), `oauth_codigos` (hash, uso único, 5 min), `claude_conexoes` (uma ativa por
pessoa, decisão #11; token Soft Flow cifrado; hashes dos tokens do Claude; `ultimo_uso_em`;
`motivo_revogacao` `usuario` | `expirado` | `reconectou`) e `claude_previas_caso` (payload pronto,
resumo, 15 min, `caso_registro`; `-1` enquanto a abertura está reservada).

### Token Soft Flow da conexão

No "Permitir acesso", a senha digitada vai uma vez para `POST /auth/login` e o token devolvido
(próprio da conexão, separado do cookie) é gravado cifrado (decisões #7 e #14). O login não derruba
as outras sessões da pessoa (conferido). Em 401 da API, o servidor renova com `POST /auth/refresh`
**usando o próprio token da conexão** (o refresh invalida o token anterior, por isso nunca é feito
com o token do navegador; ver P1). Se a renovação falhar, a conexão vira `expirado` e o Claude
recebe `401`, pedindo reconexão. Sair do Softflow não derruba o conector (o logout só apaga o
cookie).

### Ferramentas

| Ferramenta | Permissão | Anotação |
|------------|-----------|----------|
| `softflow_eu` | conexão válida | somente leitura |
| `softflow_buscar_opcoes` (`tipo`, `busca?`, `produto_id?`) | conexão válida | somente leitura |
| `softflow_preparar_caso` | `create-case` | somente leitura (só grava a prévia) |
| `softflow_abrir_caso` (`codigo_previa`) | `create-case` | escreve, idempotente |
| `softflow_consultar_caso` (`registro`) | `list-case` | somente leitura |

Padrões da prévia iguais aos da tela: importância `3`, categoria `4`, origem `4`, relator = a
pessoa conectada. Versão aceita a sequência do catálogo ou o texto exato. Campo inválido vira
"Falta resolver" e a abertura recusa a prévia. O tamanho dos textos não é validado (decisão #15):
se o legado recusar, a mensagem volta e o Claude gera outra prévia. Informações adicionais
terminam com `Aberto pelo Claude (conector Softflow) por <nome>.` (decisão #8).

### Segurança

`redirect_uri` só da lista do Claude, por igualdade exata; PKCE S256 obrigatório; tokens do Claude
e códigos só como hash; token Soft Flow cifrado e nunca devolvido; reuso de código revoga a
conexão; `/oauth/autorizar` com `X-Frame-Options: DENY` e `frame-ancestors 'none'`
(`next.config.js`); POST da autorização com checagem de `Origin` e cookie `SameSite=Lax`; rate limit
no `register`, no `token`, nas tentativas de senha (10 a cada 15 min) e por conexão no MCP (em
memória, o deploy tem uma réplica); log de cada conexão, desconexão e caso aberto.

## O que é reaproveitável

- `lib/casos/criar-caso.ts`: criação de caso + DM do Discord, fora da rota (usada pela tela e pelo
  conector).
- `lib/casos/payload.ts` e `lib/casos/versao-produto.ts`: helpers puros de payload e versão, sem
  React (os arquivos de `components/casos/shared/` só reexportam).
- `lib/auxiliar/catalogos.ts`: chamadas dos catálogos `/auxiliar/*` recebendo o `Authorization`.
- `withConectorPermission` e `comTokenDaConexao`: qualquer ferramenta nova do MCP usa os dois.
- `getSafeInternalReturnPath` aceita `/oauth/autorizar?` com URL na query sem segunda decodificação.

## Como estender

- **Ferramenta nova** (ex.: reports, decisão #2 deixa para depois): registrar em
  `lib/conector-claude/mcp/servidor.ts` com `title`, `description` em pt-BR, anotações corretas e
  checagem de permissão com `temPermissao`; chamar a API dentro de `comTokenDaConexao`. Se escrever
  algo, seguir o padrão prévia → confirmação → abertura idempotente.
- **Outro cliente além do Claude**: exige revisar a decisão #4 (lista de callbacks) com o usuário.
- **CIMD** ("Use Claude's published identity"): anunciar `client_id_metadata_document_supported` e
  aceitar `client_id` como URL; hoje é só DCR.
- **Trocar a chave** `CLAUDE_CONECTOR_CHAVE` invalida todas as conexões.

## Testes feitos e pendências

Testado em 2026-11-19 (detalhes no "Andamento" abaixo): catálogos e abertura pela tela depois da
refatoração; metadados, DCR, autorização com senha, troca de código com PKCE, refresh com rotação,
reuso de código; tela de autorização (estados, cabeçalhos, 390px); as 5 ferramentas com o cliente
MCP do SDK, incluindo abertura simultânea sem duplicar; menu, modal e desconectar.

Pendente:

- ~~Teste no Claude de verdade~~: feito em 2026-11-19 pelo usuário. O Claude conectado
  identificou a pessoa (`softflow_eu`), resolveu produto, versão, projeto e dev pelo nome, mostrou a
  prévia e, depois do ok, abriu o caso **104203** (produto Softflow, versão MELHORIA, projeto 3278);
  a consulta pelo número confirmou o caso igual à prévia.
- ~~Passo 7 da skill `planejar-softcom`~~: ajustado em 2026-11-25 (abre o caso pelo conector e, sem
  ele, entrega o texto para colar). A mesma skill foi proposta ao catálogo do Brainiac como
  `xp-planejar` (ver "Próxima mudança planejada").
- O aviso "Claude desconectado" foi corrigido (`mutateAsync`) depois do teste e não foi reconferido.
- Casos de teste criados na API de dev, para excluir: 104140, 104141, 104143.

## Protótipo

[`prototipo/conector-claude-prototipo.html`](prototipo/conector-claude-prototipo.html) e as capturas
em [`prototipo/capturas/`](prototipo/capturas/) são a referência de estrutura usada. A tela
implementada acrescenta o campo **Senha do Softflow** (decisão #14), que o protótipo não tem.

## Histórico da implementação

### Fase 0 — conferência do plano contra o código (2026-11-19)

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

### P1 — Comportamento do `POST /auth/refresh` do legado · respondida → decisão #14

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

**Teste na API de dev (2026-11-19, Claude Code, com o token da sessão do navegador):**

| Passo | Resultado |
|-------|-----------|
| `GET /auth/me` com o token atual | 200 |
| `POST /auth/refresh` com o token atual | 200, `{ success, message, authorization: { type: "bearer", token } }`, sem validade na resposta |
| `GET /auth/me` com o token **antigo** depois do refresh | **401** |
| `GET /auth/me` com o token novo | 200 |
| `POST /auth/refresh` de novo com o token antigo | 401 "Não autenticado. Token de acesso necessário." |

Os tokens são opacos (não são JWT), então a validade não aparece no token nem na resposta.
Conclusão: **é o cenário B.** O refresh troca o token (o anterior morre na hora). Pegar o token da
conexão por refresh, como a decisão #7 previa, derruba a sessão do navegador, e o teste derrubou de
fato a sessão usada nele. Renovar o token **da própria conexão** por refresh continua possível: só
mata o token da conexão, que é trocado pelo novo. O que falta é um jeito de obter um **segundo**
token sem matar o do navegador. Opções revisadas:
**C)** Na tela de autorização, a pessoa digita a senha de novo e o servidor chama `POST /auth/login`
para emitir o token da conexão. A senha só passa pela rota, nunca é guardada. Muda a decisão #7 (e
acrescenta um campo de senha na tela do protótipo). Depende de o login **não** derrubar os tokens
que já existem (conferir entrando em dois navegadores ao mesmo tempo).
**D)** Pedir ao legado um endpoint que emite token de integração a partir do token da sessão. Muda a
decisão #3 e depende de outra equipe.
**E)** No "Permitir acesso", dar o token novo do refresh para a conexão e trocar o cookie do navegador
por... nada: não há como ter dois tokens só com refresh. Descartada.
Recomendação do Claude Code: C, se o login aceitar duas sessões ao mesmo tempo, porque não depende
do legado e a reautenticação é comum em telas de consentimento. Validade do token e refresh com
token expirado continuam sem resposta: com C, se o token da conexão vencer, o `401` faz o Claude
pedir reconexão, que é aceitável.

Resposta (2026-11-19, Claude Code): C. A tela de autorização pede a senha de novo e o servidor emite
o token da conexão por `POST /auth/login`. Ver decisão #14. Ainda falta conferir que o login não
derruba as outras sessões da pessoa (entrar em dois navegadores ao mesmo tempo).

### P2 — Limites de `DescricaoResumo` e `DescricaoCompleta` · respondida → decisão #15

Fase: Fase 0 (2026-11-19). Contexto: pergunta em aberto 4. O `casoCreateFormSchema`
(`components/casos/cadastro/caso-create/schema.ts`) só exige `min(1)`; não há limite no front.
Opções: **A)** informar os limites do legado e a prévia valida com eles. **B)** sem limite na
prévia; se o legado recusar, `softflow_abrir_caso` devolve o erro dele e o Claude gera nova prévia.
Recomendação do Claude Code: A, se o limite existir, porque a decisão #6 promete que o caso sai
igual à prévia. Só bloqueia a Parte 4.

Resposta (2026-11-19, Claude Code): B. A prévia não valida tamanho; se o legado recusar, `softflow_abrir_caso`
devolve o erro dele e o Claude gera uma prévia nova. Ver decisão #15.

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
- [x] Parte 1: refatoração sem mudança de comportamento (2026-11-19). `lib/casos/versao-produto.ts`, `lib/casos/payload.ts` (os arquivos de `components/casos/shared/` reexportam), `lib/casos/criar-caso.ts` e `lib/auxiliar/catalogos.ts`. Catálogos conferidos na tela `/casos/novo` (2026-11-19, todas as rotas `/api/auxiliar/*` do formulário com 200); abertura conferida com o caso de teste 104140 (produto Softflow, projeto 3316, `POST /api/projeto-casos` → 201). A DM só sai para caso "Não planejado" (`shouldNotifyDiscordOnCreate`, regra mantida); segundo teste com `NaoPlanejado: 1`, caso 104141 → 201, DM a conferir no Discord
- [x] Parte 2: banco e OAuth (2026-11-19). Tabelas `oauth_clientes`, `oauth_codigos`, `claude_conexoes`, `claude_previas_caso` (migração `0011_conector_claude`), metadados `.well-known`, `register`, `token`, `POST /api/oauth/autorizar` (senha → `POST /auth/login`, decisão #14), cifra em `lib/conector-claude/crypto.ts` e `withConectorPermission`. Conferido no dev server: metadados, recusa de `redirect_uri` fora da lista e de `grant_type` desconhecido. Migração aplicada no banco do `.env` em 2026-11-19 (`npm run db:apply`, as 4 tabelas conferidas); o fluxo completo (autorizar → token) é testado com a tela na Parte 3
- [x] Parte 3: tela de autorização (2026-11-19). `app/oauth/autorizar/page.tsx` (servidor valida o pedido e a sessão) + `components/conector-claude/autorizar/`, com o campo **Senha do Softflow** (decisão #14); `getSafeInternalReturnPath` aceita `/oauth/autorizar?` com `://` só na query e sem segunda decodificação; `X-Frame-Options`/`frame-ancestors` no `next.config.js`. Conferido no navegador: erro de endereço de retorno, tela com dados da pessoa, senha vazia, Cancelar (`access_denied` com `state` intacto), cabeçalhos e layout em 390px. "Permitir acesso" com senha conferido pelo usuário (2026-11-19): conexão criada com o token Soft Flow cifrado, `GET /auth/me` com o token da conexão → 200 e **a sessão do navegador continuou valendo** (o login não derruba as outras sessões; pendência da decisão #14 resolvida). O `code` real se perdeu nos redirecionamentos do claude.ai (a página de login dele descarta a query), então a troca foi testada com códigos inseridos para essa mesma conexão: PKCE errado e `redirect_uri` diferente → `invalid_grant`; código certo → tokens de 1 h com refresh e hashes gravados; refresh com rotação (o antigo passa a dar `invalid_grant`); reuso do código → `invalid_grant` e conexão revogada. O teste no Claude de verdade fica para a Parte 4
- [x] Parte 4: servidor MCP e ferramentas (2026-11-19). `app/api/mcp/route.ts` (SDK `@modelcontextprotocol/sdk`, transporte Web Standard sem estado, resposta JSON) + `lib/conector-claude/mcp/` (`servidor.ts`, `catalogos.ts`, `caso.ts`); prévias em `claude_previas_caso` com reserva atômica. Conferido com o cliente MCP do SDK contra o dev server: 401 com `WWW-Authenticate`, as 5 ferramentas, prévia com pendências recusada na abertura, linha de origem, duas aberturas simultâneas da mesma prévia criaram um caso só (104143, API de dev), repetir o código devolve o mesmo caso, consulta e 401 depois de revogar. **Falta o teste no Claude de verdade**, que precisa do endereço público (só depois de publicar)
- [x] Parte 5: menu do usuário e modal "Conexão com o Claude" (2026-11-19). `GET`/`DELETE` em `app/api/db/claude-conexao/route.ts`, `services/conector-claude/conexao.ts`, `hooks/claude-conexao/use-claude-conexao.ts`, `components/conector-claude/conexao-modal/` e o item **Claude** em `components/header/user-dropdown.tsx`. O passo 3 do "sem conexão" inclui digitar a senha (decisão #14). Conferido no navegador: pílula "Não conectado"/"Conectado", modal nos dois estados, endereço do conector, confirmação e Desconectar; depois de desconectar a conexão fica revogada (`motivo_revogacao = usuario`) e o `/api/mcp` responde 401
- [x] Parte 6: publicação e orientação (2026-11-19). Variáveis e checagem pós-publicação em [`deploy/`](../deploy/README.md#conector-do-claude-apimcp), passo a passo no modal e neste README, README no formato padrão. Publicar (merge na `master`) e o teste no Claude de verdade dependem do usuário

### Plano de implementação (original)

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
