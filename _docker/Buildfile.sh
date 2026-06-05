#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -f ".env" ]]; then
  echo ".env fehlt. Kopiere _docker/.env.example nach _docker/.env und fuelle die Werte aus." >&2
  exit 1
fi

VALID_TARGETS=(
  "proxy-up"
  "proxy-check"
  "proxy-ensure"
  "proxy-dynamic-perms"
  "proxy-down"
  "up"
  "down"
  "build"
  "start"
  "stop"
  "logs"
  "image-clean"
  "pull-prebuilt"
  "php-image-current"
  "build-php"
  "recreate-php"
  "up-all"
  "up-all-build"
  "down-all"
  "restart-all"
  "rebuild-all"
  "db-import-init-dump"
  "db-pull-init"
  "db-pull"
  "db-import"
  "db-reset"
  "db-reset-from-live"
  "check-versions"
)

usage() {
  cat <<'EOF'
Nutzung:
  ./Buildfile.sh [--target <target>] [KEY=VALUE ...]
  ./Buildfile.sh <target> [KEY=VALUE ...]

Beispiele:
  ./Buildfile.sh up-all-build
  ./Buildfile.sh --target db-reset CONFIRM=1
  ./Buildfile.sh up-all-build FORCE_PHP_BUILD=1 PULL=1
EOF
}

TARGET="proxy-up"
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ "${1:-}" == "--target" ]]; then
  if [[ -z "${2:-}" ]]; then
    echo "Fehlender Wert fuer --target" >&2
    exit 1
  fi
  TARGET="$2"
  shift 2
elif [[ -n "${1:-}" ]]; then
  TARGET="$1"
  shift
fi

is_valid_target=0
for valid_target in "${VALID_TARGETS[@]}"; do
  if [[ "$TARGET" == "$valid_target" ]]; then
    is_valid_target=1
    break
  fi
done
if [[ "$is_valid_target" != "1" ]]; then
  echo "Unbekanntes Target: $TARGET" >&2
  usage >&2
  exit 1
fi

OVERRIDES=()
for arg in "$@"; do
  if [[ "$arg" =~ ^[A-Za-z_][A-Za-z0-9_]*=.*$ ]]; then
    OVERRIDES+=("$arg")
  else
    echo "Unerwartetes Argument: $arg" >&2
    echo "Erlaubt sind nur Variablen im Format KEY=VALUE." >&2
    exit 1
  fi
done

for kv in "${OVERRIDES[@]}"; do
  export "$kv"
done

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Weder 'docker compose' noch 'docker-compose' gefunden. Bitte Docker Compose installieren." >&2
  exit 1
fi

compose() {
  "${COMPOSE_CMD[@]}" -f docker-compose.yml "$@"
}

proxy_compose() {
  "${COMPOSE_CMD[@]}" -f proxy/traefik/docker-compose.yml "$@"
}

get_env() {
  local key="$1"
  sed -n "s/^${key}=//p" .env 2>/dev/null | tail -n1 | tr -d '\r'
}

get_cfg() {
  local key="$1"
  local default_value="${2:-}"
  local env_value="${!key-}"
  local file_value
  file_value="$(get_env "$key")"

  if [[ -n "$env_value" ]]; then
    printf '%s' "$env_value"
    return
  fi
  if [[ -n "$file_value" ]]; then
    printf '%s' "$file_value"
    return
  fi
  printf '%s' "$default_value"
}

docker_image_exists() {
  local image_ref="$1"
  [[ -n "$image_ref" ]] || return 1
  docker image inspect "$image_ref" >/dev/null 2>&1
}

container_exists() {
  local name="$1"
  docker ps -a --format '{{.Names}}' | grep -q "^${name}$"
}

container_running() {
  local name="$1"
  docker ps --format '{{.Names}}' | grep -q "^${name}$"
}

