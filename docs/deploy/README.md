# Deploy na VPS (Docker Swarm + Traefik)

> **Estado: implementado.** `master` = produção: push na `master` dispara o deploy. O trabalho do
> dia a dia vai na `dev` e só vai para a `master` com confirmação explícita do usuário (ver
> "Fluxo de branches" no `CLAUDE.md`). Workflow em `.github/workflows/deploy-vps.yml`.

A aplicação continua usando **Supabase**, **API Soft Flow**, **Assistant** e **Discord** fora do processo Next (Assistant já pode estar na mesma VPS). O front roda como **serviço Swarm** na overlay `network_public`, atrás do Traefik. O Cloudflare Tunnel publica HTTPS em `softflow.hostsoftcom.cloud` para `http://localhost:80`.

O Traefik da VM **só escuta HTTP na porta 80** (entrypoint `web`). Não use `docker compose up`.

## Deploy automático (GitHub Actions)

Push em `master` (ou _Run workflow_):

1. **GitHub (nuvem):** build da imagem e push para `ghcr.io/luiz-eduardo-alverga/casos-front`.
2. **Runner na VPS** (`vm-squad-xp-01`): `docker pull` + `docker stack deploy`. Sem SSH de fora.

O runner precisa estar **Idle** em Settings → Actions → Runners.

Secrets do repositório (Settings → Secrets and variables → Actions) — **só o que entra no build**:

| Secret                                         | Valor                                 |
| ---------------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`                     | API Soft Flow                         |
| `NEXT_PUBLIC_ASSISTANT_API_URL`                | `https://assistant.hostsoftcom.cloud` |
| `NEXT_PUBLIC_SUPABASE_URL`                     | URL do projeto Supabase               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | chave publishable                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                | opcional                              |

Não cadastre senha de root nem `VPS_SSH_KEY`. Runtime (`DATABASE_URL`, Discord, `TRAEFIK_*`, etc.) fica em `/opt/casos-front/.env` na VPS.

### Permissão do `.env` para o runner (uma vez, como root)

O job roda como `github-runner` e precisa **ler** o `.env`:

```bash
chgrp github-runner /opt/casos-front/.env
chmod 640 /opt/casos-front/.env
usermod -aG docker github-runner
cd /opt/actions-runner && ./svc.sh stop && ./svc.sh start
```

O restart do serviço garante que o grupo `docker` valha para o runner.

## Deploy manual (emergência)

Na VPS, como um usuário no grupo `docker`:

```bash
cd /opt/casos-front
export GHCR_TOKEN=...   # PAT com read:packages, se a imagem for privada
export GHCR_USER=Luiz-Eduardo-Alverga
export CASOS_IMAGE=ghcr.io/luiz-eduardo-alverga/casos-front:latest
bash deploy/vps-update.sh
```

## Hostnames

- App: `https://softflow.hostsoftcom.cloud`
- Assistant: `https://assistant.hostsoftcom.cloud`
- Portainer: `http://portainer-squad-xp-01.hostsoftcom.cloud` (ou HTTPS no Tunnel)
- Traefik: `http://traefik-squad-xp-01.hostsoftcom.cloud`

## Labels Traefik

Em `deploy.labels`, iguais ao Portainer:

- `Host(softflow.hostsoftcom.cloud)`
- entrypoint `web`
- sem `tls=true`
- porta interna `3000`
- rede `network_public`

## Conector do Claude (`/api/mcp`)

Ver [`conector-claude/`](../conector-claude/README.md). Variáveis de **runtime** (no
`/opt/casos-front/.env`, lidas pelo `env_file`; não precisam de rebuild):

| Variável | Valor |
|----------|-------|
| `SOFTFLOW_PUBLIC_URL` | `https://softflow.hostsoftcom.cloud` (sem barra no fim; é o domínio do conector, decisão #13) |
| `CLAUDE_CONECTOR_CHAVE` | 32 bytes em hex, gerados uma vez com `openssl rand -hex 32` |
| `BRAINIAC_MCP_URL` | `https://brainiac.softcomtecnologia.com/mcp` (recomendado no modal "Conexão com o Claude"; decisão #18) |
| `BRAINIAC_OAUTH_CLIENT_ID` | `brainiac-claude-ai` (o Brainiac não usa DCR; decisão #21) |

- Sem `BRAINIAC_MCP_URL` ou `BRAINIAC_OAUTH_CLIENT_ID`, o campo correspondente some do modal e o
  texto da recomendação continua. Os dois são de outro sistema (Squad IA): trocar só aqui, sem
  rebuild.

- A chave cifra o token Soft Flow das conexões. **Trocar a chave invalida todas as conexões**
  (cada pessoa conecta de novo); não trocar sem motivo e não reaproveitar a chave de dev.
- A migração `0011_conector_claude` cria as tabelas `oauth_*` e `claude_*`. Em 2026-11-19 ela foi
  aplicada no banco do `.env` local; se o banco de produção for outro, aplicar com
  `npm run db:apply` apontando para ele antes de publicar.
- A migração `0012_conector_claude_tipo_cliente` acrescenta `claude_conexoes.tipo_cliente`
  (default `'claude'`; compatível com o código anterior). Aplicada no banco do `.env` em
  2026-11-25; mesma regra se o banco de produção for outro.
- O Claude Code faz login com retorno para `http://localhost:<porta>/callback` na máquina do dev:
  isso não passa pela VPS nem pelo Cloudflare, só o `/oauth/autorizar` e o `/api/oauth/*`.
- O Claude chama de `160.79.104.0/21`. O Cloudflare na frente do Softflow não pode bloquear essa
  faixa em `/.well-known/*`, `/api/oauth/*` e `/api/mcp`.
- Depois de publicar, conferir:
  `curl https://softflow.hostsoftcom.cloud/.well-known/oauth-protected-resource/api/mcp` deve
  devolver `"resource": "https://softflow.hostsoftcom.cloud/api/mcp"`, e um `POST` sem token em
  `/api/mcp` deve devolver `401` com `WWW-Authenticate`.

## O que não vai para a VPS

- Postgres (Supabase)
- API Soft Flow / Softcom Cloud
- Bot Discord

A VPS só precisa **alcançar** esses serviços.

## Rebuild na VPS (imagem local)

Use quando mudar `NEXT_PUBLIC_*` ou quando o `.env` novo não aparecer na aplicação. Essas variáveis entram no bundle no `docker build`. O `docker stack deploy` ignora a seção `build` do compose.

No `.env` da VPS, `CASOS_IMAGE` fica `casos-front:latest`. Na VPS, como usuário do grupo `docker`:

```bash
cd /opt/casos-front
set -a && . .env && set +a

docker build --no-cache \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  --build-arg NEXT_PUBLIC_ASSISTANT_API_URL="$NEXT_PUBLIC_ASSISTANT_API_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
  -t casos-front:latest .

docker stack deploy -c docker-compose.yml casos-front

docker service update --force casos-front_app
```

1. O build gera a imagem local sem cache, com as `NEXT_PUBLIC_*` do `.env`.
2. O `stack deploy` reaplica o `.env` de runtime (`DATABASE_URL`, Discord, S3, `COOKIE_SECURE`, Traefik).
3. O `--force` recria o container na mesma tag `casos-front:latest`.

Confira com `docker service ps casos-front_app`: a task `Running` deve usar `casos-front:latest`.
