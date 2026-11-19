# Status do Softflow (casos-front)

*Criado em 2026-11-17, junto com a reorganização de `docs/` no formato `docs/<slug>/`. Este
arquivo diz **em que estado** cada coisa está; o **como** fica em cada `docs/<slug>/README.md` e o
**porquê** em `docs/<slug>/decisoes.md`. Ao fim de qualquer sessão que implemente, altere,
corrija, decida ou descarte algo, mover os itens entre as seções conforme o estado real.*

Branches: `master` = produção (push dispara o deploy, ver [`deploy/`](deploy/README.md)); `dev` =
trabalho do dia a dia, criada em 2026-11-17.

---

## ✅ Em produção

Tudo abaixo está na `master` e, portanto, publicado. Não havia registro de roteiro de teste ponta a
ponta antes desta data; ao testar um módulo de ponta a ponta, anotar aqui a data e o que foi
coberto.

| Funcionalidade | Pasta | Últimas entregas conhecidas |
|----------------|-------|------------------------------|
| Painel do desenvolvedor (Kanban) | [`painel-desenvolvedor/`](painel-desenvolvedor/README.md) | Layout novo; rota antiga em `/painel/old` |
| Indicadores | [`indicadores/`](indicadores/README.md) | Tela (2026-09-14); recalcular todos (2026-09-15) |
| Minha Visão | [`minha-visao/`](minha-visao/README.md) | Formato de data das próximas liberações (2026-08-12); pasta renomeada sem acento (2026-11-17, na `dev`, conferido com typecheck e lint, sem teste no navegador) |
| Avisos | [`avisos/`](avisos/README.md) | |
| Casos | [`casos/`](casos/README.md) | Duplicar caso, inclusive em lote e no modal de transferência (2026-09); anexos de documentos (2026-09-16); caso duplicado (2026-10-13); nº de caso com 6 dígitos nas relações (2026-09-16) |
| Reports | [`reports/`](reports/README.md) | Refatoração da listagem (2026-10-14) e ajustes (2026-11-06); horário base de abertura (2026-08-21); ocorrência para clientes vinculados ao marcar "requisito incompleto" (2026-08-14) |
| Projetos | [`projetos/`](projetos/README.md) | |
| Liberações | [`liberacoes/`](liberacoes/README.md) | Descrição gerada em tempo real (2026-08-10) |
| Melhorias | [`melhorias/`](melhorias/README.md) | Modal de avaliação (2026-08-26) |
| Auditoria de horas | [`auditoria-horas/`](auditoria-horas/README.md) | |
| Clientes | [`clientes/`](clientes/README.md) | |
| Produtos | [`produtos/`](produtos/README.md) | Módulo novo (2026-09-17) |
| Cadastros Smart | [`cadastros-smart/`](cadastros-smart/README.md) | |
| Adquirentes (Kanban + página pública) | [`adquirentes/`](adquirentes/README.md) | Documentação pública das adquirentes (2026-09-30) |
| Documentação (módulo) | [`documentacao/`](documentacao/README.md) | Módulo completo (2026-08-26); nova tela (2026-09-14) |
| Configurações (usuários, perfis, prompts IA) | [`configuracoes/`](configuracoes/README.md) | Ajuste de permissões (2026-10-16) |
| RBAC e hierarquia de perfis | [`rbac/`](rbac/README.md) | |
| Autenticação | [`autenticacao/`](autenticacao/README.md) | Banner do login (2026-09-24) |
| Notificações no Discord | [`casos/`](casos/README.md), [`reports/`](reports/README.md) | Caso concluído (2026-08-24); opção de desativar por usuário (2026-08-24) |
| Anexos no S3 da Softcom | [`camada-de-dados/`](camada-de-dados/README.md) | Troca de bucket (2026-10-07); aba de anexos (2026-10-07) |
| Deploy na VPS (Swarm + GitHub Actions) | [`deploy/`](deploy/README.md) | Ambiente Docker (2026-08-14); doc ajustada (2026-10-13) |

## 🟡 Implementado, ainda não testado de ponta a ponta

