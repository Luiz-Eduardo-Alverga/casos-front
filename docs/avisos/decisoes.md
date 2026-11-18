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
