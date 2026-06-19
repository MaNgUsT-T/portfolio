SHELL := /bin/bash

# Compose files relative to _docker/
COMPOSE_CMD := $(shell if docker compose version >/dev/null 2>&1; then echo "docker compose"; elif command -v docker-compose >/dev/null 2>&1; then echo "docker-compose"; else echo ""; fi)
ifeq ($(strip $(COMPOSE_CMD)),)
$(error Weder 'docker compose' noch 'docker-compose' gefunden. Bitte Docker Compose installieren.)
endif
COMPOSE := $(COMPOSE_CMD) -f docker-compose.yml
PROXY_COMPOSE_FILE := proxy/traefik/docker-compose.yml
PROXY_COMPOSE := $(COMPOSE_CMD) -f $(PROXY_COMPOSE_FILE)
# Run mysql inside db container using env credentials
DB_IMPORT := $(COMPOSE) exec -T db sh -c 'MYSQL_PWD="$$MYSQL_PASSWORD" mysql -u"$$MYSQL_USER" "$$MYSQL_DATABASE"'

# Read values directly from .env in _docker/
ENV_FILE := .env
ifeq (,$(wildcard $(ENV_FILE)))
$(error .env fehlt. Kopiere .env.example nach .env und fuelle die Werte aus.)
endif
# Read KEY=value from .env without shell expansion
get-env = $(shell sed -n 's/^$(1)=//p' $(ENV_FILE) | tail -n1)

PROJECT_NAME := $(call get-env,PROJECT_NAME)
PHP_VERSION  := $(call get-env,PHP_VERSION)
WP_CLI_VERSION  := $(call get-env,WP_CLI_VERSION)
DB_VERSION   := $(call get-env,DB_VERSION)
APACHE_VERSION := $(call get-env,APACHE_VERSION)
PHPMYADMIN_VERSION := $(call get-env,PHPMYADMIN_VERSION)
MAILHOG_VERSION := $(call get-env,MAILHOG_VERSION)
HOST_UID := $(strip $(call get-env,HOST_UID))
HOST_GID := $(strip $(call get-env,HOST_GID))

export PHP_VERSION WP_CLI_VERSION DB_VERSION APACHE_VERSION PHPMYADMIN_VERSION MAILHOG_VERSION
export HOST_UID HOST_GID

# Shared PHP-Image name (must be set in _docker/.env)
PHP_IMAGE := $(call get-env,PHP_IMAGE)
export PHP_IMAGE
LIVE_URL  := $(call get-env,LIVE_URL)
LOCAL_URL := $(call get-env,LOCAL_URL)
LIVE_PATH := $(call get-env,LIVE_PATH)
LOCAL_PATH:= $(call get-env,LOCAL_PATH)

VIRTUAL_HOST := $(call get-env,VIRTUAL_HOST)
PHPMYADMIN_HOST := $(call get-env,PHPMYADMIN_HOST)
MAILHOG_HOST := $(call get-env,MAILHOG_HOST)
MAILHOG_HOST := $(if $(MAILHOG_HOST),$(MAILHOG_HOST),mailhog.$(VIRTUAL_HOST))

export VIRTUAL_HOST PHPMYADMIN_HOST MAILHOG_HOST PROJECT_NAME LIVE_URL LOCAL_URL LIVE_PATH LOCAL_PATH

# Local DB credentials (used by containers). If not set in .env, derive from REMOTE_DB_*
MYSQL_DATABASE := $(call get-env,MYSQL_DATABASE)
MYSQL_USER     := $(call get-env,MYSQL_USER)
MYSQL_PASSWORD := $(call get-env,MYSQL_PASSWORD)
REMOTE_DB_NAME := $(call get-env,REMOTE_DB_NAME)
REMOTE_DB_USER := $(call get-env,REMOTE_DB_USER)
REMOTE_DB_PASSWORD := $(call get-env,REMOTE_DB_PASSWORD)

ifeq ($(MYSQL_DATABASE),)
  ifneq ($(REMOTE_DB_NAME),)
    MYSQL_DATABASE := $(REMOTE_DB_NAME)
  endif
