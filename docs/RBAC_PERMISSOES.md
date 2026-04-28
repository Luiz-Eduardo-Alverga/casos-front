# RBAC / Permissões — Padrão do Projeto

Este documento descreve o padrão adotado no **Casos Front** para implementar **controle de acesso por permissão (RBAC)** no **frontend** e no **backend** (rotas `/api/db/*`).

> Regra de ouro: **sempre implemente em duas camadas**:
> - **Frontend**: esconder navegação/ações e bloquear acesso por URL.
> - **Backend**: validar permissão no endpoint e retornar **403**.

---

## Conceitos do projeto

- **Permissão**: string no formato `modulo.acao` (ex.: `list-user`, `assign-user-role`, `list-acquirer`).
- **Role/Papel/Perfil**: conjunto de permissões (tabelas `roles`, `role_permissions`).
- **Permissões efetivas do usuário**: calculadas por join `user_roles → roles → role_permissions → permissions`.

Fontes úteis:
- Contrato: `public/openapi.yaml`
- Arquitetura `/api/db`: `docs/API_DB_ARQUITETURA.md`

---

## Onde as permissões vivem (frontend)

### Login / Re-sync

- No login (`POST /api/login`) o servidor devolve `permissions` (lista de códigos).
- O cliente persiste as permissões (hoje via `localStorage`) e usa isso para renderizar UI condicional.
- Quando ainda não há permissões carregadas no `localStorage`, a tela/rota pode disparar re-sync e depois seguir o fluxo normal.

Arquivos de referência:
- `lib/auth.ts`: leitura/escrita de permissões no storage
- `components/protected-route.tsx`: garante re-sync quando necessário
- `services/db-api/sync-app-user.ts`: re-sync de permissões

### Helpers de permissão (client)

Use os helpers em:
- `lib/rbac-client.ts`

Comportamento esperado:
- **Enquanto permissões não estiverem carregadas** (`permissionsLoaded() === false`): o app não deve “piscar” bloqueando tudo; o padrão adotado é **ser permissivo até carregar** e então aplicar o bloqueio.

---

## Proteção de rota/página (frontend)

Para impedir acesso por URL direta, use:
- `components/require-permission.tsx`

Padrão:
- envolver o conteúdo da página com `RequirePermission`
- se não tiver permissão: **toast** + redirect para `/painel`

Exemplo:

```tsx
import { RequirePermission } from "@/components/require-permission";
import { ConfiguracoesUsuarios } from "@/components/configuracoes/usuarios";

export default async function ConfiguracoesUsuariosPage() {
  return (
    <RequirePermission permission="list-user">
      <ConfiguracoesUsuarios initialSearch="" />
    </RequirePermission>
  );
}
```

Regras práticas:
- **Permissão de listagem** protege a página (ex.: `list-user`, `list-acquirer`).
- **Permissões de ação** protegem botões e ações (ex.: `create-*`, `edit-*`, `delete-*`, `assign-user-role`).

---

## Esconder botões / ações (frontend)

Padrão:
- compute `rbacReady = permissionsLoaded()`
- compute `canX = !rbacReady || hasPermission("codigo")`
- renderizar/ativar ações com base em `canX`

Exemplo:

```tsx
const rbacReady = permissionsLoaded();
const canCreate = !rbacReady || hasPermission("create-acquirer");

return canCreate ? (
  <Button onClick={openCreateModal}>Novo cadastro</Button>
) : null;
```

Em tabelas:
- torne `onEdit`, `onDelete` opcionais
- o componente de tabela só renderiza coluna/botões se houver handler

---

## Sidebar: filtro por permissão + esconder grupos vazios

Padrão:
- subitens devem ser filtrados por permissão
- se **um grupo ficar sem subitens visíveis**, o grupo **não deve aparecer**

Arquivos de referência:
- `components/sidebar/app-sidebar.tsx`
- `components/sidebar/sidebar-collapsible-group.tsx` (retorna `null` quando `subitems.length === 0`)

Regras práticas:
- `Configurações` pode ter múltiplos subitens, cada um com uma permissão diferente.
- A visibilidade do grupo deve ser baseada em `subitemsFiltrados.length > 0`.

---

## Validação no backend (rotas `/api/db`)

### Wrapper de permissão

Para **toda rota nova sensível**, use:
- `lib/api-db/with-permission.ts`

Padrão (Route Handler):
- cada método (`GET/POST/PATCH/PUT/DELETE`) define a permissão necessária
- se não tiver permissão: retornar `jsonError(..., 403)`

Exemplo:

```ts
import { withPermission } from "@/lib/api-db/with-permission";
import { jsonOk } from "@/lib/api-db/responses";

export async function GET() {
  return withPermission("list-user", async () => {
    return jsonOk([]);
  });
}
```

Regras práticas:
- `list-*`: protege listagens e detalhes de leitura.
- `create-*`, `edit-*`, `delete-*`: protegem escrita.
- `assign-user-role`: protege vínculos de perfil/role.

### Erros padronizados

Respostas devem seguir:
- Sucesso: `{ "data": T }`
- Erro: `{ "error": { "message": string } }`

Status comuns:
- `401`: sem sessão
- `403`: sem permissão
- `400`: validação Zod / JSON inválido
- `404`: recurso não encontrado
- `409`: conflito (FK/unique)

---

## Atualização atômica (padrão recomendado)

Quando uma operação precisa ser **atômica** (ex.: “substituir perfil do usuário”):
- implementar função transacional em `lib/db/*.ts` (ex.: `db.transaction(...)`)
- expor endpoint `PUT` que aplica a substituição em uma chamada

Exemplo já implementado:
- `PUT /api/db/app-users/{id}/roles` (substitui perfil do usuário)

---

## Checklist para novas telas/endpoints com RBAC

### Tela nova (frontend)
- [ ] Proteger página com `RequirePermission` (perm. de listagem)
- [ ] Esconder item na sidebar (perm. de listagem)
- [ ] Esconder botões de ação (`create/edit/delete/assign-*`)
- [ ] Garantir que handlers opcionais não renderizem coluna “Ações” vazia

### Endpoint novo `/api/db/*` (backend)
- [ ] Usar `withPermission("codigo")` no método
- [ ] Validar payload com Zod (em `lib/validators/db/*`)
- [ ] Usar `jsonOk`/`jsonError` + `handleDbRouteError`
- [ ] Atualizar `public/openapi.yaml` e `docs/API_DB_ARQUITETURA.md`

---

## Exemplos de permissões usadas hoje

- `list-user`: acessar tela/listagem de usuários
- `assign-user-role`: alterar perfil do usuário
- `list-acquirer`: acessar cadastros de adquirentes
- `create-acquirer` / `edit-acquirer` / `delete-acquirer`: ações em adquirentes

