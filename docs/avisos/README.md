# Avisos

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

Notificações internas do usuário. `/avisos` tem lista + detalhe com filtro por período, e o
header tem um dropdown de avisos que leva à tela. No detalhe, o aviso mostra o remetente e o
selo "Lido" ou o botão "Marcar como lido".

É a tela de destino padrão de quem não tem nenhuma outra permissão de "home"
(`lib/post-login-redirect.ts`), por isso não exige permissão própria.

## Arquitetura

```text
components/avisos/
├── avisos.tsx              entrypoint (filtro de período, lista, detalhe)
├── avisos-lista.tsx · avisos-detalhe.tsx · skeletons
└── avisos-dropdown.tsx     dropdown do header
```

- Dados: API Soft Flow via `/api/mensagens` (`hooks/mensagens/use-mensagens`,
  `use-marcar-mensagem-lida`).

## Como estender

- Tipo novo de aviso: o conteúdo vem do legado; a tela só lista. Mudança de origem exige API.