endif
ifeq ($(MYSQL_USER),)
  ifneq ($(REMOTE_DB_USER),)
    MYSQL_USER := $(REMOTE_DB_USER)
  endif
endif
ifeq ($(MYSQL_PASSWORD),)
  ifneq ($(REMOTE_DB_PASSWORD),)
    MYSQL_PASSWORD := $(REMOTE_DB_PASSWORD)
  endif
endif

export MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD

# Optional image cleanup after builds (from .env, defaults: 1/1)
CLEAN_IMAGES := $(strip $(call get-env,CLEAN_IMAGES))
CLEAN_IMAGES := $(if $(CLEAN_IMAGES),$(CLEAN_IMAGES),1)
CLEAN_BASE_IMAGE := $(strip $(call get-env,CLEAN_BASE_IMAGE))
CLEAN_BASE_IMAGE := $(if $(CLEAN_BASE_IMAGE),$(CLEAN_BASE_IMAGE),1)
# Build pull toggle: set PULL=1 to force pulling base images and prebuilt service images.
# Default is auto: only pull prebuilt images if they are missing locally.
PULL := $(strip $(call get-env,PULL))
PULL := $(if $(PULL),$(PULL),0)
PULL_FLAG := $(if $(filter 1,$(PULL)),--pull,)
PHP_IMAGE_TAG := $(PHP_IMAGE):$(PHP_VERSION)
IMAGE_BUILD_SIGNATURE ?= $(shell printf '%s' 'Dockerfile=$$(sha256sum php/Dockerfile | awk "{print \$$1}")|HOST_UID=$(HOST_UID)|HOST_GID=$(HOST_GID)|PHP_VERSION=$(PHP_VERSION)|WP_CLI_VERSION=$(WP_CLI_VERSION)' | sha256sum | awk '{print $$1}')
export IMAGE_BUILD_SIGNATURE
FORCE_PHP_BUILD := $(strip $(call get-env,FORCE_PHP_BUILD))
FORCE_PHP_BUILD := $(if $(FORCE_PHP_BUILD),$(FORCE_PHP_BUILD),0)
PREBUILT_SERVICES := db apache phpmyadmin mailhog
PROXY_SERVICES := traefik
PROXY_IMAGE := $(shell sed -n 's/^[[:space:]]*image:[[:space:]]*//p' $(PROXY_COMPOSE_FILE) | head -n1)
# Ensure PHP container uses the latest image after rebuilds.
RECREATE_PHP := $(strip $(call get-env,RECREATE_PHP))
RECREATE_PHP := $(if $(RECREATE_PHP),$(RECREATE_PHP),1)

.PHONY: \
  proxy-up proxy-check proxy-ensure proxy-dynamic-perms proxy-down \
  up down build start stop logs image-clean pull-prebuilt php-image-current build-php recreate-php \
  up-all up-all-build down-all restart-all rebuild-all \
  db-import-init-dump \
  db-pull-init db-pull db-import db-reset db-reset-from-live \
  check-versions

## Ensure dev-proxy network and start traefik
proxy-up:
	@docker network ls --format '{{.Name}}' | grep -q '^dev-proxy$$' || docker network create dev-proxy
	@if [ "$(PULL)" = "1" ]; then \
	  echo "[INFO] Lade Proxy-Image(s): $(PROXY_SERVICES)"; \
	  $(PROXY_COMPOSE) pull $(PROXY_SERVICES); \
	elif ! docker image inspect "$(PROXY_IMAGE)" >/dev/null 2>&1; then \
	  echo "[INFO] Lade fehlende Proxy-Image(s): $(PROXY_SERVICES)"; \
	  $(PROXY_COMPOSE) pull $(PROXY_SERVICES); \
	fi
	$(PROXY_COMPOSE) up -d

proxy-check:
	@docker ps --format '{{.Names}}' | grep -q '^dev-proxy_traefik$$' || (echo "Traefik ist Pflicht: Container dev-proxy_traefik laeuft nicht." && exit 1)

