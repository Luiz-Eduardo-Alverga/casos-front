# Configurações (usuários, perfis de acesso, prompts de IA)

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo. As regras de permissão e de
> hierarquia estão em [`rbac/`](../rbac/README.md); aqui ficam as telas.

## O que é

Grupo "Configurações" da sidebar, que só aparece se o usuário tiver pelo menos um dos subitens:

| Tela | Rota | Permissão |
|------|------|-----------|
| Usuários | `/configuracoes/usuarios` | `list-user` |
| Perfis de acesso | `/configuracoes/perfis` | `assign-user-role` |
| Prompts IA | `/configuracoes/prompts-ia` (+ `/novo`, `/[id]`) | `list-prompts`, `create-prompts`, `edit-prompts`, `delete-prompts` |

- **Usuários:** tabela dos usuários do Softflow (espelho do Soft Flow em `app_users`) e modal
  "gerenciar perfil" para atribuir perfis, respeitando a hierarquia.
- **Perfis de acesso:** sidebar de perfis + matriz de permissões agrupada por módulo, card de
  informações do perfil e "zona de perigo" para excluir. Visual com os tokens `papeis-*`.
- **Prompts IA:** cadastro dos prompts usados pelo Assistant, em dois tipos (filtro `?tipo=`):
  `FORM_ASSISTANT` ("Assistente de casos", preenche descrição de caso/report) e
  `RELEASE_NOTES` ("Registro de liberação", gera a descrição em [`liberacoes/`](../liberacoes/README.md)).
  Prompts podem ser ativados/desativados e ter um padrão e um por squad (setor). Ver
  [`assistente-ia/`](../assistente-ia/README.md).

## Arquitetura

```text
components/configuracoes/
├── usuarios/     index, tabela, gerenciar-perfil-modal, skeleton
├── papeis/       index, papeis-sidebar, permission-matrix, permission-module-card,
│                 role-info-card, papeis-danger-zone-card, skeletons, utils
└── prompts-ia/   index, tabela, formulário, modal de dicas, parsers do tipo
```

- Dados: Postgres via `/api/db/app-users`, `/api/db/roles`, `/api/db/permissions`,
  `/api/db/permission-modules` (hooks `hooks/configuracoes/use-db-*`,
  `use-sync-role-permissions`, `use-assigner-hierarchy`). Prompts em `/api/form-assistant-prompts`
  (`hooks/assistant/use-*-form-assistant-prompt*`).

## Como estender

- Permissão nova: seed SQL + módulo em `permission_modules`; a matriz mostra sozinha (ver
  [`rbac/`](../rbac/README.md)).
- Tipo novo de prompt: incluir em `PROMPT_TYPES` (`lib/types/form-assistant-prompts.ts`) e nos
  rótulos de `prompts-ia-tipo-parsers.ts`.
