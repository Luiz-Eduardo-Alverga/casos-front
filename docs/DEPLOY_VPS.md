# Deploy na VPS (Docker Swarm + Traefik)

A aplicação continua usando **Supabase**, **API Soft Flow** e **Discord** fora da VPS. Só o Next.js sai da Vercel e passa a rodar como **serviço Swarm**, na overlay `network_public`, atrás do Traefik da VM Skadi.

Esta VM é um **manager Swarm** (não Docker Compose avulso). `docker compose up` não coloca o container na overlay do Traefik.

O Traefik desta VM **só escuta HTTP na porta 80** (entrypoint `web`). Não há `:443` nem certificado.

## Pré-requisitos na VPS

1. Acesso SSH (`root@192.168.25.108` ou `sshSquadXp-01.hostsoftcom.cloud`).
2. Docker Swarm, Traefik e Portainer no ar.
3. Rede pública: `network_public` (overlay).
4. DNS de `softlflow.hostsoftcom.cloud` apontando para esta VM (mesmo padrão do Portainer/Traefik).
5. Cookie de login: nesta VPS use `COOKIE_SECURE=false` (HTTP). Com `Secure` o browser não envia o cookie.

Hostnames reais já no Traefik:

- App: `http://softlflow.hostsoftcom.cloud`
- Portainer: `http://portainer-squad-xp-01.hostsoftcom.cloud`
- Dashboard Traefik: `http://traefik-squad-xp-01.hostsoftcom.cloud`

## Variáveis de ambiente

Na Vercel (Project → Settings → Environment Variables), copie **todas** as de Production para um `.env` **somente na VPS** (não commitar).

Base: [`.env.example`](../.env.example). Além das da aplicação, o stack precisa de:

| Variável | Função |
|---|---|
| `TRAEFIK_HOST` | `softlflow.hostsoftcom.cloud` |
| `TRAEFIK_NETWORK` | `network_public` |
| `TRAEFIK_ENTRYPOINT` | `web` (HTTP :80) |
| `COOKIE_SECURE` | `false` enquanto não houver HTTPS |
| `CASOS_APP_BASE_URL` | `http://softlflow.hostsoftcom.cloud` (links do Discord) |

`NEXT_PUBLIC_*` entra no bundle **no `docker build`**. Se mudar URL do Supabase ou da API Soft Flow, é preciso **rebuild** da imagem, não só `stack deploy`.

## Subir o stack

Na VPS, no diretório do repositório:

```bash
git clone https://github.com/Luiz-Eduardo-Alverga/casos-front.git
cd casos-front
cp .env.example .env
# edite .env com os valores de produção
```

O Swarm **não faz build**. Gere a imagem e depois publique o stack. `--resolve-image never` evita o Swarm tentar puxar `casos-front:latest` do Docker Hub.

```bash
docker compose --env-file .env build
set -a && . ./.env && set +a
docker stack deploy -c docker-compose.yml --resolve-image never casos-front
docker service logs -f casos-front_app
```

`docker stack deploy` **não lê** `.env` sozinho; o `set -a && . ./.env` exporta as variáveis para interpolar `TRAEFIK_*` nas labels.

A VM tem 1 vCPU / 4 GB: o build pode ser lento ou estourar memória. Se o `docker compose build` falhar por OOM:

```bash
# na VPS, uma vez
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
```

Ou faça o build em outra máquina e envie a imagem:

```bash
# na sua máquina, com o .env de produção
docker compose --env-file .env build
docker save casos-front:latest | gzip | ssh root@192.168.25.108 "gunzip | docker load"
```

Na VPS, com o `.env` já preenchido:

```bash
set -a && . ./.env && set +a
docker stack deploy -c docker-compose.yml --resolve-image never casos-front
```

## Conferir

- Serviço: `docker stack services casos-front` (1/1 replicas).
- Traefik: `http://traefik-squad-xp-01.hostsoftcom.cloud` — router `casos-front`.
- App: `http://softlflow.hostsoftcom.cloud/login`.
- Login (cookie **sem** `Secure`).
- `GET /api/db/ping` autenticado (Postgres/Supabase).
- Anexos e, se usar, notificação Discord.

Não aponte o DNS de produção (`softflow.softcom.services`) enquanto a Vercel ainda for o destino. Homologue em `softlflow.hostsoftcom.cloud` primeiro.

## Portainer (alternativa)

Em **Stacks → Add stack** (modo **Swarm**), cole o `docker-compose.yml` e preencha as mesmas variáveis do `.env` na UI. A imagem `casos-front:latest` precisa já existir no node (`docker compose build` ou `docker load`).

## Labels Traefik

No Swarm as labels ficam em `deploy.labels` (igual ao Portainer desta VM):

- `Host(softlflow.hostsoftcom.cloud)`
- entrypoint `web` (HTTP :80)
- **sem** `tls=true` (esta VM não tem HTTPS)
- porta interna `3000`
- rede `network_public`

## O que não vai para a VPS

- Postgres (permanece no Supabase).
- API Soft Flow / Assistant / Softcom Cloud.
- Bot Discord.

A VPS só precisa **alcançar** esses serviços (rede `192.168.25.x` para a Soft Flow, internet para Supabase e Discord).
