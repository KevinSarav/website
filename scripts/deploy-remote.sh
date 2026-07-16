#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-$HOME/projects/professional/website}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

cd "$DEPLOY_PATH"

if [[ ! -d .git ]]; then
  echo "Missing git repository in $DEPLOY_PATH"
  echo "Clone your GitHub repo at this path first"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Git remote origin is not configured in $DEPLOY_PATH"
  exit 1
fi

git fetch --prune origin
git checkout "$DEPLOY_BRANCH"
git reset --hard "origin/$DEPLOY_BRANCH"

if [[ -f .env.sops ]]; then
  if ! command -v sops >/dev/null 2>&1; then
    echo "Found $DEPLOY_PATH/.env.sops but sops is not installed on server"
    exit 1
  fi

  tmp_env="$(mktemp)"
  trap 'rm -f "$tmp_env"' EXIT

  echo "Decrypting $DEPLOY_PATH/.env.sops to runtime .env"
  sops --decrypt --input-type dotenv --output-type dotenv .env.sops > "$tmp_env"
  install -m 600 "$tmp_env" .env
  rm -f "$tmp_env"
  trap - EXIT
fi

upsert_env() {
  local key="$1"
  local value="$2"

  if [[ -z "${value}" ]]; then
    return 0
  fi

  touch .env
  if grep -qE "^${key}=" .env; then
    sed -i "s#^${key}=.*#${key}=${value}#" .env
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

upsert_env "SITE_GDOC_RESUME_ID" "${SITE_GDOC_RESUME_ID:-}"
upsert_env "SITE_RESUME_OPEN_URL" "${SITE_RESUME_OPEN_URL:-}"
upsert_env "SITE_RESUME_EMBED_URL" "${SITE_RESUME_EMBED_URL:-}"
upsert_env "SITE_RESUME_DOWNLOAD_URL" "${SITE_RESUME_DOWNLOAD_URL:-}"

if [[ -n "${GHCR_USERNAME:-}" || -n "${GHCR_TOKEN:-}" ]]; then
  if [[ -z "${GHCR_USERNAME:-}" || -z "${GHCR_TOKEN:-}" ]]; then
    echo "GHCR auth is partially configured. Set both GHCR_USERNAME and GHCR_TOKEN or neither."
    exit 1
  fi

  docker_cfg_dir="$(mktemp -d)"
  cleanup_docker_cfg() {
    if [[ -n "${docker_cfg_dir:-}" && -d "$docker_cfg_dir" ]]; then
      DOCKER_CONFIG="$docker_cfg_dir" docker logout ghcr.io >/dev/null 2>&1 || true
      rm -rf "$docker_cfg_dir"
    fi
  }
  trap cleanup_docker_cfg EXIT

  echo "Authenticating Docker with ghcr.io"
  printf '%s\n' "$GHCR_TOKEN" | DOCKER_CONFIG="$docker_cfg_dir" docker login ghcr.io --username "$GHCR_USERNAME" --password-stdin
fi

if [[ -n "${docker_cfg_dir:-}" ]]; then
  DOCKER_CONFIG="$docker_cfg_dir" docker compose pull website
  cleanup_docker_cfg
  trap - EXIT
else
  docker compose pull website
fi

docker compose up -d --force-recreate --remove-orphans

docker image prune -f >/dev/null 2>&1 || true

echo "Website deployment completed from branch $DEPLOY_BRANCH in $DEPLOY_PATH"