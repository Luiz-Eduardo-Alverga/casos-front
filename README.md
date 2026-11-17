# Casos Front

Aplicação Next.js com App Router.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Variáveis de ambiente (resumo)

Copie de [`.env.example`](./.env.example). Principais:

- `DATABASE_URL` — Postgres (Drizzle / rotas `/api/db`).
- `NEXT_PUBLIC_API_BASE_URL` — API Soft Flow.
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_ANEXOS` e `S3_BUCKET_AVATARS` — storage S3 da Softcom para anexos e foto de perfil (somente servidor). Ver [docs/camada-de-dados/](./docs/camada-de-dados/README.md).

## Produção (VPS)

A imagem Docker usa `output: "standalone"` (ativado só quando `DOCKER=1`). Deploy automático (GHCR + runner na VPS), disparado por push na `master`: [docs/deploy/](./docs/deploy/README.md). O trabalho do dia a dia vai na branch `dev`.

## Documentação

- [`CLAUDE.md`](./CLAUDE.md) — regras para o Claude Code (e resumo para o Cursor em `.cursor/rules/`).
- [`docs/contexto-projeto-softflow.md`](./docs/contexto-projeto-softflow.md) — o que é o Softflow, vocabulário, módulos e índice das pastas `docs/<slug>/`.
- [`docs/status-projeto-softflow.md`](./docs/status-projeto-softflow.md) — estado de cada funcionalidade.
- [`docs/design-system.md`](./docs/design-system.md) — tokens, espaçamentos e padrões visuais.
