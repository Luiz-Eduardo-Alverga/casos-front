# Conector do Claude (abrir casos pelo chat)

> **Estado: em produção desde 2026-11-19** (`https://softflow.hostsoftcom.cloud/api/mcp`).
> Conferido no domínio público: metadados, `401` com `WWW-Authenticate`, registro do cliente,
> token endpoint com o banco de produção e a tela de autorização (cabeçalhos e volta pelo login).
> Testado no Claude de verdade em 2026-11-19 (caso 104203, aberto pelo conector). Decisões em
> [`decisoes.md`](decisoes.md); protótipo em [`prototipo/`](prototipo/).
>
> **Na `dev`, ainda não publicado** (2026-11-25): contexto do Brainiac (decisões #16 a #21) e
> consulta completa do caso + Claude Code (decisões #22 a #26). Implementados e conferidos; ver as
> pendências em "Testes feitos e pendências".
>
> **Há uma [próxima mudança planejada](#próxima-mudança-planejada-casos-em-lote-busca-de-casos-e-agenda-do-dev)**
> (2026-11-25, decisões #27 a #32): abrir vários casos de uma vez (filhos de um caso pai, numerados
> em partes), buscar casos e ver a agenda do dev. Implementar com `/implementar conector-claude`.

## O que é

O Softflow expõe um **servidor MCP** (`/api/mcp`) que cada pessoa da squad adiciona ao Claude como
**conector personalizado** na própria conta (decisão #12). Depois de conectar a conta do Softflow
uma vez, o Claude consegue, em nome dela e com as permissões dela:

- consultar os catálogos da abertura de caso (produto, versão, módulo, projeto, pessoas,
  categoria, importância e origem) por nome;
- montar uma **prévia** do caso com os nomes resolvidos, os padrões aplicados e o que falta;
- **abrir o caso** depois da confirmação da pessoa no chat (decisão #6);
- **consultar o caso completo** pelo número, para implementar, testar ou revisar: cabeçalho,
  descrição (com passos, informações adicionais e história), anotações, clientes, relações e anexos
  com link de download (decisões #22 e #23).

Funciona no **Claude (app e web)** e no **Claude Code**, com uma conexão ativa por tipo de cliente
(decisões #24 e #25): conectar um não derruba o outro.

Fora do escopo (decisão #2): reports, edição de caso, mudança de status, escrever anotações,
vincular clientes ou relações, baixar o conteúdo dos anexos pelo MCP e produção.

### Como fica para quem usa

Uma vez, por pessoa e por cliente. **Claude (app e web)** (contas Pro ou Max; no Free cabe um só
conector personalizado):

1. No Claude, **Customize → Connectors → Add custom connector**, endereço
   `https://softflow.hostsoftcom.cloud/api/mcp` (decisão #13). O endereço também aparece, com botão
   de copiar, no menu do usuário do Softflow → **Claude**.
2. O Claude abre **Conectar o Claude ao Softflow** (`/oauth/autorizar`). Sem sessão, a pessoa passa
   pelo login e volta para a mesma tela.
3. Confere os dados, **digita a senha do Softflow** (decisão #14) e clica em **Permitir acesso**.

**Claude Code**:

1. No terminal: `claude mcp add --transport http softflow https://softflow.hostsoftcom.cloud/api/mcp`
   (com `--scope user` vale em todos os projetos). O comando também aparece no modal, aba **Claude
   Code**.
2. No Claude Code, `/mcp` → **softflow** → **Authenticate**. O navegador abre **Conectar o Claude
   Code ao Softflow**; o retorno é `http://localhost:<porta>/callback` (decisão #24).
3. Digita a senha do Softflow e clica em **Permitir acesso**.

Para implementar um caso, o dev pede "implementa o caso 104203": as instruções do servidor mandam o
Claude chamar `softflow_consultar_caso` antes de começar.

No dia a dia: "abre o caso disso no Softflow, produto X, versão Y, dev Fulano" → o Claude busca os
IDs (`softflow_buscar_opcoes`), chama `softflow_preparar_caso`, mostra a prévia, e só com o "pode
abrir" chama `softflow_abrir_caso`. A resposta traz o número e o link
`https://softflow.hostsoftcom.cloud/casos/<registro>`. A DM do Discord segue a regra da tela: só
caso **não planejado**.

No Softflow, a conexão aparece e é desfeita pelo menu do usuário → **Claude** → modal
**Conexão com o Claude** (decisão #10). O modal tem duas colunas (decisão #19): à esquerda, em
fundo escuro, os logos Claude ↔ Softflow, o que a conexão faz e o quadro "Com o Brainiac também";
à direita, as seções **Softflow** e **Brainiac**. No mobile vira tela cheia com as colunas
empilhadas (a lista do que a conexão faz some).

- **Softflow sem conexão:** seletor **Claude (app e web)** | **Claude Code** (lembra a última
  escolha em `localStorage`) e os passos do tipo escolhido, com o endereço ou o comando para copiar
  dentro do passo que o usa (decisão #26).
- **Softflow com conexão:** uma linha por tipo, com "Desde … · usado …", a pílula e o botão
  **Desconectar** só com ícone (confirmação "Desconectar o Claude Code?", só aquele tipo) ou o link
  **Como conectar**, que abre os passos daquele tipo abaixo da linha. Abaixo, a nota "Pode abrir
  casos: Sim/Não".

### Brainiac

Sem o Brainiac, o Claude abre casos mas não conhece os produtos, os padrões da squad nem a skill de
planejamento. Como cada pessoa usa a própria conta (decisão #12), o conector é quem aponta o
caminho (decisão #16):

- as **instruções do servidor MCP** mandam ler a skill `xp-planejar` do catálogo do Brainiac
  (`brainiac_skills_list` + `brainiac_skill_read`) antes de planejar ou escrever um caso e, sem o
  Brainiac na conversa, avisar uma vez que dá para conectá-lo; abrir um caso já planejado não
  depende dele;
- o `softflow_eu` repete o lembrete numa linha fixa, para o cliente que não repassa as instruções;
- o modal **recomenda** o Brainiac nos dois estados, sempre com a pílula "Recomendado" e sem status
  (o Softflow não sabe se a pessoa conectou; decisão #17). Conectado o Softflow, mostra os passos
  próprios do Brainiac (login de colaborador Softcom → **Entrar no Brainiac** → **Autorizar
  acesso**); sem conexão, só "Adicione do mesmo jeito". Endereço e **OAuth Client ID** (o Brainiac
  não usa DCR; vai em **Advanced settings**) vêm de `BRAINIAC_MCP_URL` e
  `BRAINIAC_OAUTH_CLIENT_ID` (decisões #18 e #21); sem uma delas, o campo some e o texto fica.

Se a `xp-planejar` ainda não estiver publicada no catálogo, a busca volta vazia e o Claude segue só
com as regras do conector; nada a tratar no Softflow.

## Próxima mudança planejada: casos em lote, busca de casos e agenda do dev

> **Estado: planejado** (chat de planejamento, 2026-11-25). Decisões #27 a #32 em
> [`decisoes.md`](decisoes.md). Só ferramentas do MCP e instruções do servidor: **nenhuma tela muda**,
> então não há protótipo.

### Problema

1. **Funcionalidade grande vira vários casos, um por um.** No planejamento, uma funcionalidade maior
   é dividida em casos menores. Hoje o Claude prepara e abre cada caso separado: uma prévia e uma
   confirmação por caso, sem ligação entre eles no Softflow e sem ordem garantida na listagem.
2. **Não dá para pesquisar casos pelo Claude.** Só existe a consulta pelo número. Perguntas como
   "em quais casos foi implementado o status ErroDeSincronização no Vendas 360?" ficam sem
   resposta. A API Soft Flow (`GET /projeto-memoria`) filtra texto só pelo **resumo** do caso
   (`descricao_resumo`); o detalhe do que foi implementado costuma estar na descrição, nas anotações
   e, para os casos documentados, nas notas de caso do Brainiac
   (`engenharia/setores/<squad>/<produto>/casos/<registro>.md`).
3. **O dev não vê a agenda pelo Claude.** No Claude Code, o dev precisa saber o que fazer agora
   sem abrir o Painel do desenvolvedor (`/painel`). A agenda do Painel é por sprint
   (`GET /auxiliar/agenda-dev`: produtos priorizados com contagens) e os cards vêm de
   `GET /projeto-memoria` por status ([`painel-desenvolvedor/`](../painel-desenvolvedor/README.md)).

### 1. Casos em lote: `softflow_preparar_casos` e `softflow_abrir_casos` (decisões #27 a #29)

**`softflow_preparar_casos`** (`create-case`; somente leitura, só grava a prévia):

| Campo | Obrigatório | O que é |
|-------|-------------|---------|
| `pai` | sim | `{ "registro": <n> }` para usar um caso que já existe, ou `{ "novo": { resumo, descricao, informacoes_adicionais? } }` para abrir um caso pai junto |
| `comum` | sim | campos iguais para todos: `produto_id`, `versao`, `projeto_id`, `dev_id` e, opcionais, `qa_id`, `modulo`, `importancia`, `categoria_id`, `origem_id`, `relator_id`, `nao_planejado` (mesmos padrões do `softflow_preparar_caso`) |
| `titulo_base` | sim | início do título comum às partes (ex.: `Vendas 360 — Status ErroDeSincronização`) |
| `casos` | sim | de 2 a 15 itens, **na ordem de execução**: `{ titulo, descricao, informacoes_adicionais?, dev_id?, qa_id?, modulo?, importancia?, nao_planejado? }`; os opcionais sobrepõem `comum` só naquele caso |

- **Título de cada parte** (decisão #28): `<titulo_base> — PARTE <n>/<N> — <titulo>`, com `n` e `N`
  com zero à esquerda quando o lote tiver 10 ou mais casos (`PARTE 01/12`), para a ordenação por
  título da listagem seguir a ordem do lote. O título do caso pai novo é o `titulo_base` (sem parte).
  Se o título montado passar do limite do legado (decisão #15: não validamos tamanho), a mensagem
  do legado volta como hoje.
- **Caso pai** (decisão #27): o novo usa os campos de `comum` e a descrição informada, e ganha no fim
  a lista das partes (`PARTE 1/3 — <titulo>`), sem os números dos casos, porque o pai é aberto antes
  delas e o conector não edita texto (decisão #2); os números ficam nas relações. Pai existente:
  conferido com `GET /projeto-memoria/{registro}` (precisa existir e a pessoa precisa ter
  `list-case`); o título e a descrição dele não mudam.
- **Prévia**: uma só, com o código `pl_...` (15 minutos, uso único), a tabela dos campos comuns, o
  caso pai (novo ou existente, com resumo) e uma linha por parte (título final, dev, QA e o que foi
  sobreposto), mais "Falta resolver" por parte. Uma pendência em qualquer parte bloqueia o lote
  inteiro. Grava em `claude_previas_caso` com `payload` do lote (coluna `tipo`: `'caso'` | `'lote'`,
  default `'caso'`).

**`softflow_abrir_casos`** (`codigo_previa`; escreve, idempotente):

1. Abre o caso pai, se for novo.
2. Abre as partes **na ordem**, uma por vez, pelo mesmo `lib/casos/criar-caso.ts` (DM do Discord só
   para não planejado, como hoje).
3. Cria a relação de cada parte com o pai: `tipo_relacao 2` ("É FILHO DE") com `caso_relacionado =
   pai` (mesmo `POST /projeto-casos-relacoes` da aba Relações).
4. Grava cada número na prévia assim que é criado. Se algo falhar no meio, a resposta lista o que
   foi aberto e o erro; chamar de novo com o mesmo código **continua de onde parou** (não abre de novo
   o que já foi aberto). Depois de completo, repetir devolve o mesmo resultado (decisão #29).
5. Resposta: o pai e cada parte com número, título e link, e as relações criadas.

A linha de origem (decisão #8) vai em todos, com "(lote de <N> casos, pai <registro>)".

### 2. Busca de casos: `softflow_buscar_casos` (decisões #30 e #31)

`list-case`; somente leitura. Mesmos filtros da tela de Casos (`components/casos/filtros/casos-filtros-mappers.ts`):

| Campo | Vai para o legado como |
|-------|------------------------|
| `texto` | `descricao_resumo` (o legado busca só no resumo) |
| `produto_id`, `versao` | `produto_id`, `versao_produto` (texto da versão, como a tela) |
| `status` (lista de nomes ou ids) | `status_id[]` |
| `modulo`, `projeto_id`, `setor`, `tipo` (`CASO`/`REPORT`) | `modulo`, `projeto_id`, `setor`, `tipo_abertura` |
| `dev_id`, `qa_id`, `relator_id` | `usuario_dev_id`, `usuario_qa_id`, `usuario_abertura_id` |
| `aberto_de`, `aberto_ate`, `producao_de`, `producao_ate` (AAAA-MM-DD) | `data_abertura_inicio/final`, `data_producao_inicio/fim` |
| `nao_planejado` | `nao_planejado` |
| `pagina` | página (20 por página) |

- Pelo menos um filtro é obrigatório (sem filtro, a ferramenta recusa e pede um).
- Resposta: "<total> casos (página <p> de <n>)" e uma linha por caso: número, resumo, produto e
  versão, status, dev, data de abertura e link. Ordem do legado (a mesma da tela).
- **Busca no conteúdo** (decisão #31): as `INSTRUCOES` e a descrição da ferramenta orientam o
  Claude a, quando a pergunta for sobre o que foi implementado (e não só sobre o título):
  1. buscar no Brainiac (`brainiac_search`, cofre `engenharia`, produto do caso) as notas de caso e as
     especificações sobre o tema, que trazem o número do caso;
  2. buscar no Softflow pelo `texto` com variações do termo (o resumo costuma ter o nome da tela ou
     do status) e filtros de produto e período;
  3. juntar os números, abrir os mais prováveis com `softflow_consultar_caso` (no máximo 10) para
     confirmar na descrição e nas anotações, e dizer quais confirmou e quais são só candidatos.
  Sem o Brainiac na conversa, faz só os passos 2 e 3 e avisa que a busca ficou só no resumo.

### 3. Agenda do dev: `softflow_agenda` (decisão #32)

Somente leitura. Entrada: `pessoa_id?` (padrão: a pessoa conectada) e `projeto_id?` (padrão: a
sprint do setor cujo período inclui hoje, a mesma regra do `softflow_eu`).

- **Permissão:** a própria agenda exige só a conexão; a de outra pessoa exige `list-painel-dev`
  (a mesma da tela do Painel).
- **Dados:** `GET /auxiliar/agenda-dev` (produtos priorizados, na `ordem` da agenda, com as contagens)
  e, para cada produto da agenda, `GET /projeto-memoria` com `usuario_dev_id`, `produto_id`,
  `versao_produto`, `projeto_id` e status abertos (`1`, `2`) e retornos (`4`), como as colunas do
  Painel. Até 10 casos por produto e por status; o resto vira "+<n> no Painel".
- **Resposta**, nesta ordem:
  1. cabeçalho: pessoa, sprint (nome e período) e totais (abertos, retornos, corrigidos, resolvidos);
  2. **Em andamento**: o caso iniciado de cada produto marcado com `tem_caso_iniciado` (ver pergunta 2);
  3. **Retornos** (vêm antes: o QA devolveu), por produto na ordem da agenda;
  4. **Abertos**, por produto na ordem da agenda e, dentro do produto, por importância e número;
  5. uma linha com corrigidos e resolvidos por produto (só contagem) e o link do Painel.
  Cada caso: número, resumo, versão, status, importância e link.
- A descrição da ferramenta diz: "o que fazer agora"; para o detalhe de um caso, `softflow_consultar_caso`.

### 4. Instruções do servidor (`INSTRUCOES`)

Acrescentar, sem mexer no que existe:

```text
Funcionalidade dividida em vários casos: use softflow_preparar_casos com um caso pai (novo ou
existente) e as partes na ordem de execução; mostre a prévia do lote inteiro e só abra com o ok.
Para pesquisar casos pelo conteúdo, combine o Brainiac (notas de caso e especificações) com
softflow_buscar_casos e confirme os candidatos com softflow_consultar_caso.
Para "o que eu tenho para fazer hoje", use softflow_agenda.
```

### Fora do escopo

- Busca no texto completo pelo próprio Softflow (índice no Postgres): fica para depois, se a busca
  combinada não bastar (decisão #31).
- Mudar status, iniciar ou finalizar caso pela agenda (decisão #2 continua).
- Editar o caso pai depois do lote (por exemplo, acrescentar os números das partes na descrição).

### Perguntas em aberto

1. **(dev)** Ao criar "É FILHO DE" na parte, o legado cria sozinho o inverso ("É PAI DE") no pai, como
   parece pela aba Relações? Se não, `softflow_abrir_casos` cria os dois.
2. **(dev)** Como saber **qual** caso está em andamento? `tem_caso_iniciado` da agenda diz só que há um
   no produto. Opções: lançamento de produção aberto (`caso.producao` com `abertura` sem
   `fechamento`) do dev, ou status específico. Define a seção "Em andamento".
3. **(dev)** O `GET /projeto-memoria` aceita ordenação (por importância, por número)? Se não, a agenda
   ordena no servidor do Softflow depois de buscar.
4. **(dev)** O filtro `descricao_resumo` do legado é "contém", sem diferença de maiúsculas e acentos?
   Isso muda quantas variações do termo o Claude precisa tentar.

### Plano de implementação

Um commit por parte, na `dev`, escopo `(conector-claude)`:

1. **Busca:** `softflow_buscar_casos` reaproveitando o mapeamento de filtros da tela (extrair o
   pedaço puro de `casos-filtros-mappers.ts` para `lib/casos/` se precisar), descrição e `INSTRUCOES`.
   Conferir com o cliente MCP do SDK: por texto, por produto e período, sem filtro (recusa), paginação.
2. **Agenda:** `softflow_agenda` com a regra da sprint atual, permissão para outra pessoa e as seções.
   Conferir com um dev com casos em vários produtos e com um sem agenda (mensagem clara).
3. **Lote:** coluna `tipo` em `claude_previas_caso` (migração), `softflow_preparar_casos` e
   `softflow_abrir_casos` com pai novo e existente, numeração das partes, relações e retomada. Conferir
   na API de dev: lote de 3 com pai novo, lote de 10+ (zeros à esquerda), falha no meio e retomada.
4. Ao concluir: integrar esta seção ao README no formato padrão, mover o item no status e atualizar
   o passo 7 da skill `xp-planejar` (avisar o usuário: a skill mora no Brainiac).

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
| `app/api/oauth/register/route.ts` | DCR; só aceita os callbacks do Claude e o loopback do Claude Code (decisões #4 e #24); rate limit por IP |
| `app/oauth/autorizar/page.tsx` | Tela de consentimento (fora do shell, layout do login); o servidor valida o pedido e a sessão e passa o nome do cliente ("Claude" ou "Claude Code", pelo `redirect_uri`) |
| `app/api/oauth/autorizar/route.ts` | "Permitir acesso"/"Cancelar": login com a senha, cria a conexão com o `tipo_cliente` (revoga a anterior do mesmo tipo), gera o código; senha errada = 422 |
| `app/api/oauth/token/route.ts` | `authorization_code` (PKCE S256) e `refresh_token` com rotação; form ou JSON; erros OAuth (`invalid_grant`...) |
| `app/api/mcp/route.ts` | MCP Streamable HTTP sem estado, resposta JSON (sem SSE); GET/DELETE = 405 |
| `app/api/db/claude-conexao/route.ts` | `GET`: `conectado` (alguma ativa), `conexoes: [{ tipo, conectadoEm, ultimoUsoEm }]`, `podeAbrirCaso`, `enderecoConector`, `brainiac: { endereco, clientId }`. `DELETE ?tipo=claude\|claude-code` desconecta um tipo; sem `tipo`, todas |

### Código

| Onde | O que faz |
|------|-----------|
| `lib/conector-claude/config.ts` | `SOFTFLOW_PUBLIC_URL`, endereço do MCP, callbacks permitidos (`isRedirectUriPermitida`, `isRedirectUriLoopback`), tipo de cliente (`tipoClienteDoRedirect`, `NOME_TIPO_CLIENTE`), TTLs (código 5 min, access 1 h, refresh 30 dias, prévia 15 min); `getBrainiacConector()` (`BRAINIAC_MCP_URL`, `BRAINIAC_OAUTH_CLIENT_ID`) |
| `lib/conector-claude/crypto.ts` | Tokens aleatórios, hash SHA-256, PKCE S256, AES-256-GCM com `CLAUDE_CONECTOR_CHAVE` |
| `lib/conector-claude/legacy-token.ts` | Login do token da conexão, `comTokenDaConexao` (em 401 renova uma vez; falhou = conexão expirada) |
| `lib/conector-claude/pedido-autorizacao.ts` | Valida o pedido OAuth (cliente, `redirect_uri`, PKCE, `resource`); usado pela tela e pela rota |
| `lib/api-db/with-conector-permission.ts` | Espelho do `withPermission` a partir do Bearer do Claude: valida o access token, recalcula as permissões (`syncAppUserAndPermissions`), rate limit 60/min por conexão, `401` com `WWW-Authenticate` |
| `lib/conector-claude/mcp/servidor.ts` | `McpServer` por requisição com as 5 ferramentas e as instruções de uso |
| `lib/conector-claude/mcp/catalogos.ts` | Catálogos normalizados (id/nome), busca sem acento |
| `lib/conector-claude/mcp/caso.ts` | Prévia (resolução, padrões, pendências), abertura idempotente |
| `lib/conector-claude/mcp/consulta.ts` | Consulta completa (decisões #22 e #23): uma chamada a `GET /projeto-memoria/{id}` e as seções em Markdown (textos, anotações, clientes, relações, anexos via `listCaseAttachmentsByRegistro` + `createCaseAttachmentSignedDownloadUrl`); formatadores puros exportados |
| `lib/db/claude-conector.ts` | Drizzle das tabelas novas |
| `lib/validators/db/claude-conector.ts` | Zod do DCR, do pedido/autorização e do token endpoint |
| `components/conector-claude/autorizar/` | Tela de autorização (layout, permissões, senha, erro, sem sessão) |
| `components/conector-claude/conexao-modal/` | Modal "Conexão com o Claude" em duas colunas (`index.tsx`, coluna escura e seção Brainiac), `secao-softflow.tsx` (seletor e lista por tipo), `instrucoes-softflow.tsx` (passos de cada tipo), `confirmar-desconexao.tsx`, `EnderecoCopiavel` (campo + copiar só com ícone), `PassosNumerados` (passo com bloco abaixo), `cabecalho-secao.tsx`, `utils.ts` e a pílula do menu |
| `components/conector-claude/logos-conector.tsx` | Logos Claude ↔ Softflow (decisão #20), usados na autorização e no modal. `public/images/claude.svg` é o `ClaudeIcon-Rounded.svg` do press kit oficial da Anthropic (anthropic.com/news → "Download press kit"), sem alteração |
| `services/conector-claude/`, `hooks/conector-claude/`, `hooks/claude-conexao/` | Front da autorização e da conexão |

### Tabelas (migrações `0011_conector_claude` e `0012_conector_claude_tipo_cliente`)

`oauth_clientes` (DCR), `oauth_codigos` (hash, uso único, 5 min), `claude_conexoes` (uma ativa por
pessoa **e por `tipo_cliente`** `claude` | `claude-code`, decisão #25, que revogou a #11; token
Soft Flow cifrado; hashes dos tokens do Claude; `ultimo_uso_em`; `motivo_revogacao` `usuario` |
`expirado` | `reconectou`) e `claude_previas_caso` (payload pronto, resumo, 15 min,
`caso_registro`; `-1` enquanto a abertura está reservada).

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
| `softflow_consultar_caso` (`registro`, `secoes?`) | `list-case` (anexos: `list-case-attachment`) | somente leitura |

`softflow_consultar_caso` devolve o cabeçalho (produto, versão, projeto, status, dev, QA, relator,
importância, categoria, link) e, só quando têm conteúdo: `## Descrição`, `## Passos para
reproduzir`, `## Informações adicionais`, `## História` (texto do legado com `\r\n` → `\n`),
`## Anotações (n)` (da mais recente; acima de 30, as 30 e "+n anotações antigas no Softflow"),
`## Clientes (n)`, `## Relações (n)` (com o link do caso relacionado) e `## Anexos (n)` (nome,
tamanho, data e link assinado que vence em 5 minutos; sem a permissão, "Seu perfil não permite ver
os anexos"). `secoes` (`descricao`, `anotacoes`, `clientes`, `relacoes`, `anexos`; padrão todas)
restringe o que vem além do cabeçalho.

Padrões da prévia iguais aos da tela: importância `3`, categoria `4`, origem `4`, relator = a
pessoa conectada. Versão aceita a sequência do catálogo ou o texto exato. Campo inválido vira
"Falta resolver" e a abertura recusa a prévia. O tamanho dos textos não é validado (decisão #15):
se o legado recusar, a mensagem volta e o Claude gera outra prévia. Informações adicionais
terminam com `Aberto pelo Claude (conector Softflow) por <nome>.` (decisão #8).

### Segurança

`redirect_uri` só da lista do Claude, por igualdade exata, ou loopback do Claude Code
(`http://localhost|127.0.0.1:<porta>/callback`, regex no texto cru, sem query nem fragmento; RFC
8252, decisão #24); PKCE S256 obrigatório (é o que protege o loopback); tokens do Claude
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
- **Outro cliente além do Claude e do Claude Code**: exige revisar as decisões #4 e #24 (callbacks)
  com o usuário e, se ele tiver conexão própria, um valor novo em `TIPOS_CLIENTE` (`config.ts`),
  em `NOME_CONEXAO`/`TIPOS_CONEXAO` (`conexao-modal/utils.ts`) e no `tipoClienteDoRedirect`.
- **Seção nova na consulta**: acrescentar a `SECOES_CONSULTA` e um formatador puro em
  `consulta.ts`; o enum de `secoes` da ferramenta vem da mesma lista.
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
  `xp-planejar` (ver "Brainiac").
- **Contexto do Brainiac** (2026-11-25), conferido na `dev`: lint dos arquivos alterados e
  `npm run build`; instruções novas e as 5 ferramentas pelo cliente MCP do SDK (transporte em
  memória); modal conectado, sem conexão e sem as variáveis do Brainiac (dados trocados só no
  navegador), rótulos dos três botões de copiar, mobile em 390px com rolagem até o rodapé; tela de
  autorização com os logos. **Falta:** pôr `BRAINIAC_MCP_URL` e `BRAINIAC_OAUTH_CLIENT_ID` no
  `.env` da VPS, publicar e conferir no Claude de verdade que ele lê a `xp-planejar` (depende de
  ela estar publicada no catálogo do Brainiac). A linha nova do `softflow_eu` só foi conferida no
  código: a ferramenta precisa de uma conexão real.
- **Consulta completa e Claude Code** (2026-11-25), conferido na `dev` (detalhes no "Andamento"):
  formatação das seções com o JSON real de casos e anexos reais no S3; 22 endereços de retorno;
  DCR loopback; tela "Conectar o Claude Code"; `GET`/`DELETE` por tipo; modal em todos os estados
  e em 390px; desconectar o Claude Code sem derrubar a conexão real do Claude. Migração `0012`
  aplicada no banco do `.env` (2026-11-25). **Falta:** (a) o ponta a ponta no Claude Code
  (`claude mcp add` + `/mcp` → Authenticate → senha → ferramentas), conferindo que a conexão do
  Claude no app continua; (b) `softflow_consultar_caso` com uma conexão real num caso com relação
  (nenhum caso recente tinha; a seção foi conferida com uma relação montada); (c) publicar.
- `npm run lint` não roda no Next 16 (`next lint` foi removido; o script trata `lint` como pasta).
  Por enquanto, rodar `npx eslint <arquivos>`.
- O aviso "Claude desconectado" foi corrigido (`mutateAsync`) depois do teste e não foi reconferido.
- Casos de teste criados na API de dev, para excluir: 104140, 104141, 104143.

## Protótipo

[`prototipo/conector-claude-prototipo.html`](prototipo/conector-claude-prototipo.html) e as capturas
em [`prototipo/capturas/`](prototipo/capturas/) são a referência de estrutura usada. A tela
implementada acrescenta o campo **Senha do Softflow** (decisão #14), que o protótipo não tem. O
modal em duas colunas segue [`prototipo/modal-duas-colunas.html`](prototipo/modal-duas-colunas.html)
(capturas `11` a `13`); as alternativas descartadas estão em
[`prototipo/modal-propostas.html`](prototipo/modal-propostas.html).

## Histórico da implementação

### Especificação da mudança de 2026-11-25: consulta completa do caso e Claude Code

> Especificação do chat de planejamento (2026-11-25), implementada na mesma data. Decisões #22 a #25 em
> [`decisoes.md`](decisoes.md); protótipo em
> [`prototipo/modal-duas-colunas.html`](prototipo/modal-duas-colunas.html)
> (`?c=sem-conexao-code` e `?c=conectado-dois`), capturas `12`, `14` e `15`.

#### Problema

1. **A consulta não traz o que o dev precisa.** `softflow_consultar_caso` (`consultarCaso` em
   `lib/conector-claude/mcp/caso.ts`) devolve só cabeçalho e resumo. Faltam a **descrição completa**
   e os outros textos, as **anotações**, os **clientes** e as **relações** do caso, que a tela de edição
   mostra nas abas. O `GET /projeto-memoria/{id}` que a consulta já chama devolve tudo isso em
   `caso.textos`, `caso.anotacoes`, `caso.clientes` e `caso.relacoes` (`interfaces/projeto-memoria.ts`);
   a consulta só não formata.
2. **O Claude Code não consegue conectar.** A squad passou a usar o conector também com devs no
   Claude Code. Ao entrar, ele responde *"This service doesn't accept sign-ins from Claude Code"*: o
   Claude Code se registra (DCR) com `redirect_uri` `http://localhost:<porta>/callback`, e o
   `register` e a autorização só aceitam os dois endereços do Claude na web (decisão #4,
   `isRedirectUriPermitida` em `lib/conector-claude/config.ts`).
3. **Uma conexão por pessoa derrubaria a outra.** Com a decisão #11, quem conecta o Claude Code
   revoga a conexão do Claude no app (`motivo_revogacao = 'reconectou'`), e vice-versa.

#### O que muda

1. **`softflow_consultar_caso` completo** (decisão #22). Mantém as linhas de hoje e acrescenta
   seções em Markdown, nesta ordem, cada uma só se tiver conteúdo:
   - `## Descrição` (`textos.descricao_completa`), `## Passos para reproduzir`
     (`textos.passos_para_reproduzir`), `## Informações adicionais` (`textos.informacoes_adicionais`),
     `## História` (`textos.historia`). Texto como veio do legado, convertendo `\r\n` em `\n`.
   - `## Anotações (<n>)`: uma por item, da mais recente para a mais antiga,
     `- <dd/MM/yyyy HH:mm> · <usuario>: <anotacoes>`. Acima de 30, mostra as 30 mais recentes e a linha
     "+<n> anotações antigas no Softflow".
   - `## Clientes (<n>)`: `- <cliente_nome ou "Cliente <cliente>"> (código <cliente>) · incidente
     <incidente> · <dd/MM/yyyy>`.
   - `## Relações (<n>)`: `- <tipo_relacao_nome> do caso <caso_relacionado>: <descricao_resumo>`
     e o link do caso relacionado. Se `caso.relacoes` não vier no `projeto-memoria`, buscar em
     `GET /projeto-casos-relacoes?registro=<id>` (a mesma rota da aba Relações).
   - `## Anexos (<n>)`: nome, tamanho e data de cada anexo do caso, a partir de
     `GET /api/db/casos/[registro]/anexos` (reaproveitar a função de `lib/` por trás dessa rota), com o
     link de download assinado que ela já gera. Só com `list-case-attachment`; sem a permissão, a
     seção diz "Seu perfil não permite ver os anexos". O link vence no mesmo prazo da tela; a seção
     avisa isso numa linha.
   - Parâmetro novo opcional `secoes` (lista de `descricao`, `anotacoes`, `clientes`, `relacoes`,
     `anexos`; padrão: todas), para o Claude pedir só parte quando o caso for grande.
   - A descrição da ferramenta passa a dizer que ela traz o caso completo e serve para implementar,
     testar ou revisar.

2. **Claude Code aceito no login** (decisão #24):
   - `isRedirectUriPermitida` aceita, além dos dois endereços do Claude, endereços **loopback**
     (RFC 8252): esquema `http`, host `localhost` ou `127.0.0.1`, **qualquer porta**, caminho exato
     `/callback`, sem query nem fragmento. Comparação exata no resto (`http://localhost:53214/callback`
     sim; `http://localhost.evil.com/callback`, `https://localhost/callback` ou
     `http://localhost:53214/cb` não).
   - No `register` e na autorização a regra é a mesma. PKCE S256 continua obrigatório (é o que
     protege o loopback).
   - A tela `/oauth/autorizar` mostra o nome do cliente: **Conectar o Claude Code ao Softflow**
     quando o `redirect_uri` é loopback, e o título de hoje no resto. O passo de digitar a senha não
     muda.
   - `GET /.well-known/oauth-authorization-server` não muda (já anuncia DCR e PKCE).

3. **Uma conexão ativa por pessoa e por tipo de cliente** (decisão #25), revoga a #11:
   - coluna nova `tipo_cliente` em `claude_conexoes` (`'claude'` | `'claude-code'`), preenchida na
     autorização a partir do `redirect_uri` (loopback = `claude-code`). Migração com default
     `'claude'` para as conexões existentes;
   - conectar de novo revoga só a conexão ativa **do mesmo tipo** (`motivo_revogacao =
     'reconectou'`);
   - `GET /api/db/claude-conexao` passa a devolver `conexoes: [{ tipo, conectadoEm, ultimoUsoEm }]`
     (e o `podeAbrirCaso` geral); `DELETE` ganha `?tipo=` para desconectar uma só (sem `tipo`,
     todas, como hoje).

4. **Modal "Conexão com o Claude"** (decisão #25; capturas `12`, `14` e `15`):
   - **Sem conexão:** acima dos passos do Softflow, um seletor segmentado **Claude (app e web)** |
     **Claude Code** (abre em "Claude (app e web)"; lembra a última escolha em `localStorage`, com
     try/catch). Na aba Claude Code:
     1. "No terminal, rode o comando:" com o campo do comando
        `claude mcp add --transport http softflow <endereço do conector>` (copiar só com ícone)
        **dentro do próprio passo**, logo abaixo do texto, e a nota "Adicione **--scope user** para
        valer em todos os projetos.";
     2. "No Claude Code, digite **/mcp**, escolha **softflow** e **Authenticate**.";
     3. "No Softflow, digite sua senha e clique em **Permitir acesso**."
   - **O que copiar fica dentro do passo que o usa** (decisão #26): na aba Claude (app e web), o campo
     do endereço do conector sai de baixo da lista e vai para dentro do passo 2 ("Cole o endereço e
     clique em **Add**:"). Os passos são uma lista em que o item pode ter um bloco abaixo do texto,
     alinhado com o texto (não com o número).
   - **Conectado:** o quadro de hoje vira uma lista com uma linha por tipo: **Claude (app e web)** e
     **Claude Code**, cada uma com "Desde … · usado há …" (ou "Para implementar casos no terminal"
     quando não conectada), a pílula Conectado/Não conectado e, à direita, o botão **Desconectar** só
     com ícone (`Unplug`, mesmo estilo destrutivo) ou o link **Como conectar** (abre as instruções da
     aba correspondente logo abaixo da linha). A linha "Pode abrir casos: Sim/Não" sai do quadro e
     vira uma nota abaixo dele. O botão "Desconectar o Softflow" do rodapé sai.
   - A pílula do título da seção Softflow fica "Conectado" se houver pelo menos uma conexão.
   - Confirmação de desconectar: a de hoje, com o nome do cliente ("Desconectar o Claude Code?").
   - A seção Brainiac não muda. O Brainiac hoje só aceita o Claude na web (`brainiac-claude-ai`,
     callback do claude.ai); conectar o Brainiac no Claude Code é com a Squad IA, fora daqui.

5. **Instruções do servidor** (`INSTRUCOES`): uma linha nova: "Para implementar, testar ou revisar
   um caso, chame softflow_consultar_caso com o número antes de começar: ela traz descrição,
   anotações, clientes, relações e anexos."

#### Fora do escopo

- Escrever anotações, vincular clientes ou relações e mudar status pelo conector (decisão #2
  continua; avaliar numa próxima, agora que o dev usa o conector).
- Baixar o conteúdo dos anexos pelo MCP: a consulta só lista e dá o link assinado.
- Conectar o Brainiac no Claude Code.

#### Perguntas em aberto

1. ~~**(dev)** O `GET /projeto-memoria/{id}` já traz `caso.relacoes`?~~ Respondida na Fase 0
   (2026-11-25): sim. A resposta traz as chaves `anotacoes`, `relacoes` e `clientes` (conferido no
   caso 104203; é também de onde a aba Relações lê, `caso-edit-form.tsx`). A consulta faz uma
   chamada; `/projeto-casos-relacoes` fica só como reserva se a chave não vier.
2. ~~**(dev)** Validade do link assinado dos anexos~~: respondida na Fase 0 (2026-11-25):
   `SIGNED_DOWNLOAD_TTL_SEC = 300` (`lib/constants/case-attachments.ts`), 5 minutos. A seção avisa
   "Os links vencem em 5 minutos; consulte de novo para gerar outros."

#### Plano de implementação

Um commit por parte, na `dev`, escopo `(conector-claude)`:

1. **Consulta completa:** formatação das seções, `secoes`, anexos com permissão, descrição da
   ferramenta e linha nova nas `INSTRUCOES`. Conferir com o cliente MCP do SDK num caso com
   anotações, clientes, relações e anexos, e num caso vazio.
2. **Loopback e tipo de cliente:** `isRedirectUriPermitida`, coluna `tipo_cliente` e migração,
   revogação por tipo, título da tela de autorização, `GET`/`DELETE` de `claude-conexao`. Conferir os
   casos de `redirect_uri` aceitos e recusados (lista acima) e, de ponta a ponta, `claude mcp add` +
   `/mcp` → Authenticate no Claude Code, sem derrubar a conexão do Claude no app.
3. **Modal:** seletor Claude/Claude Code, lista de conexões, desconectar por tipo. Conferir desktop e
   390px nos estados das capturas.
4. Ao concluir: integrar esta seção ao README no formato padrão e mover o item no status.

### Especificação da mudança de 2026-11-25: contexto do Brainiac

> Especificação do chat de planejamento (2026-11-25), implementada na mesma data. Decisões #16 a #18 em
> [`decisoes.md`](decisoes.md) (e #19 a #21); protótipo em
> [`prototipo/modal-duas-colunas.html`](prototipo/modal-duas-colunas.html) (capturas `11` a `13`).

#### Problema

Quem conecta só o Softflow consegue abrir caso, mas o Claude dela não conhece os produtos, os
padrões da squad nem o jeito de planejar e escrever o caso. Esse contexto está no Brainiac: as notas
dos produtos e, a partir de agora, a skill **`xp-planejar`** no catálogo de skills de Engenharia
(proposta enviada em 2026-11-25, `e95ba449-2946-4520-8fdd-95c977fe2941`, aguardando revisão e
publicação). Cada pessoa usa conta pessoal do Claude (decisão #12), então não existe configuração
central que entregue isso: cada uma precisa conectar o Brainiac, e o Claude precisa saber que deve
ler a skill de lá.

#### O que muda

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
         colaborador Softcom, clique em **Entrar no Brainiac** e depois em **Autorizar acesso**." e a nota "Se você já conectou o Brainiac, não precisa fazer nada.";
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

#### Fora do escopo

- Detectar se a pessoa conectou o Brainiac (o Softflow não tem como saber; decisão #17).
- Instalar a skill na conta da pessoa: ela é lida do catálogo do Brainiac pelo próprio Claude.
- Publicar a `xp-planejar` no Brainiac: é revisão e publicação administrativa do Brainiac, fora deste
  repositório.

#### Perguntas em aberto

1. ~~Endereço do MCP do Brainiac~~: respondida em 2026-11-25 (`https://brainiac.softcomtecnologia.com/mcp`,
   Client ID `brainiac-claude-ai`).
2. ~~Rótulo do login do Brainiac~~: respondida em 2026-11-25 com a tela de login dele (e-mail e senha
   de colaborador Softcom, botão **Entrar no Brainiac**) e a tela seguinte, "Conectar aplicativo", com o
   botão **Autorizar acesso**; os dois entraram no passo 3.

#### Plano de implementação

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
   para quem usa), tirar o aviso de estado planejado e mover o item no status.

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

### Contexto do Brainiac (mudança de 2026-11-25)

Fase 0 (2026-11-25): todos os arquivos citados no plano existem e servem como descrito
(`lib/conector-claude/config.ts`, `lib/conector-claude/mcp/servidor.ts`, `app/api/db/claude-conexao/route.ts`,
`services/conector-claude/conexao.ts`, `components/conector-claude/conexao-modal/index.tsx`,
`components/conector-claude/autorizar/autorizar-cabecalho.tsx`, `public/images/icon.png`); nenhuma
decisão de outra pasta conflita; as duas perguntas em aberto do planejamento já têm resposta.
Decidido pelo Claude Code: as variáveis do Brainiac também entram no `.env.example` (o deploy lê
`.env` por `env_file`, sem mudar o `docker-compose.yml`); o painel do Brainiac na coluna escura
reaproveita as classes do quadro da pessoa em `autorizar/index.tsx`
(`border-primary-foreground/15 bg-primary-foreground/5`). O logo do Claude (item 5) depende de
baixar o arquivo do kit de imprensa da Anthropic, o que pede o ok do usuário; sem ele fica o "C"
(decisão #20). O usuário autorizou o download (2026-11-25).

- [x] Fase 0 (2026-11-25)
- [x] 1: variáveis `BRAINIAC_*`, `getBrainiacConector()` e `brainiac` no `GET /api/db/claude-conexao` (2026-11-25)
- [x] 2: `INSTRUCOES` e a linha do `softflow_eu` (2026-11-25)
- [x] 3: `public/images/claude.svg` e os logos na autorização e no modal (2026-11-25). O press kit é um ZIP com o logo completo, o Spark e o ícone; usado o `ClaudeIcon-Rounded.svg` (spark sobre quadrado arredondado), que ocupa o lugar do quadrado "C" sem redesenhar. O kit não traz diretrizes de uso por escrito
- [x] 4: modal em duas colunas com `EnderecoCopiavel` (dois estados e mobile) (2026-11-25). A tela de confirmação do Desconectar passa a aparecer na coluna direita, com a esquerda fixa
- [x] 5: conferência (2026-11-25); detalhes em "Testes feitos e pendências"
- [x] 6: README no formato padrão e status (2026-11-25)

### Consulta completa e Claude Code (mudança de 2026-11-25)

Fase 0 (2026-11-25): os arquivos citados existem e servem como descrito (`consultarCaso` em
`lib/conector-claude/mcp/caso.ts`, `isRedirectUriPermitida` usada por `app/api/oauth/register` e
`lib/conector-claude/pedido-autorizacao.ts`, `claude_conexoes` em `db/schema.ts`, revogação em
`lib/db/claude-conector.ts`, `listCaseAttachmentsByRegistro` + `createCaseAttachmentSignedDownloadUrl`
por trás de `GET /api/db/casos/[registro]/anexos`). As duas perguntas em aberto foram respondidas pelo
código e pela API (ver acima). Nenhuma decisão de outra pasta conflita; a #24 revoga em parte a #4 e
a #25 revoga a #11, ambas registradas pelo planejamento. Decidido pelo Claude Code: o seletor
Claude/Claude Code usa o `Tabs` de `components/ui/tabs.tsx` (pill discreto, `design-system.md`); a
migração é a `0012`, gerada com `npm run db:migrate`; anexos chamam as funções de `lib/` direto
(sem passar pela rota), com a mesma checagem de `list-case-attachment` pelas permissões da conexão.

- [x] Fase 0 (2026-11-25)
- [x] Parte 1: consulta completa (2026-11-25). `lib/conector-claude/mcp/consulta.ts` (a consulta saiu de `caso.ts`): seções de textos, anotações (30 mais recentes + "+n anotações antigas"), clientes, relações (reserva em `/projeto-casos-relacoes` se a chave não vier) e anexos com link assinado de 5 min (`list-case-attachment`), parâmetro `secoes`, descrição da ferramenta e linha nova nas `INSTRUCOES`. Datas do legado reformatadas sem converter fuso; anexos em `America/Sao_Paulo`. Conferido com o JSON real dos casos 104106 e 95348 (anotações, cliente, descrição com `
`), anexos reais do 95348 no S3, sem a permissão, caso sem anexos, 35 anotações e uma relação montada (nenhum caso recente com relação encontrado), e pelo cliente MCP do SDK (instruções, esquema de `secoes`, seção inválida recusada). A chamada completa com uma conexão real fica para o teste no Claude
- [x] Parte 2: loopback e tipo de cliente (2026-11-25). `isRedirectUriLoopback` (regex no texto cru: `http`, `localhost`/`127.0.0.1`, porta 1 a 65535, `/callback` exato), `tipoClienteDoRedirect` e `NOME_TIPO_CLIENTE` em `config.ts`; coluna `tipo_cliente` (migração `0012_conector_claude_tipo_cliente`, **aplicada no banco do `.env` em 2026-11-25** com o ok do usuário; as 8 conexões existentes ficaram `claude`); revogação só do mesmo tipo; `GET /api/db/claude-conexao` com `conexoes` (mantém `conectado`; `conectadoEm`/`ultimoUsoEm` de topo ficam até a Parte 3); `DELETE ?tipo=` (Zod). Tela de autorização: "Conectar o Claude Code ao Softflow" com retorno loopback. Conferido: 22 endereços aceitos/recusados (inclusive `localhost.evil.com`, `https`, `/cb`, query, fragmento, `..`, maiúsculas, sem porta, porta 0 e 65536, `[::1]`); DCR loopback aceito e os dois inválidos recusados; título da tela; `GET` com a lista; `DELETE ?tipo=xyz` → 400, `?tipo=claude-code` → 0 revogadas. Falta o ponta a ponta no Claude Code (`claude mcp add` + `/mcp` → Authenticate) sem derrubar a conexão do Claude no app, que pede a senha do usuário
- [x] Parte 3: modal (2026-11-25). `conexao-modal/secao-softflow.tsx` (seletor com o `Tabs` do repositório, lembrado em `localStorage` com try/catch; lista por tipo com Desconectar só com ícone ou "Como conectar", que abre as instruções abaixo da linha; nota "Pode abrir casos"), `instrucoes-softflow.tsx` (passos dos dois tipos, o que copiar dentro do passo, decisão #26), `confirmar-desconexao.tsx` ("Desconectar o Claude Code?", `DELETE ?tipo=`), `cabecalho-secao.tsx`, `PassosNumerados` com bloco por passo e `utils.ts` (nomes, comando, "Desde … · usado …"). O rodapé perdeu o "Desconectar o Softflow"; o `GET` perdeu `conectadoEm`/`ultimoUsoEm` de topo. Linha do Claude (app e web) sem conexão diz "Para planejar e abrir casos pelo chat" (o protótipo só tinha o texto do Claude Code). Conferido no navegador: estado real (só Claude), "Como conectar" do Claude Code, sem conexão nas duas abas e a escolha salva, duas conexões, confirmação e desconectar só o Claude Code (a conexão real do Claude continuou), 390px nos dois estados sem rolagem lateral
- [x] Parte 4: README no formato padrão e status (2026-11-25)

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
