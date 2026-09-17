# Cadastro de Produto — estrutura de dados para protótipo

Brief para **Claude Design**. Fonte de verdade dos campos disponíveis no módulo de cadastro de Produto (Softflow).

Usar junto com `DESIGN_SYSTEM.md` e `BRIEF_CLAUDE_DESIGN.md`. Idioma da UI: **pt-BR**. Visual: ferramenta interna (sidebar + header + cards), densidade compacta, sem hero.

Este arquivo descreve **o que a API entrega hoje**. Ainda não há POST/PUT/DELETE neste briefing — o protótipo pode prever ações de criar/editar, mas os campos abaixo são os que existem para listar e detalhar.

---

## 1. O que é este módulo

**Produto** é uma linha de software Softcom (ex.: Smart, API Smart TEF). Quase tudo no Softflow (casos, liberações, versões) se amarra a um produto.

O cadastro de produto agrupa:

| Recurso | O que é |
| --- | --- |
| **Produto** | Cadastro mestre (nome, PO, Scrum Master, setor, flags, responsáveis) |
| **Versões** | Releases do produto (número da versão, status aberto/fechado, datas, notas) |
| **Módulos** | Subprodutos / módulos (Smart PDV, Smart TEF, Totem, etc.) |
| **Checklist** | Itens de rotina na liberação (quem faz o quê, em que ordem) |
| **Scripts** | Procedimentos operacionais (texto longo: como subir ambiente, organizar estoque, etc.) |

Vocabulário: usar **Produto**, **Versão**, **Módulo**, **Checklist**, **Script**. Não chamar de “projeto” (projeto no Softflow é outro módulo, o SGP).

---

## 2. Telas sugeridas

### 2.1. Listagem — `/produtos`

- Título da página: **Produtos**
- Filtros no card (grid 1 → 2 sm → 4 lg):
  - **Nome do produto** (texto, filtro `NomeProjeto`)
  - **Setor** (texto/select, filtro `Setor`)
- Tabela com infinite scroll (paginação por cursor)
- Clique na linha abre o detalhe

Colunas sugeridas na tabela (não precisa mostrar todos os campos):

| Coluna | Campo | Exemplo |
| --- | --- | --- |
| Registro | `Registro` | 205 |
| Nome | `NomeProjeto` | Smart (Softcom Smart) |
| Setor | `Setor` | SQUAD XP |
| PO | `PO` | Luiz |
| Scrum Master | `ScrumMaster` | Mendonça |
| Data | `DataProjeto` | 19/06/2020 |
| Status | `Desativado` | Ativo / Desativado |

### 2.2. Detalhe — `/produtos/[id]`

Cabeçalho com nome do produto + registro. Abaixo, **abas** (o detalhe é o mesmo objeto da listagem; as abas são listas filhas):

1. **Dados gerais** — ficha do produto (`ProdutoData`)
2. **Versões** — tabela de `ProdutoVersaoData`
3. **Módulos** — tabela/lista de `ProdutoModuloData`
4. **Checklist** — lista ordenável de `ProdutoChecklistData`
5. **Scripts** — lista de cards (descrição + procedimento em texto longo)

Estados obrigatórios em cada aba: **skeleton**, **vazio**, **com dados**.

---

## 3. Paginação (todas as listagens)

Todas as listas (produtos, versões, módulos, checklist, scripts) usam o mesmo envelope:

```json
{
  "success": true,
  "data": [ /* itens */ ],
  "pagination": {
    "per_page": 15,
    "next_cursor": "string | null",
    "prev_cursor": null,
    "has_more": false
  }
}
```

| Campo | Tipo | Uso no protótipo |
| --- | --- | --- |
| `per_page` | number | Página padrão 15 itens |
| `next_cursor` | string \| null | Carregar mais (infinite scroll) |
| `prev_cursor` | string \| null | Voltar página (raro na UI) |
| `has_more` | boolean | Mostrar “carregar mais” / sentinel de scroll |

O detalhe do produto **não** tem paginação: `{ success, data: { ...produto } }`.

---

## 4. Produto (cadastro mestre)

Filtros da listagem: `NomeProjeto` (opcional), `Setor` (opcional).

Detalhe: mesmo objeto, um único registro.

### Campos

