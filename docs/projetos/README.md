# Projetos

> **Estado: implementado.** É o modelo de organização de pastas seguido por Casos e Produtos.
> Padrões gerais em [`padrao-front/`](../padrao-front/README.md). Decisões travadas em
> [`decisoes.md`](decisoes.md).
>
> **Próxima mudança planejada: filtros da listagem** (Nome, Setor, Status e Mês; abre com o setor
> do usuário e o mês atual já aplicados). Especificada em 2026-11-19 e ainda não implementada. Ver
> a seção [Próxima mudança planejada](#próxima-mudança-planejada-filtros-da-listagem-de-projetos)
> e as decisões #30 a #37.

## O que é

Cadastro SGP de projeto: listagem em `/projetos`, cadastro em `/projetos/novo` e edição em
`/projetos/[id]` com as abas Abertura, Escopo, Risco, Stakeholders e Cronograma. O Escopo lista
casos e reports da memória do projeto. Dados da API Soft Flow (`sgp-*`, `projeto-memoria`).

Abaixo, a organização de `components/projetos/`. Para aba nova, seção 11; campo novo na Abertura,
seção 12; feature nova, checklist da seção 14.

### Duplicar casos (aba Escopo)

Quem tem `edit-case` ou `edit-report` vê o botão "Duplicar casos" e checkboxes na tabela. O modal
escolhe o projeto destino e chama `POST /api/projeto-casos/transferir-proximo-projeto`
(`services/projeto-casos/transferir-proximo-projeto.ts`).

- Nenhum caso marcado: o body vai só com `cronograma_origem` e `cronograma_destino`. A API duplica
  os elegíveis do projeto (Aberto e Em desenvolvimento; bloqueados ficam de fora). Os filtros da aba
  não entram nessa chamada.
- Casos marcados: o body inclui `registros` com os ids dos casos (`caso.id`). O checkbox do
  cabeçalho marca só as linhas já carregadas (a lista pagina de 15 em 15). Casos que saem da lista
  carregada (filtro ou troca de projeto) deixam de estar marcados.

### Clonar projeto (listagem)

Cria um projeto novo a partir de um existente informando só **nome, data de início e data de
fim**. O uso principal é abrir a próxima sprint sem recadastrar tudo (ex.: `Squad XP 2026 - 11.02`
→ `Squad XP 2026 - 12.01`). Decisões #1 a #15 em [`decisoes.md`](decisoes.md).

- **Entrada:** botão de ícone `Copy` na coluna Ações da listagem, antes do Editar, com tooltip
  "Clonar projeto", e item "Clonar" no menu "Mais ações" (⋯) da edição `/projetos/[id]`
  (decisão #15). Os dois só aparecem com `create-project` (decisão #10). Projetos Abertos e
  Fechados podem ser clonados (decisão #6).
- **Modal "Clonar projeto":** bloco de leitura com a origem (`#registro`, nome, setor · PDV ·
  classe, período), nome (padrão `"{nome} - Clone"`, até 120 caracteres), data de início e de fim
  (padrão: dia seguinte ao fim da origem, com a mesma duração; sem fim na origem, ficam vazias),
  duração calculada e texto informativo do que é e do que não é copiado.
- **Validação** (react-hook-form + Zod): nome obrigatório após `trim`, datas obrigatórias, fim ≥
  início. O erro de ordem aparece assim que as duas datas estão preenchidas. Nome repetido não é
  checado (decisões #5 e #13).
- **Envio:** datas em `YYYY-MM-DD 00:00:00` (`formatDateTimeSgp`). Durante a chamada, botões
  desabilitados ("Clonando...") e Esc, X e clique fora não fecham.
- **Sucesso:** fecha o modal, toast `"{message} · #{registro} {nome}"`, invalida
  `["sgp-cadastros"]`. Na edição, abre o projeto novo (`/projetos/{registro}`); na listagem,
  destaca a linha nova (fundo amarelo suave, selo "Novo" e "Clonado do
  projeto #…") enquanto a listagem estiver montada (decisão #7). Se a linha não estiver nas
  páginas carregadas (filtro por outro Id, por exemplo), fica só o toast.
- **Erro:** o modal continua aberto com os dados, mostra a mensagem da API acima do rodapé e um
  `toast.error`. Mudar qualquer campo apaga a mensagem (decisão #8).

#### Contrato da API Soft Flow

`POST /sgp-cadastros/{registro}/clonar`, em que `{registro}` é o projeto de origem.

```json
{
  "nome_projeto": "Squad XP 2026 - 11.02 - Clone",
  "data_inicio": "2027-11-01 00:00:00",
  "data_fim": "2027-11-30 00:00:00"
}
```

Resposta 200 (testada pelo usuário com a origem 3278):

```json
{
  "success": true,
  "message": "Projeto clonado com sucesso",
  "data": { "registro": 3311, "nome_projeto": "Squad XP 2026 - 11.02 - Clone", "status": "ABERTO",
            "data_inicio": "2027-11-01 00:00:00", "data_fim": "2027-11-30 00:00:00",
            "datas": "2027-11-01 00:00:00", "data_desativado": "2027-11-30 00:00:00",
            "cliente": 293, "usuario": 816, "tipo": "PROJETO", "classe_projeto": "ESTRATEGICO",
            "pdv": "JOAO PESSOA", "setor": "SQUAD XP", "...": "demais campos de SgpCadastroData" }
}
```

O `data` tem o mesmo formato de `SgpCadastroData` (`interfaces/sgp-cadastro.ts`). No exemplo,
`necessidades`, `expectativas`, `objetivo` e os checklists (usabilidade, confiabilidade etc.)
vieram vazios.

**Conferido na API de dev em 2026-11-19 (Parte 1)**, clonando a origem 3278 pela rota
`/api/sgp-cadastros/3278/clonar` (projetos de teste criados: #3313 e #3314, ambos
"TESTE Claude Code - clone 3278"):

| Caso | Resposta da API (repassada pela rota como `{ error }`) |
|------|--------------------------------------------------------|
| Sucesso | **201** com `success`, `message`, `data` (projeto novo, status `ABERTO`) |
| Fim antes do início | **422** "The data fim field must be a date after or equal to data inicio." |
| Origem inexistente | **404** "Projeto não encontrado!!!" |
| Período sobrepõe outro projeto aberto (mesmo com nome diferente) | **422** "Já existe projeto aberto nesse período!!!" |
| Nome repetido em período livre | **201**: o nome **não** é checado (#3314 tem o mesmo nome do #3313) |

O que o clone leva: setor, PDV, classe, tipo, cliente e `usuario` (responsável), **os usuários
autorizados** (17 de 17, então a rota não precisa de `POST /sgp-usuarios`) e **os stakeholders**
(9 de 9). **Não leva os casos** (memória do #3313 vazia). **Não leva o `objetivo_id`**: a origem tem
65 e o clone volta com 0. Cronograma e riscos não foram conferidos porque a 3278 não tem nenhum.

### Aba Stakes (lista editável)

A aba **Stakes** de `/projetos/[id]` é uma lista editável em linha, no estilo de planilha, com
salvar em lote, copiar, colar e importar de outro projeto do mesmo setor. O card **Usuários
autorizados**, abaixo dela, continua como antes. Decisões #16 a #29 em [`decisoes.md`](decisoes.md).

- **Card "Stakeholders":** header com "N pessoas", "#registro · nome", o aviso "N linhas não
  salvas" (bolinha amarela) e os botões Importar, Copiar linhas, Adicionar linha e Salvar. Abaixo,
  a linha de ajuda com os atalhos e as faixas.
- **Tabela:** Função (select dos tipos `STAKEHOLDERS`), Colaborador (combobox com busca), Planejada
  e Não planejada (horas **por dia**, `HH:MM` com máscara), Dias, Total ((planejada + não
  planejada) × dias), Observação e Excluir. "Aprovou" não aparece: é preservado no PUT e vai 0 no
  POST (decisão #17). A ordem é a de inclusão, `sequencia` crescente (decisão #29). À esquerda, uma
  faixa de 3px marca linha nova (azul) ou alterada (amarela).
- **Rodapé:** "Totais · N pessoas" com as somas de planejada × dias, não planejada × dias e total.
- **Lançar:** Adicionar linha (botão ou link abaixo da tabela) põe a linha no fim com os dias da
  anterior (10 na primeira) e foco na Função; Tab percorre os campos; Enter num campo de texto da
  última linha cria outra; Ctrl+S salva (decisão #23).
- **Salvar** (decisões #18 a #20): valida só as linhas novas e alteradas (função, colaborador da
  lista, horas com minutos abaixo de 60, dias ≥ 1, colaborador sem repetir). Com erro, nada é
  enviado: borda vermelha nos campos, "Linha N: …" embaixo e o toast "Corrija N linhas antes de
  salvar". Sem erro, um POST/PUT por linha; falha parcial deixa salvas as que deram certo e marca
  as outras com a mensagem da API. Toast: "Stakeholders salvos: X novos e Y alterados."
- **Excluir** (decisão #21): linha nova sai na hora; linha salva pede confirmação e chama o DELETE
  na hora, fora do lote.
- **Descartar** (decisão #22): com linhas não salvas, trocar de aba, Voltar, clicar em link do app
  ou fechar/recarregar a página pede "Descartar alterações?".
- **Copiar linhas** (decisão #24): TSV com cabeçalho (Função, Colaborador, Planejada, Não planejada,
  Dias, Observação) das linhas preenchidas.
- **Colar** (decisão #25): colar texto com tabulação na aba abre o Importar em "Colar linhas", com
  prévia. A leitura aceita cabeçalho opcional, maiúsculas trocadas e horas como `6`, `6h30`,
  `06,30` ou `0630`.
- **Importar** (decisão #26): "De outro projeto" (projetos do mesmo setor, mais novos primeiro,
  Fechados marcados) ou "Colar linhas". Prévia com checkbox; quem já está no projeto ou repete na
  própria lista fica bloqueado; linha com problema entra com o erro marcado. As escolhidas entram
  como novas e só gravam no Salvar.
- **Permissão:** `edit-project`, como antes. Sem ela, a tabela fica só leitura e só "Copiar linhas"
  aparece.
- **Mobile** (decisão #27): a tabela mantém as colunas e rola na horizontal dentro do card
  (`min-w-[1080px]`).

## Arquitetura

### Clonar projeto

```text
app/api/sgp-cadastros/[id]/clonar/route.ts      POST → API externa POST /sgp-cadastros/{id}/clonar (withPermission create-project)
interfaces/sgp-cadastro.ts                      ClonarSgpCadastroRequest / ClonarSgpCadastroResponse
services/sgp-cadastros/clonar-sgp-cadastro.ts   fetchWithAuth para /api/sgp-cadastros/{id}/clonar
hooks/projetos/use-clonar-sgp-cadastro.tsx      useMutation({ origemId, data }) + invalidate ["sgp-cadastros"]
components/projetos/clonar/
├── index.tsx                  ProjetoClonarModal: useForm, mutation, sucesso/erro, bloqueio de fechamento
├── schema.ts                  Zod (nomeProjeto, dataInicio, dataFim, fim ≥ início), NOME_PROJETO_MAX
└── utils.ts                   valoresPadraoClone, duracaoEmDias (inclusiva), textoDuracao (funções puras)
components/projetos/index.tsx                   canCloneProject (= create-project), origem do modal e linha destacada
components/projetos/projetos-tabela.tsx         repassa onClonar e destaque
components/projetos/tabela/projetos-tabela-types.ts        onClonar?, destaque? (ProjetoClonadoDestaque) na variante listagem
components/projetos/tabela/projetos-tabela-table.tsx       coluna Ações com 112px quando há onClonar
components/projetos/tabela/projetos-tabela-row-listagem.tsx  botão Clonar e destaque "Novo"
components/projetos/edicao/projeto-edit-form.tsx           canCloneProject, modal com origem = cadastro, onClonado → router.push
components/projetos/edicao/projeto-edit-header.tsx         item "Clonar" do menu ⋯ só com onClonar
```

- A rota valida nome e datas, repassa o corpo para a API e devolve a resposta como veio (201). Erro
  da API vira `{ error }` com o mesmo status (`extractApiError`). Não faz `POST /sgp-usuarios`: o
  clone já leva os usuários autorizados.
- O botão só aparece quando `onClonar` é passado. A permissão fica no entrypoint e a linha não
  conhece RBAC (seção 10).
- O destaque é estado local de `Projetos` (`{ registro, origemRegistro }`), não vem da API: some ao
  sair da tela.
- Cores do destaque: `bg-panel-badge-importance-yellow-bg` na linha e selo
  `bg-panel-badge-importance-yellow` com `text-primary` (decisão #11).

### Aba Stakes

```text
components/projetos/edicao/stakes/
├── index.tsx                  AbaStakes: queries, useForm + useFieldArray, sincroniza com o servidor,
│                              salvar em lote, excluir, Ctrl+S, paste com TSV, Importar, Copiar
├── stakes-lista.tsx           card: header, ajuda, tabela, link Adicionar linha, rodapé, vazio e erro
├── stake-linha.tsx            uma linha editável + "Linha N: …" (validação, API e importação)
├── stakes-lista-skeleton.tsx  carga inicial (lista com 6 linhas + usuários autorizados)
├── stakes-importar-modal.tsx  Importar: De outro projeto / Colar linhas, prévia e bloqueios
├── area-de-transferencia.ts   Clipboard API em contexto seguro; reserva com execCommand("copy")
├── stakes-lista.types.ts      StakeLinha, status, erros por campo, catálogos, linha importada
├── stakes-lista-schema.ts     Zod do formato de uma linha
├── stakes-lista-utils.ts      regras puras: ordem, status, totais, validação do Salvar, TSV
│                              (gerar/ler), bloqueios do Importar, mesclarComServidor
├── stake-form-utils.ts        payload POST/PUT a partir da linha; formatos de hora (também do Cronograma)
├── utils.ts                   horas SGP, mapa de tipos, nomes e iniciais de usuário
└── usuario*-autorizado*.tsx, usuarios-grid.tsx   card Usuários autorizados (sem mudança)
components/projetos/edicao/shared/alteracoes-pendentes.tsx  provider "Descartar alterações?" da edição
components/projetos/edicao/projeto-edit-form.tsx            envolve a edição no provider; troca de aba passa pela guarda
components/projetos/edicao/projeto-edit-header.tsx          Voltar passa pela guarda
hooks/projetos/use-sgp-stakes-todos.tsx      todas as páginas (100 por vez) de GET /sgp-stakes/projeto/{id}
hooks/projetos/use-salvar-stakes-em-lote.ts  POST/PUT por linha em sequência, resultado por linha, invalida no fim
```

- **Estado:** o formulário guarda as linhas (`StakeLinha`, valores como na tela). O status de cada
  linha é calculado comparando com o registro gravado (`originais`: dados do servidor + respostas
  do último Salvar), não guardado.
- **Sincronização:** quando a lista do servidor muda (carga, salvar, excluir), `mesclarComServidor`
  troca as linhas sem mudança local pela versão do servidor, mantém as alteradas e as novas e tira
  as excluídas. Excluir uma linha não apaga o que está sendo lançado nas outras.
- **Linhas da tela** vêm de `fields` do `useFieldArray` (com o valor observado quando existe):
  o `useWatch` pode chegar um render atrasado depois de um `remove`.
- **Cache:** a chave de `useSgpStakesTodos` fica sob `byProjetoInfinite(id)`, então os hooks de
  create/update/delete e `invalidateSgpStakesQueries` já a recarregam.
- **Erros** ficam num `Map` por `key` da linha (estável enquanto a linha existe) e somem quando a
  linha é editada.
- **Guarda de descarte:** a aba informa o número de linhas não salvas ao provider; ele intercepta
  troca de aba e Voltar (`confirmarDescarte`), cliques em `<a>` internos (listener em captura) e
  `beforeunload`. Como a aba desmonta ao trocar, descartar é só seguir com a ação.
- **Colar:** o listener de `paste` fica no `document` enquanto a aba está aberta, com
  `edit-project` e o Importar fechado; ignora colagens dentro de outro diálogo e texto sem
  tabulação.
- **Catálogos:** funções de `useSgpTipos({ tipo: "STAKEHOLDERS" })` e colaboradores de
  `useUsuariosProjetos()` (todos; `nome_suporte` sem repetição na Fase 0). O Salvar espera os dois
  carregarem.
- **Cores:** faixa nova `bg-status-info`; faixa alterada e bolinha `bg-panel-badge-importance-yellow`
  (decisão #11); erros `border-destructive`/`text-destructive`.

## O que é reaproveitável

- `components/projetos/clonar/utils.ts`: `duracaoEmDias` (contagem inclusiva sem efeito de fuso) e
  `valoresPadraoClone` servem para qualquer "próximo período" de um registro SGP.
- O modal segue o mesmo esqueleto do `EscopoDuplicarCasosModal` (header com ícone escuro, bloco
  informativo, rodapé Cancelar/Confirmar) com o erro da API acima do rodapé: bom modelo para outro
  modal de criação que não pode perder dados no erro.
- O padrão "callback opcional = ação visível" (`onClonar`) para pôr uma ação na linha da tabela
  sem a linha conhecer permissão.

- `stakes-lista-utils.ts`: `lerHorasTolerante`, `gerarTsv`/`lerTsv` (copiar/colar com Excel e
  Access) e `mesclarComServidor` servem para outra lista editável em lote (Cronograma, Riscos).
- `use-salvar-stakes-em-lote.ts`: o padrão "uma chamada por item, sem parar na falha, resultado
  por item, invalida uma vez" para qualquer API sem endpoint em lote.
- `edicao/shared/alteracoes-pendentes.tsx`: qualquer aba da edição com mudanças locais chama
  `setPendentes(n)` e ganha o aviso de descarte.
- `area-de-transferencia.ts`: copiar com reserva para o Softflow servido sem HTTPS.

## Como estender

- **Outro ponto de entrada:** renderizar `ProjetoClonarModal` com `origem` = o `SgpCadastroData`
  do projeto (ou `null` para fechar) e decidir no `onClonado` o que fazer com o projeto novo, como
  em `projeto-edit-form.tsx`.
- **Copiar mais campos** (ex.: objetivo, se o backend passar a aceitar): a mudança é no backend
  ou numa chamada extra na rota; atualizar o `TEXTO_INFORMATIVO` do modal e a decisão #14.
- **Novo campo no clone:** acrescentar em `ClonarSgpCadastroRequest`, no Zod de `schema.ts`, no
  padrão de `utils.ts` e no `onSubmit` do modal.

- **Coluna nova na lista de Stakes:** campo em `StakeLinha` e no Zod, `stakeToLinha`,
  `linhaAlterada`, payloads em `stake-form-utils.ts`, célula em `stake-linha.tsx` (com
  `aria-label` "… da linha N"), cabeçalho em `stakes-lista.tsx`, posição em `TSV_CABECALHO`,
  `gerarTsv` e `lerTsv`. Ajustar `STAKES_LISTA_COLUNAS` e o `min-w` da tabela.
- **Outra aba com salvar em lote:** usar `useAlteracoesPendentes().setPendentes` para o aviso de
  descarte e seguir a divisão desta aba (utils puros, hook de lote, linha + lista + orquestrador).

## Pendências

- O clone não copia o objetivo do projeto (`objetivo_id` volta 0). Ajuste do backend; até lá o
  modal avisa (decisão #14).
- Cronograma e riscos da origem: não conferido se o clone os copia (a origem do teste não tinha
  nenhum). O texto do modal não os cita.
- Projetos de teste criados na API de dev em 2026-11-19: #3313, #3314, #3315 e #3316 (o app não
  exclui projeto).
- Aba Stakes: o Ctrl+V real do teclado não foi exercitado (o painel de teste não lê a área de
  transferência); a colagem foi conferida disparando o evento `paste` na página. Salvar linhas
  importadas usa o mesmo caminho da Parte 2, testado com linhas lançadas à mão.
- Aba Stakes: com o seletor de Função aberto, digitar rápido nem sempre pula para a função pela
  letra (busca do Radix Select); setas e clique funcionam.
- `stakes/utils.ts` ainda exporta funções dos cards antigos (`computeStakeCardTotalMin`,
  `formatStakeCardTotal`, `computeStakesHorasTotais` etc.) sem uso; `formatSgpHorasCurto` e
  `getUsuarioIniciais` seguem em uso.

## Próxima mudança planejada: filtros da listagem de Projetos

### Objetivo

Hoje a listagem `/projetos` só filtra por **Id do projeto** (`Registro`). Os filtros de Setor e
Objetivo existem no código, mas estão comentados. Esta mudança acrescenta **Nome do projeto, Setor,
Status e Mês**, que são parâmetros que o `GET /sgp-cadastros` já aceita. A tela abre com o **setor do
usuário logado e o mês atual** preenchidos e aplicados, então a lista já mostra os projetos do
squad dele no mês (decisões #30 a #37).

### Protótipo

[`prototipo/softflow-prototipo.html`](prototipo/softflow-prototipo.html), atualizado em
2026-11-19, no menu **Projetos**. A lógica está em `pjVals` (bloco `filtros`), e as regras puras
ficam em `pjFiltra`, `pjMesIntervalo`, `pjMesNome`, `PJ_FILTRO_PADRAO` e `PJ_SETOR_USUARIO`. No
mock, o mês atual é outubro de 2026 (`NOW`).

| Captura | Estado |
|---------|--------|
| `capturas/15-projetos-filtros-padrao.png` | Ao abrir: Setor = setor do usuário e Mês = mês atual, já aplicados ("2 filtros aplicados") |
| `capturas/16-projetos-seletor-mes.png` | Seletor de mês aberto: ano com setas, 12 meses, mês atual com contorno, "Este mês" e "Todos os meses" |
| `capturas/17-projetos-filtrado-mes.png` | Novembro de 2026 + Aberto |
| `capturas/18-projetos-sem-resultado.png` | Nenhum projeto encontrado |
| `capturas/19-projetos-filtros-mobile.png` | 390px: campos em coluna única |

### Comportamento

1. **Card "Filtros"**: header com ícone `Filter`, título e o selo "N filtro(s) aplicado(s)" quando
   houver. O content tem um grid que quebra sozinho (no desktop: Id, Nome ocupando 2 colunas,
   Setor, Status; na linha de baixo, Mês e o botão Filtrar). No mobile, coluna única.
2. **Campos e parâmetros**:

   | Campo | Parâmetro | Regra |
   |---|---|---|
   | Id do projeto | `Registro` | Só dígitos (mantém o campo atual) |
   | Nome do projeto | `NomeProjeto` | Texto com ícone de busca, "Busque por parte do nome..."; `trim` |
   | Setor | `Setor` (nome) | Select com "Todos"; abre com o setor do usuário (decisões #31 e #37) |
   | Status | `Status` | Todos / Aberto (`ABERTO`) / Fechado (`FECHADO`) (decisão #33) |
   | Mês | `data_inicio` + `data_fim` | Seletor só de mês (decisão #32): 1º e último dia do mês, `AAAA-MM-DD`; abre com o mês atual (decisão #37) |

3. **Seletor de mês** (decisão #32): o gatilho tem a aparência de um select, com ícone `Calendar`,
   e mostra "Novembro de 2026" ou "Todos os meses". Ele abre um popover com:
   - o ano e as setas "Ano anterior" e "Próximo ano";
   - uma grade de 3×4 meses ("Jan"…"Dez", com `aria-label` "Novembro de 2026"). O mês escolhido
     fica com fundo primário e o mês atual com contorno. Os outros meses ganham fundo `muted` no
     hover; o mês selecionado não muda no hover;
   - um rodapé com "Este mês" e "Todos os meses".

   Escolher um mês fecha o popover. Esc ou clique fora também fecham.
4. **Aplicar**: o botão **Filtrar** e o **Enter** em qualquer campo de texto aplicam os filtros.
   Filtrar fica desabilitado sem nenhum filtro, como hoje. Os filtros continuam na URL (`nuqs`),
   com as chaves novas `nome`, `status` e `mes`.
5. **Ao abrir a tela** sem filtros na URL: Setor = setor do usuário e Mês = mês atual (data do
   navegador), e a busca já sai (decisão #37). Com filtros na URL, valem os da URL.
6. **Limpar filtros** (botão do topo da página): volta ao padrão, com o setor do usuário e o mês
   atual aplicados e o resto vazio (decisão #37). Para ver todos os setores ou todos os meses, o
   usuário escolhe "Todos" no Setor ou "Todos os meses" no seletor.
7. Estados: "Nenhum filtro aplicado" (quando o usuário tira tudo), skeleton durante a busca e
   "Nenhum projeto encontrado". Esses três estados não mudam.

### O que reaproveitar

- `components/projetos/filtros/`: `projetos-filtros.tsx`, `projetos-filtros.types.ts`,
  `projetos-filtros-mappers.ts` e `projetos-filtros-parsers.ts`. O trabalho é acrescentar campos a
  esses arquivos, não criar outros.
- `CasoFormSetor` (já importado no arquivo e comentado) e `resolveSetorNome`. O setor do usuário
  vem de `getUser().setor` (nome), convertido para id com `resolveSetorIdByNome`, como em
  `components/projetos/cadastro/index.tsx`.
- Status: `Select` de `@/components/ui/select`, com as opções do `ProjetoStatusBadge`.
- Seletor de mês: **não existe no repositório.** Criar em `components/fields/mes-picker.tsx`
  (`Popover` + grade de `Button`), genérico, para servir a outras telas mensais. Se precisar de
  cor nova, parar e perguntar (regra do design-system).
- O filtro de Objetivo (`CasoFormSgpObjetivo`) continua fora (decisão #35).

### Arquitetura proposta

```text
components/projetos/filtros/
├── projetos-filtros.tsx          + Nome, Setor (descomentado), Status, Mês; grid 4 colunas
├── projetos-filtros.types.ts     + nome, status, mes (AAAA-MM)
├── projetos-filtros-mappers.ts   + mesParaIntervalo; filtrosToSgpCadastrosParams com os novos
├── projetos-filtros-parsers.ts   + nome, status, mes na URL
components/fields/mes-picker.tsx  seletor só de mês (novo, genérico)
hooks/projetos/use-projetos-filtros.ts   padrão = setor do usuário + mês atual; limpar volta ao padrão
services/sgp-cadastros/get-sgp-cadastros.ts  + nome_projeto, status, data_inicio, data_fim
app/api/sgp-cadastros/route.ts    GET repassa NomeProjeto, Status, data_inicio e data_fim
```

### Perguntas em aberto (resolver na Fase 0)

1. **Regra de período da API:** com `data_inicio` = 01/11 e `data_fim` = 30/11, a API traz os
   projetos que **começam e terminam** dentro do mês, ou os que **cruzam** o mês? No protótipo,
   a regra é "dentro do mês", mas projetos longos (ex.: Sustentação, jan–dez) só aparecem na
   outra regra. Conferir na API de teste e registrar como decisão. Se a API não cobrir a regra
   desejada, perguntar ao usuário.
2. **`NomeProjeto`** busca por parte do nome e sem diferenciar maiúsculas? Conferir.
3. **Setor do usuário que não aparece em `useSetores`:** cair em "Todos" e mostrar "Nenhum
   filtro aplicado"? Proposta: sim.

### Perguntas do Claude Code (filtros)

#### P7 — Regra do filtro por mês · aberta

Fase: Parte 1 (2026-11-19). Contexto: pergunta 1 do planejamento, conferida na API de dev com o
setor SQUAD XP. O `GET /sgp-cadastros` **não** usa "dentro do mês" nem "cruza o mês": ele traz os
projetos que **começam** no período (`data_inicio` do projeto entre os dois parâmetros). Com
`data_inicio=2026-11-10&data_fim=2026-11-20` veio só o 3278 (16/11→30/11); o 3277 (01/11→15/11),
que cruza o intervalo, ficou de fora. Só com `data_fim=2022-02-20` vieram os que começam até essa
data, inclusive o 1804 (16/02→28/02). No uso por mês: sprint de 1 a 15 ou de 16 a 30 aparece no
mês dela nas duas regras. A diferença é para projeto longo (ex.: Sustentação jan–dez), que só
aparece no mês em que começa, e para projeto que começa num mês e termina no outro, que aparece só
no mês de início.
Opções: **A)** aceitar a regra da API: o mês mostra os projetos que **começam** nele; o seletor
manda 1º e último dia do mês, como está. **B)** "cruza o mês" no front: pedir à API os que começam
até o fim do mês e filtrar na tela os que terminam depois do 1º dia; exige buscar todas as páginas
do setor (a listagem hoje pagina de 15 em 15) e piora com o histórico. **C)** pedir ao backend um
parâmetro para "cruza o período" (fora do escopo desta entrega) e ficar com A até lá.
Recomendação do Claude Code: **A** (com C como pedido ao backend se projetos longos importarem),
porque as sprints de 15 dias, que são o uso principal, aparecem certas, e a B quebra a paginação.

Pergunta 2 do planejamento, conferida: `NomeProjeto` busca por **parte do nome** e **sem
diferenciar maiúsculas** ("squad xp 2026 - 11.02" achou o 3278 e o 3311; "claude code" achou os
projetos de teste). Acentos não foram conferidos (não há nome com acento no SQUAD XP). `Status`
aceita `ABERTO`/`FECHADO` (minúsculas também).

### Plano de implementação

1. **Parte 1: dados.** Service e route com os 4 parâmetros novos, tipos, parsers e mappers
   (`mesParaIntervalo`). Conferir as perguntas 1 e 2 na API de teste.
2. **Parte 2: tela.** `mes-picker`, campos novos no card, padrão com setor do usuário e mês atual,
   e Limpar voltando ao padrão. Conferir no navegador: abrir já filtrado pelo setor e pelo mês,
   Enter, mês, URL com os filtros e mobile.
3. **Parte 3: fechamento.** README, decisões, contexto e status.

### Andamento da implementação (filtros)

Fase 0 concluída em 2026-11-19, sem pergunta para o usuário. Conferido no código:

- Os arquivos citados existem (`components/projetos/filtros/*`, `hooks/projetos/use-projetos-filtros.ts`,
  `services/sgp-cadastros/get-sgp-cadastros.ts`, `app/api/sgp-cadastros/route.ts`). Hoje o GET da
  rota só repassa `Setor`, `Registro`, `objetivo_id`, `per_page` e `cursor`, então as perguntas 1
  (regra de período) e 2 (`NomeProjeto`) só podem ser conferidas depois da Parte 1, como o plano
  já prevê.
- Pergunta 3, resolvida pela decisão #37: se o setor do usuário não estiver em `useSetores`, o
  Setor fica em "Todos" e o mês atual continua aplicado (a lista mostra todos os setores no mês),
  em vez de "Nenhum filtro aplicado".
- Detalhes decididos pelo Claude Code: o Setor usa o `CasoFormSetor` que já existe (combobox;
  "Todos" = limpar a seleção, com placeholder "Todos"); o padrão (setor do usuário + mês atual) é
  gravado na URL ao abrir sem filtros, esperando `useSetores` para converter o nome do setor em
  id, como no cadastro; o `mes-picker` usa só tokens existentes (`bg-primary` no mês escolhido,
  contorno `border-primary` no mês atual, `hover:bg-muted` nos outros); o parâmetro `objetivo`
  continua aceito na URL, sem campo na tela (decisão #35).

- [x] Parte 1: dados (service e route com `NomeProjeto`, `Status`, `data_inicio`, `data_fim`;
  tipos, parsers e mappers com `mesParaIntervalo`) e conferência das perguntas 1 e 2 na API de dev.
  Entregue em 2026-11-19: GET da rota e `getSgpCadastros` repassam os quatro parâmetros; filtros
  com `nome`, `status` (só `ABERTO`/`FECHADO`) e `mes` (`AAAA-MM`) na URL; `mesParaIntervalo`,
  `mesDaData` e `contarFiltrosAplicados` nos mappers. Conferido com `tsx` (intervalos, fevereiro
  bissexto, parâmetros, status inválido ignorado) e na API de dev. A pergunta 2 está respondida
  acima; a pergunta 1 virou a P7 (regra "começa no período"). Build e `eslint` ok.
- [ ] Parte 2: tela (`mes-picker`, Nome, Setor, Status e Mês no card, padrão com setor do usuário
  e mês atual, Limpar voltando ao padrão)
- [ ] Parte 3: fechamento (README, decisões, contexto, status)

### Fora do escopo

Filtro de Objetivo, intervalo de datas livre (dia a dia), filtro por PDV ou classe e ordenação da
listagem.

---

## 1. Visão Geral

O módulo Projetos cobre três fluxos principais:

| Fluxo | Rota | Entrypoint |
| ----- | ---- | ---------- |
| **Listagem** | `/projetos` | `components/projetos/index.tsx` → `Projetos` |
| **Cadastro** | `/projetos/novo` | `components/projetos/cadastro/index.tsx` → `ProjetoCreateForm` |
| **Edição** | `/projetos/[id]` | `components/projetos/edicao/index.tsx` → `ProjetoEditView` |

Cada fluxo tem sua própria subpasta. Componentes reutilizados entre fluxos ficam em `shared/` (no nível raiz ou dentro de `edicao/`).

---

## 2. Árvore de Pastas

```
components/projetos/
├── index.tsx                      # Listagem: orquestra filtros + tabela + ações
├── projetos-tabela.tsx            # Card de listagem com fetch e infinite scroll
├── utils.ts                       # Utilitários compartilhados do módulo (ex.: formatSgpDateTimeToPt)

├── filtros/                       # Filtros da listagem
│   ├── projetos-filtros.tsx
│   ├── projetos-filtros.types.ts
│   ├── projetos-filtros-mappers.ts
│   └── projetos-filtros-parsers.ts

├── tabela/                        # Tabela reutilizável (listagem e escopo)
│   ├── projetos-tabela-table.tsx
│   ├── projetos-tabela-types.ts
│   ├── projetos-tabela-row-listagem.tsx
│   ├── projetos-tabela-row-escopo.tsx
│   ├── projetos-tabela-escopo-badges.tsx
│   └── projeto-status-badge.tsx

├── layout/                        # Skeletons de layout compartilhados
│   ├── projetos-tabela-skeleton.tsx
│   └── projetos-tabela-escopo-skeleton-rows.tsx

├── shared/                        # Formulários/comp. usados em cadastro + edição
│   └── projeto-abertura-form.tsx

├── clonar/                        # Modal Clonar projeto (listagem): index, schema, utils

├── cadastro/                      # Fluxo de criação
│   ├── index.tsx                  # Entrypoint: ProjetoCreateForm
│   ├── schema.ts                  # Zod schema + ProjetoFormData
│   ├── constants.ts               # Valores padrão (status, tipo, etc.)
│   ├── utils.ts                   # Builders de payload, mappers API ↔ form
│   ├── projeto-create-header.tsx
│   └── projeto-create-footer.tsx

└── edicao/                        # Fluxo de edição (abas)
    ├── index.tsx                  # Entrypoint: fetch do projeto + estados de erro
    ├── projeto-edit-form.tsx      # Orquestrador de abas + form de abertura
    ├── projeto-edit-header.tsx
    ├── projeto-edit-rodape-acoes.tsx
    ├── projeto-edit-skeleton.tsx
    ├── projeto-nao-encontrado.tsx

    ├── abas/                      # Adaptadores finos para cada aba (TabsContent)
    │   ├── aba-abertura.tsx
    │   ├── aba-escopo.tsx
    │   ├── aba-risco.tsx
    │   ├── aba-stakes.tsx
    │   ├── aba-cronograma.tsx
    │   └── aba-placeholder.tsx

    ├── shared/                    # Utilitários compartilhados entre abas de edição
    │   └── sgp-tipos-utils.ts

    ├── escopo/                    # Feature: aba Escopo
    ├── risco/                     # Feature: aba Risco
    ├── stakes/                    # Feature: aba Stakeholders
    └── cronograma/                # Feature: aba Cronograma
```

Hooks de dados ficam em `hooks/projetos/` (não dentro de `components/projetos/`).

---

## 3. Responsabilidades por Camada

### 3.1. Entrypoints (`index.tsx`)

Cada fluxo expõe **um componente principal** via `index.tsx`:

- **`Projetos`** — monta layout de listagem, delega filtros e tabela, gerencia permissões e navegação.
- **`ProjetoCreateForm`** — `useForm`, mutation de criação, header/footer, modal de sucesso.
- **`ProjetoEditView`** — fetch inicial (`useSgpCadastroById`), skeleton, 404 e delegação ao `ProjetoEditForm`.

**Regra:** o entrypoint concentra hooks de dados de alto nível, estados globais do fluxo e composição. Evite JSX profundo — delegue para subcomponentes.

### 3.2. Orquestradores intermediários

Alguns fluxos têm um segundo nível de orquestração:

| Arquivo | Papel |
| ------- | ----- |
| `projetos-tabela.tsx` | Card + fetch infinito + empty states da listagem |
| `projeto-edit-form.tsx` | Tabs, form de abertura compartilhado, permissões de edição, submit |

Esses arquivos **não** devem conter lógica de subfeatures (risco, escopo, etc.) — apenas coordenam abas e passam props (`projetoId`, `enabled`).

### 3.3. Adaptadores de aba (`edicao/abas/`)

Arquivos em `edicao/abas/` são **adaptadores finos** entre o sistema de tabs e a feature folder:

```tsx
// edicao/abas/aba-escopo.tsx
import { AbaEscopo } from "@/components/projetos/edicao/escopo";

export function AbaEscopoTab({ projetoId, enabled }: AbaEscopoTabProps) {
  return <AbaEscopo projetoId={projetoId} enabled={enabled} />;
}
```

**Regra:** `abas/` não contém lógica de negócio. Toda implementação fica na pasta da feature (`escopo/`, `risco/`, etc.).

### 3.4. Feature folders (abas complexas)

Abas com CRUD, modais, grids e múltiplos estados seguem o padrão de **feature folder** descrito em [docs/padrao-front/README.md](../padrao-front/README.md).

Estrutura típica (ex.: `edicao/risco/`):

```
edicao/risco/
├── index.tsx                      # Entrypoint: AbaRisco (queries, modais, handlers)
├── utils.ts                       # Funções puras (sem React)
├── aba-risco-skeleton.tsx           # Skeleton da carga inicial
├── riscos-identificados-card.tsx  # Card/seção de UI
├── riscos-ocorrencias-card.tsx
├── risco-card.tsx                 # Item individual
├── riscos-grid.tsx                # Grid/lista
├── risco-form-modal.tsx           # Modal de criação/edição
├── risco-form-schema.ts           # Zod do formulário
├── risco-form-utils.ts            # Normalização/parse do form
├── risco-form-constants.ts        # Opções fixas, labels
├── risco-prioridade-badge.tsx     # Badge visual
└── risco-historico-*.tsx          # Subfeature de histórico/ocorrências
```

**Regra:** cada feature folder exporta seu componente principal pelo `index.tsx` (ex.: `AbaRisco`, `AbaEscopo`, `AbaStakes`, `AbaCronograma`).

---

## 4. Convenções de Nomenclatura

### 4.1. Arquivos

| Sufixo / padrão | Uso | Exemplo |
| --------------- | --- | ------- |
| `index.tsx` | Entrypoint do fluxo ou feature | `cadastro/index.tsx`, `edicao/risco/index.tsx` |
| `*.types.ts` | Interfaces e tipos do domínio local | `projetos-filtros.types.ts`, `projetos-tabela-types.ts` |
| `*-mappers.ts` | Conversão form ↔ API ↔ filtros | `projetos-filtros-mappers.ts` |
| `*-parsers.ts` | Parse de query string / URL | `projetos-filtros-parsers.ts` |
| `schema.ts` / `*-schema.ts` | Schemas Zod + tipos inferidos | `cadastro/schema.ts`, `risco-form-schema.ts` |
| `utils.ts` / `*-utils.ts` | Funções puras (sem hooks) | `escopo/utils.ts`, `risco-form-utils.ts` |
| `constants.ts` / `*-constants.ts` | Valores fixos, defaults | `cadastro/constants.ts` |
| `*-config.ts` | Mapas de configuração (badges, cores) | `cronograma-papel-badge-config.ts` |
| `aba-*-skeleton.tsx` | Skeleton da carga inicial da aba | `aba-risco-skeleton.tsx` |
| `*-content-skeleton.tsx` | Skeleton de refetch (filtros aplicados) | `escopo-content-skeleton.tsx` |
| `*-modal.tsx` | Modais de formulário ou confirmação | `risco-form-modal.tsx` |
| `*-card.tsx` | Seções encapsuladas em Card | `riscos-identificados-card.tsx` |
| `*-badge.tsx` | Badges visuais isolados | `projeto-status-badge.tsx` |
| `*-row.tsx` | Linha de tabela ou lista | `projetos-tabela-row-listagem.tsx` |
| `projeto-create-*` / `projeto-edit-*` | Peças do layout de cadastro/edição | `projeto-edit-header.tsx` |

### 4.2. Componentes exportados

| Prefixo | Significado |
| ------- | ----------- |
| `Projetos*` | Listagem (`Projetos`, `ProjetosTabela`, `ProjetosFiltros`) |
| `ProjetoCreate*` | Cadastro |
| `ProjetoEdit*` | Edição (shell: header, footer, skeleton) |
| `Aba*` | Conteúdo de uma aba (`AbaEscopo`, `AbaRisco`) |
| `Aba*Tab` | Adaptador fino em `edicao/abas/` |

### 4.3. Props comuns em abas

Todas as abas de edição recebem:

```tsx
interface AbaFeatureProps {
  projetoId: number | string;
  enabled?: boolean; // lazy-load quando a aba está ativa
}
```

---

## 5. Separação de Concerns

### 5.1. O que fica em `components/projetos/`

| Responsabilidade | Onde |
| ---------------- | ---- |
| UI, composição, estado local de tela | Componentes |
| Schemas Zod de formulários | `*-schema.ts` na feature |
| Mappers form ↔ payload API | `utils.ts`, `*-utils.ts`, `*-mappers.ts` |
| Tipos locais de props/form | `*.types.ts` |
| Config visual (badges, labels) | `*-config.ts`, `*-constants.ts` |

### 5.2. O que fica fora (`hooks/`, `interfaces/`, `services/`)

| Responsabilidade | Onde |
| ---------------- | ---- |
| Queries e mutations (React Query) | `hooks/projetos/` |
| Query keys centralizadas | `hooks/projetos/sgp-projeto-query-keys.ts` |
| Tipos da API | `interfaces/sgp-*.ts` |
| Chamadas HTTP | `services/` |

**Regra:** subcomponentes de UI **não** conhecem `queryKey` nem invalidam cache diretamente. Callbacks e dados vêm do entrypoint da feature (`index.tsx`).

### 5.3. Utilitários compartilhados

| Escopo | Local |
| ------ | ----- |
| Todo o módulo Projetos | `components/projetos/utils.ts` |
| Cadastro + edição (form de abertura) | `components/projetos/shared/` |
| Schema e payload create/update | `components/projetos/cadastro/schema.ts` e `cadastro/utils.ts` |
| Múltiplas abas de edição | `components/projetos/edicao/shared/` |

O form de abertura (`projeto-abertura-form.tsx`) é compartilhado entre cadastro e aba Abertura. O schema Zod (`cadastro/schema.ts`) é reutilizado na edição.

---

## 6. Padrões por Subpasta

### 6.1. `filtros/`

Responsável pela UI de filtros da listagem e pela conversão de valores.

```
filtros/
├── projetos-filtros.tsx           # UI (react-hook-form + CasoFormProvider)
├── projetos-filtros.types.ts      # ProjetosFiltrosAplicados, ProjetosFiltersForm
├── projetos-filtros-mappers.ts    # formToFiltrosAplicados, filtrosToSgpCadastrosParams
└── projetos-filtros-parsers.ts    # Parse de query string (URL ↔ filtros)
```

Estado dos filtros aplicados é gerenciado pelo hook `useProjetosFiltros` (`hooks/projetos/use-projetos-filtros.ts`).

### 6.2. `tabela/` + `layout/`

A tabela suporta **variantes** via prop discriminated union:

```tsx
<ProjetosTabelaTable variant="listagem" itens={...} />
<ProjetosTabelaTable variant="escopo" itens={...} />
```

| Arquivo | Papel |
| ------- | ----- |
| `projetos-tabela-table.tsx` | Table shell + switch de variante |
| `projetos-tabela-types.ts` | Props tipadas por variante |
| `projetos-tabela-row-*.tsx` | Renderização de cada linha |
| `layout/*-skeleton*.tsx` | Skeletons reutilizados pela tabela |

Skeletons de layout ficam em `layout/` porque são compartilhados entre listagem e escopo.

### 6.3. `cadastro/`

```
cadastro/
├── index.tsx          # useForm + mutation + SuccessModal
├── schema.ts          # projetoFormSchema, ProjetoFormData, defaultValues
├── constants.ts       # DEFAULT_STATUS_PROJETO, DEFAULT_TIPO_PROJETO
├── utils.ts           # buildCreateSgpProjetoPayload, sgpCadastroToFormValues
├── projeto-create-header.tsx
└── projeto-create-footer.tsx
```

**Regra:** schema e utils de form ficam em `cadastro/` mesmo quando reutilizados na edição — a edição importa de lá.

### 6.4. `edicao/` — shell

```
edicao/
├── index.tsx                  # Fetch → skeleton | 404 | ProjetoEditForm
├── projeto-edit-form.tsx      # Tabs + FormProvider + submit abertura
├── projeto-edit-header.tsx    # Cabeçalho com metadados do projeto
├── projeto-edit-rodape-acoes.tsx
├── projeto-edit-skeleton.tsx
└── projeto-nao-encontrado.tsx
```

`projeto-edit-form.tsx` controla a aba ativa e passa `enabled={activeTab === "..."}` para lazy-load das abas.

### 6.5. Feature folders — padrão CRUD

Abas com listagem + modais (Risco, Cronograma) seguem este fluxo no `index.tsx`. A aba Stakes é a exceção: lista editável com salvar em lote (ver "Aba Stakes" no topo):

1. Queries infinitas (`useSgp*ByProjetoInfinite`)
2. Mutations de delete (`useDeleteSgp*`)
3. Estado de modais (`modalOpen`, `modalMode`, `itemEmEdicao`)
4. Handlers (`handleCriar`, `handleEditar`, `handleExcluir`)
5. Skeleton na carga inicial (`if (isLoading && !data) return <Aba*Skeleton />`)
6. Composição de cards + modais + `ConfirmacaoModal`

Formulários de modal seguem trio:

```
*-form-schema.ts    → Zod
*-form-utils.ts     → parse/normalize valores
*-form-modal.tsx    → UI + useForm + mutation create/update
```

---

## 7. Loading States

O módulo usa **dois níveis de skeleton** onde aplicável:

| Cenário | Componente |
| ------- | ---------- |
| Carga inicial (sem dados, sem filtros) | `aba-*-skeleton.tsx` ou `projetos-tabela-skeleton.tsx` |
| Refetch com filtros aplicados | `*-content-skeleton.tsx` (mantém filtros montados) |
| Próxima página (infinite scroll) | Rows skeleton dentro da tabela (`isFetchingNextPage`) |

Exemplo na aba Escopo:

```tsx
const isInitialLoading =
  enabled && escopoQuery.isLoading && !escopoQuery.data && !hasFiltrosAplicados;

const isRefetchingComFiltros =
  hasFiltrosAplicados &&
  (escopoQuery.isFetching || escopoQuery.isLoading) &&
  !escopoQuery.isFetchingNextPage;

if (isInitialLoading) return <AbaEscopoSkeleton />;
// ...
{isRefetchingComFiltros ? <EscopoContentSkeleton /> : /* conteúdo */}
```

---

## 8. Paginação Infinita

Listagem e abas usam **IntersectionObserver** com ref sentinela:

```tsx
const loadMoreRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const el = loadMoreRef.current;
  if (!el || !hasNextPage || isFetchingNextPage) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) fetchNextPage();
    },
    { root: null, rootMargin: "100px", threshold: 0 },
  );
  observer.observe(el);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

// No JSX:
{hasNextPage && <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />}
```

Dados paginados são achatados com `flatMap`:

```tsx
const itens = data?.pages.flatMap((p) => p.data) ?? [];
```

---

## 9. Formulários

| Contexto | Padrão |
| -------- | ------ |
| Filtros da listagem | `useForm` + `FormProvider`, submit via botão "Filtrar" (`getValues`) |
| Cadastro / abertura | `useForm` + `zodResolver` + `CasoFormProvider` + `FormProvider` |
| Modais de feature | `useForm` local no modal, schema em `*-form-schema.ts` |

Campos reutilizáveis vêm de `@/components/fields/caso-form-*` via `CasoFormProvider`.

---

## 10. Permissões (RBAC)

Verificações de permissão ficam nos **entrypoints**, não nos subcomponentes:

```tsx
const canCreateProject = !permissionsLoaded() || hasPermission("create-project");
const canEditProject = !rbacReady || hasPermission("edit-project");
```

Códigos usados no módulo: `create-project` (também libera o Clonar da listagem, decisão #10), `edit-project`.

---

## 11. Como Adicionar uma Nova Aba de Edição

1. Criar pasta `edicao/<feature>/` com `index.tsx` exportando `Aba<Feature>`.
2. Adicionar adaptador fino em `edicao/abas/aba-<feature>.tsx` exportando `Aba<Feature>Tab`.
3. Registrar a aba em `projeto-edit-form.tsx` (tab trigger + `TabsContent` com `enabled`).
4. Criar hooks em `hooks/projetos/` (`use-sgp-<feature>-by-projeto`, mutations).
5. Se houver formulário modal: criar `*-form-schema.ts`, `*-form-utils.ts`, `*-form-modal.tsx`.
6. Criar `aba-<feature>-skeleton.tsx` para carga inicial.
7. Abas ainda não implementadas usam `aba-placeholder.tsx` como referência.

---

## 12. Como Adicionar um Campo ao Form de Abertura

1. Atualizar `cadastro/schema.ts` (Zod + tipo).
2. Atualizar `cadastro/utils.ts` (payload create/update).
3. Adicionar campo em `shared/projeto-abertura-form.tsx`.
4. Se necessário, ajustar `cadastro/constants.ts` (defaults).

---

## 13. Imports e Compatibilidade

- Preferir imports absolutos: `@/components/projetos/...`
- Feature folders exportam pelo `index.tsx`; consumidores importam da pasta:

  ```tsx
  import { AbaEscopo } from "@/components/projetos/edicao/escopo";
  ```

- Quando um arquivo cresce e vira pasta, manter **arquivo ponte** no path antigo (re-export) para não quebrar imports existentes — ver [docs/padrao-front/README.md](../padrao-front/README.md).

---

## 14. Checklist — Nova Feature no Módulo

### Estrutura
- [ ] Feature folder criada com `index.tsx` como entrypoint?
- [ ] Tipos em `*.types.ts`, utils puros em `utils.ts`?
- [ ] Schema Zod separado em `*-schema.ts` (se houver form)?
- [ ] Adaptador fino em `edicao/abas/` (se for aba de edição)?

### Dados
- [ ] Hooks criados em `hooks/projetos/` (não dentro de components)?
- [ ] Query keys registradas em `sgp-projeto-query-keys.ts`?
- [ ] Mutations invalidam queries relacionadas?

### UI
- [ ] Skeleton de carga inicial (`aba-*-skeleton.tsx`)?
- [ ] Skeleton de refetch (se houver filtros)?
- [ ] EmptyState quando lista vazia?
- [ ] Modais seguem trio schema + utils + modal?
- [ ] Permissões verificadas no entrypoint?

### Reutilização
- [ ] Componente compartilhado entre fluxos está em `shared/`?
- [ ] Tabela reutiliza `tabela/projetos-tabela-table.tsx` (se aplicável)?
- [ ] Form de abertura reutiliza `cadastro/schema.ts`?

---

## 15. Referências Cruzadas

| Documento | Conteúdo |
| --------- | -------- |
| [docs/padrao-front/README.md](../padrao-front/README.md) | Cards, cores, skeletons, empty states, layout responsivo |
| [docs/padrao-front/README.md](../padrao-front/README.md) | Quando e como decompor em feature folders |
| [docs/camada-de-dados/README.md](../camada-de-dados/README.md) | Padrões de chamadas à API |
| [docs/rbac/README.md](../rbac/README.md) | Permissões do sistema |

---

**Última atualização**: Junho 2025  
**Versão**: 1.0

---

## Histórico da implementação

### Clonar projeto (2026-11-19)

Planejado e implementado em 2026-11-19 (`/implementar projetos`): Fase 0, Parte 1 (dados e testes
na API de dev), Parte 2 (tela) e Parte 3 (este fechamento).

### Protótipo do clonar projeto

[`prototipo/softflow-prototipo.html`](prototipo/softflow-prototipo.html), menu **Projetos**. A
listagem do protótipo imita a do app (ID/Nome, Data de início, Data de fim, Status, Ações). A
lógica está em `pjVals` e `pjAbrirClone`, e a marcação em `<sc-if value="{{ isProjetos }}">` e
`<sc-if value="{{ pjcOn }}">`. Clonar com o nome de um projeto que já existe simula um erro da
API, só para mostrar o estado de erro (no app, quem decide é o backend, decisão #5).

| Captura | Estado |
|---------|--------|
| `capturas/01-projetos-listagem.png` | Listagem com o botão Clonar (ícone de cópia) antes do Editar |
| `capturas/02-clonar-modal-padrao.png` | Modal aberto com os padrões: nome "… - Clone", próximo período e duração |
| `capturas/03-clonar-modal-data-invalida.png` | Data de fim anterior ao início, com o erro no campo |
| `capturas/04-clonar-modal-erro-api.png` | Erro da API acima do rodapé, dados preservados, toast de erro |
| `capturas/05-projeto-clonado.png` | Depois do sucesso: toast e linha nova destacada com "Novo" e "Clonado do projeto #…" |
| `capturas/06-clonar-modal-mobile.png` | 390px: o modal ocupa a largura toda e fica preso embaixo, como os outros |

### Perguntas do planejamento (clonar projeto)

Respondidas na Fase 0 e na Parte 1: 1 → decisão #10; 2 → decisão #13; 3 e 5 → teste na API de dev (contrato acima: o clone já vincula os usuários; erros em 4xx com `message`, repassados como `{ error }`); 4 → decisões #9 e #14.

1. **Permissão:** usar `create-project` (recomendado: clonar cria um projeto, e não precisa de
   permissão nova nem seed) ou criar `clone-project` com seed em `db/scripts/`? Decisão do usuário.
2. **Nome duplicado:** o backend recusa um nome que já existe? Com que status e mensagem? Se não
   recusar, o usuário decide se isso fica assim.
3. **Usuários autorizados:** o cadastro faz `POST /sgp-usuarios` logo depois de
   `POST /sgp-cadastros` (`app/api/sgp-cadastros/route.ts`). O clone já vincula usuários ao projeto
   novo (o logado ou os da origem)? Conferir na aba de usuários do projeto clonado. Se não vincular,
   a rota de clonar faz o mesmo `POST /sgp-usuarios` com o usuário logado, e isso vira decisão nova.
4. **O que mais é copiado:** cronograma, riscos, stakeholders, usuários e casos da origem vêm para
   o projeto novo? Conferir clonando um projeto de teste que tenha esses dados. O texto informativo
   do modal e a decisão #9 dependem disso.
5. **Erro:** formato e status da resposta de erro da API (`success: false` com `message`? 4xx?).

### Perguntas do Claude Code (clonar projeto)

#### P1 — Permissão do clone · respondida → decisão #10

Fase: Fase 0 (2026-11-19). Contexto: é a pergunta 1 do planejamento. Hoje o módulo usa
`create-project` (`components/projetos/index.tsx`, `app/api/sgp-cadastros/route.ts`, seed em
`db/scripts/seed-create-project-rbac.sql`) e `edit-project`.
Opções: **A)** usar `create-project` no botão e no `withPermission` da rota nova. **B)** criar
`clone-project` com seed `db/scripts/seed-clone-project-rbac.sql` e atribuição aos papéis na UI.
Recomendação do Claude Code: **A**, porque clonar cria um projeto e quem pode cadastrar já pode
fazer o mesmo à mão; não exige seed nem configuração de papéis.
Resposta (2026-11-19, Claude Code): opção A, usar `create-project`.

#### P2 — Tokens do destaque da linha nova e do selo "Novo" · respondida → decisão #11

Fase: Fase 0 (2026-11-19). Contexto: o protótipo (captura 05, `pjVals`) pinta a linha clonada com
`--yellow-soft` e o selo "Novo" com fundo amarelo. Não há token semântico de "linha em destaque" em
`app/globals.css`, e o `CLAUDE.md` restringe o amarelo a CTA de marca. Os amarelos que existem são
do painel (`panel-badge-importance-yellow` / `-bg`) e da marca (`brand-yellow`).
Opções: **A)** criar tokens novos `row-highlight` (fundo da linha) e `badge-new` / `badge-new-bg`
(selo), light e `.dark`, num amarelo suave como o do protótipo, e registrar no `design-system.md`.
**B)** reaproveitar `panel-badge-importance-yellow-bg` na linha e `panel-badge-importance-yellow`
no selo, sem token novo. **C)** destaque neutro/azul com os tokens existentes (`bg-muted` na linha
e selo com `status-info`), sem amarelo.
Recomendação do Claude Code: **A**, porque mantém o visual aprovado no protótipo com nome
semântico próprio, sem amarrar a listagem de projetos a tokens do painel.
Resposta (2026-11-19, Claude Code): opção B, reaproveitar os amarelos do painel.

#### P3 — Onde conferir as perguntas 2 a 5 da API · respondida → decisão #12

Fase: Fase 0 (2026-11-19). Contexto: o plano manda conferir na Parte 1, "clonando um projeto de
teste". Cada teste cria um projeto de verdade na API Soft Flow apontada pelo `.env`, e não há
rota de exclusão de projeto no app. As respostas mudam a rota (vínculo em `/sgp-usuarios`,
pergunta 3), o texto do modal e a decisão #9 (pergunta 4).
Opções: **A)** o usuário indica um projeto de teste (registro) e autoriza o Claude Code a cloná-lo
pela rota nova, logado no app local, duas vezes (uma com sucesso, outra com nome repetido/datas
inválidas para ver o erro). **B)** o usuário faz os testes no Postman/Insomnia e responde as
perguntas 2 a 5 aqui. **C)** implementar as Partes 1 e 2 sem conferir: a rota repassa o erro da
API como vier (`extractApiError`), não faz `POST /sgp-usuarios` e o texto do modal fica como está;
corrige-se depois se o teste mostrar diferença.
Recomendação do Claude Code: **A**, porque responde tudo de uma vez pelo mesmo caminho que o
usuário final vai usar, com o mínimo de projetos criados.
Resposta (2026-11-19, Claude Code): opção A. A API do `.env` é a de desenvolvimento, e o Claude
Code pode fazer os testes de clone nela.

#### P4 — Nome repetido é aceito pela API · respondida → decisão #13

Fase: Parte 1 (2026-11-19). Contexto: é a pergunta 2 do planejamento. A API aceitou clonar com um
nome que já existe (#3313 e #3314 têm o mesmo nome; tabela no "Contrato da API Soft Flow"). Ela
recusa por **período** sobreposto a outro projeto aberto, não por nome. A decisão #5 diz que o
front não checa nome.
Opções: **A)** deixar assim: nome repetido passa, e a regra de período (que o backend já aplica)
evita a maioria dos duplicados de sprint. **B)** a rota consulta `GET /sgp-cadastros` pelo nome
antes de clonar e recusa com 422 "Já existe um projeto com esse nome". **C)** pedir ao backend
que recuse nome repetido (fora do escopo desta entrega).
Recomendação do Claude Code: **A**, porque o caso real (clonar a mesma sprint duas vezes) já é
barrado pela regra de período, e a API de listagem não tem filtro por nome para uma checagem
confiável no servidor.
Resposta (2026-11-19, Claude Code): opção A, nome repetido passa.

#### P5 — O clone perde o objetivo do projeto · respondida → decisão #14

Fase: Parte 1 (2026-11-19). Contexto: é a pergunta 4 do planejamento. A origem 3278 tem
`objetivo_id: 65`, e o clone #3313 voltou com `objetivo_id: 0` (o resto do cadastro, os usuários
autorizados e os stakeholders vieram iguais). O objetivo é editável na aba Abertura
(`PUT /sgp-cadastros/{id}` com `ObjetivoID`).
Opções: **A)** aceitar: o texto do modal avisa que o objetivo não é copiado, e o usuário preenche
na aba Abertura. **B)** a rota de clonar faz um `PUT /sgp-cadastros/{novo}` logo depois, repondo o
`ObjetivoID` da origem (o PUT exige o payload completo da Abertura, montado a partir do `data` do
clone). **C)** tratar como bug do backend e só registrar a pendência, sem aviso no modal.
Recomendação do Claude Code: **A** agora e avisar o backend, porque o PUT completo logo depois do
clone duplica a regra de montagem do payload na rota e pode sobrescrever campos se a API mudar.
Resposta (2026-11-19, Claude Code): opção A, o modal avisa e o backend fica como pendência.

Detalhe decidido pelo Claude Code (pergunta 4 do planejamento, sem conflito com decisões): o texto
informativo do modal passa a citar também usuários autorizados e stakeholders, já que a API os
copia. A decisão #9 continua valendo: os casos não vêm.

### Plano de implementação (clonar projeto)

1. **Parte 1: dados.** Rota `app/api/sgp-cadastros/[id]/clonar/route.ts`, tipos, service e hook.
   Conferir as perguntas 2 a 5 na API de teste, clonando um projeto de teste (não usar projetos
   reais de sprint).
2. **Parte 2: tela.** `components/projetos/clonar/` (modal, schema, utils), botão na linha, permissão
   no entrypoint, destaque da linha nova. Conferir no navegador: padrões do modal, erro de datas,
   erro da API, sucesso com destaque, tema escuro e 390px.
3. **Parte 3: fechamento.** README (tirar a seção da mudança planejada e documentar o clone no
   formato padrão), decisões, contexto, status e `docs/rbac/` se a permissão mudar.

### Andamento da implementação (clonar projeto)

Fase 0 concluída em 2026-11-19 (decisões #10 a #12). Detalhes decididos pelo Claude Code: datas com
`DatePickerInput` (o do cadastro e do cronograma); a linha clonada mostra também "Clonado do projeto
#…", como na captura 05; se a origem não tiver `data_fim`, as datas padrão do modal ficam vazias.

- [x] Parte 1: dados (rota, tipos, service, hook) e conferência das perguntas 2 a 5 na API de dev.
  Perguntas 3 e 5 respondidas pelo teste (tabela no contrato); 2 e 4 viraram P4 e P5. Validação:
  `npm run build` ok e `eslint` nos arquivos novos ok (o `npm run lint` do repositório está quebrado:
  `next lint` não existe no Next 16 e a chamada falha com "Invalid project directory").
- [x] Parte 2: tela (modal, schema, utils, botão na linha, permissão, destaque da linha nova).
  Conferido no navegador em 2026-11-19: padrões (origem 16–30/11 → 01–15/12, 15 dias), erro de
  ordem das datas, erro da API (período sobreposto, com toast e dados preservados; editar um campo
  apaga a mensagem), "Clonando..." com Esc bloqueado, sucesso criando o projeto de teste #3315
  com selo "Novo" e "Clonado do projeto #3278", tema escuro e 390px. O modal usa o `Dialog` do app
  (centralizado, largura toda no mobile), não o painel preso embaixo do protótipo. Na API de dev
  o clone levou cerca de 40 s para responder.
- [x] Parte 3: fechamento (README no formato padrão, decisões, contexto, status), 2026-11-19.

### Fora do escopo (clonar projeto)

Editar outros campos no clone, clonar vários projetos de uma vez, copiar casos (existe "Duplicar
casos"), clonar a partir da tela de edição e mudanças no backend.

### Aba Stakes em lista (2026-11-19)

Planejada e implementada em 2026-11-19 (`/implementar projetos`): Fase 0 (decisão #29), Parte 1
(dados e regras), Parte 2 (lista editável), Parte 3 (copiar, colar e importar) e Parte 4 (este
fechamento). Abaixo, a especificação como foi aprovada, as perguntas e o andamento.

#### Objetivo

Hoje a aba **Stakes** de `/projetos/[id]` mostra um card por stakeholder, e cada inclusão ou
alteração passa pelo `StakeFormModal`. Lançar a equipe de uma sprint leva muitos cliques. Esta
mudança troca os cards por uma **lista editável em linha**, no estilo de planilha, com salvar em
lote (decisões #16 a #23). Ela também traz o que o usuário fazia no Access: **copiar as linhas de
um projeto e colar em outro**, e **importar direto de outro projeto do mesmo setor** (decisões #24
a #26). O card **Usuários autorizados**, abaixo, não muda.

#### Protótipo

[`prototipo/softflow-prototipo.html`](prototipo/softflow-prototipo.html), atualizado em
2026-11-19. Para abrir a aba, vá em **Projetos** e clique no lápis de qualquer linha. Só a aba
Stakes está prototipada; as outras mostram "Aba fora deste protótipo". A lógica está em
`stkVals`, `stkImpVals`, `stkSalvar`, `stkAdd`, `stkCopiar` e `onPaste`, e as regras puras ficam
em `stkValida`, `stkComDuplicados`, `stkTsv` e `stkParse`. Os dados mockados estão em
`STK_SEED`, `STK_FUNCOES`, `STK_COLABS` e `stkDoProjeto`.

| Captura | Estado |
|---------|--------|
| `capturas/07-stakes-lista.png` | Lista com 10 stakeholders e o rodapé de totais (225h / 135h / 360h) |
| `capturas/08-stakes-linha-nova.png` | Uma linha alterada (faixa amarela) e uma nova (faixa azul), com "2 linhas não salvas" |
| `capturas/09-stakes-erro-repetido.png` | Salvar com colaborador repetido: borda vermelha e "Linha 11: Colaborador já está em outra linha" |
| `capturas/10-stakes-salvo.png` | Depois de salvar: toast "Stakeholders salvos: 1 novo e 1 alterado." |
| `capturas/11-stakes-copiado.png` | Toast do Copiar linhas |
| `capturas/12-stakes-colar-previa.png` | Ctrl+V com linhas copiadas: prévia com repetidos bloqueados e linha com problema |
| `capturas/13-stakes-importar-projeto.png` | Importar › De outro projeto, só com projetos do mesmo setor |
| `capturas/14-stakes-mobile.png` | 390px: a tabela rola na horizontal dentro do card |

O protótipo é referência de estrutura. As cores inline dele não entram no código: traduzir para
tokens ([`design-system.md`](../design-system.md)). Onde divergir das decisões, as decisões
vencem.

#### Comportamento

1. **Card "Stakeholders"**:
   - Header: ícone `Users`, título, selo "N pessoas" e "#registro · nome do projeto".
   - À direita: o aviso "N linhas não salvas" (bolinha amarela, só quando há), **Importar**
     (`Upload`), **Copiar linhas** (`Copy`), um divisor, **Adicionar linha** (`Plus`) e **Salvar**
     (primário, `Save`). Os quatro botões ficam visíveis (decisão #28).
   - Abaixo do header, uma linha de ajuda: "Horas por dia. Tab passa para o próximo campo, Enter
     na última linha cria outra, Ctrl+S salva e Ctrl+V com linhas copiadas abre a importação.
     Faixa azul: linha nova · faixa amarela: linha alterada."
2. **Tabela** (decisão #17): colunas Função, Colaborador, Planejada, Não planejada, Dias, Total,
   Observação e Excluir.
   - Função é um select com os tipos `STAKEHOLDERS` (`useSgpTipos`).
   - Colaborador é um combobox com busca e botão de limpar.
   - Planejada e Não planejada são horas **por dia**, `HH:MM` com máscara (`0600` vira `06:00`).
   - Dias é um número inteiro.
   - Total = (planejada + não planejada) × dias, só leitura.
   - Observação é texto livre e opcional.
   - Campos compactos (altura 32px). À esquerda de cada linha, uma faixa de 3px marca o estado:
     azul para nova, amarela para alterada, sem cor para salva.
3. **Rodapé de totais**: "Totais · N pessoas" e as somas de planejada × dias, não planejada × dias
   e total (ex.: 225h / 135h / 360h). Substitui o `StakesSummary`.
4. **Adicionar linha** (botão do header ou link "Adicionar linha" abaixo da tabela):
   - A linha nova entra no fim, com os **dias da linha anterior** e as horas em `00:00`.
   - O foco vai para a Função.
   - **Enter** num campo de texto da última linha cria outra linha. **Ctrl+S** salva (decisão #23).
5. **Salvar** (decisões #18 e #19):
   - Valida as linhas novas e alteradas: função, colaborador da lista, horas `HH:MM` com minutos
     abaixo de 60, dias ≥ 1, e **colaborador sem repetir** em outra linha (decisão #20).
   - Se houver erro, nada é enviado. Cada campo com erro fica com borda vermelha, e embaixo da
     linha aparece "Linha N: …". Toast: "Corrija N linha(s) antes de salvar."
   - Sem erro: `POST /sgp-stakes` para as novas e `PUT /sgp-stakes/{sequencia}` para as alteradas,
     uma chamada por linha. O botão mostra "Salvando...", e o resultado sai num toast só:
     "Stakeholders salvos: X novos e Y alterados."
   - Se alguma chamada falhar, as que deram certo ficam salvas, e as que falharam continuam
     marcadas, com a mensagem da API embaixo da linha (decisão #19).
   - Sem nada alterado, o toast diz "Nenhuma alteração para salvar."
6. **Excluir** (decisão #21): linha nova sai na hora. Linha salva abre o `ConfirmacaoModal` atual
   ("Excluir stakeholder") e chama o `DELETE` na hora, fora do lote.
7. **Descartar** (decisão #22): com linhas não salvas, Voltar, trocar de aba ou sair da tela abre
   "Descartar alterações?" (destrutivo). Confirmar volta as linhas para o que está gravado.
8. **Copiar linhas** (decisão #24):
   - Copia todas as linhas preenchidas como texto separado por tabulação (TSV), com o cabeçalho
     `Função  Colaborador  Planejada  Não planejada  Dias  Observação`.
   - Usa `navigator.clipboard.writeText` quando `window.isSecureContext`. Se não der, usa
     `document.execCommand("copy")` com um textarea oculto.
   - Toast: "N linhas copiadas. Cole com Ctrl+V na aba Stakes de outro projeto ou numa planilha."
9. **Colar** (decisão #25): na aba Stakes, um `paste` cujo texto tenha tabulação é interceptado e
   abre o modal **Importar** em "Colar linhas", já com o texto e a prévia. Não há botão "Colar".
   - A leitura aceita variações:
     - cabeçalho opcional (reconhecido por "Função" ou "Papel" na 1ª coluna);
     - função e colaborador sem diferenciar maiúsculas;
     - horas como `6`, `6:00`, `6h30` ou `06,30`;
     - dias só com dígitos.
   - Colunas por posição: Função, Colaborador, Planejada, Não planejada, Dias, Observação.
   - Linha sem tabulação vira "Linha N: colunas não estão separadas por tabulação".
10. **Importar** (modal "Importar stakeholders", decisão #26):
    - Duas opções no topo: **De outro projeto** (padrão quando aberto pelo botão) e **Colar
      linhas**.
    - De outro projeto: um select só com projetos do **mesmo setor** do projeto aberto, com a
      ajuda "Só aparecem projetos do setor X". Ao escolher, aparecem os stakeholders dele.
    - Colar linhas: um textarea (monospace) com a explicação do formato.
    - Prévia: uma linha por stakeholder, com checkbox, "FUNÇÃO · Colaborador" e "HH:MM + HH:MM por
      dia × N dias · observação". O resumo diz "X de Y linhas selecionadas · N repetidas
      bloqueadas".
    - **Repetidos bloqueados** (decisão #20): quem já está no projeto ("Já está no projeto") ou
      aparece duas vezes na própria lista ("Repetido nesta lista") fica sem checkbox ativo.
    - Linha com problema (ex.: "Escolha um colaborador da lista") aparece em vermelho, pode ser
      importada e entra com o erro já marcado na lista.
    - **Importar N linhas** acrescenta as escolhidas como linhas novas, que só são gravadas no
      Salvar. Toast: "N linhas importadas[, M com problema para corrigir]. Revise e clique em
      Salvar."
11. **Mobile** (decisão #27): a tabela mantém as colunas e rola na horizontal dentro do card
    (`min-w` ~1080px). O header quebra os botões em linhas.
12. Estados obrigatórios: skeleton espelhando a tabela (header + 6 linhas + rodapé) na carga,
    empty state "Nenhum stakeholder no projeto" com "Adicionar linha", e erro de carregamento com
    "Tentar de novo".

#### O que reaproveitar

- `hooks/projetos/use-create-sgp-stake`, `use-update-sgp-stake` e `use-delete-sgp-stake`, com as
  chaves de `sgpStakesQueryKeys`. Invalidar uma vez só no fim do lote, não a cada linha.
- `stake-form-utils.ts`: `formatHorasInputToSgpIso`, `formatMinutesToHorasInput`,
  `buildCreateSgpStakePayload` e `buildUpdateSgpStakePayload`. Adaptar para receber a linha.
  Nesta mudança o `Observacoes` passa a vir da linha. O `ProjetoAprovado` continua preservado no
  PUT e vai 0 no POST (decisão #17).
- `utils.ts`: `parseSgpHorasToMinutes`, `buildSgpTiposMap` e `formatHorasResumoTotais`.
- `maskHHMM` (`components/casos/edicao/producao/utils`) para a máscara de horas.
- Colaborador: a fonte de dados de `CasoFormDevAtribuido` (`useUsuariosProjetos`). O componente
  em si é feito para formulário de caso, então a célula precisa de uma versão compacta (combobox
  de 32px). Na Fase 0, ver se `ComboboxField` serve com `className`.
- Projetos do mesmo setor: `useSgpCadastros` com o parâmetro `setor` (`Setor` na API).
- Stakes do projeto de origem: `GET /sgp-stakes/projeto/{registro}` (mesmo service da aba).
- `ConfirmacaoModal` para excluir e descartar. Para o modal Importar, o esqueleto do
  `EscopoDuplicarCasosModal`.
- Formulário: react-hook-form com `useFieldArray` e um schema Zod de array, como manda o
  `CLAUDE.md`.

#### Arquitetura proposta

```text
components/projetos/edicao/stakes/
├── index.tsx                     orquestra: carrega todas as páginas, form com useFieldArray,
│                                 salvar em lote, descartar, atalhos (Ctrl+S, Enter, paste)
├── stakes-lista.tsx              card + header + tabela + rodapé
├── stake-linha.tsx               uma linha editável
├── stakes-lista-skeleton.tsx     (substitui aba-stakes-skeleton.tsx)
├── stakes-importar-modal.tsx     De outro projeto / Colar linhas + prévia
├── stakes-lista.types.ts         StakeLinha (key, sequencia?, idTipo, colaboradorId/Label,
│                                 planejada, naoPlanejada, dias, observacao, original)
├── stakes-lista-schema.ts        Zod por linha + array
└── stakes-lista-utils.ts         puro: stakeToLinha, linhaAlterada, duplicados, totais,
                                  gerarTsv, lerTsv (parse tolerante), linhaToPayload
mantidos: usuarios-autorizados-*.tsx, usuario-autorizado-form-modal.tsx, utils.ts,
          stake-form-utils.ts (adaptado)
saem:     stake-card.tsx, stakes-grid.tsx, stakes-summary.tsx, stake-form-modal.tsx,
          stake-form-schema.ts, stakes-card.tsx; stake-tipo-badge* se ficar sem uso
hooks/projetos/use-salvar-stakes-em-lote.ts   POST/PUT em sequência, resultado por linha,
                                              invalida sgpStakesQueryKeys no fim
```

#### Perguntas em aberto (resolver na Fase 0)

1. **Todas as linhas de uma vez:** `GET /sgp-stakes/projeto/{registro}` é paginado (`per_page`
   15, cursor). A lista precisa de todas as linhas para editar, calcular os totais e checar
   repetidos. Conferir o `per_page` máximo da API ou buscar as páginas em sequência até
   `has_more = false`. O mesmo vale para os stakes do projeto de origem no Importar.
2. **Nome → colaborador na colagem:** o texto colado traz o nome, e a API precisa do
   `suporte_id`. Conferir se `useUsuariosProjetos` devolve todos os colaboradores com nome
   único. Se houver nomes iguais, a linha deve vir com o problema "Mais de um colaborador com esse
   nome" para o usuário escolher.
3. **Função → `id_tipo`:** casar pelo nome do tipo `STAKEHOLDERS` (`useSgpTipos`), sem
   diferenciar maiúsculas. Conferir se os nomes são únicos.
4. **Projetos do setor no Importar:** `useSgpCadastros({ setor })` é paginado. Para o select,
   usar um combobox com busca (há muitos projetos por setor) e definir se entram Abertos e
   Fechados (proposta: os dois, mais recentes primeiro).
5. **Ordem da lista:** a API devolve em que ordem? Proposta: a ordem do GET, com as linhas novas
   no fim até salvar.

#### Perguntas do Claude Code (aba Stakes)

Fase 0 (2026-11-19), conferida no código e na API de dev (só leitura):

- **Pergunta 1 (todas as linhas):** a API aceita `per_page` alto (`per_page=1000` devolveu as 9
  linhas do 3278 com `has_more: false`). O teto não foi visto, então a busca pede páginas de 100
  em sequência até `has_more = false`, tanto na aba quanto nos stakes da origem no Importar.
- **Pergunta 2 (nome → colaborador):** `GET /auxiliar/usuarios?somente_projetos=false` devolve 541
  colaboradores (`id`, `nome_suporte`), **sem nome repetido** (comparando sem maiúsculas). Os
  `nomes` gravados nos stakes do 3278 batem com o `nome_suporte` do `suporte_id`. A colagem casa
  pelo nome; o problema "Mais de um colaborador com esse nome" fica como proteção para o futuro.
- **Pergunta 3 (função → `id_tipo`):** são 18 tipos `STAKEHOLDERS` (CONSULTOR, PO, TIME, GP, SM,
  SQA, GC, GP/PO, APOIO, GESTOR, SUB-GERENCIA, DIRETOR COMERCIAL, SUPERVISOR, LT, PM, QA, DEV, TECH
  LEAD), **sem nome repetido**. Casa pelo `Nomes` sem maiúsculas.
- **Pergunta 4 (projetos do setor):** `GET /sgp-cadastros?Setor=SQUAD XP` devolve 78 projetos
  (Abertos e Fechados), já do registro mais novo para o mais antigo. Segue a proposta: combobox com
  busca, Abertos e Fechados, mais recentes primeiro, sem o próprio projeto aberto.
- Detalhes decididos pelo Claude Code: o colaborador da célula usa o `ComboboxField` (aceita
  `controlHeightClassName="h-8"`, `hideLabel` e limpar); a lista segue a permissão atual da aba
  (`edit-project`): sem ela, a tabela fica só leitura e só "Copiar linhas" aparece; a faixa da
  linha nova usa `bg-status-info` e a da alterada `bg-panel-badge-importance-yellow` (tokens que
  já existem, o amarelo como na decisão #11); o aviso de descarte cobre trocar de aba, Voltar,
  clique em link do app (interceptado enquanto há linhas não salvas) e fechar/recarregar a página
  (`beforeunload`, com o aviso padrão do navegador).

##### P6 — Ordem da lista de stakeholders · respondida → decisão #29

Fase: Fase 0 (2026-11-19). Contexto: pergunta 5 do planejamento. A API devolve os stakes do **mais
novo para o mais antigo** (`sequencia` decrescente: 23341, 23340 … 23333 no projeto 3278). Com a
proposta "ordem do GET, novas no fim até salvar", as linhas que o usuário acabou de lançar no fim
pulam para o topo depois do Salvar.
Opções: **A)** ordem de inclusão (`sequencia` crescente): a mais antiga em cima, as novas no fim,
e continuam no fim depois de salvar. **B)** ordem do GET (mais nova em cima), com as novas no fim
só até salvar. **C)** ordenar por Função e depois por Colaborador, com as novas no fim até salvar.
Recomendação do Claude Code: **A**, porque a lista se comporta como planilha (o que foi lançado
por último fica embaixo) e nada muda de lugar ao salvar.
Resposta (2026-11-19, Claude Code): opção A, ordem de inclusão (`sequencia` crescente).

#### Plano de implementação

1. **Parte 1: dados e regras.** Busca de todas as páginas, `stakes-lista-utils.ts` (conversões,
   validação, repetidos, totais, `gerarTsv`/`lerTsv`), schema Zod e
   `use-salvar-stakes-em-lote`. Conferir as perguntas 1 a 3 na API de teste.
2. **Parte 2: lista editável.** `stakes-lista`, `stake-linha`, skeleton, salvar em lote com erro
   por linha, excluir, descartar ao sair, atalhos e mobile. Remover os cards e o modal antigos.
   Conferir no navegador: lançar 3 linhas só com teclado, erro de repetido, falha parcial
   (simulada), descarte ao trocar de aba.
3. **Parte 3: copiar, colar e importar.** Copiar linhas (com fallback), `paste` com TSV,
   `stakes-importar-modal` com as duas origens, prévia e repetidos bloqueados. Conferir copiando
   de um projeto e colando em outro, e colando do Excel.
4. **Parte 4: fechamento.** README (sair da seção de mudança planejada), decisões, contexto e
   status.

#### Andamento da implementação (aba Stakes)

Fase 0 concluída em 2026-11-19 (decisão #29; respostas das perguntas 1 a 4 em "Perguntas do Claude
Code (aba Stakes)").

- [x] Parte 1: dados e regras (busca de todas as páginas, `stakes-lista-utils.ts`, schema Zod,
  `use-salvar-stakes-em-lote`). Entregue em 2026-11-19: `useSgpStakesTodos` (páginas de 100 até
  `has_more = false`, chave sob o prefixo que `invalidateSgpStakesQueries` já cobre), regras puras
  em `stakes-lista-utils.ts` (ordem por `sequencia`, status, totais, validação com repetidos,
  `gerarTsv`/`lerTsv`, `marcarBloqueios`), `linhaToCreatePayload`/`linhaToUpdatePayload` em
  `stake-form-utils.ts` e `useSalvarStakesEmLote` (um POST/PUT por linha, sem parar na falha,
  invalida uma vez no fim). Conferido: checagens das regras com `tsx` (horas tolerantes, ida e
  volta do TSV, colagem do Excel, repetidos, payloads) e a paginação por cursor na API de dev
  (3278 com `per_page=2`: 5 páginas, 9 linhas sem repetir). Build e `eslint` ok.
- [x] Parte 2: lista editável (lista, linha, skeleton, salvar em lote, excluir, descartar, atalhos,
  mobile; remover cards e modal antigos). Entregue em 2026-11-19: `stakes-lista.tsx`,
  `stake-linha.tsx`, `stakes-lista-skeleton.tsx` e `index.tsx` com `useFieldArray`;
  `mesclarComServidor` junta a lista com o servidor depois de salvar/excluir sem perder o que não
  foi salvo; guarda de descarte em `edicao/shared/alteracoes-pendentes.tsx` (provider na edição:
  troca de aba, Voltar, clique em link do app e `beforeunload`). Saíram `stake-card`,
  `stakes-grid`, `stakes-summary`, `stakes-card`, `stake-form-modal`, `stake-form-schema`,
  `aba-stakes-skeleton` e `stake-tipo-badge*`. Conferido no navegador no projeto de teste #3315:
  linha lançada só pelo teclado (foco na Função, Tab, máscara, Enter na observação cria outra),
  repetido com borda vermelha e "Linha N: …", Ctrl+S, falha parcial simulada (PUT forçado a 500:
  a nova gravou, a alterada ficou amarela com a mensagem), descarte ao trocar de aba e ao clicar em
  link da barra lateral, excluir linha nova (na hora) e salva (confirmação + DELETE), erro de
  carga com "Tentar de novo" (a API de dev deu 500 passageiro) e 390px com rolagem só na tabela.
  O stake criado no teste foi excluído no fim. Observado: digitar rápido no seletor de Função
  aberto nem sempre aciona a busca por letra do Radix; setas e clique funcionam.
- [x] Parte 3: copiar, colar e importar. Entregue em 2026-11-19: botões Importar (`Upload`, só com
  `edit-project`) e Copiar linhas (`Copy`) no header; `area-de-transferencia.ts` (Clipboard API em
  contexto seguro, `execCommand("copy")` como reserva); `paste` com tabulação na aba abre o
  `stakes-importar-modal.tsx` em "Colar linhas" (ignorado dentro de outro diálogo); o modal tem
  "De outro projeto" (combobox com os projetos do setor, mais novos primeiro, Fechados marcados,
  sem o próprio) e "Colar linhas" (textarea monospace), prévia com checkbox, repetidos bloqueados
  e problemas em vermelho. Conferido no navegador: Copiar no #3315 (TSV com cabeçalho, 9 linhas,
  toast); colar esse texto no #3316 (evento `paste` disparado na página, já que o Ctrl+V simulado
  do painel não lê a área de transferência): 9 bloqueadas "Já está no projeto"; colagem estilo
  Excel sem cabeçalho (maiúsculas, `2h30`, repetido "Repetido nesta lista", colaborador fora da
  lista, linha sem tabulação, hora inválida) importada com "5 linhas importadas, 3 com problema
  para corrigir" e os erros embaixo das linhas; De outro projeto com o #2931 (Fechado): 77
  projetos do SQUAD XP, "1 de 8 linhas selecionadas · 7 repetidas bloqueadas" (conta também as
  linhas ainda não salvas); reserva do copiar com `isSecureContext` falso. As linhas importadas no
  teste foram descartadas (nada gravado no #3316). Não exercitado aqui: Ctrl+V real do teclado e
  salvar linhas importadas (o salvar é o mesmo da Parte 2).
- [x] Parte 4: fechamento (README, decisões, contexto, status), 2026-11-19.

#### Fora do escopo

Editar "Aprovou" (`projeto_aprovado`), horas de risco e ocorrência gerada. Importar de projeto de
outro setor. Desfazer exclusão. Mudanças no card Usuários autorizados e no cadastro
`/projetos/novo`.