- **Padrão único de gatilho de select/combobox** (2026-11-19, na `dev`). Combobox
  (`components/ui/combobox.tsx`), multi-selects (`components/ui/v2/combobox2.tsx`, input e chips)
  e o seletor de mês seguem o `SelectTrigger`: seta só para baixo, sem fundo no hover, fundo
  transparente, texto regular, foco de 1px; o Estimado de Casos perdeu o negrito. Medido igual em
  `/projetos` e `/casos`, temas claro e escuro. Afeta todas as telas com combobox; não conferidas
  uma a uma. Na mesma linha, `Input`, `Textarea` e o campo de data (`input-group` +
  `DatePickerInput`) passaram a radius 8px, fundo transparente e `shadow-sm`, e a data perdeu o
  `font-medium`; medido igual em `/casos` e `/projetos/novo`. O `Label` base virou `block` sem `leading-none`, o que alinhou Tipo e Usuário no modal
  de editar Produção (antes 4px de diferença); verificador de alinhamento sem achados em `/casos`,
  `/casos/novo`, caso 104108 (com o modal), `/projetos`, `/projetos/novo`, `/projetos/3315`,
  `/produtos`, `/reports/novo` e `/liberacoes`. No combobox, a lista passou a rolar com a roda do mouse dentro de modais
  (`Popover` modal) e a seta ficou no lugar do Select quando não há botão de limpar; conferido no
  modal de editar Produção (Usuário rolou e selecionou; seta a 13px como o Tipo) e nos filtros de
  Casos. Ver
  [`design-system.md`](design-system.md).
- **Avisos: aviso automático (bloqueante)** (2026-11-18, na `dev`). Aviso não lido com `auto`,
  enviado nos últimos 7 dias, abre numa janela sem X sobre qualquer tela do dashboard, um por vez
  do mais antigo para o mais novo, até marcar como lido. Testado na API de dev com os avisos 8011,
  8012 e 8013 (só para o registro 2384): fila, Esc e clique fora bloqueados, erro simulado no
  marcar, sino e mobile 390px. Não exercitado: a janela por cima de outro modal aberto. Falta ir
  para produção. Ver [`avisos/`](avisos/README.md).
- **Envio de avisos (tela Novo aviso, `/avisos/novo`)** (2026-11-18, na `dev`). Botão "Novo
  aviso" em `/avisos` com a permissão `create-aviso` (seed aplicado no Postgres e atribuído ao
  papel "PM/PO Squad Xp"), conteúdo, modo Todos/Filtrar, quatro filtros, "Adicionar usuário
  específico", lista com seleção e envio por `POST /api/comunicados`. Testado na API de teste:
  envio pela tela só para o registro 2384 (201) e o aviso apareceu na lista. `GET
  /auxiliar/comunicado-filtros` dava 503 na API de teste, então os filtros foram vistos com a
  resposta simulada no navegador. Falta conferir com o endpoint real e ir para produção
  (atribuir `create-aviso` aos papéis certos). Ver [`avisos/`](avisos/README.md).
- **Projetos: aba Stakes em lista** (2026-11-19, na `dev`). A aba Stakes de `/projetos/[id]`
  virou lista editável em linha com salvar em lote, faixas de linha nova/alterada, totais,
  atalhos (Enter, Ctrl+S), aviso de descarte, copiar linhas (TSV), colar com Ctrl+V e importar de
  outro projeto do mesmo setor; cards e modal antigos removidos. Testado nos projetos de teste
  #3315 e #3316 da API de dev: lançamento só pelo teclado, repetido, falha parcial simulada,
  descarte (aba e link), excluir nova e salva, erro de carga, 390px, copiar (e reserva sem HTTPS),
  colagem estilo Excel com problemas, importar de projeto fechado com bloqueios. Não exercitado:
  Ctrl+V real do teclado (conferido com o evento `paste`) e salvar linhas importadas. Falta ir
  para produção. Ver [`projetos/`](projetos/README.md).
