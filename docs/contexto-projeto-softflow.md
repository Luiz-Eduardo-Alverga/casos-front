# Softflow — contexto do produto

Documento de briefing para Claude (Chat, Design ou Code) e para qualquer pessoa que precise do contexto inicial do que a aplicação é, para quem serve e como está organizada.

Não substitui a documentação de cada funcionalidade em `docs/<slug>/` (índice no fim deste
arquivo) nem o visual em [`design-system.md`](design-system.md). O estado de cada entrega (✅ /
🟡 / ❌ / 📋) fica em [`status-projeto-softflow.md`](status-projeto-softflow.md).

---

## O que é

O **Softflow** é o sistema interno da **Softcom** para operar o ciclo de desenvolvimento, suporte e entrega de software. Não é um produto de marketing nem um SaaS genérico: é a ferramenta do dia a dia de desenvolvedores, QA, product owners, suporte e gestores.

A Softcom desenvolve software para o mercado de **pagamentos e PDV (Smart POS)**. O Softflow organiza o trabalho em torno de **produtos**, **versões**, **projetos**, **clientes** e **adquirentes** (Cielo, Rede, Stone etc.).

Tom do produto: corporativo, denso, funcional. Tudo em **português (Brasil)**. Visual de ferramenta de trabalho: sidebar + header + cards brancos, sem hero, sem dashboard genérico colorido.

URL de produção de referência: `https://softflow.softcom.services`.

O repositório deste front é `casos-front`. O produto visível para o usuário se chama **Softflow**.

---

## Problema que resolve

O time gerencia ocorrências, projetos e liberações via API legado **Soft Flow / SGP**. O Softflow é o **front moderno** dessa operação: listar, filtrar, abrir, acompanhar, atribuir, testar, liberar e auditar — com permissões por papel.

O usuário típico precisa responder, em segundos:

- O que está aberto comigo / no meu setor / no meu produto?
- Qual caso ou report preciso tratar agora?
- O que entra na próxima versão / liberação?
- Qual cliente está afetado e qual o prazo?
- Quem gastou horas em quê?

---

## Vocabulário de domínio

Usar exatamente estes termos. Não traduzir para Jira, Linear, GitHub Issues ou vocabulário genérico de ticket.

| Termo | Significado |
| --- | --- |
| **Caso** | Unidade de trabalho de desenvolvimento (bug, ajuste, tarefa). Tem número de registro, produto, versão, projeto, importância, categoria, módulo, origem, relator, dev atribuído, QA, status. Fluxo típico: Aberto → Corrigido → (Retorno do QA) → Concluído. |
| **Report** | Ocorrência vinda de cliente/suporte, com SLA e análise. É um caso com `tipo_abertura = REPORT`. Tem prioridade, responsável de suporte, Product Owner/QA, data limite (dias úteis, fuso São Paulo), status de análise. Pode virar **ocorrência** (caso de desenvolvimento) depois da análise. |
| **Projeto** | Cadastro SGP de um projeto: abertura, escopo (casos/reports vinculados), riscos, stakeholders, cronograma. |
| **Liberação** | Registro de release de um produto: versão piloto, versão final, flags, checklist e casos da versão. Pode ser encerrada. |
| **Produto** | Linha de software Softcom (ex.: um app Smart). Quase tudo é filtrado por produto. |
| **Versão** | Release do produto (sequência/nome). Casos e liberações se amarram a versão. |
| **Setor** | Área da empresa (dev, QA, suporte etc.). Muitos painéis filtram pelo setor do usuário logado. |
| **Adquirente** | Bandeira/adquirente de pagamento no contexto Smart POS. Cadastro próprio + kanban de status de homologação. |
| **Cliente** | Cliente Softcom (empresa). Tem dados cadastrais, produtos/URLs, casos e tickets vinculados. |
| **Memória / projeto-memória** | Fonte da API que lista casos/reports (o “feed” operacional). |
| **Assistant / Prompts IA** | Assistente que ajuda a preencher descrição de caso/report a partir de um texto livre. Prompts são cadastráveis em Configurações. |

Não chamar caso de “ticket” na UI (ticket existe só no contexto de cliente, como aba à parte). Não chamar report de “bug”. Não inventar nomes novos para esses conceitos.

**Relação importante:** report e caso compartilham o mesmo backend de `projeto-casos`. A diferença é o tipo de abertura e os campos/fluxos extras de análise e SLA.

---

## Personas e permissões

Acesso é **RBAC** (`modulo.acao`, ex.: `list-case`, `list-report`, `list-painel-dev`). A sidebar e as ações somem conforme o papel. Após o login, cada usuário cai na primeira tela que tem permissão (painel do dev, minha visão, casos, projetos, auditoria, cadastros ou avisos). Detalhe em `docs/rbac/README.md`.

