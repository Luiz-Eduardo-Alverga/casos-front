#!/usr/bin/env bash
# Atualiza o stack Swarm na VPS a partir da imagem no GHCR.
# ENV_FILE aponta para o .env de runtime (padrão: .env ao lado do compose).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

IMAGE="${CASOS_IMAGE:-ghcr.io/luiz-eduardo-alverga/casos-front:latest}"
GHCR_USER="${GHCR_USER:-luiz-eduardo-alverga}"
ENV_FILE="${ENV_FILE:-$ROOT/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Falta $ENV_FILE (não commitar; copiar de .env.example)." >&2
  exit 1
fi

if [[ "$ENV_FILE" != "$ROOT/.env" ]]; then
  ln -sfn "$ENV_FILE" "$ROOT/.env"
fi

if [[ -n "${GHCR_TOKEN:-}" ]]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
fi

docker pull "$IMAGE"

set -a
# shellcheck disable=SC1091
. "$ENV_FILE"
set +a
export CASOS_IMAGE="$IMAGE"

docker stack deploy -c docker-compose.yml casos-front

echo "Stack atualizado: $IMAGE"
docker stack services casos-front