has_init_dump() {
  ls -1 db/init/*.sql >/dev/null 2>&1 || ls -1 db/init/*.sql.gz >/dev/null 2>&1
}

ensure_proxy_network() {
  docker network ls --format '{{.Name}}' | grep -q '^dev-proxy$' || docker network create dev-proxy >/dev/null
}

check_versions() {
  local missing=()
  [[ -n "$PHP_IMAGE" ]] || missing+=("PHP_IMAGE")
  [[ -n "$PHP_VERSION" ]] || missing+=("PHP_VERSION")
  [[ -n "$WP_CLI_VERSION" ]] || missing+=("WP_CLI_VERSION")
  [[ -n "$DB_VERSION" ]] || missing+=("DB_VERSION")
  [[ -n "$APACHE_VERSION" ]] || missing+=("APACHE_VERSION")
  [[ -n "$PHPMYADMIN_VERSION" ]] || missing+=("PHPMYADMIN_VERSION")
  [[ -n "$HOST_UID" ]] || missing+=("HOST_UID")
  [[ -n "$HOST_GID" ]] || missing+=("HOST_GID")

  if (( ${#missing[@]} > 0 )); then
    echo "Fehlende Pflicht-Variablen. In _docker/.env setzen:" >&2
    echo "  ${missing[*]}" >&2
    exit 1
  fi
}

proxy_dynamic_perms() {
  if container_running dev-proxy_traefik; then
    if docker exec dev-proxy_traefik sh -lc "mkdir -p /etc/traefik/dynamic && chown ${HOST_UID}:${HOST_GID} /etc/traefik/dynamic && chmod 775 /etc/traefik/dynamic" >/dev/null 2>&1; then
      echo "[INFO] Rechte fuer /etc/traefik/dynamic auf UID/GID ${HOST_UID}:${HOST_GID} gesetzt."
    else
      echo "[WARN] Konnte Rechte auf /etc/traefik/dynamic nicht setzen."
    fi
  fi
}

proxy_up() {
  ensure_proxy_network

  if [[ "$PULL" == "1" ]]; then
    echo "[INFO] Lade Proxy-Image(s): traefik"
    proxy_compose pull traefik
  elif ! docker_image_exists "$PROXY_IMAGE"; then
    echo "[INFO] Lade fehlende Proxy-Image(s): traefik"
    proxy_compose pull traefik
  fi

  proxy_compose up -d
}

proxy_check() {
  if ! container_running dev-proxy_traefik; then
    echo "Traefik ist Pflicht: Container dev-proxy_traefik laeuft nicht." >&2
    exit 1
  fi
}

proxy_ensure() {
  if container_exists dev-proxy_traefik; then
    echo "[INFO] Traefik-Container existiert. Starte proxy-check..."
    proxy_check
    proxy_dynamic_perms
    echo "[INFO] Traefik-Container laeuft. Starte naechsten Schritt..."
    return
  fi

  echo "[INFO] Traefik-Container fehlt. Starte proxy-up..."
  proxy_up
  echo "[INFO] Proxy-Start abgeschlossen. Starte proxy-check..."
  proxy_check
  proxy_dynamic_perms
  echo "[INFO] Traefik-Container laeuft. Starte naechsten Schritt..."
}

pull_prebuilt() {
  if [[ "$PULL" == "1" ]]; then
    echo "[INFO] Lade vorgebaute Images: db apache phpmyadmin"
    compose pull db apache phpmyadmin
    return
  fi

  local missing=()
  docker_image_exists "mariadb:${DB_VERSION}" || missing+=("db")
  docker_image_exists "httpd:${APACHE_VERSION}" || missing+=("apache")
  docker_image_exists "phpmyadmin:${PHPMYADMIN_VERSION}" || missing+=("phpmyadmin")

  if (( ${#missing[@]} > 0 )); then
    echo "[INFO] Lade fehlende vorgebaute Images: ${missing[*]}"
    compose pull "${missing[@]}"
  fi
}

php_image_current() {
  local label_key='dev.wp.image-build-signature'
  local current_signature
  current_signature="$(docker image inspect "$PHP_IMAGE_TAG" --format "{{ index .Config.Labels \"${label_key}\" }}" 2>/dev/null || true)"
  if [[ -n "$current_signature" && "$current_signature" == "$IMAGE_BUILD_SIGNATURE" ]]; then
    echo "[INFO] PHP-Image aktuell: $PHP_IMAGE_TAG"
    return 0
  fi
  echo "[INFO] PHP-Image veraltet oder fehlt: $PHP_IMAGE_TAG"
  return 1
}

build_php() {
  local args=(build)
  if [[ "$PULL" == "1" ]]; then
    args+=(--pull)
  fi
  args+=(php)

  if [[ "$FORCE_PHP_BUILD" == "1" ]]; then
    echo "[INFO] Erzwinge Build des PHP-Images"
    compose "${args[@]}"
    return
  fi

  if php_image_current >/dev/null 2>&1; then
    echo "[INFO] PHP-Image ${PHP_IMAGE_TAG} existiert bereits; Build wird uebersprungen."
  else
    echo "[INFO] PHP-Image veraltet oder fehlt. Build wird gestartet: ${PHP_IMAGE_TAG}"
    compose "${args[@]}"
  fi
}

recreate_php() {
  if [[ "$RECREATE_PHP" != "1" ]]; then
    return
  fi

  local ctn="${PROJECT_NAME}_php"
  local cur_id new_id
  cur_id="$(docker inspect -f '{{.Image}}' "$ctn" 2>/dev/null || true)"
  new_id="$(docker image inspect -f '{{.Id}}' "$PHP_IMAGE_TAG" 2>/dev/null || true)"

  if [[ -n "$new_id" && "$cur_id" != "$new_id" ]]; then
    echo "[INFO] Erstelle php-Container neu, um das neueste Image zu verwenden"
    compose up -d --force-recreate --no-deps php
  fi
}

image_clean() {
  if [[ "$CLEAN_IMAGES" != "1" ]]; then
    return
  fi

  echo "[INFO] Bereinige ungenutzte Images"
  docker image prune -f >/dev/null || true

  if [[ "$CLEAN_BASE_IMAGE" == "1" && -n "$PHP_VERSION" ]]; then
    local base="php:${PHP_VERSION}-fpm"
    if docker_image_exists "$base"; then
      echo "[INFO] Entferne Basis-Image $base"
      docker rmi "$base" >/dev/null 2>&1 || true
    fi
  fi
}

show_urls_and_status() {
  if [[ -n "$PHPMYADMIN_HOST" ]]; then
    echo "[INFO] phpMyAdmin: http://${PHPMYADMIN_HOST}"
  fi

  if command -v curl >/dev/null 2>&1; then
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' "${LOCAL_URL}" || true)"
    if [[ -n "$code" ]]; then
      echo "[CHECK] HTTP-Status ${LOCAL_URL}: ${code}"
      return
    fi
  fi

  echo "[INFO] 'curl' nicht gefunden. Manuell pruefen: ${LOCAL_URL}"
}

require_confirm() {
  if [[ "${CONFIRM:-}" != "1" ]]; then
    echo "Loeschen des DB-Volumes verweigert. Mit CONFIRM=1 erneut ausfuehren" >&2
    exit 1
  fi
}

import_gzip_to_db() {
  local dump_file="$1"
  gzip -dc "$dump_file" | compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER" "$MYSQL_DATABASE"'
}

PROJECT_NAME="$(get_cfg PROJECT_NAME)"
PHP_IMAGE="$(get_cfg PHP_IMAGE)"
PHP_VERSION="$(get_cfg PHP_VERSION)"
WP_CLI_VERSION="$(get_cfg WP_CLI_VERSION)"
DB_VERSION="$(get_cfg DB_VERSION)"
APACHE_VERSION="$(get_cfg APACHE_VERSION)"
PHPMYADMIN_VERSION="$(get_cfg PHPMYADMIN_VERSION)"
HOST_UID="$(get_cfg HOST_UID)"
HOST_GID="$(get_cfg HOST_GID)"
LIVE_URL="$(get_cfg LIVE_URL)"
LOCAL_URL="$(get_cfg LOCAL_URL)"
LIVE_PATH="$(get_cfg LIVE_PATH)"
LOCAL_PATH="$(get_cfg LOCAL_PATH)"
PHPMYADMIN_HOST="$(get_cfg PHPMYADMIN_HOST)"

MYSQL_DATABASE="$(get_cfg MYSQL_DATABASE)"
MYSQL_USER="$(get_cfg MYSQL_USER)"
MYSQL_PASSWORD="$(get_cfg MYSQL_PASSWORD)"
REMOTE_DB_NAME="$(get_cfg REMOTE_DB_NAME)"
REMOTE_DB_USER="$(get_cfg REMOTE_DB_USER)"
REMOTE_DB_PASSWORD="$(get_cfg REMOTE_DB_PASSWORD)"

if [[ -z "$MYSQL_DATABASE" && -n "$REMOTE_DB_NAME" ]]; then
  MYSQL_DATABASE="$REMOTE_DB_NAME"
fi
if [[ -z "$MYSQL_USER" && -n "$REMOTE_DB_USER" ]]; then
  MYSQL_USER="$REMOTE_DB_USER"
fi
if [[ -z "$MYSQL_PASSWORD" && -n "$REMOTE_DB_PASSWORD" ]]; then
  MYSQL_PASSWORD="$REMOTE_DB_PASSWORD"
fi
export MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD

CLEAN_IMAGES="$(get_cfg CLEAN_IMAGES 1)"
CLEAN_BASE_IMAGE="$(get_cfg CLEAN_BASE_IMAGE 1)"
PULL="$(get_cfg PULL 0)"
FORCE_PHP_BUILD="$(get_cfg FORCE_PHP_BUILD 0)"
RECREATE_PHP="$(get_cfg RECREATE_PHP 1)"

if [[ -z "${IMAGE_BUILD_SIGNATURE:-}" ]]; then
  DOCKERFILE_HASH="$(sha256sum php/Dockerfile | awk '{print $1}')"
  IMAGE_BUILD_SIGNATURE="$(printf '%s' "Dockerfile=${DOCKERFILE_HASH}|HOST_UID=${HOST_UID}|HOST_GID=${HOST_GID}|PHP_VERSION=${PHP_VERSION}|WP_CLI_VERSION=${WP_CLI_VERSION}" | sha256sum | awk '{print $1}')"
fi
export IMAGE_BUILD_SIGNATURE

PHP_IMAGE_TAG="${PHP_IMAGE}:${PHP_VERSION}"
PROXY_IMAGE="$(sed -n 's/^[[:space:]]*image:[[:space:]]*//p' proxy/traefik/docker-compose.yml | head -n1)"

case "$TARGET" in
  proxy-up)
    proxy_up
    ;;
  proxy-check)
    proxy_check
    ;;
  proxy-ensure)
    proxy_ensure
    ;;
  proxy-dynamic-perms)
    proxy_dynamic_perms
    ;;
  proxy-down)
    proxy_compose down || true
    ;;
  up)
    proxy_check
    check_versions
    pull_prebuilt
    build_php
    compose up -d
    recreate_php
    image_clean
    echo "[OK] Docker-Stack gebaut & gestartet. URL: ${LOCAL_URL}"
    show_urls_and_status
    ;;
  down)
    compose down
    ;;
  build)
    args=(build)
    [[ "$PULL" == "1" ]] && args+=(--pull)
    compose "${args[@]}"
    image_clean
    ;;
  start)
    compose start
    ;;
  stop)
    compose stop
    ;;
  logs)
    compose logs -f apache
    ;;
  image-clean)
    image_clean
    ;;
  pull-prebuilt)
    pull_prebuilt
    ;;
  php-image-current)
    php_image_current
    ;;
  build-php)
    build_php
    ;;
  recreate-php)
    recreate_php
    ;;
  up-all)
    proxy_check
    check_versions
    pull_prebuilt
    compose up -d
    echo "[OK] Docker-Stack gestartet. URL: ${LOCAL_URL}"
    show_urls_and_status
    ;;
  up-all-build)
    proxy_ensure
    check_versions

    if ! has_init_dump; then
      echo "[up-all-build] Keine Init-Dumps vorhanden. Versuche, die Live-DB per SSH zu ziehen..."
      if bash scripts/db_pull.sh db/init/live.sql.gz; then
        echo "[up-all-build] Live-DB-Dump nach _docker/db/init/live.sql.gz geladen"
      else
        echo "[up-all-build] Live-DB-Dump fehlgeschlagen; fahre ohne Init-Dump fort (leere Datenbank bei erster Initialisierung)."
      fi

      if has_init_dump && docker volume ls --format '{{.Name}}' | grep -qx "${PROJECT_NAME}_db_data"; then
        echo "[up-all-build] Hinweis: DB-Volume ${PROJECT_NAME}_db_data existiert bereits; MariaDB importiert Init-Dumps nur bei erster Initialisierung."
        echo "             Importiere den erzeugten Dump mit 'make -C _docker db-import-init-dump' oder setze zurueck mit 'make -C _docker db-reset-from-live CONFIRM=1'."
      fi
    fi

    pull_prebuilt
    build_php
    compose up -d
    recreate_php
    image_clean
    echo "[OK] Docker-Stack gebaut & gestartet. URL: ${LOCAL_URL}"
    show_urls_and_status
    ;;
  down-all)
    compose down || true
    proxy_compose down || true
    ;;
  restart-all)
    check_versions
    compose down || true
    proxy_compose down || true
    ensure_proxy_network
    if [[ "$PULL" == "1" ]]; then
      echo "[INFO] Lade Proxy-Image(s): traefik"
      proxy_compose pull traefik
    fi
    proxy_compose up -d
    pull_prebuilt
    compose up -d
    echo "[OK] Docker-Stack neu gestartet. URL: ${LOCAL_URL}"
    show_urls_and_status
    ;;
  rebuild-all)
    check_versions
    compose down || true
    proxy_compose down || true
    ensure_proxy_network
    if [[ "$PULL" == "1" ]]; then
      echo "[INFO] Lade Proxy-Image(s): traefik"
      proxy_compose pull traefik
    fi
    proxy_compose up -d
    pull_prebuilt
    compose up -d --build
    image_clean
    echo "[OK] Docker-Stack neu gebaut & gestartet. URL: ${LOCAL_URL}"
    show_urls_and_status
    ;;
  db-pull-init)
    bash scripts/db_pull.sh db/init/live.sql.gz
    ;;
  db-pull)
    bash scripts/db_pull.sh ../live.sql.gz
    ;;
  db-import)
    [[ -f ../live.sql.gz ]] || { echo "../live.sql.gz nicht gefunden (Repository-Root)" >&2; exit 1; }
    import_gzip_to_db ../live.sql.gz
    ;;
  db-import-init-dump)
    [[ -f db/init/live.sql.gz ]] || { echo "_docker/db/init/live.sql.gz nicht gefunden" >&2; exit 1; }
    import_gzip_to_db db/init/live.sql.gz
    ;;
  db-reset)
    require_confirm
    compose down -v
    build_php
    compose up -d
    image_clean
    ;;
  db-reset-from-live)
    bash scripts/db_pull.sh db/init/live.sql.gz
    require_confirm
    compose down -v
    build_php
    compose up -d
    image_clean
    ;;
  check-versions)
    check_versions
    ;;
esac