Personas principais:

1. **Desenvolvedor** — Painel Kanban (o que está comigo), abrir/editar casos, arrastar status, horas.
2. **QA / Product Owner** — Reports para analisar (aprovar, incompleto, suspender), casos para testar, retornos.
3. **Suporte** — Abrir reports, vincular cliente, acompanhar SLA e prazos.
4. **Gestor / coordenação** — Painel Minha Visão (KPIs, distribuição, prazos de clientes, liberações, ideias), projetos, auditoria de horas.
5. **Admin** — Usuários, perfis de acesso, prompts de IA, cadastros Smart.

---

## Módulos atuais

Navegação em três blocos: **painéis pessoais**, **gerenciar** e **recursos**.

### Painéis

- **Avisos** (`/avisos`) — notificações internas, lista + detalhe, filtro por período. Envio de
  avisos (comunicados para a empresa toda, por filtros ou para usuários específicos) está
  especificado em `docs/avisos/` e ainda não implementado.
- **Painel do desenvolvedor** (`/painel`) — Kanban operacional do dev. Colunas: **Abertos / Corrigidos / Retornos / Concluídos**. Filtros (produto, projeto, setor, agenda), drag-and-drop persiste status, infinite scroll, modal de resumo do caso. É a “home” de quem desenvolve. Detalhe em `docs/painel-desenvolvedor/README.md`.
- **Indicadores** (`/painel/indicadores`) — premiação e metas do período por colaborador (baseline, recálculo); ver outros colaboradores exige `list-indicadores-all`.
- **Painel Minha Visão** (`/painel/minha-visao`) — visão gerencial: KPIs, casos para testar, casos em produção, prazos de clientes, próximas/últimas liberações, painel de ideias. Filtros de setor/produto/projeto/versão.

### Operação (Casos e Reports)

- **Casos** (`/casos`) — listagem filtrável com tabela e infinite scroll. Criação em `/casos/novo` (form em 2 colunas + modo rápido + anexos + Assistant). Edição em `/casos/[id]` com abas: **Inicial, Anotações, Relações, Clientes, Produção, Anexos, Histórico**. Coluna lateral com status, classificação e ações (transferência, abrir ocorrência quando faz sentido). Há indicador de caso em produção. Padrão de pastas em `docs/casos/README.md`.
- **Reports** (`/reports`) — fila de análise (lista ou tabela + detalhe). Ações: **aprovar**, **marcar incompleto**, **suspender** (com anotação). Criação em `/reports/novo` (produto, categoria, prioridade/SLA, ocorrência inicial, PO/QA, responsável suporte, vínculo com cliente). Um report concluído pode notificar no Discord. Edição reutiliza a tela de caso quando já existe registro, com layout específico de report.

### Projetos e entrega

- **Projetos** (`/projetos`) — listagem, cadastro (`/projetos/novo`) e edição (`/projetos/[id]`) com abas: **Abertura, Escopo, Risco, Stakeholders, Cronograma**. Escopo lista casos/reports da memória do projeto (badges de status, origem caso vs report). Padrão de pastas em `docs/projetos/README.md`.
- **Liberações** (`/liberacoes`) — registro de release: versões piloto vs final e casos vinculados por produto. Detalhe em `/liberacoes/[registro]` com abas **Liberação** (identidade, piloto, versão final, flags, encerrar), **Casos da versão** e **Checklist**.
- **Melhorias** (`/melhorias`) — tela de ideias/melhorias por produto, setor e período, disponível na navegação principal.

### Clientes e cadastros Smart

- **Clientes** (`/clientes`) — busca por nome (obrigatória para listar). Detalhe (`/clientes/[id]`): dados gerais, contato, endereço, produtos/URLs, abas de **casos** e **tickets**.
- **Produtos** (`/produtos`) — cadastro de linhas de software Softcom: listagem, novo (`/produtos/novo`) e detalhe (`/produtos/[id]`) com abas **Dados gerais, Versões, Módulos, Checklist, Scripts**. Padrão de pastas em `docs/produtos/README.md`.
- **Cadastros Smart** — Adquirentes, Versões, Dispositivos (CRUD em Postgres próprio).
- **Kanban Adquirentes** (`/cadastros/adquirentes/status`) — board do status de homologação/integração de adquirentes.
- **Documentação** (`/documentacao`) — base de conhecimento técnico e de processo, com categorias, tags, vínculos com entidades do Softflow, histórico e conteúdo Markdown sanitizado. Cadastro e edição exigem permissões próprias. Padrão de pastas em `docs/documentacao/README.md`.

