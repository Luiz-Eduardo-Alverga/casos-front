# Produtos — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: regras do módulo em
`.cursor/rules/produtos.mdc` e `PADRAO_PRODUTOS`, consolidadas em 2026-11-17. Onde o porquê não
estava registrado, está marcado "a confirmar".

1. **Vocabulário: Produto, Versão, Módulo, Checklist, Script. Produto nunca é "projeto".**
   **Por quê:** no legado o recurso se chama `projeto-versoes`, e o nome vazava para a UI.

2. **Produtos é item de primeiro nível na sidebar (ícone Package, `list-product`), perto de
   Clientes/Projetos, e não entra em "Cadastros Smart".** Foi a única mudança permitida no shell.
   Porquê: a confirmar.

3. **Não há reordenação persistente do checklist (sem `PUT /api/produtos/[id]/checklist/ordem`,
   sem DnD).** **Por quê:** o legado não tem endpoint de atualização em lote.

4. **PUT sempre envia o objeto completo: mescla o registro atual da API com os campos editados.**
   **Por quê:** o legado sobrescreve o registro inteiro; mandar só o que a tela edita apaga o resto.
   Versão: fachada PUT → `PATCH /projeto-versoes-sub/{seq}`.

5. **Scripts são texto puro (`whitespace-pre-wrap`, fonte mono), sem `MarkdownView`.**
   Porquê: a confirmar (scripts não são Markdown e a renderização quebraria o conteúdo).

6. **Listagens sem contador de total.** **Por quê:** a paginação do legado é por cursor e não
   devolve total.

7. **Colaborador nunca aparece como número cru:** chip com avatar de iniciais + nome; sem nome,
   chip neutro `"#<id>"`.

8. **Ações sem permissão somem da UI** (sem botão desabilitado, sem coluna ou menu de ações
   vazio). Permissões: `list-product`, `create-product`, `edit-product`, `delete-product`.

9. **O protótipo HTML (`Softflow - Produtos.dc.html`) não é convertido:** a implementação parte da
   especificação textual + tokens Softflow. **Por quê:** o HTML usa estilos inline e hex soltos.

10. **Labels da UI centralizados em `components/produtos/constants.ts`.**

11. **Versão de produto aceita número com pontos (ex.: 8.1.1.0) ou uma das versões especiais
    MELHORIA, BUG e BACKLOG.** As especiais podem ser digitadas em qualquer caixa e são gravadas
    em maiúsculas (`normalizeVersaoInput` em `edicao/versoes/versao-form-schema.ts`). Qualquer
    outro texto continua bloqueado. Origem: pedido do usuário, 2026-11-17. **Por quê:** o legado
    já usa essas versões para agrupar casos fora de uma release (encontradas em maiúsculas em
    Heimdall Gateway, PBX Softcom, Servidor Asgard, Meu Fiscal Web e Hub Softcom), e a validação
    antiga impedia criar ou editar uma delas pela tela.

12. **Na edição, Responsável bugs e Responsável melhorias limpos vão como `0` no PUT, não
    `null`** (`parseOptionalIdForUpdate` em `cadastro/utils.ts`). **Por quê:** o legado
    (`PUT /projeto-versoes/{id}`) ignora `null` e mantém o valor antigo, que voltava para a tela
    depois de salvar; produtos sem responsável já vêm da API com `0`. Testado em 2026-11-17 no
    produto 375. **Limitação conhecida, sem solução no front:** o mesmo PUT ignora `null` e `""`
    em `InformacoesTecnicas`, então apagar todo o texto não limpa o campo. Resolver exige
    mudança no legado.
