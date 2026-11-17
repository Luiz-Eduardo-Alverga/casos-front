# Camada de dados — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: `PADRAO_REQUISICOES`, `API_DB_ARQUITETURA` e
regras do Cursor, consolidadas em 2026-11-17.

1. **O browser nunca chama a API Soft Flow nem o Postgres direto: sempre por Route Handler do
   Next.** **Por quê:** o token fica em cookie `HttpOnly` e `DATABASE_URL`/credenciais do S3 só
   existem no servidor. **Exceção conhecida, não decidida:** a análise de produção da auditoria
   chama o Assistant direto do browser (ver [`auditoria-horas/`](../auditoria-horas/README.md)).

2. **Duas famílias de rota separadas: proxy do legado (`/api/<modulo>`) e Postgres
   (`/api/db/*`).** Não misturar Drizzle em rota de proxy nem proxy em `/api/db`.

3. **Camadas obrigatórias em `/api/db`:** `db/schema.ts` → `lib/db/<recurso>.ts` (só Drizzle) →
   `lib/validators/db/<recurso>.ts` (só Zod) → `app/api/db/.../route.ts` (só orquestração). Sem
   query dentro da route.

4. **Envelope de resposta:** sucesso `jsonOk` → `{ data: T }`; erro `jsonError` →
   `{ error: { message } }`; DELETE → 204.

5. **No front: service com `fetchWithAuth` → hook em `hooks/<modulo>/` com TanStack Query.**
   Hooks nunca dentro de `components/`. Query com parâmetro obrigatório usa `enabled`.

6. **Anexos ficam no S3 da Softcom (`S3_*`), acessado só pelo servidor (presign/multipart).**
   Substituiu o Supabase Storage (commit `29018ed`, "mudar bucket de anexo de arquivos").
