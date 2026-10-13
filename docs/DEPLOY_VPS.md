# Deploy na VPS (Docker Swarm + Traefik)

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
