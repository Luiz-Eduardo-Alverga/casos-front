# Softflow (casos-front)

Front Next.js do **Softflow**, sistema interno da Softcom para casos, reports, projetos,
liberações e produtos. Contexto do produto, vocabulário e convenções de engenharia em
[`docs/contexto-projeto-softflow.md`](docs/contexto-projeto-softflow.md).

## Documentação

- Sempre que uma sessão resultar em algo novo implementado, alterado, corrigido, decidido ou
  descartado (código, arquitetura, infraestrutura ou decisão de produto), atualizar
  [`docs/contexto-projeto-softflow.md`](docs/contexto-projeto-softflow.md) e
  [`docs/status-projeto-softflow.md`](docs/status-projeto-softflow.md) antes de considerar a
  tarefa concluída. Mover itens entre as seções do status (✅ em produção / 🟡 implementado não
  testado / ❌ pendência / 📋 backlog) conforme o estado real, sem deixar "para depois". Se a
  sessão não mudou nada que afete esses documentos, não é preciso tocar neles.

- Antes de implementar ou alterar qualquer tela (especialmente as que vêm de um protótipo ou do
  Figma), consultar [`docs/design-system.md`](docs/design-system.md): tokens de cor, espaçamentos,
  card e layouts já implementados. Se a tela precisar de um token que não existe, **parar e
  confirmar com o usuário** antes de inventar cor ou padrão novo. Nunca copiar hex cru de protótipo
  para o componente.

- Antes de mexer numa funcionalidade existente, procurar `docs/<slug>/` primeiro. A tabela
  "Índice de `docs/<slug>/`" no fim do contexto lista as pastas. Cada pasta tem um `README.md` (o
  que é / arquitetura / o que é reaproveitável / como estender) e, quando há decisão de produto
  ou regra não óbvia pelo código, um `decisoes.md` (decisões travadas com o porquê; não reabrir
  sem o usuário decidir de novo). Ao terminar uma funcionalidade nova, ou uma mudança estrutural
  relevante numa existente, criar ou atualizar a pasta `docs/<slug>/` **como parte da entrega: não
  é opcional, é parte de "pronto"**. A pasta tem que bastar para uma sessão nova entender aquela
  funcionalidade sem ler o código todo nem a conversa que a originou. Nada de arquivo solto tipo
  `notes.md`/`todo.md` (nem na raiz do repositório): tudo entra em `README.md`, `decisoes.md` ou
  `prototipo/`.

- Vários READMEs foram escritos em 2026-11-17 como **levantamento inicial a partir do código**
  (dizem isso no topo e têm a seção "Lacunas do levantamento"). Ao mexer num desses módulos,
  completar o README com o que a sessão aprendeu e resolver as lacunas que ficarem claras.

## Fluxo planejamento → especificação → código

- O planejamento acontece num chat do Claude: lê este repositório, prototipa seguindo o
  `docs/design-system.md` e grava a especificação em `docs/<slug>/` com commit na `dev`. O
  planejamento só escreve em `docs/`; código de app é do Claude Code.