### Gestão

- **Auditoria de horas** (`/auditoria/horas-colaboradores`) — análise de produção/horas por projeto e colaborador (pode auditar só a si ou todos, conforme permissão).
- **Configurações** — Usuários, Perfis de acesso (RBAC), Prompts IA do Assistant.

Integrações laterais (não são telas, mas fazem parte da experiência):

- **Discord** — DM ao dev quando um caso é aberto/clonado; aviso quando report é concluído.
- **Assistant** — preenchimento assistido de descrição de caso/report.
- **Anexos** — upload no S3 da Softcom (presign/multipart pelo servidor), para casos e documentação.

---

## Padrões de tela (para prototipar)

Shell estável em todas as telas autenticadas. Fonte de verdade visual: [`design-system.md`](design-system.md); padrões de código em [`padrao-front/`](padrao-front/README.md).

- **Sidebar** esquerda (expandida ~256px / colapsada ~64px), escura, com logo Softflow.
- **Header** fixo 64px, branco.
- Conteúdo com padding 24px e espaço no topo para não ficar sob o header.
- Fundo da página cinza-azulado muito claro; **cards brancos** `rounded-lg` com sombra leve.
- Densidade compacta. Cards com header (ícone 14px + título sm semibold) e conteúdo.
- Idioma: pt-BR. Empty state + skeleton em toda listagem.
- Desktop: scroll **dentro dos cards**, não na página inteira. Mobile: coluna única.

Layouts recorrentes:

1. **Listagem / painel** — título + subtítulo + ações no header da página; card de filtros (grid até 4 colunas); card de tabela/lista; infinite scroll.
2. **Cadastro** — página rolável, 2 colunas (principal + lateral ~362px), rodapé/ações.
3. **Edição com abas** — tabs no topo, cards empilhados, coluna lateral quando for caso/report, rodapé fixo de salvar quando necessário.

Badges de status (pílula):

- Abertos: azul
- Corrigidos / concluídos: verde
- Retornos: laranja/vermelho
- Importância: amarelo

Acento de marca: amarelo dourado (login, destaques pontuais). Botão primário é **escuro**, não amarelo em toda parte.

Não fazer: hero, glassmorphism, “AI purple”, sombras fortes, dashboards genéricos de stats, cores hex soltas fora da paleta.

Protótipos devem parecer **tela nativa do Softflow**, não um redesign da marca. Criatividade no fluxo; fidelidade no visual.

---

## Arquitetura (o suficiente para não prototipar o impossível)

- Front: **Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui + TanStack Query + react-hook-form + Zod**.
- Duas origens de dados:
  1. **API Soft Flow** (legado): casos, reports, projetos, usuários, catálogos (produtos, versões, status, clientes Softcom, visão gerencial, etc.). O Next faz proxy (`/api/...`). Ver [`camada-de-dados/`](camada-de-dados/README.md).
  2. **Postgres (Supabase) via `/api/db`**: cadastros Smart, RBAC, documentação, metadados de anexos e dados nativos do Softflow. Ver [`camada-de-dados/`](camada-de-dados/README.md).
- Arquivos de anexo: S3 da Softcom, só pelo servidor.
- IA: serviço externo **Assistant** (preenchimento de caso/report, release notes, análise de produção, prompts). Ver [`assistente-ia/`](assistente-ia/README.md).
- Auth: login na API Soft Flow → cookie HttpOnly `casos_token` + permissões no cliente. Ver [`autenticacao/`](autenticacao/README.md) e [`rbac/`](rbac/README.md).
- Deploy: Docker Swarm na VPS, disparado por push na `master`. Ver [`deploy/`](deploy/README.md).

Ao prototipar, respeitar o que o sistema já sabe persistir. Fluxos novos podem exigir API nova — deixar isso explícito no protótipo (campo/ação vs. “ainda não existe no backend”).

---

## Como usar este documento no Claude

Este arquivo existe para **definir o próximo ciclo do Softflow**: funcionalidades, melhorias, fluxos e protótipos de tela.

Ao trabalhar a partir daqui:

1. Fale a língua do produto (caso, report, liberação, produto, versão, setor).
2. Protótipos devem parecer tela nativa do Softflow. Criatividade no fluxo; fidelidade no visual.
3. Sempre considerar: permissões (quem vê), empty/loading, mobile vs desktop, e o encadeamento com módulos existentes (ex.: um report aprovado vira caso; uma liberação puxa casos da versão).
4. Quando uma feature for pedida, primeiro situe no mapa (módulo, persona, tela de entrada, tela de detalhe, impacto em kanban/minha visão).
5. Separe: **já existe** / **existe parcial** / **é novo**. Não recriar Casos, Reports, Projetos ou Liberações do zero.
6. Priorize valor operacional (menos cliques, menos troca de contexto, menos retrabalho entre suporte → análise → dev → QA → release).

