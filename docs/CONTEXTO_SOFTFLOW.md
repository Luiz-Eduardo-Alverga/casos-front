# Softflow — contexto do produto

Documento de briefing para Claude (Chat, Design ou Code) e para qualquer pessoa que precise do contexto inicial do que a aplicação é, para quem serve e como está organizada.

Não substitui os padrões de implementação (`PADRAO_COMPONENTES.md`, `PADRAO_CASOS.md`, `PADRAO_PROJETOS.md`). Complementa o brief visual em `BRIEF_CLAUDE_DESIGN.md` e o design system em `DESIGN_SYSTEM.md`.

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

Acesso é **RBAC** (`modulo.acao`, ex.: `list-case`, `list-report`, `list-painel-dev`). A sidebar e as ações somem conforme o papel. Após o login, cada usuário cai na primeira tela que tem permissão (painel do dev, minha visão, casos, projetos, auditoria, cadastros ou avisos). Detalhe em `RBAC_PERMISSOES.md`.

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

- **Avisos** (`/avisos`) — notificações internas, lista + detalhe, filtro por período.
- **Painel do desenvolvedor** (`/painel`) — Kanban operacional do dev. Colunas: **Abertos / Corrigidos / Retornos / Concluídos**. Filtros (produto, projeto, setor, agenda), drag-and-drop persiste status, infinite scroll, modal de resumo do caso. É a “home” de quem desenvolve. Detalhe em `KANBAN_PAINEL_DESENVOLVEDOR.md`.
- **Painel Minha Visão** (`/painel/minha-visao`) — visão gerencial: KPIs, casos para testar, casos em produção, prazos de clientes, próximas/últimas liberações, painel de ideias. Filtros de setor/produto/projeto/versão.

### Operação (Casos e Reports)

- **Casos** (`/casos`) — listagem filtrável com tabela e infinite scroll. Criação em `/casos/novo` (form em 2 colunas + modo rápido + anexos + Assistant). Edição em `/casos/[id]` com abas: **Inicial, Anotações, Relações, Clientes, Produção, Anexos, Histórico**. Coluna lateral com status, classificação e ações (transferência, abrir ocorrência quando faz sentido). Há indicador de caso em produção. Padrão de pastas em `PADRAO_CASOS.md`.
- **Reports** (`/reports`) — fila de análise (lista ou tabela + detalhe). Ações: **aprovar**, **marcar incompleto**, **suspender** (com anotação). Criação em `/reports/novo` (produto, categoria, prioridade/SLA, ocorrência inicial, PO/QA, responsável suporte, vínculo com cliente). Um report concluído pode notificar no Discord. Edição reutiliza a tela de caso quando já existe registro, com layout específico de report.

### Projetos e entrega

- **Projetos** (`/projetos`) — listagem, cadastro (`/projetos/novo`) e edição (`/projetos/[id]`) com abas: **Abertura, Escopo, Risco, Stakeholders, Cronograma**. Escopo lista casos/reports da memória do projeto (badges de status, origem caso vs report). Padrão de pastas em `PADRAO_PROJETOS.md`.
- **Liberações** (`/liberacoes`) — registro de release: versões piloto vs final e casos vinculados por produto. Detalhe em `/liberacoes/[registro]` com abas **Liberação** (identidade, piloto, versão final, flags, encerrar), **Casos da versão** e **Checklist**.
- **Melhorias** (`/melhorias`) — tela de ideias/melhorias por produto, setor e período. Existe no código; o item do menu está **comentado** (feature em evolução / ainda não promovida no nav).

### Clientes e cadastros Smart

- **Clientes** (`/clientes`) — busca por nome (obrigatória para listar). Detalhe (`/clientes/[id]`): dados gerais, contato, endereço, produtos/URLs, abas de **casos** e **tickets**.
- **Cadastros Smart** — Adquirentes, Versões, Dispositivos (CRUD em Postgres próprio).
- **Kanban Adquirentes** (`/cadastros/adquirentes/status`) — board do status de homologação/integração de adquirentes.

### Gestão

- **Auditoria de horas** (`/auditoria/horas-colaboradores`) — análise de produção/horas por projeto e colaborador (pode auditar só a si ou todos, conforme permissão).
- **Configurações** — Usuários, Perfis de acesso (RBAC), Prompts IA do Assistant.

Integrações laterais (não são telas, mas fazem parte da experiência):

- **Discord** — DM ao dev quando um caso é aberto/clonado; aviso quando report é concluído.
- **Assistant** — preenchimento assistido de descrição de caso/report.
- **Anexos** — upload no Supabase Storage.

---

## Padrões de tela (para prototipar)

Shell estável em todas as telas autenticadas. Fonte de verdade visual: `BRIEF_CLAUDE_DESIGN.md`, `DESIGN_SYSTEM.md`, `PADRAO_ESPACAMENTOS.md`, `PADRAO_COMPONENTES.md`.

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
  1. **API Soft Flow** (legado): casos, reports, projetos, usuários, catálogos (produtos, versões, status, clientes Softcom, visão gerencial, etc.). O Next faz proxy (`/api/...`). Ver `PADRAO_REQUISICOES.md`.
  2. **Postgres (Supabase) via `/api/db`**: cadastros Smart, RBAC, anexos, prompts, dados nativos do Softflow. Ver `API_DB_ARQUITETURA.md`.
- Auth: login na API Soft Flow → cookie HttpOnly `casos_token` + permissões no cliente. Ver `FLUXO_AUTENTICACAO_LOGIN.md`.

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

## Estado atual relevante para o roadmap

- Casos, Reports, Projetos, Liberações, Painel Dev, Minha Visão, Clientes, Cadastros Smart, Auditoria, Avisos, RBAC e Prompts IA **já estão no ar**.
- **Melhorias** está implementada como tela, mas **ainda não está no menu**.
- Qualquer proposta nova deve encaixar nesse sistema visual e nesse vocabulário — não em um produto paralelo.

---

**Referências:** `BRIEF_CLAUDE_DESIGN.md`, `DESIGN_SYSTEM.md`, `PADRAO_COMPONENTES.md`, `PADRAO_ESPACAMENTOS.md`, `PADRAO_CASOS.md`, `PADRAO_PROJETOS.md`, `RBAC_PERMISSOES.md`, `KANBAN_PAINEL_DESENVOLVEDOR.md`