| Campo API | Tipo | Nulo? | Label sugerida | Notas para o protótipo |
| --- | --- | --- | --- | --- |
| `Registro` | number | não | Registro | ID. Exibir como `#205` |
| `DataProjeto` | string datetime | não | Data do cadastro | `"2020-06-19 13:41:11"` → formatar `dd/MM/yyyy HH:mm` |
| `NomeProjeto` | string | não | Nome do produto | Título principal. Ex.: `Smart (Softcom Smart)` |
| `PO` | string | não | Product Owner | Nome, não ID. Ex.: `Luiz` |
| `ScrumMaster` | string | não | Scrum Master | Nome. Ex.: `Mendonça` |
| `Setor` | string | não | Setor | Ex.: `SQUAD XP` |
| `Comercial_Necessidades_ID` | number \| null | sim | Necessidade comercial | ID; se null, mostrar “—” |
| `Responsavel_Suporte` | string | não | Responsável suporte | Texto/setor. Ex.: `SQUAD XP` |
| `Responsavel_Parametrizacao` | string | não | Responsável parametrização | Texto/setor. Ex.: `SQUAD XP` |
| `Desativado` | boolean | não | Desativado | Switch / badge Ativo vs Desativado |
| `MostrarConsulta` | boolean | não | Mostrar na consulta | Switch |
| `MostrarTeste` | boolean | não | Mostrar em teste | Switch |
| `VinculadoA` | number | não | Vinculado a | ID de outro produto (0 = nenhum). Ex.: `205` ou `0` |
| `FAQExibir` | boolean | não | Exibir FAQ | Switch |
| `InformacoesTecnicas` | string \| null | sim | Informações técnicas | Texto longo / textarea. Pode ser vazio |
| `CalcularBurnDown` | boolean | não | Calcular burndown | Switch |
| `responsavel_bugs_suporte_id` | number \| null | sim | Responsável bugs (suporte) | ID de colaborador. Ex.: `1995` |
| `responsavel_melhorias_suporte_id` | number \| null | sim | Responsável melhorias (suporte) | ID de colaborador. Ex.: `2384` |
| `vacaLeiteira` | number | não | Vaca leiteira | Flag numérica. Ex.: `0` ou `-1`. Tratar como indicador, não como texto livre |

### Exemplo (detalhe)

```json
{
  "Registro": 205,
  "DataProjeto": "2020-06-19 13:41:11",
  "NomeProjeto": "Smart (Softcom Smart)",
  "PO": "Luiz",
  "ScrumMaster": "Mendonça",
  "Setor": "SQUAD XP",
  "Comercial_Necessidades_ID": null,
  "Responsavel_Suporte": "SQUAD XP",
  "Responsavel_Parametrizacao": "SQUAD XP",
  "Desativado": false,
  "MostrarConsulta": false,
  "MostrarTeste": true,
  "VinculadoA": 205,
  "FAQExibir": false,
  "InformacoesTecnicas": null,
  "CalcularBurnDown": true,
  "responsavel_bugs_suporte_id": 1995,
  "responsavel_melhorias_suporte_id": 2384,
  "vacaLeiteira": -1
}
```

Outros exemplos de nome para a listagem: `Smart Express`, `API Smart TEF`.

---

## 5. Versões do produto

Filtro obrigatório: `Registro` (id do produto). Paginação por cursor (`has_more` pode ser `true`).

### Campos

| Campo API | Tipo | Nulo? | Label sugerida | Notas |
| --- | --- | --- | --- | --- |
| `Sequencia` | number | não | Sequência | ID da versão. Ex.: `4734` |
| `Registro` | number | não | Produto | FK do produto. Ex.: `205` |
| `DataVersao` | string datetime | não | Data da versão | `"2026-09-15 19:37:51"` |
| `Versao` | string | não | Versão | Título da linha. Ex.: `8.1.1.0` |
| `DataAberturaProjeto` | string datetime | não | Abertura | `"2026-09-16 00:00:00"` — date picker |
| `DataFechamentoProjeto` | string datetime \| null | sim | Fechamento | `null` se ainda aberta |
| `MostrarPlanejamento` | boolean | não | Mostrar no planejamento | Switch |
| `Status` | string | não | Status | Valores vistos: `ABERTO`, `FECHADO`. Badge: aberto = azul, fechado = cinza/verde |
| `Release` | number | não | Release | Ex.: `1` |
| `HomemDiaHora` | number \| null | sim | Homem/dia hora | Métrica; se null, “—” |
| `NotasdaVersao` | string \| null | sim | Notas da versão | Texto. Ex.: `HOTFIX Muccini e Lasca de Pizza`, `Totem + Smart TEF + AutoPagamento` |
| `VersaoBanco` | string \| null | sim | Versão do banco | |
| `Helptools` | boolean | não | Helptools | Switch / badge |
| `VersaoBancoMesas` | string \| null | sim | Versão banco mesas | |
| `testador_id` | number \| null | sim | Testador | ID de colaborador. Ex.: `1995` |
| `estacionamento_ideias` | boolean | não | Estacionamento de ideias | Switch |

