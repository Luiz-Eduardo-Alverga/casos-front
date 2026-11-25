# Conector do Claude — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: chat de planejamento da abertura de casos pelo
Claude, 2026-11-19, com protótipo em [`prototipo/`](prototipo/).

1. **A abertura pelo Claude é um conector MCP do próprio Softflow (`/api/mcp`), não um link
   pré-preenchido para `/casos/novo`.** **Por quê:** o usuário quer abrir o caso sem sair do chat.
   O link ainda obrigaria a abrir a plataforma, e o Claude na nuvem não alcança a API do Softflow
   por outro caminho que não seja um conector. É também a "integração por API" que a skill
   `planejar-softcom` já prevê no passo 7.

2. **Escopo da primeira entrega: abrir e consultar caso.** Reports, edição, status, anexos e
   produção ficam de fora. **Por quê:** escolha do usuário. O fluxo que dói é o do PO no fim do
   planejamento, que abre caso. Report tem SLA, cliente e responsável de suporte, e merece
   planejamento próprio.

3. **O Softflow é o servidor de autorização (OAuth 2.1 com DCR e PKCE) e o servidor MCP.** A API
   Soft Flow não muda. **Por quê:** é o que o Claude exige de um conector remoto com login por
   pessoa, e o Softflow já é o BFF que conhece o login e as permissões. Pedir mudança no legado
   atrasaria a entrega.

4. **Só os endereços de retorno do Claude são aceitos** (`https://claude.ai/api/mcp/auth_callback`
   e `https://claude.com/api/mcp/auth_callback`), por igualdade exata, no registro e na
   autorização. **Por quê:** o conector é só para o Claude. Aceitar qualquer endereço
   abriria espaço para um site de terceiros pedir acesso em nome de alguém da squad.

5. **Não há permissão nova para conectar.** Qualquer pessoa logada conecta; cada ferramenta usa
   as permissões que a pessoa já tem (`create-case` para preparar e abrir, `list-case` para
   consultar), recalculadas no servidor a cada chamada. Sem `create-case`, a tela de autorização
   avisa que o Claude só vai consultar. **Por quê:** o usuário quer o conector para toda a squad.
   Repetir no conector o RBAC que já existe evita duas regras para a mesma ação.

6. **Abrir caso é sempre em dois passos: prévia, depois abertura pelo código da prévia.** O caso
   é criado exatamente com o payload da prévia; o código vale 15 minutos e é de uso único (usar
   de novo devolve o mesmo caso, sem criar outro). **Por quê:** garante que a pessoa viu e
   confirmou no chat o que vai ser criado, e evita caso duplicado se o Claude repetir a chamada.

