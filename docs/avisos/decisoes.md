# Avisos — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: chat de planejamento do envio de avisos
(tela "Novo aviso"), 2026-11-18, com protótipo em [`prototipo/`](prototipo/).

1. **Envio de aviso é uma rota própria, `/avisos/novo`, dentro do shell.** Não é modal nem
   sheet. **Por quê:** o usuário testou as duas opções no protótipo. O modal ficava apertado
   para a descrição, e o bottom sheet em tela cheia ficou exagerado. Uma tela própria segue o
   padrão de cadastro e edição do app.

2. **No desktop (≥1024px) a página não rola.** Os dois cards ocupam a altura disponível (mín.
   ~560px), e só rolam o textarea da Descrição e a lista de usuários. Conteúdo e Destinatários
   ficam lado a lado na proporção ~3:2. No mobile, as colunas ficam empilhadas e a página rola.
   **Por quê:** pedido do usuário, para escrever textos longos e ver muitos destinatários sem
   perder as ações e os filtros de vista. Segue a regra de scroll interno nos cards do
   design-system.

3. **Destinatários têm dois modos explícitos: "Todos os usuários" e "Filtrar destinatários".
   O padrão é Filtrar.** No modo Filtrar, sem filtro e sem usuário adicionado, não há
   destinatário. **Por quê:** antes eram 8 cliques ("Selecionar todos" nos 4 filtros) para mandar
   para todos. Por outro lado, um filtro vazio que valesse "todos" sem aviso fazia o envio para
   a empresa inteira acontecer por acidente. Mandar para todos passa a ser 1 clique consciente.

4. **Os filtros funcionam como na API: OR dentro do grupo e AND entre grupos.** No modo Filtrar,
   um grupo sem seleção não restringe nada e vai no payload com todos os valores daquele grupo.
   No modo Todos, os quatro grupos vão com todos os valores. **Por quê:** é o formato do exemplo
   da API (`nivel` com todos os valores). A confirmação de que a API não prefere array vazio
   está em "Perguntas em aberto" do README.

5. **A lista de usuários recarrega sozinha quando os filtros mudam (sem botão "Buscar"), e todo
   usuário encontrado entra marcado.** Desmarcar tira o usuário do `suporte_ids`. O checkbox
   mestre age sobre a lista visível, respeitando a busca local, e tem estado parcial. **Por
   quê:** menos cliques. O usuário vê na hora quem vai receber.

6. **"Adicionar usuário específico" busca por nome ou registro na empresa inteira, sem depender
   dos filtros.** O usuário adicionado entra na lista com o selo "Adicionado" e vai no
   `suporte_ids`. Desmarcar um usuário adicionado o tira da lista. **Por quê:** pedido do
   usuário, para mandar o aviso a poucas pessoas sem montar filtro, ou incluir alguém fora do
   filtro.

7. **As ações ficam no topo da página, à direita do título: Voltar, Salvar rascunho
   (`enviado: false`) e Enviar aviso (`enviado: true`). Não há breadcrumb.** Sair com algo
   preenchido pede a confirmação "Descartar aviso?". **Por quê:** o usuário pediu para remover
   o breadcrumb. Com as ações no topo, não é preciso um rodapé fixo. O significado de `enviado:
   false` ainda depende de confirmação ("Perguntas em aberto" do README).

8. **Permissão nova `create-aviso`, com seed.** Ela protege a rota `/avisos/novo`
   (`RequirePermission`), o botão "Novo aviso" (`hasPermission`, o botão some sem a permissão) e
   o route handler de `POST /comunicados` (`withPermission`). A tela `/avisos` continua sem
   permissão própria. **Por quê:** `/avisos` é a home de quem não tem outra permissão, mas enviar
   avisos para a empresa não pode ser aberto a todos.

9. **Validação:** título e descrição obrigatórios (com `trim`) e pelo menos um destinatário
   selecionado. Os erros aparecem inline, abaixo de cada bloco, depois da primeira tentativa de
   envio. O botão não fica desabilitado antes disso. **Por quê:** o usuário vê o que falta ao
   clicar, em vez de ficar com um botão cinza sem saber o motivo.

10. **O front nunca chama a API Soft Flow direto nem guarda token.** As três chamadas
    (`comunicado-filtros`, `usuarios-comunicado`, `comunicados`) passam por route handlers em
    `app/api/` com `getAuthorizationHeader()`, como `/api/mensagens`. **Por quê:** é o padrão da
    camada de dados ([`camada-de-dados/`](../camada-de-dados/README.md)). Um token pessoal
    apareceu nos exemplos de curl do planejamento e não deve ser usado em lugar nenhum.

