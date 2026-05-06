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
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — necessários para **anexos de caso** (Storage bucket privado `casos-anexos`). Ver [docs/API_DB_ARQUITETURA.md](./docs/API_DB_ARQUITETURA.md).