### Exemplos de linhas

| Versão | Status | Abertura | Fechamento | Notas |
| --- | --- | --- | --- | --- |
| 8.1.1.0 | ABERTO | 16/09/2026 | — | — |
| 8.0.2.0 | ABERTO | 15/09/2026 | 30/09/2027 | Serviço de Impressão + Desconto na Comanda |
| 7.1.3.0 | FECHADO | 14/07/2026 | 05/08/2026 | REPORTS |
| 8.0.0.0 | FECHADO | 19/03/2026 | 01/09/2026 | Totem + Smart TEF + AutoPagamento |

---

## 6. Módulos do produto

Filtro obrigatório: `Registro` (id do produto). Paginação por cursor.

Há hierarquia possível: `Parent_ID` + `Nivel` (nos dados atuais todos estão em nível 0, sem pai). O protótipo pode ser **lista plana**; se quiser antecipar árvore, indentar filhos.

### Campos

| Campo API | Tipo | Nulo? | Label sugerida | Notas |
| --- | --- | --- | --- | --- |
| `Sequencia` | number | não | Sequência | ID do módulo. Ex.: `891` |
| `Registro` | number | não | Produto | FK |
| `NomeModulo` | string | não | Nome do módulo | Título. Ex.: `SMART PDV` |
| `OrdemImpressao` | number \| null | sim | Ordem de impressão | |
| `Nivel` | number | não | Nível | `0` = raiz |
| `Parent_ID` | number \| null | sim | Módulo pai | `null` = raiz |
| `Descricao` | string \| null | sim | Descrição | Texto |
| `LocalArquivo` | string \| null | sim | Local do arquivo | Path |
| `Versionado` | boolean | não | Versionado | Switch |
| `Atualizador` | boolean | não | Atualizador | Switch |

### Exemplos de nomes

`SMART AUTOPAGAMENTO`, `SMART TEF`, `TODOS`, `SMART PDV`, `SMART MINIMERCADO`, `SMART PRE-VENDA`, `SMART PADRÃO`, `SMART TOTEM`, `SMART COMANDA`.

---

## 7. Checklist do produto

Filtro obrigatório: `Projeto_Versoes_ID` (id do produto — mesmo valor de `Registro`). Paginação por cursor.

Lista curta, ordenável por `Ordenacao`. Cada item tem um responsável (id de colaborador).

### Campos

| Campo API | Tipo | Nulo? | Label sugerida | Notas |
| --- | --- | --- | --- | --- |
| `ID` | number | não | ID | Ex.: `246` |
| `Projeto_Versoes_ID` | number | não | Produto | FK. Ex.: `205` |
| `DescricaoItem` | string | não | Item | Texto da tarefa |
| `Ordenacao` | number | não | Ordem | Usar para ordenar a lista. Ex.: `1`, `2`, `3` |
| `id_responsavel` | number \| null | sim | Responsável | ID de colaborador. Ex.: `1995`, `2384`. No protótipo pode mostrar avatar + nome fictício |

### Exemplos

| Ordem | Item | Responsável (id) |
| --- | --- | --- |
| 1 | Rodar roteiro de automação de testes | 1995 |
| 2 | Subir APK no Helptools | 2384 |
| 3 | Lançar comunicado de liberação | 2384 |

UI sugerida: lista vertical (não tabela larga), número da ordem à esquerda, descrição, responsável à direita. Checkbox visual é opcional — a API de leitura **não** traz campo de concluído.