- Uma pasta cujo `README.md` começa com **"Estado: planejado"** (ou que tem uma seção "Próxima
  mudança planejada") é uma especificação aprovada e ainda não implementada. Ao receber
  "Implemente `docs/<slug>/`":
  1. **Fase 0, antes de qualquer código:** ler `README.md`, `decisoes.md` e `prototipo/` da pasta,
     conferir o plano contra o código (arquivos citados, o que seria reaproveitado, conflito com
     decisões de outras pastas) e reportar ao usuário o que diverge. As "Perguntas em aberto" se
     resolvem aqui, com o usuário.
  2. Implementar pelas partes do "Plano de implementação", um commit por entrega.
  3. As decisões da pasta valem como qualquer `decisoes.md`: mudar uma exige o usuário. Se mudar,
     registrar uma decisão nova que revoga a anterior, sem apagar a antiga.
  4. Ao concluir: reescrever o `README.md` no formato padrão (o que é / arquitetura /
     reaproveitável / como estender), tirando o "Estado: planejado", e mover o item do
     `📋 Backlog` do status para a seção que reflete o estado real.
- **Perguntas no meio da implementação** não passam por copiar e colar: o Claude Code as registra
  na seção "Perguntas do Claude Code" do `README.md` da pasta (`### P<n> — ... · aberta`, com
  opções e recomendação), faz commit e push na `dev` e para. A resposta vira decisão numerada em
  `decisoes.md` e a pergunta passa a `· respondida → decisão #<m>`. O comando `/implementar <slug>`
  (`.claude/commands/implementar.md`) faz esse ciclo: lista o que está planejado, faz a Fase 0,
  para em pergunta aberta e retoma de onde parou.
- O protótipo (`prototipo/`) é referência visual de estrutura e hierarquia: traduzir para os
  componentes e tokens do repositório. Onde diverge das decisões, as decisões vencem.
- Arquivos de protótipo em `docs/` (inclusive `.tsx`) não fazem parte do app: `docs` está no
  `exclude` do `tsconfig.json` e no `.dockerignore`. Nunca importar nada de `docs/`.

## Regras de implementação (resumo)

O detalhe está nas pastas citadas; isto é o mínimo para não errar.

- **Shell:** sidebar (`components/sidebar/app-sidebar.tsx`), header e layout de `app/(dashboard)`
  já existem. Nunca criar outro AppShell, Sidebar ou Header; tela nova é só o conteúdo.
- **Não recriar** Casos, Reports, Projetos e Liberações; proposta nova encaixa no que existe.
- **Cores** só por token semântico (`bg-card`, `text-text-primary`, `border-border-divider`…).
  Proibido hex/rgb/hsl literal e `bg-white`/`text-black`. Token novo: variável em
  `app/globals.css` (light e `.dark`) + registro em `tailwind.config.ts`.
- **Espaçamento** na escala 8/16/24; card com header `p-4 pb-2` + `border-b border-border-divider`
  e content `p-6 pt-2 space-y-2`; cards empilhados `gap-2`, colunas `gap-6`.
- **Dados** ([`docs/camada-de-dados/`](docs/camada-de-dados/README.md)): legado por proxy em
  `app/api/<modulo>`; Postgres em `/api/db/*` com as camadas `db/schema.ts` → `lib/db/` (só
  Drizzle) → `lib/validators/db/` (só Zod) → route (só orquestração). Respostas `jsonOk` /
  `jsonError`. No front, service com `fetchWithAuth` → hook em `hooks/<modulo>/` (nunca em
  `components/`).
- **Permissões** ([`docs/rbac/`](docs/rbac/README.md)) em duas camadas: `RequirePermission` na
  página e `hasPermission` nas ações (ação sem permissão some), `withPermission` no backend.
  Permissão nova acompanha seed em `db/scripts/seed-*-rbac.sql`.
- **UI:** pt-BR; toda listagem/aba com fetch tem skeleton que espelha a estrutura real, empty
  state e erro; desktop com scroll dentro dos cards, mobile em coluna única; botão primário
  escuro, amarelo só em CTA de marca.
- **Organização:** feature folder com `index.tsx` como entrypoint; `*.types.ts`, `utils.ts` (só
  funções puras), `schema.ts` (Zod). Formulários com react-hook-form + Zod.
- **Validação:** não há testes automatizados. Rodar `npm run lint` e `npm run build` e conferir a
  tela no navegador.

## Fluxo de branches

- `master` = produção. Push na `master` dispara o deploy na VPS
  (`.github/workflows/deploy-vps.yml`, ver [`docs/deploy/`](docs/deploy/README.md)). Só recebe
  merge quando o usuário confirma explicitamente (algo como "isso está pronto, pode mergear pra
  master" ou "vamos publicar isso"), nunca por conta própria, mesmo que a mudança pareça pequena.
- `dev` = trabalho do dia a dia. Todo commit vai para cá por padrão, em qualquer máquina e
  sessão. Nunca commitar nem dar push direto na `master`.
- Se a sessão começar com `master` como branch ativa, trocar para `dev` antes de qualquer
  alteração (ou perguntar ao usuário, se não tiver certeza de que a `dev` local está atualizada
  com a remota).
- Branch de feature separada (a partir da `dev`) é exceção: só para mudança grande ou arriscada
  que o usuário queira poder abandonar sem sujar a `dev`.

## Cursor

O Cursor continua em uso, com menos frequência. `.cursor/rules/softflow.mdc` (sempre aplicada) e
`.cursor/rules/produtos.mdc` apontam para este arquivo e para `docs/`. A fonte de verdade é
`CLAUDE.md` + `docs/`; ao mudar uma regra aqui, ajustar o resumo do Cursor se ele a repetir.
