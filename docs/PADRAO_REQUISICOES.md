# Padrão de Requisições - Casos Front

Este documento descreve o padrão arquitetural utilizado para implementar requisições HTTP na aplicação.

## Arquitetura

A aplicação segue uma arquitetura em camadas para requisições:

```
Componente/Page
    ↓
Hook (React Query)
    ↓
Service
    ↓
API Route (Next.js)
    ↓
API Externa (http://10.0.0.20:83/api-soft-flow/api)
```

## Estrutura de Arquivos

### 1. Service (`services/[modulo]/[nome].ts`)

**Responsabilidade**: Fazer requisições para as rotas da API do Next.js.

**Características**:
- Usa `getToken()` de `@/lib/auth` para obter o token de autenticação
- Usa `fetchWithAuth()` de `@/lib/fetch` para fazer requisições com tratamento automático de erros 401
- Define interfaces TypeScript para os tipos de dados
- Chama rotas da API do Next.js (ex: `/api/projeto-dev/produtos-ordem`)
- Passa o token no header `Authorization: Bearer {token}`

**Exemplo**:
```typescript
import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface ProdutoOrdem {
  id: string;
  id_colaborador: string;
  id_produto: string;
  produto_nome: string;
  versao: string;
  ordem: string;
  selecionado: boolean;
}

export async function getProdutosOrdem(params: {
  id_colaborador: string;
}): Promise<ProdutoOrdem[]> {
  const token = getToken();

  const url = new URL("/api/projeto-dev/produtos-ordem", window.location.origin);
  url.searchParams.set("id_colaborador", params.id_colaborador);

  const response = await fetchWithAuth(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar produtos ordem");
  }

  return await response.json();
}
```

### 2. API Route (`app/api/[modulo]/[recurso]/route.ts`)

**Responsabilidade**: Proxificar requisições para a API externa.

**Características**:
- Usa `api` de `@/lib/axios` (configurado com `NEXT_PUBLIC_API_BASE_URL`)
- Extrai query params e headers da requisição do cliente
- Repassa o header `Authorization` para a API externa
- Trata erros e retorna respostas apropriadas
- A baseURL do axios aponta para `http://10.0.0.20:83/api-soft-flow/api`

**Exemplo**:
```typescript
import { api } from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id_colaborador = url.searchParams.get("id_colaborador");

    if (!id_colaborador) {
      return Response.json(
        { error: "Parametro id_colaborador é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.get("/projeto-dev-produtos-ordem", {
      params: {
        id_colaborador,
      },
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Erro na API Route de produtos ordem:", error);
    const status = error?.response?.status || 500;
    const errorMessage = error?.response?.data?.message || error?.message || "Erro ao buscar produtos ordem";
    return Response.json({ error: errorMessage }, { status });
  }
}
```

### 3. Hook (`hooks/use-[nome].tsx`)

**Responsabilidade**: Gerenciar estado e cache das requisições usando React Query.

**Características**:
- Usa `useQuery` do `@tanstack/react-query`
- Define `queryKey` apropriada para cache
- Usa `enabled` para controlar quando a query deve ser executada
- Chama a função do service

**Exemplo**:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { getProdutosOrdem } from "@/services/projeto-dev/get-produtos-ordem";

export function useProdutosOrdem(params: { id_colaborador: string }) {
  return useQuery({
    queryKey: ["produtos-ordem", params.id_colaborador],
    enabled: Boolean(params.id_colaborador),
    queryFn: () => getProdutosOrdem({ id_colaborador: params.id_colaborador }),
  });
}
```

## Fluxo de Dados

1. **Componente** chama o hook: `const { data, isLoading } = useProdutosOrdem({ id_colaborador: "202" })`
2. **Hook** executa a query do React Query, que chama o service
3. **Service** faz requisição para `/api/projeto-dev/produtos-ordem?id_colaborador=202` com token no header
4. **API Route** recebe a requisição, extrai params e headers, e faz requisição para a API externa usando axios
5. **API Externa** retorna os dados
6. **API Route** retorna os dados para o service
7. **Service** retorna os dados para o hook
8. **Hook** atualiza o cache do React Query e retorna os dados para o componente

## Configuração

### Variáveis de Ambiente

- `NEXT_PUBLIC_API_BASE_URL`: URL base da API externa (ex: `http://10.0.0.20:83/api-soft-flow/api`)

### Autenticação

- Token armazenado em `localStorage` com chave `@casos:token`
- Token obtido via `getToken()` de `@/lib/auth`
- Token enviado no header `Authorization: Bearer {token}`
- Erros 401 são tratados automaticamente por `fetchWithAuth()`, que limpa a autenticação e redireciona para `/login`

## Convenções

### Nomenclatura

- **Services**: `get[Nome]`, `create[Nome]`, `update[Nome]`, `delete[Nome]`
- **Hooks**: `use[Nome]` (ex: `useProdutosOrdem`)
- **API Routes**: `app/api/[modulo]/[recurso]/route.ts`
- **Query Keys**: `["recurso", ...params]` (ex: `["produtos-ordem", id_colaborador]`)

### Estrutura de Pastas

```
services/
  ├── [modulo]/
  │   └── [nome].ts
app/
  └── api/
      └── [modulo]/
          └── [recurso]/
              └── route.ts
hooks/
  └── use-[nome].tsx
```

## Exemplos de Uso

### GET com parâmetros

```typescript
// Service
export async function getProdutosOrdem(params: { id_colaborador: string }) {
  // ...
}

// Hook
export function useProdutosOrdem(params: { id_colaborador: string }) {
  return useQuery({
    queryKey: ["produtos-ordem", params.id_colaborador],
    enabled: Boolean(params.id_colaborador),
    queryFn: () => getProdutosOrdem(params),
  });
}

// Componente
const { data, isLoading } = useProdutosOrdem({ id_colaborador: "202" });
```

### GET com busca opcional

```typescript
// Service
export async function getVersoes(params: {
  produto_id: string;
  search?: string;
}) {
  const url = new URL("/api/auxiliar/versoes", window.location.origin);
  url.searchParams.set("produto_id", params.produto_id);
  if (params.search) url.searchParams.set("search", params.search);
  // ...
}

// Hook
export function useVersoes(params?: { produto_id?: string; search?: string }) {
  return useQuery({
    queryKey: ["versoes", params?.produto_id ?? "", params?.search ?? ""],
    enabled: Boolean(params?.produto_id),
    queryFn: () => getVersoes({ produto_id: params!.produto_id!, search: params?.search }),
  });
}
```

## Tratamento de Erros

- **Service**: Lança `Error` com mensagem apropriada
- **API Route**: Retorna JSON com `{ error: string }` e status code apropriado
- **Hook**: React Query trata erros automaticamente, expondo `error` no retorno do hook
- **Componente**: Pode acessar `error` do hook para exibir mensagens ao usuário

## Notas Importantes

1. **Sempre usar `fetchWithAuth`** no service para tratamento automático de 401
2. **Sempre validar parâmetros obrigatórios** na API Route antes de chamar a API externa
3. **Sempre usar `enabled` no hook** quando a query depende de parâmetros obrigatórios
4. **Sempre definir interfaces TypeScript** para os dados retornados
5. **Sempre incluir o token no header Authorization** quando disponível
6. **Query keys devem ser únicas** e incluir todos os parâmetros relevantes para o cache
