#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$here/../.." && pwd)"
config_file="$repo_root/_docker/.env"

dest="${1:-$repo_root/_docker/db/init/live.sql.gz}"
mkdir -p "$(dirname "$dest")"

if [[ ! -f "$config_file" ]]; then
  echo "$config_file fehlt. Erstelle _docker/.env und setze SSH_*/REMOTE_* Variablen." >&2
  exit 1
fi

# Read key=value from .env without shell expansion
getval() {
  # Read key=value from .env; no shell expansion
  local key="$1"
  local val=""
  val=$(grep -E "^${key}=" "$config_file" | head -n1 | sed -e "s/^${key}=//" -e 's/\r$//') || true
  # strip surrounding single or double quotes if present
  val="${val%\"}"; val="${val#\"}"
  val="${val%\'}"; val="${val#\'}"
  printf '%s' "$val"
}

SSH_HOST="$(getval SSH_HOST)"
SSH_USER="$(getval SSH_USER)"
SSH_PORT="$(getval SSH_PORT)"

if [[ -z "$SSH_HOST" || -z "$SSH_USER" || -z "$SSH_PORT" ]]; then
  echo "SSH_HOST, SSH_USER und SSH_PORT muessen in _docker/.env gesetzt sein" >&2
  exit 1
fi

REMOTE_DB_NAME="$(getval REMOTE_DB_NAME)"
REMOTE_DB_USER="$(getval REMOTE_DB_USER)"
REMOTE_DB_PASSWORD="$(getval REMOTE_DB_PASSWORD)"
REMOTE_DB_HOST="$(getval REMOTE_DB_HOST)"

if [[ -z "$REMOTE_DB_NAME" || -z "$REMOTE_DB_USER" || -z "$REMOTE_DB_PASSWORD" || -z "$REMOTE_DB_HOST" ]]; then
  echo "REMOTE_DB_HOST, REMOTE_DB_NAME, REMOTE_DB_USER und REMOTE_DB_PASSWORD muessen fuer db-pull in _docker/.env gesetzt sein" >&2
  exit 1
fi

quote() { printf %q "$1"; }
REMOTE_DB_HOST_Q=$(quote "$REMOTE_DB_HOST")
REMOTE_DB_NAME_Q=$(quote "$REMOTE_DB_NAME")
REMOTE_DB_USER_Q=$(quote "$REMOTE_DB_USER")
REMOTE_DB_PASSWORD_Q=$(quote "$REMOTE_DB_PASSWORD")

# Build remote command: use mysqldump/mariadb-dump over SSH
# with 'set -o pipefail' so that a failing mysqldump causes a non-zero exit status.
REMOTE_CMD="set -o pipefail; if command -v mysqldump >/dev/null 2>&1; then DUMP=mysqldump; elif command -v mariadb-dump >/dev/null 2>&1; then DUMP=mariadb-dump; else echo 'mysqldump/mariadb-dump auf dem Server nicht gefunden' >&2; exit 127; fi; MYSQL_PWD=$REMOTE_DB_PASSWORD_Q \"\$DUMP\" --no-tablespaces --single-transaction -h $REMOTE_DB_HOST_Q -u $REMOTE_DB_USER_Q $REMOTE_DB_NAME_Q | gzip -c"

tmp="$dest.part"
echo "Hole Live-DB per SSH von $SSH_USER@$SSH_HOST ($REMOTE_DB_USER@$REMOTE_DB_HOST/$REMOTE_DB_NAME) -> $dest"
# Properly quote the remote command so it is passed as a single argument to bash -lc
remote_quoted_cmd=$(printf %q "$REMOTE_CMD")
if ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "bash -lc $remote_quoted_cmd" > "$tmp"; then
  mv "$tmp" "$dest"
  echo "Gespeichert: $dest"
else
  echo "[db-pull] SSH/mysqldump fehlgeschlagen; temporaere Datei $tmp wird bereinigt" >&2
  rm -f "$tmp"
  exit 1
fi