- **Projetos: clonar projeto** (2026-11-19, na `dev`). Botão Clonar na listagem `/projetos` e
  item "Clonar" do menu ⋯ da edição `/projetos/[id]` (`create-project`), modal com nome e período,
  `POST /api/sgp-cadastros/{id}/clonar`; na listagem a linha nova fica destacada com "Novo", na
  edição a tela abre o projeto novo. Testado na API de dev (clones de teste #3313, #3314, #3315 a
  partir do 3278 e #3316 a partir do 3315 pela edição): padrões, erro de datas, erro de período
  sobreposto (422), origem inexistente (404), sucesso com destaque, ida para o projeto novo, tema
  escuro e 390px. A API levou cerca de 40 s no clone pela tela.
  Não conferido: se cronograma e riscos são copiados. Falta ir para produção. Ver
  [`projetos/`](projetos/README.md).
- **Projetos: seleção de casos ao duplicar o escopo** (2026-11-17, na `dev`). A aba Escopo marca
  casos na tabela. Sem marcação, `POST /api/projeto-casos/transferir-proximo-projeto` segue sem
  `registros` e a API duplica os elegíveis do projeto. Com marcação, envia só esses ids. ESLint dos
  arquivos alterados passou. No navegador local a rota caiu no login, então a seleção e o POST não
  foram exercitados. Ver [`projetos/`](projetos/README.md).
- **Flags Liberação / Entregue / Atualização Automática na edição de caso** (2026-11-17, na
  `dev`). Pílulas com checkbox no header de "Classificação e Origem", salvas no PATCH do caso.
  Testado no navegador com o caso 104020 (dev local + API real): leitura da API, marcar e
  desmarcar com salvar e recarregar, flag não alterada continua fora do PATCH, aba Clientes;
  caso devolvido ao estado original (tudo desmarcado). Falta ir para produção (`master`). Ver
  [`casos/`](casos/README.md).
- **Minha Visão: próximas liberações abrem o registro em nova aba** (2026-11-17, na `dev`).
  Testado no navegador: 7 itens viraram links `/liberacoes/{registro}?standalone=1` com
  `target="_blank"`, e o clique abriu a liberação certa (#1109). O painel do app abre na mesma
  aba; a nova aba de fato não foi vista. Ver [`minha-visao/`](minha-visao/README.md).
- **Versão de produto aceita MELHORIA, BUG e BACKLOG** (2026-11-17, na `dev`). Testado no modal
  do produto 375 sem salvar: "abc" bloqueia com a mensagem nova, "melhoria" e "8.1.1.0" passam;
  conversão para maiúsculas conferida isolada. Não foi salva nenhuma versão real. Ver
  [`produtos/decisoes.md`](produtos/decisoes.md) #11.
- **Produto: limpar Responsável bugs/melhorias e salvar agora limpa** (2026-11-17, na `dev`).
  Testado no produto 375: preencher, salvar, limpar e salvar deixa `0` na API e "Nenhum" na tela
  depois de recarregar. Ver [`produtos/decisoes.md`](produtos/decisoes.md) #12.
- **Casos: modal "Editar produção" na aba Produção** (2026-11-17, na `dev`). Testado no caso
  104020: lançamento criado (iniciar/parar), editado no modal para TESTANDO 11:46–12:16 (PUT
  enviou tipo e horas; API devolveu os novos valores; tabela mostrou 30 minutos), validação de
  fechamento ≤ abertura, salvar sem alteração não chama a API. Depois o lançamento foi excluído e
  o caso voltou a status Aberto e sem "Não planejado"; o histórico do caso guarda esses passos.
  Em seguida, Usuário, Projeto, Quem ajudou (valeu) e Anotação passaram a ser editáveis
  ([`casos/decisoes.md`](casos/decisoes.md) #8 e #9): testado no lançamento 294341 do caso
  104020 trocando projeto para 3301, "quem ajudou" para Mendonça e anotação; a API devolveu os
  novos valores com o lançamento ainda no caso; depois projeto e "quem ajudou" voltaram ao
  original. O projeto vai em `cronograma_id` (`registro` é o caso).
- **Casos: indicador de caso em produção na listagem** (2026-11-17, na `dev`). Faixa verde à
  esquerda e fundo leve para casos com o tempo rodando (o selo "Em produção" foi tirado por
  aumentar a linha); aparece também no Escopo de Projetos (linha compartilhada). Testado no
  navegador em `/casos?projeto_id=3278`: 104020 e 104000 (iniciados) com faixa, sem selo, e a
  coluna de status com a mesma altura das outras linhas. Ver
  [`casos/decisoes.md`](casos/decisoes.md) #10 e #11.
- **Produtos: filtro "Incluir desativados" e setor do usuário por padrão** (2026-11-17, na `dev`).
  Listagem passa `incluir_desativados` ao legado. Testado no navegador: entrada pelo menu e
  carga direta abrem com SQUAD XP e desativados (15 itens, 4 desativados na 1ª página); desligar
  manda `incluir_desativados=false` e some com os desativados; "Limpar filtros" zera tudo;
  `?nome=Smart` é respeitado sem setor. Ver [`produtos/decisoes.md`](produtos/decisoes.md) #13.
- **Produtos: abrir nesta aba / em nova aba e sem badges de filtros** (2026-11-17, na `dev`).
  Coluna Ações com lápis e link externo (`?standalone=1`, "Voltar" vira "Fechar"); card do
  celular com os mesmos ícones. Testado no navegador: lápis abre na mesma aba, standalone mostra
  "Fechar" e o clique fecha a aba, toque no card no celular abre o produto. Em telas por volta
  de 950 px a coluna Ações fica fora da área visível e exige rolar a tabela para o lado; em
  1440 px cabe inteira.
- **Minha Visão: Painel de ideias abre Melhorias em nova aba, com hover e ícone** (2026-11-17,
  na `dev`). Testado: 6 linhas com link `target="_blank"`, ícone e fundo no hover, clique na
  linha chama `window.open(..., "_blank")` sem sair da Minha Visão. Corrigido no mesmo dia: o
  filtro de período ia só com o dia de `dt_inicial`/`dt_final` (ex.: 07/09 a 07/09) e a tela de
  Melhorias vinha vazia; agora vai o mês da competência (01/09 a 30/09). Testado com Smart
  2026/09: a lista passou a trazer os registros do mês.

## ❌ Pendências conhecidas, ainda não endereçadas

Encontradas no levantamento de 2026-11-17 (nenhuma foi corrigida; dependem de decisão do
usuário):

- **Auditoria chama o Assistant direto do browser** (`services/ia/get-production-analysis.ts` via
  `apiAssistant`), sem Route Handler nem `withPermission`. A pasta `app/api/ia/production-analysis/`
  existe vazia. Ver [`auditoria-horas/`](auditoria-horas/README.md).
- **`/clientes` e `/painel/indicadores` sem `RequirePermission`**: clientes fica aberto a qualquer
  usuário logado; indicadores depende do bloqueio por prefixo `/painel`.
- **Cores cruas do Tailwind no Kanban de adquirentes** (`status-adquirentes-columns.ts`), contra a
  regra de tokens.
- **Informações técnicas do produto não pode ser apagada**: o legado ignora `null` e `""` nesse
  campo no `PUT /projeto-versoes/{id}`. Precisa de ajuste no legado. Efeito do teste de
  2026-11-17: o produto 375 (Meu Fiscal Web) ficou com "teste" nesse campo (antes vazio).
- **Contagem do Painel de ideias × tela de Melhorias pode diferir em 1.** Smart 2026/09: o painel
  conta 6 (5 pendentes, 1 recusada), a tela de Melhorias com o mês inteiro lista 7 (6 aguardando,
  1 recusada). A sobra é a #25837 (30/09, sem produto exibido na lista). Causa não investigada
  (regra de contagem do painel no legado).
- **Anotação de lançamento de produção não pode ser apagada**: o
  `PUT /projeto-casos-producao/{sequencia}` ignora `anotacao` vazia (`""` e `null`). Precisa de
  ajuste no legado. Efeito do teste de 2026-11-17: o lançamento 294341 do caso 104020 ficou com
  a anotação "teste anotacao" e com os segundos de abertura/fechamento zerados (15:02:00–15:03:00).
- **Rota antiga `/painel/old`** (`components/painel/painel`) continua publicada.
- **Link quebrado** para `db/scripts/reset-supabase-dev.sql` em
  [`camada-de-dados/`](camada-de-dados/README.md) (o arquivo não existe).
- **Sem testes automatizados**: validação depende de `lint`, `build` e conferência manual.
- **`npm run lint` quebrado**: o script chama `next lint`, que não existe no Next 16 (falha com
  "Invalid project directory ... lint"). Enquanto isso, rodar `npx eslint <arquivos>`. Visto em
  2026-11-19.
- **Clone de projeto não copia o objetivo**: `POST /sgp-cadastros/{id}/clonar` devolve
  `objetivo_id: 0` mesmo com a origem preenchida (3278 tem 65). Precisa de ajuste no backend; até
  lá o modal avisa (decisão #14 de [`projetos/`](projetos/decisoes.md)).

## 📋 Backlog consciente (decisão sua, não esquecimento)

Especificação aprovada e ainda não implementada fica em `docs/<slug>/README.md` com **"Estado:
planejado"** (ou com a seção "Próxima mudança planejada") e aparece aqui.

- **Avisos: rascunhos e avisos enviados**: o botão "Salvar rascunho" ficou fora do envio de
  avisos até existir uma tela para ver e retomar rascunhos e enviados (decisão #13 de
  [`avisos/`](avisos/decisoes.md)).
- **Projetos: filtros da listagem**: especificado em 2026-11-19. Nome do projeto, Setor, Status
  (Aberto/Fechado) e Mês (seletor só de mês → `data_inicio`/`data_fim`), além do Id. Abre com o setor
  do usuário e o mês atual já aplicados. Protótipo, decisões #30 a #37 e plano em 3 partes em
  [`projetos/`](projetos/README.md#próxima-mudança-planejada-filtros-da-listagem-de-projetos). Regra
  de período da API para conferir na Fase 0. Implementar com `/implementar projetos`.