---

## 8. Scripts do produto

Filtro obrigatório: `projetoVersoes_id` (id do produto). Paginação por cursor.

Cada script é um **procedimento longo** (várias linhas, quebras `\r\n`, às vezes URLs). Não cabe bem em tabela: usar **lista de cards** expansíveis (título = `descricao`, corpo = `procedimento` em texto pré-formatado / wrap).

Ordenar por `ordenador` quando não for `null`; itens sem ordem vão no fim.

### Campos

| Campo API | Tipo | Nulo? | Label sugerida | Notas |
| --- | --- | --- | --- | --- |
| `id` | number | não | ID | Ex.: `19` |
| `projetoVersoes_id` | number | não | Produto | FK |
| `descricao` | string | não | Título | Uma linha. Ex.: `Como Levantar o Ambiente de Teste` |
| `procedimento` | string | não | Procedimento | Texto longo, multiline. Preservar quebras de linha |
| `ordenador` | number \| null | sim | Ordem | `1`, `2`, `3`, `4` ou `null` |

### Exemplos de títulos (corpo omitido no protótipo — usar lorem de 4–8 linhas)

1. Como Levantar o Ambiente de Teste  
2. Endereço do servidor de Testes e Banco de Dados  
3. Substituir o banco de dados atual por um zerado  
4. Organizar Estoque Geral  
5. Levantar Ambiente de Teste (Alternativo) — sem ordem (`ordenador: null`)

Não colocar senhas, IPs internos ou credenciais no protótipo. Usar placeholders (`usuário`, `senha`, `https://exemplo.softcom...`).

---

## 9. Relação entre recursos

```
Produto (Registro)
  ├── Versões          filtro Registro
  ├── Módulos          filtro Registro
  ├── Checklist        filtro Projeto_Versoes_ID   (= Registro do produto)
  └── Scripts          filtro projetoVersoes_id    (= Registro do produto)
```

O id do produto é o mesmo número nas quatro listas filhas. Nomes do parâmetro na API são inconsistentes (`Registro` vs `Projeto_Versoes_ID` vs `projetoVersoes_id`) — no protótipo isso não importa: é sempre “este produto”.

Colaboradores aparecem só como **ID** (`testador_id`, `id_responsavel`, `responsavel_bugs_suporte_id`, `responsavel_melhorias_suporte_id`). No protótipo, mostrar chip com nome fictício + id, não um campo numérico cru.

---

## 10. Booleans e badges

| Conceito | true | false |
| --- | --- | --- |
| `Desativado` | badge **Desativado** (cinza) | badge **Ativo** (verde) |
| `Status` da versão | — | `ABERTO` azul / `FECHADO` neutro |
| Switches | `MostrarConsulta`, `MostrarTeste`, `FAQExibir`, `CalcularBurnDown`, `MostrarPlanejamento`, `Helptools`, `estacionamento_ideias`, `Versionado`, `Atualizador` | |

Botão primário da aplicação é **escuro**, não amarelo. Amarelo só como acento de marca pontual.

---

## 11. Prompt curto para o Claude Design

> Protótipo Softflow (pt-BR): cadastro de **Produto**. Duas telas. (1) Listagem `/produtos`: título Produtos, card de filtros (Nome do produto + Setor), tabela com Registro, Nome, Setor, PO, Scrum Master, Data, badge Ativo/Desativado; infinite scroll. (2) Detalhe `/produtos/[id]`: header com nome + #registro; abas Dados gerais, Versões, Módulos, Checklist, Scripts. Dados gerais = ficha (nome, PO, Scrum Master, setor, responsáveis, switches, informações técnicas). Versões = tabela (versão, status ABERTO/FECHADO, datas, notas, helptools). Módulos = lista de nomes tipo SMART PDV / SMART TEF. Checklist = lista ordenada de tarefas com responsável. Scripts = accordion de procedimentos longos. Shell Softflow: sidebar + header 64px, cards brancos compactos, skeleton e empty state em cada aba. Sem credenciais no conteúdo de scripts.

---

**Referências visuais:** `docs/DESIGN_SYSTEM.md`, `docs/BRIEF_CLAUDE_DESIGN.md`, `docs/CONTEXTO_SOFTFLOW.md`.
