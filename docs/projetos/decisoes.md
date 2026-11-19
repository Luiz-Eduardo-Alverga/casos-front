# Projetos — decisões travadas

Não reabrir sem o usuário decidir de novo. Cada decisão traz o porquê.

## Clonar projeto (planejamento, 2026-11-19)

Origem: chat de planejamento do "Clonar projeto", com protótipo em [`prototipo/`](prototipo/)
(capturas 01 a 06) e a requisição `POST /sgp-cadastros/{registro}/clonar` testada pelo usuário.

1. **A ação Clonar fica na coluna Ações da listagem `/projetos`, como botão de ícone (`Copy`)
   antes do Editar.** A listagem não muda: mesmas colunas, filtros e paginação. **Por quê:** o
   usuário escolhe o projeto de origem onde já procura projetos. Abrir a próxima sprint a partir
   da atual é o uso principal.

2. **O clone pede só três campos, todos obrigatórios: nome, data de início e data de fim.** Os
   outros campos (setor, PDV, classe, tipo, cliente) vêm do projeto de origem e não são editáveis
   no modal. **Por quê:** é o que a API recebe. Qualquer ajuste depois do clone é feito na aba
   Abertura do projeto novo.

3. **Valores padrão:** nome `"{nome da origem} - Clone"`; início no dia seguinte ao `data_fim` da
   origem; fim mantendo a mesma duração em dias (contagem inclusiva). O modal mostra a duração
   calculada ("N dias"). **Por quê:** quem clona quer o ciclo seguinte. O sufixo " - Clone" é o
   do exemplo de uso da API.

4. **Datas vão para a API como `YYYY-MM-DD 00:00:00`, inclusive `data_fim`**, com o mesmo
   `formatDateTimeSgp` do cadastro (`components/projetos/cadastro/utils.ts`). O front valida que a
   data de fim é igual ou posterior à de início, e o erro aparece assim que as duas estão
   preenchidas. **Por quê:** mantém o formato que o cadastro e a edição já usam.

5. **O front não valida nome duplicado.** Se o backend recusar, a mensagem dele aparece no modal.
   **Por quê:** a listagem é paginada e filtrada por setor, então o front não enxerga todos os
   projetos e uma checagem local daria falsa segurança.

6. **Projetos Abertos e Fechados podem ser clonados.** **Por quê:** o fluxo comum é fechar a
   sprint e abrir a próxima a partir dela.

7. **Depois do sucesso, o usuário continua na listagem.** O modal fecha, aparece o toast com o
   `message` da API e o `#registro` e nome do projeto novo, e a listagem é recarregada
   (invalidando `["sgp-cadastros"]`). A linha nova, se estiver nas páginas carregadas, ganha fundo
   de destaque e o selo "Novo" até o usuário sair da tela. **Por quê:** comportamento aprovado no
   protótipo. O usuário pode clonar outro projeto em seguida ou abrir o novo pelo Editar.

8. **Erro na chamada não perde o que foi digitado.** O modal continua aberto com os dados, mostra
   a mensagem da API acima do rodapé e um toast de erro. Durante a chamada, os dois botões ficam
   desabilitados ("Clonando...") e Esc, X e clique fora não fecham o modal. **Por quê:** o
   usuário corrige e tenta de novo sem redigitar, e não fecha o modal no meio de uma criação.

9. **O clone não leva casos.** O texto do modal orienta usar "Duplicar casos" na aba Escopo do
   projeto de origem, que já existe. **Por quê:** a duplicação de casos tem regras próprias
   (elegíveis, bloqueados, "Não planejado") e já está implementada. Depende da pergunta 4 do
   README: se a API de clone copiar casos, o texto muda e esta decisão é revista com o usuário.

## Clonar projeto (Fase 0, 2026-11-19)

Respostas do usuário às perguntas P1 a P3 do Claude Code (README, "Perguntas do Claude Code").

10. **Clonar usa a permissão `create-project`**, no botão da listagem (`hasPermission` no
    entrypoint `components/projetos/index.tsx`) e no `withPermission` da rota
    `app/api/sgp-cadastros/[id]/clonar/route.ts`. Sem permissão nova nem seed. **Por quê:**
    clonar cria um projeto, e quem pode cadastrar já poderia fazer o mesmo à mão.

11. **O destaque da linha clonada e o selo "Novo" reaproveitam os amarelos do painel:** fundo da
    linha `bg-panel-badge-importance-yellow-bg` e selo com `bg-panel-badge-importance-yellow` (texto
    em contraste com o token correspondente). Nenhum token novo. **Por quê:** mantém o amarelo
    suave aprovado no protótipo sem criar token para um uso pontual.

12. **As perguntas 2 a 5 do planejamento são conferidas na Parte 1 pelo Claude Code, clonando
    projetos na API Soft Flow de desenvolvimento** (a apontada pelo `.env`) pela rota nova, logado
    no app local. **Por quê:** o usuário confirmou que é a API de dev, então os projetos criados no
    teste não afetam produção.

## Clonar projeto (Parte 1, 2026-11-19)

Respostas do usuário às perguntas P4 e P5, depois dos testes na API de dev.