proxy-ensure:
	@set -e; \
	if docker ps -a --format '{{.Names}}' | grep -q '^dev-proxy_traefik$$'; then \
	  echo "[INFO] Traefik-Container existiert. Starte proxy-check..."; \
	  $(MAKE) proxy-check; \
	  $(MAKE) proxy-dynamic-perms; \
	  echo "[INFO] Traefik-Container laeuft. Starte naechsten Schritt..."; \
	else \
	  echo "[INFO] Traefik-Container fehlt. Starte proxy-up..."; \
	  $(MAKE) proxy-up; \
	  echo "[INFO] Proxy-Start abgeschlossen. Starte proxy-check..."; \
	  $(MAKE) proxy-check; \
	  $(MAKE) proxy-dynamic-perms; \
	  echo "[INFO] Traefik-Container laeuft. Starte naechsten Schritt..."; \
	fi

proxy-dynamic-perms:
	@if docker ps --format '{{.Names}}' | grep -q '^dev-proxy_traefik$$'; then \
	  if docker exec dev-proxy_traefik sh -lc 'mkdir -p /etc/traefik/dynamic && chown $(HOST_UID):$(HOST_GID) /etc/traefik/dynamic && chmod 775 /etc/traefik/dynamic'; then \
	    echo "[INFO] Rechte fuer /etc/traefik/dynamic auf UID/GID $(HOST_UID):$(HOST_GID) gesetzt."; \
	  else \
	    echo "[WARN] Konnte Rechte auf /etc/traefik/dynamic nicht setzen."; \
	  fi; \
	fi

proxy-down:
	$(PROXY_COMPOSE) down || true

pull-prebuilt:
	@if [ "$(PULL)" = "1" ]; then \
	  echo "[INFO] Lade vorgebaute Images: $(PREBUILT_SERVICES)"; \
	  $(COMPOSE) pull $(PREBUILT_SERVICES); \
	else \
	  missing=""; \
	  if ! docker image inspect "mariadb:$(DB_VERSION)" >/dev/null 2>&1; then missing="$$missing db"; fi; \
	  if ! docker image inspect "httpd:$(APACHE_VERSION)" >/dev/null 2>&1; then missing="$$missing apache"; fi; \
	  if ! docker image inspect "phpmyadmin:$(PHPMYADMIN_VERSION)" >/dev/null 2>&1; then missing="$$missing phpmyadmin"; fi; \
	  if ! docker image inspect "mailhog/mailhog:$(MAILHOG_VERSION)" >/dev/null 2>&1; then missing="$$missing mailhog"; fi; \
	  if [ -n "$$missing" ]; then \
	    echo "[INFO] Lade fehlende vorgebaute Images: $$missing"; \
	    $(COMPOSE) pull $$missing; \
	  fi; \
	fi

