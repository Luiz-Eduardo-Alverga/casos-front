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
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_ANEXOS` e `S3_BUCKET_AVATARS` — storage S3 da Softcom para anexos e foto de perfil (somente servidor). Ver [docs/API_DB_ARQUITETURA.md](./docs/API_DB_ARQUITETURA.md).

## Produção (VPS)

A imagem Docker usa `output: "standalone"` (ativado só quando `DOCKER=1`). Deploy automático (GHCR + runner na VPS): [docs/DEPLOY_VPS.md](./docs/DEPLOY_VPS.md).