13. **Nome repetido passa no clone.** Nem o front nem a rota checam nome; vale o que a API decide,
    e hoje ela aceita nome repetido e recusa período sobreposto a outro projeto aberto (422 "Já
    existe projeto aberto nesse período!!!", mostrado no modal como qualquer erro, decisão #8).
    Complementa a decisão #5. **Por quê:** clonar a mesma sprint duas vezes já é barrado pela regra
    de período, e a listagem da API não filtra por nome para uma checagem confiável.

14. **O clone não copia o objetivo, e o modal avisa.** O texto informativo diz que o objetivo não é
    copiado e deve ser preenchido na aba Abertura do projeto novo. A rota não faz PUT de correção. O
    comportamento da API (`objetivo_id` volta 0) fica registrado como pendência para o backend.
    **Por quê:** um PUT completo logo depois do clone duplicaria a montagem do payload da Abertura
    na rota e poderia sobrescrever campos se a API mudar.

## Clonar projeto na edição (2026-11-19)

15. **O item "Clonar" do menu "Mais ações" da edição `/projetos/[id]` abre o mesmo modal da
    listagem, com o projeto aberto como origem.** Mesma permissão (`create-project`, decisão #10);
    sem ela o item some. Depois do sucesso, a tela abre o projeto novo (`/projetos/{registro}`),
    com o toast do clone. Revoga, só nesse ponto, o "clonar a partir da tela de edição" que estava
    fora do escopo do planejamento. **Por quê:** pedido do usuário; o item já existia como "Em
    breve". Abrir o projeto novo foi escolha do Claude Code: na edição não há lista para destacar
    a linha, e o próximo passo natural é ajustar o projeto novo (o objetivo, por exemplo, decisão
    #14).

## Aba Stakes em lista (planejamento, 2026-11-19)

Origem: chat de planejamento a partir de um esboço do usuário (lista no estilo de planilha), com
protótipo em [`prototipo/`](prototipo/) (capturas 07 a 14).

16. **A aba Stakes vira uma lista editável em linha e deixa de ter cards e modal de stakeholder.**
    O card Usuários autorizados não muda. **Por quê:** lançar a equipe de uma sprint pelo modal,
    uma pessoa por vez, é lento. A lista permite lançar tudo pelo teclado.

17. **Colunas: Função, Colaborador, Planejada, Não planejada, Dias, Total, Observação e Excluir.**
    As horas são **por dia**, e o Total = (planejada + não planejada) × dias. **"Aprovou" não
    aparece na lista:** o `projeto_aprovado` gravado é preservado no PUT e vai 0 no POST. A
    Observação passa a ser editável. **Por quê:** o usuário pediu para tirar o Aprovou. Observação
    estava no esboço e hoje só era preservada.

18. **Salvar é em lote:** as mudanças ficam na tela, marcadas por uma faixa (azul para nova,
    amarela para alterada), até clicar em **Salvar** ou apertar Ctrl+S. Como a API não tem
    endpoint em lote, o front faz um `POST`/`PUT` por linha e invalida as listagens uma vez no fim.
    **Por quê:** é o modelo do esboço, e o usuário confirmou.

19. **A validação acontece no Salvar e é tudo ou nada antes de enviar.** Se uma linha tiver erro,
    nada é enviado, e cada linha mostra o problema embaixo dela. Se a API falhar em parte, as
    linhas que deram certo ficam salvas, e as que falharam continuam marcadas com a mensagem da
    API. **Por quê:** o usuário corrige tudo de uma vez antes de gravar. Uma falha de rede no meio
    do lote não pode descartar o que já foi gravado nem o que falta gravar.

20. **Colaborador repetido no mesmo projeto é bloqueado.** No Salvar, o erro é "Colaborador já
    está em outra linha". No Importar, a linha repetida fica sem checkbox ativo, com "Já está no
    projeto" ou "Repetido nesta lista". **Por quê:** resposta do usuário.

21. **Excluir não entra no lote.** Linha nova sai na hora. Linha salva pede a confirmação atual e
    chama o `DELETE` na hora. **Por quê:** mantém o comportamento de hoje e evita uma exclusão
    "pendente" que o usuário não vê.

22. **Sair com linhas não salvas pede "Descartar alterações?".** Vale para Voltar, trocar de aba
    ou sair da tela. Confirmar volta as linhas ao que está gravado. **Por quê:** com salvar em
    lote, sair sem aviso perderia o lançamento inteiro.

23. **Atalhos de lançamento:** Adicionar linha copia os dias da linha anterior e põe o foco na
    Função; Tab percorre os campos; Enter na última linha cria outra; Ctrl+S salva; as horas têm
    máscara (`0600` vira `06:00`). **Por quê:** o objetivo da mudança é lançar rápido, sem mouse.

24. **Copiar linhas gera texto separado por tabulação (TSV), com cabeçalho**, nas colunas Função,
    Colaborador, Planejada, Não planejada, Dias e Observação. Usa a Clipboard API em contexto
    seguro e `execCommand("copy")` como reserva. **Por quê:** é o formato que Excel e Access
    colam. O usuário copiava e colava as linhas no Access, e a reserva cobre o Softflow servido
    sem HTTPS.

25. **Colar é pelo Ctrl+V na aba Stakes, sem botão "Colar".** Texto com tabulação abre o modal
    Importar em "Colar linhas", com prévia antes de incluir. A leitura é tolerante: cabeçalho
    opcional, sem diferenciar maiúsculas, horas como `6`, `6h30` etc. **Por quê:** ler a área de
    transferência por um botão exige permissão do navegador e não funciona sem HTTPS. O Ctrl+V
    funciona sempre, e a prévia evita colar lixo.

26. **Importar de outro projeto mostra só projetos do mesmo setor** do projeto aberto. As linhas
    escolhidas entram como novas e só são gravadas no Salvar. **Por quê:** resposta do usuário. É
    o caminho mais curto para repetir a equipe da sprint anterior, sem passar pela área de
    transferência.

27. **No celular, a tabela rola na horizontal dentro do card.** Não vira cards empilhados.
    **Por quê:** resposta do usuário. O lançamento é feito no computador.

28. **O header do card mantém os quatro botões visíveis:** Importar, Copiar linhas, Adicionar
    linha e Salvar. **Por quê:** resposta do usuário, que preferiu os botões à vista a juntá-los
    num menu.