7. **O conector usa um token Soft Flow próprio, obtido no "Permitir acesso" a partir da sessão do
   navegador, guardado cifrado e renovado pelo servidor.** O Softflow nunca recebe nem guarda a
   senha. **Por quê:** é o único jeito de agir em nome da pessoa sem mudar o legado. Separar do
   cookie evita que o conector dependa da sessão do navegador. Sujeito às perguntas 1 a 3 do
   README sobre o comportamento do `POST /auth/refresh`. (A forma de obter o token foi revogada
   pela decisão #14.)

8. **Caso aberto pelo conector leva em Informações adicionais a linha "Aberto pelo Claude
   (conector Softflow) por <nome>."** **Por quê:** o legado não tem campo de origem do canal, e
   quem atende o caso precisa saber que ele veio do chat (e de quem), sem depender de log do
   servidor.

9. **A tela de autorização usa o layout do login (fora do shell) e o CTA amarelo "Permitir
   acesso".** **Por quê:** a pessoa chega ali vinda do Claude, muitas vezes logo depois do login.
   O amarelo de marca é permitido nas superfícies de login, e o shell do dashboard nessa tela
   confundiria (menu clicável no meio de um fluxo de autorização).

10. **A conexão aparece e é desfeita no menu do usuário (item "Claude" → modal "Conexão com o
    Claude"), não numa página de Configurações.** **Por quê:** Configurações hoje é de admin
    (usuários, perfis, prompts). A conexão é pessoal, como "Notificações no Discord", que já mora
    nesse menu.

11. **Uma conexão ativa por pessoa.** Conectar de novo revoga a anterior. **Por quê:** a pessoa
    usa uma conta do Claude, e uma conexão só deixa o modal e a revogação
    simples.

12. **Cada pessoa adiciona o conector na própria conta do Claude (Pro ou Max), como conector
    personalizado pelo endereço `https://softflow.softcom.services/api/mcp`.** (Domínio revogado pela decisão #13.) Não há Owner nem
    configuração central. **Por quê:** a squad usa contas pessoais do Claude, não um plano
    Team/Enterprise (informado pelo usuário em 2026-11-19). O servidor e o login são os mesmos
    nos dois cenários; só muda quem cadastra o endereço. Por isso o modal "sem conexão" mostra o
    endereço com botão de copiar como passo principal. No plano Free cabe um só conector
    personalizado.

13. **O endereço canônico do conector é `https://softflow.hostsoftcom.cloud/api/mcp`.** O domínio
    vem da variável `SOFTFLOW_PUBLIC_URL`, não fica fixo no código. Atualiza o domínio citado na
    decisão #12, que continua valendo no resto. **Por quê:** o usuário informou em 2026-11-19 que
    `softflow.hostsoftcom.cloud` é o endereço atual e `softflow.softcom.services` é o antigo. O
    Claude exige que o `resource` dos metadados seja exatamente o endereço cadastrado, então só um
    domínio vale. Resposta da P3.

14. **O token Soft Flow da conexão é emitido por `POST /auth/login` com a senha que a pessoa digita
    de novo na tela de autorização, não por refresh da sessão do navegador.** A senha só passa pela
    rota `POST /api/oauth/autorizar` até o legado; nunca é gravada nem registrada em log. Depois de
    emitido, o token da conexão é guardado cifrado e renovado por `POST /auth/refresh` com ele
    mesmo (o que só troca o token da conexão). A tela de autorização ganha o campo **Senha** acima
    de **Permitir acesso**. Revoga a forma de obter o token da decisão #7; o resto da #7 (token
    próprio, cifrado, renovado pelo servidor) continua. **Por quê:** o teste da P1 mostrou que o
    refresh invalida o token anterior na hora, então pegar o token da conexão por refresh derrubaria
    a sessão do navegador. O login emite um segundo token sem depender de mudança no legado
    (escolha do usuário em 2026-11-19, opção C da P1). Conferido em 2026-11-19: o login do
    conector não derruba as outras sessões da pessoa.

15. **A prévia não valida o tamanho do resumo nem da descrição.** Se o legado recusar o texto ao
    criar o caso, `softflow_abrir_caso` devolve a mensagem do legado, a prévia continua sem caso
    criado e o Claude ajusta o texto e gera uma prévia nova. **Por quê:** o limite do legado não é
    conhecido e o formulário da tela também não valida tamanho (`casoCreateFormSchema` só exige
    `min(1)`); escolha do usuário em 2026-11-19 (opção B da P2). Ajusta a promessa da decisão #6:
    o caso, se criado, é exatamente o da prévia; a recusa por tamanho só aparece na abertura.

16. **O próprio conector aponta para o contexto do Brainiac.** As instruções do servidor MCP mandam
    o Claude ler a skill `xp-planejar` do catálogo do Brainiac antes de planejar ou escrever um caso,
    e avisar uma vez quando o Brainiac não estiver conectado; o `softflow_eu` repete o lembrete numa
    linha fixa. Abrir um caso já planejado continua não dependendo do Brainiac. **Por quê:** cada
    pessoa usa conta pessoal do Claude (decisão #12), sem configuração central. O conector é a única
    coisa que toda pessoa que abre caso pelo Claude tem, então é por ele que o caminho chega a quem
    é novo, sem instalar skill (planejamento de 2026-11-25).

17. **O modal "Conexão com o Claude" recomenda conectar o Brainiac, nos dois estados, sempre com o
    mesmo bloco.** **Por quê:** o usuário quer deixar explícito para quem conecta que o Brainiac
    faz falta para planejar. O Softflow não tem como saber se a pessoa conectou o Brainiac no Claude
    dela, então o bloco não mostra status nem some; o texto diz que, se já conectou, não precisa
    fazer nada.

18. **O endereço do Brainiac no modal vem da variável `BRAINIAC_MCP_URL`**, como o endereço do
    conector vem de `SOFTFLOW_PUBLIC_URL` (decisão #13). Sem a variável, o bloco aparece sem
    endereço. **Por quê:** o endereço é de outro sistema (Squad IA) e pode mudar sem deploy de código
    no Softflow; o bloco continua útil mesmo sem ele.

19. **O modal "Conexão com o Claude" passa a ter duas colunas, no padrão da tela de autorização:
    coluna escura à esquerda explicando o que a conexão faz e por que o Brainiac ajuda, coluna clara
    à direita com as seções Softflow e Brainiac.** Revoga a forma do bloco da decisão #17 (quadro
    abaixo das informações do Softflow); o resto da #17 continua (recomendação nos dois estados, sem
    status do Brainiac). Com o Softflow conectado, a seção do Brainiac mostra o próprio passo a passo;
    sem conexão, só "Adicione do mesmo jeito". Botões de copiar só com ícone. **Por quê:** o usuário
    achou o modal com o bloco empilhado comprido demais e escolheu, entre as propostas de 2026-11-25
    (abas, lista recolhida, faixa e duas colunas), o modal largo em duas colunas. Os passos próprios
    do Brainiac existem porque, conectado, os do Softflow não aparecem e "do mesmo jeito" ficaria sem
    referência.

20. **As telas do conector usam o logo oficial do Claude e o ícone do Softflow (`icon.png`) no lugar
    das letras "C" e "S".** O logo do Claude vem do kit de imprensa oficial da Anthropic, sem
    alteração, seguindo as diretrizes de marca dela; sem o arquivo oficial, fica o "C". **Por quê:**
    pedido do usuário (2026-11-25) para a pessoa reconhecer de cara os dois sistemas. O logo é marca
    da Anthropic: usar o arquivo oficial evita uma versão redesenhada ou fora das regras de uso.

21. **O Client ID do Brainiac também vem de variável (`BRAINIAC_OAUTH_CLIENT_ID`) e aparece no
    modal com botão de copiar.** Complementa a decisão #18. **Por quê:** o Brainiac não usa o
    registro automático de clientes; quem adiciona o conector precisa informar `brainiac-claude-ai`
    em Advanced settings (informado pelo usuário em 2026-11-25), e o valor é de outro sistema.

22. **`softflow_consultar_caso` devolve o caso completo: textos (descrição, passos, informações
    adicionais, história), anotações, clientes, relações e anexos**, em seções Markdown, com o
    parâmetro opcional `secoes` para pedir só parte. Anotações limitadas às 30 mais recentes.
    **Por quê:** o conector passou a ser usado por devs no Claude Code para implementar o caso, e a
    consulta só trazia o cabeçalho; o usuário notou que faltavam anotações, clientes e relações
    (2026-11-25). Os dados já vêm no `GET /projeto-memoria/{id}`, então não há chamada nova ao legado
    além de relações (se não vierem ali) e anexos.

23. **Anexos aparecem na consulta como lista com link de download assinado, só para quem tem
    `list-case-attachment`.** **Por quê:** o dev precisa ver prints e arquivos do caso para
    implementar; a lista com link é o que a aba Anexos já faz, com a mesma permissão. Baixar o
    conteúdo pelo MCP ficou de fora: o link basta e evita trafegar arquivos grandes pelo conector.
    Decisão tomada no planejamento; o usuário pode tirar a seção sem afetar o resto.

24. **O login aceita o Claude Code: além dos dois endereços do Claude na web, endereços loopback
    `http://localhost:<porta>/callback` e `http://127.0.0.1:<porta>/callback`, qualquer porta.**
    Revoga em parte a decisão #4 (só os endereços do Claude); o resto da #4 (comparação exata, nada
    fora da lista) continua. **Por quê:** a squad está levando o conector para os devs, que usam o
    Claude Code, e ele só faz login com retorno para a máquina local (2026-11-25). Loopback com PKCE
    S256 é o padrão para aplicativos nativos (RFC 8252): o código só chega a quem está na máquina da
    pessoa e só vale com o verificador do PKCE. A pessoa continua digitando a senha e confirmando na
    tela de autorização, que passa a dizer "Claude Code".

25. **Uma conexão ativa por pessoa e por tipo de cliente (Claude no app e na web, Claude Code), e o
    modal lista as duas, cada uma com o próprio Desconectar.** Revoga a decisão #11. **Por quê:** o
    mesmo dev usa o Claude no app para planejar e o Claude Code para implementar; com uma conexão
    por pessoa, conectar um derrubaria o outro. O tipo sai do `redirect_uri` (loopback = Claude
    Code), que é o que de fato diferencia os dois clientes.

26. **No passo a passo do modal, o campo de copiar (endereço ou comando) fica dentro do passo que o
    usa, logo abaixo do texto, e não depois da lista.** Vale para as abas Claude (app e web) e Claude
    Code da seção Softflow. **Por quê:** com o comando do Claude Code abaixo do passo 3, o usuário
    leu o passo 2 ("digite /mcp e escolha softflow") sem ter visto o comando que faz o softflow
    aparecer, e o fluxo ficou confuso (2026-11-25).

27. **Vários casos de uma vez são um lote com um caso pai: cada parte é aberta como filha ("É FILHO
    DE") de um pai novo ou já existente, numa prévia única.** **Por quê:** no planejamento, uma
    funcionalidade maior é dividida em casos menores, e o usuário escolheu ligá-los como filhos de um
    caso pai (2026-11-25). Uma prévia só mantém a regra da decisão #6 (nada abre sem o ok) sem pedir
    uma confirmação por caso.

28. **O título de cada parte é `<titulo_base> — PARTE <n>/<N> — <titulo>`, com zero à esquerda quando
    o lote tem 10 ou mais casos.** **Por quê:** pedido do usuário (2026-11-25): com a parte no título, a
    listagem ordenada por título mostra os casos na ordem de execução. O zero à esquerda evita que
    "PARTE 10" fique antes de "PARTE 2".

29. **`softflow_abrir_casos` abre na ordem, grava cada número na prévia e, se falhar no meio, continua
    de onde parou quando chamado de novo com o mesmo código.** Uma pendência em qualquer parte bloqueia
    o lote inteiro na prévia. **Por quê:** o legado não tem transação entre casos; sem retomada, um erro
    na parte 3 de 5 levaria a abrir de novo as duas primeiras (casos duplicados) ou a terminar o lote à
    mão. A idempotência da decisão #6 vale para o lote inteiro.

30. **`softflow_buscar_casos` usa os mesmos filtros da tela de Casos, exige pelo menos um filtro e
    devolve 20 por página.** **Por quê:** é o que a API Soft Flow oferece (`GET /projeto-memoria`), já
    mapeado na tela; exigir filtro evita listar a base inteira no chat.

31. **A busca pelo conteúdo do caso é feita pelo Claude combinando o Brainiac (notas de caso e
    especificações) com `softflow_buscar_casos` e confirmando com `softflow_consultar_caso`; o
    Softflow não cria índice de texto agora.** **Por quê:** escolha do usuário (2026-11-25). O legado só
    filtra pelo resumo, e o detalhe do que foi implementado está nas notas de caso do Brainiac e na
    descrição do caso; combinar as fontes resolve sem infraestrutura nova. Um índice próprio no Postgres
    fica para depois, se não bastar.

32. **`softflow_agenda` mostra "o que fazer agora" da sprint atual: em andamento, retornos e abertos por
    produto na ordem da agenda, com as contagens; a agenda de outra pessoa exige `list-painel-dev`.**
    **Por quê:** escolha do usuário (2026-11-25) para o dev, no Claude Code, saber por onde começar
    sem abrir o Painel. Retornos vêm antes dos abertos porque foram devolvidos pelo QA. A permissão é a
    mesma da tela do Painel.

33. **A própria agenda no `softflow_agenda` exige só a conexão; a agenda de outra pessoa exige
    `audit-all-users`.** Revoga a permissão da decisão #32 (`list-painel-dev` para outra pessoa); o
    resto da #32 continua. **Por quê:** no Painel, `list-painel-dev` só abre a tela e todo dev a tem;
    ver o Painel de outra pessoa ("Ver como") exige `audit-all-users`. Repetir essa regra evita que
    qualquer dev veja pelo Claude a agenda de um colega, o que a tela não deixa (decisão #5: o conector
    não cria regra nova). Resposta da P4 (2026-11-25).