11. **O bloco "Payload enviado para a API" do protótipo não vai para o app.** **Por quê:** existe
    só para o dev ver o formato do payload durante o planejamento.

## Respostas da Fase 0 (2026-11-18, Claude Code)

12. **`auto` é "Exibir automaticamente"** (o aviso abre sozinho quando o destinatário entra no
    Softflow), switch ligado por padrão. Resposta da P1. **Por quê:** é o significado no legado.

13. **Sem botão "Salvar rascunho" nesta entrega; o envio vai sempre com `enviado: true`.**
    Revoga a parte "Salvar rascunho (`enviado: false`)" da decisão #7 (o resto da #7 vale). O
    botão volta junto com a tela de enviados/rascunhos, que fica no backlog. Resposta da P2.
    **Por quê:** salvar um rascunho que o usuário não consegue reabrir no Softflow é perda de
    texto disfarçada.

14. **`suporte_ids` é a lista final de destinatários; os arrays de filtro são registro, e grupo
    sem seleção vai com todos os valores.** Confirmar na Parte 1 contra a API de teste (a `.env`
    local aponta para ela). Resposta da P3.

15. **Função tem nome: a API passou a devolver `funcao: ["LIDER", "OPERACIONAL"]`.** O filtro
    Função aparece como os outros três e a linha do usuário mostra a função. Resposta da P4
    (a API foi alterada em 2026-11-18).

16. **Título com no máximo 120 caracteres; descrição sem limite no front.** Erro de validação da
    API vira toast. Resposta da P5.

17. **Cartão de rádio selecionado usa `border-primary` + `bg-primary/5`, sem token novo.**
    Resposta da P6. **Por quê:** não cria cor nova e funciona nos dois temas.

Nota (2026-11-18, implementação): a decisão #14 foi confirmada na API de teste (comunicado com
filtros que batiam em 5 usuários e `suporte_ids: [2384]` gerou `total_destinatarios: 1`), e a
#4 também (grupo com array vazio dá 422).

## Aviso automático (planejamento, 2026-11-18)

Origem: chat de planejamento do comportamento do `auto`, com protótipo em
[`prototipo/`](prototipo/) (capturas 09 a 11).

18. **`auto: true` faz o aviso abrir sozinho para o destinatário até ele marcar como lido.**
    Complementa a decisão #12 (o switch "Exibir automaticamente" do envio): o aviso não aparece
    só uma vez no login, ele continua aparecendo enquanto `status_leitura.lido` for `false`.
    **Por quê:** é o significado do campo no legado, explicado pelo usuário.

19. **A janela é bloqueante: só fecha com "Marcar como lido".** Sem X, sem "Ver depois", e Esc
    ou clique fora não fecham. **Por quê:** escolha do usuário entre três opções (adiar até
    reabrir o Softflow, adiar 30 minutos ou bloquear). Avisos automáticos são os que a empresa
    precisa garantir que foram lidos.

20. **Com mais de um aviso automático não lido, aparece um por vez, do mais antigo para o mais
    novo.** O header diz quantos faltam ("Mais N aviso(s) depois deste") e o botão vira "Marcar
    como lido e ver o próximo". **Por quê:** a leitura segue a ordem em que os avisos foram
    enviados, e o usuário sabe quanto falta antes de voltar ao trabalho.

21. **A consulta dos automáticos não tem período: todo aviso automático não lido aparece,
    mesmo de meses anteriores.** O sino e a tela `/avisos` continuam com "Este mês" por padrão.
    **Por quê:** um aviso que precisa ser lido não pode sumir na virada do mês. Depende da
    pergunta 1 da seção "Próxima mudança planejada" do README (a API aceitar a consulta sem
    datas).

22. **A consulta segue a regra do sino: ao abrir o Softflow e a cada 5 minutos, das 6h às
    23h.** A regra é extraída para um hook compartilhado. **Por quê:** não cria uma segunda
    política de polling contra a API, e um aviso enviado durante o expediente chega em até 5
    minutos.

23. **Falha não pode prender nem sumir com o aviso.** Erro ao marcar como lido: a janela
    continua aberta, com toast e mensagem inline, e o botão volta a funcionar. Erro ao consultar
    `GET /mensagens`: a janela não abre e o Softflow segue usável até o próximo ciclo. **Por
    quê:** a janela é bloqueante (decisão #19). Uma falha de rede não pode travar o usuário fora
    do sistema, e também não pode dar o aviso por lido sem o `PUT`.

24. **A janela aparece em qualquer rota do dashboard, inclusive `/avisos` e `/avisos/novo`, e
    fica por cima de qualquer outro modal aberto, sem desmontar a tela de baixo.** **Por quê:**
    o aviso é prioritário, e nada que o usuário estava digitando se perde, porque a tela de
    baixo continua montada.
