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
