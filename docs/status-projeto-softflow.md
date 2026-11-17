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
| Minha Visão | [`minha-visao/`](minha-visao/README.md) | Formato de data das próximas liberações (2026-08-12) |
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

Nada registrado ainda.

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
- **Rota antiga `/painel/old`** (`components/painel/painel`) continua publicada.
- **Pasta `components/minha-visão/` com acento** no nome.
- **Link quebrado** para `db/scripts/reset-supabase-dev.sql` em
  [`camada-de-dados/`](camada-de-dados/README.md) (o arquivo não existe).
- **Sem testes automatizados**: validação depende de `lint`, `build` e conferência manual.

## 📋 Backlog consciente (decisão sua, não esquecimento)

Nada registrado ainda. Especificação aprovada e ainda não implementada fica em
`docs/<slug>/README.md` com **"Estado: planejado"** e aparece aqui.
