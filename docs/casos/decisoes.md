# Casos — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: `CONTEXTO_SOFTFLOW` e `PADRAO_CASOS`,
consolidados em 2026-11-17.

1. **Caso nunca é chamado de "ticket" na UI.** Ticket existe só no contexto de cliente, como aba à
   parte. Report não é "bug". **Por quê:** é o vocabulário do time; misturar confunde com os
   tickets de suporte dos clientes.

2. **Report e caso compartilham o backend `projeto-casos`; a diferença é `tipo_abertura = REPORT`
   e os campos de análise/SLA.** Edição de report reutiliza a tela de caso com layout próprio.

3. **Casos, Reports, Projetos e Liberações não são reimplementados do zero:** proposta nova encaixa
   no que existe.

4. **Quando um arquivo vira pasta, o caminho antigo fica como arquivo ponte (re-export)** para não
   quebrar imports (seção "Caminhos legados" do README).

5. **Número de caso aceita até 6 dígitos nas relações** (commit `46e65cb`).

6. **Flags Liberação, Entregue e Atualização Automática são editadas na edição de caso e salvas
   junto com o "Salvar", não a cada clique; só entram no PATCH quando foram alteradas.**
   Origem: pedido do usuário, 2026-11-17. **Por quê:** seguir o mesmo fluxo dos outros campos do
   formulário (o usuário pode desistir antes de salvar) e não sobrescrever o valor da API com o
   default do formulário quando o campo não foi tocado. Ficam só na edição de caso; na de report,
   a confirmar se devem aparecer.

7. **Edição de um lançamento de produção é feita no modal "Editar produção" (não mais inline), e
   Usuário e Projeto ficam comentados no código até a API aceitar.** Origem: protótipo e pedido
   do usuário, 2026-11-17. **Por quê:** o `PUT /projeto-casos-producao/{sequencia}` do legado só
   recebe `tipo_producao`, `hora_abertura` e `hora_fechamento`; mostrar campos que não salvam
   enganaria quem edita. Para ativar, procurar "Aguardando API" em `producao-editar-modal.tsx`
   (schema, valores iniciais, JSX e payload) e confirmar no legado os nomes dos campos.
   **Revogada em parte pela #8** (Usuário e Projeto agora são editáveis).

8. **O modal "Editar produção" edita também Projeto, Usuário, quem ajudou (valeu) e Anotação.**
   Origem: usuário, 2026-11-17, informando os campos do PUT do legado: `registro` = projeto do
   lançamento (id do projeto), `usuario` = id do usuário, `valeu_usuario_id` = id de quem ajudou,
   `anotacao` = texto livre. Projeto e Usuário são obrigatórios; "quem ajudou" é opcional e vazio
   vai como `0` (convenção do legado para "ninguém"); Anotação é opcional (até 2000 caracteres).
   **Corrigida pela #9** quanto ao campo do projeto.

9. **O projeto do lançamento vai em `cronograma_id`, não em `registro`.** Decisão do usuário,
   2026-11-17, depois de a API mostrar que `registro` é o número do caso (o GET devolve
   `registro: 104020` e o projeto em `projeto_id`; iniciar/parar usam `/{registro}` = caso).
   **Por quê:** mandar o projeto em `registro` arriscaria mover o lançamento para outro caso.
   Testado no caso 104020: trocar o projeto muda `projeto_id` e o lançamento continua no caso.
   **Limitação do legado:** o PUT ignora `anotacao` vazia (`""` e `null`), então não dá para
   apagar uma anotação já salva, só trocar o texto; o modal avisa quando a pessoa apaga tudo.

10. **Caso em produção na listagem: faixa lateral + selo "Em produção" (opções B + C).**
    Escolha do usuário, 2026-11-17, entre ícone ao lado do número, selo no status, faixa lateral
    e filtro. **Por quê:** a faixa destaca na rolagem (mesmo padrão do Kanban do painel) e o selo
    diz o que ela significa, sem depender só da cor. Verde de status, não a cor primária do
    Kanban, para não confundir com linha selecionada. Como a linha é compartilhada, aparece também
    no Escopo de Projetos. Um filtro "Só iniciados" ficou para depois, se fizer falta.