---

## Convenções de engenharia (frontend)

Stack: Next.js (App Router), React, TypeScript, Tailwind, shadcn/ui, TanStack Query,
react-hook-form + Zod. Detalhes em [`padrao-front/`](padrao-front/README.md),
[`camada-de-dados/`](camada-de-dados/README.md) e [`design-system.md`](design-system.md).

- Shell (sidebar, header, layout de `app/(dashboard)`) já existe; tela nova é só conteúdo.
- Componentes com responsabilidade única; componente grande vira feature folder com `index.tsx`
  como entrypoint (hooks + estado + handlers). `*.types.ts` para tipos, `utils.ts` só funções
  puras, `schema.ts` para Zod.
- Cores só por token semântico; espaçamento na escala 8/16/24; card no padrão do design system.
- Toda listagem/aba com fetch tem skeleton que espelha a estrutura real, empty state e erro.
- Dados por hook customizado em `hooks/<modulo>/` (nunca em `components/`), com `enabled` quando
  depende de parâmetro e paginação infinita com `flatMap`.
- Formulários com react-hook-form (`FormProvider`, `Controller`/`useFormContext`), sem estado
  local por campo.
- Permissão no entrypoint da tela (`RequirePermission`) e nas ações (`hasPermission`); no
  backend, `withPermission`.
- UI toda em pt-BR. Desktop: scroll dentro dos cards; mobile: coluna única.
- Não há suíte de testes automatizados; validação é `npm run lint`, `npm run build` e conferência
  no navegador.

---

## Estado atual

O estado de cada funcionalidade (confirmado, não testado, pendências, backlog) fica em
[`status-projeto-softflow.md`](status-projeto-softflow.md). Qualquer proposta nova deve encaixar
neste sistema visual e neste vocabulário, não em um produto paralelo.

---

## Índice de `docs/<slug>/`

Cada pasta tem um `README.md` (o que é / arquitetura / reaproveitável / como estender) e, quando
há decisão não óbvia pelo código, um `decisoes.md`.

| Pasta | Assunto |
|-------|---------|
| [`painel-desenvolvedor/`](painel-desenvolvedor/README.md) | Kanban do dev (`/painel`) |
| [`indicadores/`](indicadores/README.md) | Premiação e metas (`/painel/indicadores`) |
| [`minha-visao/`](minha-visao/README.md) | Painel gerencial (`/painel/minha-visao`) |
| [`avisos/`](avisos/README.md) | Notificações internas (`/avisos`); envio de avisos (`/avisos/novo`) planejado |
| [`casos/`](casos/README.md) | Casos (`/casos`) |
| [`reports/`](reports/README.md) | Fila de análise e abertura de reports (`/reports`) |
| [`projetos/`](projetos/README.md) | Projetos SGP (`/projetos`) |
| [`liberacoes/`](liberacoes/README.md) | Registro de liberação (`/liberacoes`) |
| [`melhorias/`](melhorias/README.md) | Ideias e melhorias (`/melhorias`) |
| [`auditoria-horas/`](auditoria-horas/README.md) | Auditoria de horas (`/auditoria/horas-colaboradores`) |
| [`clientes/`](clientes/README.md) | Clientes Softcom e tickets (`/clientes`) |
| [`produtos/`](produtos/README.md) | Produtos, versões, módulos, checklist, scripts (`/produtos`) |
| [`cadastros-smart/`](cadastros-smart/README.md) | Adquirentes, versões e dispositivos (`/cadastros/*`) |
| [`adquirentes/`](adquirentes/README.md) | Kanban de status e página pública de adquirentes |
| [`documentacao/`](documentacao/README.md) | Módulo de documentação (`/documentacao`) |
| [`configuracoes/`](configuracoes/README.md) | Usuários, perfis de acesso, prompts IA |
| [`assistente-ia/`](assistente-ia/README.md) | Integração com o Assistant |
| [`rbac/`](rbac/README.md) | Permissões e hierarquia de perfis |
| [`autenticacao/`](autenticacao/README.md) | Login, sessão e redirecionamento |
| [`camada-de-dados/`](camada-de-dados/README.md) | API Soft Flow (proxy) e `/api/db` (Drizzle) |
| [`padrao-front/`](padrao-front/README.md) | Padrões de componente, estado e formulário |
| [`deploy/`](deploy/README.md) | Deploy na VPS |
