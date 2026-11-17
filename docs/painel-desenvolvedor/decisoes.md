# Painel do desenvolvedor — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: seção "Regras de negócio específicas" do
README, consolidada em 2026-11-17. Onde o porquê não estava registrado, está marcado "a confirmar".

1. **Quatro colunas fixas: Abertos, Corrigidos, Retornos, Concluídos.**

2. **Arrastar de Abertos/Retornos para Corrigidos é "finalizar caso"**, que usa um endpoint
   diferente do PATCH de status. **Por quê:** finalizar no legado registra mais do que a troca de
   status. Detalhe: a confirmar.

3. **Produto/versão é filtro obrigatório para carregar cards; projeto é opcional.**
   Porquê: a confirmar (provavelmente volume de dados por consulta).

4. **"Ver como" outro desenvolvedor só com `audit-all-users`.** Tela exige `list-painel-dev`.

5. **Ordenação por importância e destaque para `statusTempo === "INICIADO"`.**

6. **Paginação infinita por coluna (cursor) e dedupe por `id` ao juntar as quatro listas.**

7. **Clique no card abre o modal de resumo; o lápis leva à tela de edição.**