php-image-current:
	@label_key='dev.wp.image-build-signature'; \
	current_signature="$$(docker image inspect "$(PHP_IMAGE_TAG)" --format "{{ index .Config.Labels \"$${label_key}\" }}" 2>/dev/null || true)"; \
	if [ -n "$$current_signature" ] && [ "$$current_signature" = "$(IMAGE_BUILD_SIGNATURE)" ]; then \
	  echo "[INFO] PHP-Image aktuell: $(PHP_IMAGE_TAG)"; \
	else \
	  echo "[INFO] PHP-Image veraltet oder fehlt: $(PHP_IMAGE_TAG)"; \
	  exit 1; \
	fi

build-php:
	@if [ "$(FORCE_PHP_BUILD)" = "1" ]; then \
	  echo "[INFO] Erzwinge Build des PHP-Images"; \
	  $(COMPOSE) build $(PULL_FLAG) php; \
	elif $(MAKE) --no-print-directory php-image-current >/dev/null 2>&1; then \
	  echo "[INFO] PHP-Image $(PHP_IMAGE_TAG) existiert bereits; Build wird uebersprungen."; \
	else \
	  echo "[INFO] PHP-Image veraltet oder fehlt. Build wird gestartet: $(PHP_IMAGE_TAG)"; \
	  $(COMPOSE) build $(PULL_FLAG) php; \
	fi

recreate-php:
	@if [ "$(RECREATE_PHP)" = "1" ]; then \
	  ctn="$(PROJECT_NAME)_php"; \
	  cur_id=$$(docker inspect -f '{{.Image}}' "$$ctn" 2>/dev/null || true); \
	  new_id=$$(docker image inspect -f '{{.Id}}' "$(PHP_IMAGE_TAG)" 2>/dev/null || true); \
	  if [ -n "$$new_id" ] && [ "$$cur_id" != "$$new_id" ]; then \
	    echo "[INFO] Erstelle php-Container neu, um das neueste Image zu verwenden"; \
	    $(COMPOSE) up -d --force-recreate --no-deps php; \
	  fi; \
	fi

up: proxy-check check-versions
	@$(MAKE) pull-prebuilt
	# Baue das PHP-Image vor dem Start
	@$(MAKE) build-php
	$(COMPOSE) up -d
	@$(MAKE) recreate-php
	@$(MAKE) image-clean
	@echo "[OK] Docker-Stack gebaut & gestartet. URL: $(LOCAL_URL)"
	@if [ -n "$(PHPMYADMIN_HOST)" ]; then echo "[INFO] phpMyAdmin: http://$(PHPMYADMIN_HOST)"; fi
	@if [ -n "$(MAILHOG_HOST)" ]; then echo "[INFO] MailHog: http://$(MAILHOG_HOST)"; fi
	@command -v curl >/dev/null 2>&1 && { \
	  code=$$(curl -s -o /dev/null -w '%{http_code}' '$(LOCAL_URL)'); \
	  echo "[CHECK] HTTP-Status $(LOCAL_URL): $$code"; \
	} || { echo "[INFO] 'curl' nicht gefunden. Manuell prüfen: $(LOCAL_URL)"; }

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build $(PULL_FLAG)
	@$(MAKE) image-clean

start:
	$(COMPOSE) start

stop:
	$(COMPOSE) stop

logs:
	$(COMPOSE) logs -f apache

image-clean:
	@cleanup="$(CLEAN_IMAGES)"; base_cleanup="$(CLEAN_BASE_IMAGE)"; \
	if [ "$$cleanup" = "1" ]; then \
	  echo "[INFO] Bereinige ungenutzte Images"; \
	  docker image prune -f >/dev/null || true; \
	  if [ "$$base_cleanup" = "1" ] && [ -n "$(PHP_VERSION)" ]; then \
	    base="php:$(PHP_VERSION)-fpm"; \
	    if docker image inspect "$$base" >/dev/null 2>&1; then \
	      echo "[INFO] Entferne Basis-Image $$base"; \
	      docker rmi "$$base" >/dev/null 2>&1 || true; \
	    fi; \
	  fi; \
	fi

## Convenience: start proxy and project together
up-all: proxy-check check-versions
	@$(MAKE) pull-prebuilt
	$(COMPOSE) up -d
	@echo "[OK] Docker-Stack gestartet. URL: $(LOCAL_URL)"
	@# Admin-/Login-URL bestimmen (WPS Hide Login beachten)
	@set -euo pipefail; \
	@if [ -n "$(PHPMYADMIN_HOST)" ]; then echo "[INFO] phpMyAdmin: http://$(PHPMYADMIN_HOST)"; fi
	@if [ -n "$(MAILHOG_HOST)" ]; then echo "[INFO] MailHog: http://$(MAILHOG_HOST)"; fi
	@command -v curl >/dev/null 2>&1 && { \
	  code=$$(curl -s -o /dev/null -w '%{http_code}' '$(LOCAL_URL)'); \
	  echo "[CHECK] HTTP-Status $(LOCAL_URL): $$code"; \
	} || { echo "[INFO] 'curl' nicht gefunden. Manuell prüfen: $(LOCAL_URL)"; }

# Like up-all, but build PHP if the image is missing (use FORCE_PHP_BUILD=1 to rebuild)
up-all-build: proxy-ensure check-versions
	@if ! ls -1 db/init/*.sql >/dev/null 2>&1 && ! ls -1 db/init/*.sql.gz >/dev/null 2>&1; then \
	  echo "[up-all-build] Keine Init-Dumps vorhanden. Versuche, die Live-DB per SSH zu ziehen..."; \
	  if bash scripts/db_pull.sh db/init/live.sql.gz; then \
	    echo "[up-all-build] Live-DB-Dump nach _docker/db/init/live.sql.gz geladen"; \
	  else \
	    echo "[up-all-build] Live-DB-Dump fehlgeschlagen; fahre ohne Init-Dump fort (leere Datenbank bei erster Initialisierung)."; \
	  fi; \
	  if (ls -1 db/init/*.sql >/dev/null 2>&1 || ls -1 db/init/*.sql.gz >/dev/null 2>&1) && docker volume ls --format '{{.Name}}' | grep -qx '$(PROJECT_NAME)_db_data'; then \
	      echo "[up-all-build] Hinweis: DB-Volume $(PROJECT_NAME)_db_data existiert bereits; MariaDB importiert Init-Dumps nur bei erster Initialisierung."; \
	    echo "             Importiere den erzeugten Dump mit 'make -C _docker db-import-init-dump' oder setze zurueck mit 'make -C _docker db-reset-from-live CONFIRM=1'."; \
	    fi; \
	fi
	@$(MAKE) pull-prebuilt
	@$(MAKE) build-php
	$(COMPOSE) up -d
	@$(MAKE) recreate-php
	@$(MAKE) image-clean
	@echo "[OK] Docker-Stack gebaut & gestartet. URL: $(LOCAL_URL)"
	@# Admin-/Login-URL bestimmen (WPS Hide Login beachten)
	@if [ -n "$(PHPMYADMIN_HOST)" ]; then echo "[INFO] phpMyAdmin: http://$(PHPMYADMIN_HOST)"; fi
	@if [ -n "$(MAILHOG_HOST)" ]; then echo "[INFO] MailHog: http://$(MAILHOG_HOST)"; fi
	@command -v curl >/dev/null 2>&1 && { \
	  code=$$(curl -s -o /dev/null -w '%{http_code}' '$(LOCAL_URL)'); \
	  echo "[CHECK] HTTP-Status $(LOCAL_URL): $$code"; \
	} || { echo "[INFO] 'curl' nicht gefunden. Manuell prüfen: $(LOCAL_URL)"; }

down-all:
	$(COMPOSE) down || true
	$(PROXY_COMPOSE) down || true

# Schnell neu starten ohne Neubuild
restart-all: check-versions
	$(COMPOSE) down || true
	$(PROXY_COMPOSE) down || true
	@docker network ls --format '{{.Name}}' | grep -q '^dev-proxy$$' || docker network create dev-proxy
	@if [ "$(PULL)" = "1" ]; then \
	  echo "[INFO] Lade Proxy-Image(s): $(PROXY_SERVICES)"; \
	  $(PROXY_COMPOSE) pull $(PROXY_SERVICES); \
	fi
	$(PROXY_COMPOSE) up -d
	@$(MAKE) pull-prebuilt
	$(COMPOSE) up -d
	@echo "[OK] Docker-Stack neu gestartet. URL: $(LOCAL_URL)"
	@# Admin-/Login-URL bestimmen (WPS Hide Login beachten)
	@set -euo pipefail; \
	@if [ -n "$(PHPMYADMIN_HOST)" ]; then echo "[INFO] phpMyAdmin: http://$(PHPMYADMIN_HOST)"; fi
	@if [ -n "$(MAILHOG_HOST)" ]; then echo "[INFO] MailHog: http://$(MAILHOG_HOST)"; fi
	@command -v curl >/dev/null 2>&1 && { \
	  code=$$(curl -s -o /dev/null -w '%{http_code}' '$(LOCAL_URL)'); \
	  echo "[CHECK] HTTP-Status $(LOCAL_URL): $$code"; \
	} || { echo "[INFO] 'curl' nicht gefunden. Manuell prüfen: $(LOCAL_URL)"; }

# Neuaufbau mit Build (vorheriges Verhalten)
rebuild-all: check-versions
	$(COMPOSE) down || true
	$(PROXY_COMPOSE) down || true
	@docker network ls --format '{{.Name}}' | grep -q '^dev-proxy$$' || docker network create dev-proxy
	@if [ "$(PULL)" = "1" ]; then \
	  echo "[INFO] Lade Proxy-Image(s): $(PROXY_SERVICES)"; \
	  $(PROXY_COMPOSE) pull $(PROXY_SERVICES); \
	fi
	$(PROXY_COMPOSE) up -d
	@$(MAKE) pull-prebuilt
	$(COMPOSE) up -d --build
	@$(MAKE) image-clean
	@echo "[OK] Docker-Stack neu gebaut & gestartet. URL: $(LOCAL_URL)"
	@if [ -n "$(PHPMYADMIN_HOST)" ]; then echo "[INFO] phpMyAdmin: http://$(PHPMYADMIN_HOST)"; fi
	@if [ -n "$(MAILHOG_HOST)" ]; then echo "[INFO] MailHog: http://$(MAILHOG_HOST)"; fi
	@command -v curl >/dev/null 2>&1 && { \
	  code=$$(curl -s -o /dev/null -w '%{http_code}' '$(LOCAL_URL)'); \
	  echo "[CHECK] HTTP-Status $(LOCAL_URL): $$code"; \
	} || { echo "[INFO] 'curl' nicht gefunden. Manuell prüfen: $(LOCAL_URL)"; }

# Pull live DB dump into init folder (used on first DB init)
db-pull-init:
	bash scripts/db_pull.sh db/init/live.sql.gz

# Pull live DB dump into project root for manual import (repository root)
db-pull:
	bash scripts/db_pull.sh ../live.sql.gz

# Import a dump (expects ./live.sql.gz in repository root) into running containers
db-import:
	@test -f ../live.sql.gz || (echo "../live.sql.gz nicht gefunden (Repository-Root)" >&2; exit 1)
	@gzip -dc ../live.sql.gz | $(DB_IMPORT)

# Import the generated init dump into running DB (no reset)
db-import-init-dump:
	@test -f db/init/live.sql.gz || (echo "_docker/db/init/live.sql.gz nicht gefunden" >&2; exit 1)
	@gzip -dc db/init/live.sql.gz | $(DB_IMPORT)

# Reset DB volume and re-init (will import any dumps in _docker/db/init)
db-reset:
	@[ "$(CONFIRM)" = "1" ] || (echo "Loeschen des DB-Volumes verweigert. Mit CONFIRM=1 erneut ausfuehren" >&2; exit 1)
	$(COMPOSE) down -v
	@$(MAKE) build-php
	$(COMPOSE) up -d
	@$(MAKE) image-clean

# Convenience: fetch live dump into init, then reset (requires CONFIRM=1)
db-reset-from-live: db-pull-init
	@[ "$(CONFIRM)" = "1" ] || (echo "Loeschen des DB-Volumes verweigert. Mit CONFIRM=1 erneut ausfuehren" >&2; exit 1)
	$(COMPOSE) down -v
	@$(MAKE) build-php
	$(COMPOSE) up -d
	@$(MAKE) image-clean

.PHONY: check-versions
check-versions:
	@if [ -z "$(PHP_IMAGE)" ] || [ -z "$(PHP_VERSION)" ] || [ -z "$(WP_CLI_VERSION)" ] || [ -z "$(DB_VERSION)" ] || [ -z "$(APACHE_VERSION)" ] || [ -z "$(PHPMYADMIN_VERSION)" ] || [ -z "$(MAILHOG_VERSION)" ] || [ -z "$(HOST_UID)" ] || [ -z "$(HOST_GID)" ]; then \
	  echo "Fehlende Pflicht-Variablen. In _docker/.env setzen:" >&2; \
	  echo "  PHP_IMAGE, PHP_VERSION, WP_CLI_VERSION, DB_VERSION, APACHE_VERSION, PHPMYADMIN_VERSION, MAILHOG_VERSION, HOST_UID, HOST_GID" >&2; \
	  exit 1; \
	fi
