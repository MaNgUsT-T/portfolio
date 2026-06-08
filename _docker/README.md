# Lokale Docker Entwicklungsumgebung für dpp.clinton.de

Stand: 2026-04-07

Dieses Dokument beschreibt die lokale Docker-Entwicklungsumgebung dieses Repositories. Es dient als technische Referenz
für Start, Betrieb, Konfiguration und Troubleshooting. Ziel ist es, eine 1:1-Parität zu gewährleisten, um
"funktioniert bei mir, aber nicht live"-Probleme zu vermeiden.

## Dokumentationsstruktur

- `_docker/README.md` enthält die technischen Docker-Details.
- `README.md` bietet den schlanken Projekteinstieg.
- `AGENTS.md` enthält Rollen, Verantwortlichkeiten und Arbeitsweise für Agenten.
- `CONTRIBUTING.md` regelt Beiträge (Codestyle, QA, Commits/PRs).

## Spezifikationen der Umgebung

### Webserver
Apache aus `httpd:${APACHE_VERSION}` (2.4-Serie) mit `.htaccess`-Unterstützung (`AllowOverride All`, `mod_rewrite`
aktiv).

### PHP
Eigenes PHP-FPM-Image (`FROM php:${PHP_VERSION}-fpm`), Version über `_docker/.env` (`PHP_VERSION`).

### Datenbank
MariaDB über `_docker/.env` (`DB_VERSION`, Image `mariadb:${DB_VERSION}`).

### Tools

- WP-CLI ist im PHP-Image vorinstalliert (`/usr/local/bin/wp`).
- phpMyAdmin über `_docker/.env` (`PHPMYADMIN_VERSION`, Image `phpmyadmin:${PHPMYADMIN_VERSION}`) für die grafische
  Datenbankverwaltung.
- MailHog über `_docker/.env` (`MAILHOG_VERSION`, Image `mailhog/mailhog:latest`) für lokale
  E-Mail-Tests.

### Reverse Proxy / Routing
Traefik-basiertes Host-Routing über `dev-proxy` mit `VIRTUAL_HOST` und `PHPMYADMIN_HOST`.

### Struktur
Infrastruktur unter `_docker/`, Anwendungs-Root im Repository-Root.

## Voraussetzungen
Für den zuverlässigen Betrieb der lokalen Umgebung werden folgende Voraussetzungen erwartet:

### Docker + Compose
Auf dem Host muss `docker compose` oder `docker-compose` verfügbar sein.

### Projekt-Konfiguration
`_docker/.env` muss vorhanden sein (aus `_docker/.env.example` ableiten) und die Pflichtvariablen für Build/Laufzeit
enthalten (`PHP_IMAGE`, `PHP_VERSION`, `WP_CLI_VERSION`, `DB_VERSION`, `APACHE_VERSION`, `PHPMYADMIN_VERSION`,
`HOST_UID`, `HOST_GID`).

### Hostnamen für Routing
`VIRTUAL_HOST` und `PHPMYADMIN_HOST` müssen in `_docker/.env` gesetzt sein und lokal auf `127.0.0.1` auflösen
(Hosts-Datei). `MAILHOG_HOST` kann ebenfalls gesetzt werden; ohne Wert verwenden die Startskripte
`mailhog.<VIRTUAL_HOST>`.

### Traefik-Proxy
Für `up`, `up-all` und alle URL-basierten Zugriffe muss der Proxy-Container `dev-proxy_traefik` laufen (wird bei
`up-all-build` automatisch sichergestellt).

### Werkzeugwahl
`make` ist der empfohlene Aufrufpfad. Alternativ können die PowerShell-/Bash-Wrapper unter `_docker/` genutzt werden.

### Optional für Live-DB-Pull:
Für `db-pull*` und `db-reset-from-live` werden SSH-Erreichbarkeit sowie gültige `SSH_*`- und `REMOTE_DB_*`-Werte in
`_docker/.env` benötigt.

## Umgebungsvariablen

### SSH-Zugang zum Server (für DB-Pull)

- `SSH_HOST`: SSH-Host für `db-pull`/`db-pull-init` (Remote-Zugriff für Dump).
- `SSH_USER`: SSH-Benutzer für den DB-Pull.
- `SSH_PORT`: SSH-Port für den DB-Pull.

### Live-DB-Zugänge (kanonisch für DB-Pull, werden lokal ggf. in MYSQL_* gespiegelt)

- `REMOTE_DB_HOST`: Datenbank-Host der Live-/Remote-DB für `db_pull.sh`.
- `REMOTE_DB_NAME`: Datenbankname der Live-/Remote-DB für `db_pull.sh`.
- `REMOTE_DB_USER`: Datenbankbenutzer der Live-/Remote-DB für `db_pull.sh`.
- `REMOTE_DB_PASSWORD`: Datenbankpasswort der Live-/Remote-DB für `db_pull.sh`.

### Passwort für den 'root'-Benutzer der Datenbank.

- `MYSQL_ROOT_PASSWORD`: Root-Passwort für MariaDB (`db`) und phpMyAdmin (`phpmyadmin`).

### Lokale DB-Zugänge (optional). Wenn leer, leitet das Makefile sie aus REMOTE_DB_* ab.

- `MYSQL_DATABASE`: Lokaler Datenbankname für den MariaDB-Container (`MYSQL_DATABASE`). Wenn leer, wird
  `REMOTE_DB_NAME` verwendet.
- `MYSQL_USER`: Lokaler DB-Benutzer für MariaDB/PHP (`MYSQL_USER`). Wenn leer, wird `REMOTE_DB_USER` verwendet.
- `MYSQL_PASSWORD`: Lokales DB-Passwort für MariaDB/PHP (`MYSQL_PASSWORD`). Wenn leer, wird `REMOTE_DB_PASSWORD`
  verwendet.

### Host-UID/GID fuer Bind-Mount-Schreibrechte.
Diese Werte werden in diesem Projekt zentral aus `_docker/.env` gelesen und von Makefile sowie `docker compose` gleich
verwendet.

- `HOST_UID`: Host-UID für Build/Dateirechte (Bind-Mounts, Proxy-Dynamic-Permissions).
- `HOST_GID`: Host-GID für Build/Dateirechte (Bind-Mounts, Proxy-Dynamic-Permissions).

### Versionen

- `PHP_VERSION`: Tag für PHP-Image-Version (`${PHP_IMAGE}:${PHP_VERSION}`).
- `WP_CLI_VERSION`: WP-CLI-Version für den PHP-Image-Build.
- `DB_VERSION`: MariaDB-Image-Version (`mariadb:${DB_VERSION}`).
- `APACHE_VERSION`: Apache-Image-Version (`httpd:${APACHE_VERSION}`).
- `PHPMYADMIN_VERSION`: phpMyAdmin-Image-Version (`phpmyadmin:${PHPMYADMIN_VERSION}`).
- `MAILHOG_VERSION`: MailHog-Image-Version (`mailhog/mailhog:latest`).

### Gemeinsamer PHP-Imagename (für php)

- `PHP_IMAGE`: Image-Name für `php`.

### Projektname

- `PROJECT_NAME`: Compose-Projektname. Prägt Container-/Netzwerk-/Volume-Namen.

### URLs / Pfade

- `LIVE_URL`: Quell-URL für manuelle URL-Rewrites.
- `LOCAL_URL`: Ziel-URL für lokale Umgebung und Link-Ausgaben.
- `LIVE_PATH`: Quellpfad für manuelle Pfad-Rewrites.
- `LOCAL_PATH`: Zielpfad für lokale Container-Umgebung (typisch `/var/www/html`).

### Reverse-Proxy-Hostnamen

- `VIRTUAL_HOST`: Traefik-Hostname für die Website (`apache`-Routerregel).
- `PHPMYADMIN_HOST`: Traefik-Hostname für phpMyAdmin (`phpmyadmin`-Routerregel).
- `MAILHOG_HOST`: Traefik-Hostname für MailHog (`mailhog`-Routerregel). Wenn der Wert in `_docker/.env` fehlt,
  verwenden Makefile und Buildfile.sh/ps1 `mailhog.<VIRTUAL_HOST>`.


## Makefile-Flags (optionale Laufzeitsteuerung)

- `CLEAN_IMAGES` (Standard `1`): Entfernt ungenutzte Docker-Images nach Build/Start-Zielen.
- `CLEAN_BASE_IMAGE` (Standard `1`): Entfernt zusätzlich `php:<PHP_VERSION>-fpm` im Target `image-clean`.
- `FORCE_PHP_BUILD` (Standard `0`): Erzwingt Neubau des PHP-Images trotz gültiger Build-Signatur.
- `PULL` (Standard `0`): Erzwingt Pull von Proxy-/Prebuilt-Images.
- `RECREATE_PHP` (Standard `1`): Erstellt den `php`-Container neu, wenn sich die Image-ID geändert hat.

Alle Flags können dauerhaft in `_docker/.env` gesetzt oder pro Aufruf per CLI-Override (`make ... VAR=...`) gesetzt
werden.

## Checkliste für neue Projekte
Wenn diese Konfiguration für ein neues Projekt kopiert wird, müssen die folgenden Punkte angepasst werden.

### `_docker/php/Dockerfile` / Versionierung

#### PHP-Version setzen
Per Build-Arg über `PHP_VERSION` (in `_docker/.env`). Dockerfile nutzt `FROM php:${PHP_VERSION}-fpm` – keine manuelle
Änderung der Dockerfile nötig.

#### Image-Name
Über `PHP_IMAGE` (Standard: `ionos-php`). Hinweis: Ein lokales Build mit `PHP_IMAGE=php` taggt das Image als
`php:<Version>` und überschreibt lokal den offiziellen Tag.

#### Build-Signatur
Das Makefile prüft das PHP-Image gegen eine Signatur aus `php/Dockerfile`, `HOST_UID`, `HOST_GID`, `PHP_VERSION` und
`WP_CLI_VERSION`. Bei Abweichungen wird automatisch neu gebaut.

#### Image-Cleanup (automatisch)
Nach Build-Targets räumt das Makefile ungenutzte Images auf und entfernt optional
das Basis-Image `php:<PHP_VERSION>-fpm`. Steuerbar über `_docker/.env` (`CLEAN_IMAGES`, `CLEAN_BASE_IMAGE`) oder
per CLI-Override (`make ... CLEAN_IMAGES=0 CLEAN_BASE_IMAGE=0`).

- Standard: `CLEAN_IMAGES=1`, `CLEAN_BASE_IMAGE=1`.
- Manuell: `make -C _docker image-clean`.

#### PHP-Erweiterungen
Den "Website‑Zustand" des Projekts prüfen und Extensions im Dockerfile entsprechend anpassen (gd, intl, mbstring,
mysqli/pdo_mysql, zip sind enthalten).

### `_docker/php/uploads.ini` anpassen
Werte für `memory_limit`, `max_execution_time`, `upload_max_filesize` usw. aus der Live-Server-Konfiguration in diese
Datei übernehmen.

### `_docker/.env` Datei anpassen
Dies ist der wichtigste Schritt. Alle projektspezifischen Werte (inkl. Versionen/Hostnamen) werden hier definiert.

- `PROJECT_NAME`: Eindeutiger Projektname. Wird für Container-, Volume- und Netzwerk-Namen verwendet.
- `VIRTUAL_HOST`, `PHPMYADMIN_HOST`, `MAILHOG_HOST`: Hostnamen für Traefik-Routing.
- `PHP_IMAGE`, `PHP_VERSION`, `WP_CLI_VERSION`, `DB_VERSION`, `APACHE_VERSION`, `PHPMYADMIN_VERSION`,
  `MAILHOG_VERSION`: Versionen/Image.
- `HOST_UID`, `HOST_GID`: Host-UID/GID für Linux/WSL-Bind-Mount-Schreibrechte (`www-data` im PHP-Image).
- `MYSQL_ROOT_PASSWORD`: Neues, sicheres Root-Passwort setzen.
- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`: Lokale DB-Zugänge (können leer bleiben, werden bei Bedarf aus
  REMOTE_DB_* abgeleitet).
- `LIVE_URL`, `LOCAL_URL`: Öffentliche Live-/Staging-URL und lokale URL.
- `LIVE_PATH`, `LOCAL_PATH`: Live-Serverpfad und Containerpfad für Pfad-Ersetzungen.

### `_docker/docker-compose.yml` anpassen

#### Container-/Netzwerk-/Volume-Namen
Werden automatisch über `PROJECT_NAME` gesetzt (siehe `_docker/.env`). Benannte Ressourcen verhindern Kollisionen
(`${PROJECT_NAME}_cl_network`, `${PROJECT_NAME}_db_data`).

#### Traefik-Routing (portlos)
Es werden keine Container-Ports veröffentlicht. Der Zugriff erfolgt über `VIRTUAL_HOST`/`PHPMYADMIN_HOST` via Traefik
(Port 80 auf `127.0.0.1`).

#### Traefik-Provider
Der Proxy nutzt Docker-Provider und File-Provider. Zusätzliche Laufzeit-Konfigurationen werden aus
`/etc/traefik/dynamic` geladen (über das benannte Volume `dev-proxy-dynamic`).

- Gemeint sind zusätzliche Traefik-Regeln als YAML-Dateien, die nicht als Docker-Labels an einzelnen Services hängen.
- Zweck: zentrale, projektübergreifende Regeln, z. B. Host-/Pfad-Routing auf mehrere Stacks, globale Middlewares oder
  statische Services.
- Wichtig: In diesem Projekt ist `--providers.file.watch=true` aktiv. Änderungen in `dynamic/` werden ohne
  Traefik-Neustart neu geladen.
- Das Make-Target `proxy-dynamic-perms` setzt die Rechte auf `/etc/traefik/dynamic` auf die in `_docker/.env` gesetzten
  `HOST_UID`/`HOST_GID`.
- Die automatische Ausführung von `proxy-dynamic-perms` erfolgt derzeit nur über `proxy-ensure` (z. B. in
  `up-all-build`). Bei reinem `proxy-up` bei Bedarf manuell ausführen: `make -C _docker proxy-dynamic-perms`.
- Shopify-Stacks können Dynamic-Dateien direkt schreiben/entfernen. Traefik übernimmt Änderungen bei aktivem
  `watch=true` automatisch.

#### Performance-Hinweis (macOS):
Der Haupt-Bind-Mount wird mit `:cached` betrieben (`../:/var/www/html:cached`) für bessere IO-Performance.

### `_docker/README.md` anpassen
Projekttitel und alle spezifischen Beispiele (z. B. URLs) aktualisieren, um das neue Projekt widerzuspiegeln.

### `.gitignore` anpassen
Für neue Projekte die Ignore-Regeln auf projektspezifische Pfade prüfen und bei Bedarf anpassen.

- `_docker/.env` muss immer ignoriert bleiben (lokale Secrets/Passwörter).
- SQL-Dumps bleiben ignoriert (`*.sql`, `*.sql.gz`, `_docker/db/init/*.sql`, `_docker/db/init/*.sql.gz`).
- Lokale IDE-/OS-Dateien bleiben ignoriert (`.idea`, `.DS_Store`).
- Projektspezifische lokale Artefakte (z. B. `img/products`) nur dann beibehalten, wenn sie nicht versioniert werden
  sollen.

### Zeitzonen & PHP‑Einstellungen

- Container‑Timezone ist in `docker-compose.yml` als `Europe/Berlin` gesetzt. Bei Bedarf in den
  `environment:`‑Blöcken der Services ändern.
- PHP‑Timezone und Limits werden über `_docker/php/uploads.ini` gesteuert (z.B. `date.timezone`, `memory_limit`,
  `max_execution_time`). Die Datei bei Bedarf manuell anpassen.

## Installation der Umgebung samt Projekt
Die folgenden Schritte richten das Projekt zum ersten Mal ein.

#### Projekt-Dateien hinzufügen
Alle Projekt-Dateien und -Ordner direkt in diesem Hauptverzeichnis platzieren.

#### Umgebungsvariablen konfigurieren

1. In das `_docker`-Verzeichnis wechseln.
2. Die Vorlagendatei `_docker/.env.example` nach `_docker/.env` kopieren.
3. Die neue `_docker/.env`-Datei öffnen und projektspezifische Werte sowie Passwörter eintragen.

Liste der Variablen befindet sich unter [Umgebungsvariablen](#umgebungsvariablen)

#### Container bauen und starten
Den passenden Weg nach lokaler Installation wählen. Alle Befehle vom **Hauptverzeichnis des Projekts** ausführen.

##### Makefile (empfohlen)
Der einfachste Weg, die gesamte Umgebung (inklusive des Proxy-Servers) zu starten und die benötigten Images zu bauen,
ist die Verwendung des `make`-Befehls:

```bash
make -C _docker up-all-build
```

Was dieser Befehl tut:
- Startet den Traefik Proxy: Stellt sicher, dass das `dev-proxy` Netzwerk existiert und startet den Traefik Reverse
  Proxy, der Anfragen an lokale Hostnamen (wie in `.env` für `VIRTUAL_HOST` definiert) weiterleitet.
- Baut (bei Bedarf) und startet die Projekt-Container: Baut das benutzerdefinierte PHP-Image, wenn
  `PHP_IMAGE:PHP_VERSION` fehlt, die Build-Signatur nicht mehr passt (`php/Dockerfile`, `HOST_UID`, `HOST_GID`,
  `PHP_VERSION`, `WP_CLI_VERSION`) oder `FORCE_PHP_BUILD=1` gesetzt ist, und startet anschließend die Container.

Hinweis: `up-all` erwartet einen bereits laufenden Traefik-Proxy (`dev-proxy_traefik`) und startet ihn nicht selbst.
Falls der Proxy fehlt: `make -C _docker proxy-up`.

Nach dem Start wartet das Makefile (und die PowerShell-Skripte unten) auf den Abschluss und gibt hilfreiche Links aus:
- phpMyAdmin: `[INFO] phpMyAdmin: http://<PHPMYADMIN_HOST>`.
- MailHog: `[INFO] MailHog: http://<MAILHOG_HOST>`.

Beispiele:
- phpMyAdmin: http://pma.project.local
- MailHog: http://mailhog.project.local

Für spätere Starts ohne Neu-Build genügt:

```bash
make -C _docker up-all
```

Vollständige Liste der Befehle befindet sich unter [Makefile Befehle](#makefile-befehle).

##### PowerShell
Für Windows PowerShell stehen eigenständige Skripte bereit:

`_docker/Buildfile.ps1` bildet die Makefile-Targets direkt über `-Target` ab und benötigt **kein** `make`.

```powershell
_docker\Buildfile.ps1 -Target up-all-build
```

Für spätere Starts ohne Neu-Build genügt:

```powershell
_docker\Buildfile.ps1 -Target up-all

```

Vollständige Liste der Befehle befindet sich unter [PowerShell-Skript
Befehle](#powershell-skript-befehle-buildfileps1).

##### Bash (Git Bash/WSL/Linux/macOS)
Als Alternative zu Make / PowerShell unter Git Bash, WSL, Linux und macOS:

```bash
bash ./_docker/Buildfile.sh up-all-build
```

Für spätere Starts ohne Neu-Build genügt:

```bash
bash ./_docker/Buildfile.sh up-all
```

Vollständige Liste der Befehle befindet sich unter [Bash-Skript Befehle](#bash-skript-befehle-buildfilesh).

Bei Nutzung eines WSL-/Linux-Terminals (`~/...$`):

```bash
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target up-all-build
```

Für spätere Starts ohne Neu-Build genügt:

```bash
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target up-all
```

Vollständige Liste der Befehle befindet sich unter [WSL/Linux-Terminal Befehle](#wsllinux-terminal-befehle)

#### Projekt-Installation abschließen
Browser unter der in `_docker/.env` gesetzten `LOCAL_URL` öffnen.

## Installations Prozesse
Hier werden die Prozesse detailliert beschrieben, die beim Target up-all-build (Make, Buildfile.sh, Buildfile.ps1)
ausgeführt werden.

### Traefik / Proxy aufsetzen
Das Setup nutzt Traefik als Reverse Proxy, um lokale Projekte über **saubere Hostnamen ohne explizite Portnummern** im
Browser aufzurufen.

Traefik bindet Port `80` des Host-Systems und leitet Anfragen basierend auf dem `Host`-Header an den korrekten
Docker-Container weiter.

**Damit dies funktioniert, sind folgende Schritte wichtig:**

#### Routing-Hostnamen in `_docker/.env` festlegen
In `_docker/.env` müssen `VIRTUAL_HOST` und `PHPMYADMIN_HOST` mit den gewünschten lokalen Hostnamen gesetzt sein.
Optional kann `MAILHOG_HOST` gesetzt werden; ohne Wert verwenden die Startskripte `mailhog.<VIRTUAL_HOST>`.

#### Hostnamen in die `hosts`-Datei eintragen
Das Betriebssystem muss wissen, dass die gewählten Hostnamen auf den lokalen Rechner verweisen. Dafür Einträge in die
`hosts`-Datei ergänzen:

- macOS/Linux: `/etc/hosts`
- Windows: `C:\Windows\System32\drivers\etc\hosts`

```
127.0.0.1 <VIRTUAL_HOST>
127.0.0.1 <PHPMYADMIN_HOST>
127.0.0.1 <MAILHOG_HOST>
```

**Nach diesen Schritten sind die Anwendung unter `<LOCAL_URL>`, phpMyAdmin unter `http://<PHPMYADMIN_HOST>` und MailHog
unter `http://<MAILHOG_HOST>` ohne Portnummern erreichbar.**

#### Traefik starten (einmalig für alle Projekte)
Das wird bei `up-all-build`, `restart-all` und `rebuild-all` automatisch gestartet. `up-all` prüft nur auf einen
laufenden Proxy und bricht sonst ab.

#### Hinweis zur Port-Bindung auf dem Host (127.0.0.1:80)

- Traefik bindet Port `80` nur lokal auf Loopback (`127.0.0.1:80` und `[::1]:80`). Wenn Port `80` bereits belegt ist,
  erscheint `port is already allocated`.
- Die Projekt-Services veröffentlichen keine eigenen Host-Ports. Das Routing erfolgt ausschließlich über Traefik.
- Für LAN-Zugriff müssen die Port-Mappings in `_docker/proxy/traefik/docker-compose.yml` von Loopback auf eine externe
  Bindung (z. B. `0.0.0.0:80:80`) umgestellt werden.

### Live-Datenbank Import
Der MariaDB-Container importiert beim allerersten Start automatisch SQL‑Dateien aus `_docker/db/init/`. Dabei werden
sowohl `*.sql` als auch `*.sql.gz` erkannt (alle vorhandenen Dateien werden importiert, daher idealerweise nur einen
Dump dort ablegen).

Beim Target up-all-build (Makefile, Buildfile.sh oder Buildfile.ps1) läuft die Importlogik in dieser Reihenfolge:

##### Init‑Ordner prüfen
Wenn bereits Dumps in `_docker/db/init/` liegen (`*.sql` oder `*.sql.gz`), werden sie beim ersten Start der Datenbank
importiert. Es wird kein weiterer Dump geholt.

##### Live‑Dump per SSH (Fallback)
Wenn keine Dumps im Init-Ordner liegen, wird bei up-all-build (make, Buildfile.sh, Buildfile.ps1) automatisch ein
Live-DB-Dump nach db/init/live.sql.gz versucht: standardmäßig über _docker/scripts/db_pull.sh; bei Buildfile.ps1 wird
bei Bedarf ein PowerShell-Fallback verwendet, also ein alternativer DB-Pull direkt per PowerShell, falls der Bash-Aufruf
nicht erfolgreich ist.

Dazu  muss `_docker/.env` um SSH/Remote-Parameter ergänzt werden:

```env
# SSH Verbindung
SSH_HOST=<SSH_HOST>
SSH_USER=<SSH_USER>
SSH_PORT=22

# Live-DB (Pflicht für db-pull/db-reset-from-live)
REMOTE_DB_HOST=<REMOTE_DB_HOST>
REMOTE_DB_NAME=
REMOTE_DB_USER=
REMOTE_DB_PASSWORD=
```

Schlägt der SSH‑Zugriff oder `mysqldump` fehl, wird der temporäre Dump verworfen und der Stack ohne Init‑Dump
gestartet.

##### Leere Datenbank
Wenn alle zwei Schritte keinen Dump ergeben, startet MariaDB mit einer leeren Datenbank (nur Schema `MYSQL_DATABASE`,
keine Tabellen).

## Umgebungsprozesse manuell ansteuern
Die folgenden Punkte beschreiben manuelle Abläufe, mit denen sich die wichtigsten Umgebungsprozesse außerhalb von
`up-all-build` gezielt und nachvollziehbar ausführen lassen.

### Traefik Start (einmalig für alle Projekte)
Die folgenden Befehle starten den zentralen Traefik-Proxy für alle lokalen Projekt-Stacks.

```bash
make -C _docker proxy-up
```
oder
```powershell
.\_docker\Buildfile.ps1 -Target proxy-up
```
oder
```bash
bash ./_docker/Buildfile.sh proxy-up
```

Hinweis: `proxy-up` startet Netzwerk und Traefik, ruft `proxy-dynamic-perms` aber nicht automatisch auf. Für
Dynamic-Dateien mit `HOST_UID`/`HOST_GID` danach manuell ausführen:

```bash
make -C _docker proxy-dynamic-perms
```
oder
```powershell
.\_docker\Buildfile.ps1 -Target proxy-dynamic-perms
```
oder
```bash
bash ./_docker/Buildfile.sh proxy-dynamic-perms
```

### Live-Datenbank Import
Die folgenden Befehle bilden denselben manuellen Ablauf für `make`, `Buildfile.ps1` und `Buildfile.sh` ab.

```bash
make -C _docker db-pull           # speichert als ./live.sql.gz
make -C _docker up                # Container starten
make -C _docker db-import         # importiert ./live.sql.gz in die laufende DB
```
oder
```powershell
.\_docker\Buildfile.ps1 -Target db-pull
.\_docker\Buildfile.ps1 -Target up
.\_docker\Buildfile.ps1 -Target db-import
```
oder
```bash
bash ./_docker/Buildfile.sh db-pull
bash ./_docker/Buildfile.sh up
bash ./_docker/Buildfile.sh db-import
```

Das Makefile und Buildfile.sh nutzen `_docker/scripts/db_pull.sh`, das über SSH auf dem Server `mysqldump` bzw.
`mariadb-dump` mit den Zugangsdaten aus `_docker/.env` (`REMOTE_DB_*`) ausführt und den Stream komprimiert nach
`_docker/db/init/live.sql.gz` bzw. `./live.sql.gz` schreibt. Voraussetzung dafür sind `SSH_*` und `REMOTE_DB_*`
(insbesondere `REMOTE_DB_HOST`). Buildfile.ps1 versucht denselben Ablauf zunächst ebenfalls über
`_docker/scripts/db_pull.sh` und verwendet bei Bedarf einen PowerShell-Fallback, falls der Bash-Aufruf nicht erfolgreich
ist.

Hinweis: Das DB‑Pull‑Script liest ausschließlich `REMOTE_DB_HOST`, `REMOTE_DB_NAME`, `REMOTE_DB_USER` und
`REMOTE_DB_PASSWORD` aus `_docker/.env`. `MYSQL_*` wird dafür nicht verwendet.

## Datenbank-Verwaltung mit phpMyAdmin
Ein phpMyAdmin-Container ist Teil dieses Setups für die grafische Datenbankverwaltung.

- URL: `http://<PHPMYADMIN_HOST>` (Wert aus `_docker/.env`. Hostname muss lokal auf `127.0.0.1` auflösen)
- Benutzername: `root` (Standard)
- Passwort: Wert von `MYSQL_ROOT_PASSWORD` aus `_docker/.env`

## E-Mail-Tests mit MailHog
MailHog ist Teil dieses Setups, damit PHP-Mails lokal abgefangen und im Browser geprüft werden können.

- URL: `http://<MAILHOG_HOST>` (Wert aus `_docker/.env`; ohne Wert nutzen die Startskripte `mailhog.<VIRTUAL_HOST>`)
- SMTP-Ziel im Docker-Netzwerk: `mailhog:1025`
- Web-UI-Port im Container: `8025`

Das PHP-Image enthält `msmtp-mta`, stellt dadurch `/usr/sbin/sendmail` bereit und lädt `_docker/php/mail.ini`. Dadurch
leitet PHP `mail()` lokale E-Mails an MailHog weiter, ohne SMTP-Zugangsdaten in der Anwendung zu speichern.

## Sicherheits‑Checkliste (Lokal)

- Keine sensiblen Live‑Zugänge in Code/Repo – nur in `.env`.
- Secrets schützen: `_docker/.env` nie committen. Datei ist per `.gitignore` ausgeschlossen.
- Zugriff nur via Traefik auf `127.0.0.1:80` und `[::1]:80` (keine direkt veröffentlichten App-Container-Ports).
- Datenbank hat keine externen Ports (nur internes Docker‑Netzwerk).
- phpMyAdmin nur lokal erreichbar. bei Bedarf zusätzlich per Passwort/HTTP Auth schützen.
- MailHog nur lokal erreichbar. Keine produktiven oder sensiblen E-Mail-Inhalte in Screenshots oder Tickets posten.
- Pro Projekt eigene Volumes/Netzwerke (über `PROJECT_NAME`).

## WP-CLI Verwendung
WP-CLI ist im PHP-Container vorinstalliert.

**Basis-Befehl:**

```bash
docker compose -f _docker/docker-compose.yml exec --user=www-data php wp <Befehl>
```

`--user=www-data`: **Wichtig**, um Probleme mit Dateiberechtigungen zu vermeiden.

**Beispiel-Befehl: Installation prüfen**

```bash
docker compose -f _docker/docker-compose.yml exec --user=www-data php wp --info
```

**Profi-Tipp: Alias erstellen**
`alias d-wp="docker compose -f _docker/docker-compose.yml exec --user=www-data php wp"` in `~/.bashrc` oder `~/.zshrc`
eintragen, um Befehle mit `d-wp --info` auszuführen.

## Schnellreferenz

### Makefile Befehle

```bash
make -C _docker up-all # Stack starten (Proxy muss bereits laufen)
make -C _docker up-all-build # Stack starten inkl. Build/Proxy-Ensure
make -C _docker down-all # Projekt + Proxy stoppen
make -C _docker restart-all # Komplett neu starten ohne Build
make -C _docker rebuild-all # Komplett neu bauen + neu starten
make -C _docker build # Images bauen
make -C _docker up # Projekt starten (mit Proxy-Check)
make -C _docker down # Projekt stoppen
make -C _docker logs # Apache-Logs verfolgen
make -C _docker start # Gestoppte Container starten
make -C _docker stop # Laufende Container stoppen
make -C _docker image-clean # Ungenutzte Images aufräumen
make -C _docker proxy-up # Traefik/Proxy starten
make -C _docker proxy-check # Proxy-Status prüfen
make -C _docker proxy-ensure # Proxy bei Bedarf starten + prüfen
make -C _docker proxy-down # Traefik/Proxy stoppen
make -C _docker proxy-dynamic-perms # Rechte für Traefik dynamic setzen
make -C _docker pull-prebuilt # Prebuilt Images ziehen
make -C _docker php-image-current # PHP-Image-Signatur prüfen
make -C _docker build-php # PHP-Image bauen
make -C _docker recreate-php # PHP-Container ggf. neu erstellen
make -C _docker db-import-init-dump # Init-Dump in DB importieren
make -C _docker db-pull-init # Live-Dump nach _docker/db/init ziehen
make -C _docker db-pull # Live-Dump nach Repo-Root ziehen
make -C _docker db-import # ../live.sql.gz importieren
make -C _docker db-reset CONFIRM=1 # DB-Volume resetten (CONFIRM=1)
make -C _docker db-reset-from-live CONFIRM=1 # Live-Dump ziehen + DB-Reset
make -C _docker check-versions # Pflicht-Variablen prüfen
```
### PowerShell-Skript Befehle (`Buildfile.ps1`)

```powershell
.\_docker\Buildfile.ps1 -Target up-all # Stack starten (Proxy muss bereits laufen)
.\_docker\Buildfile.ps1 -Target up-all-build # Stack starten inkl. Build/Proxy-Ensure
.\_docker\Buildfile.ps1 -Target down-all # Projekt + Proxy stoppen
.\_docker\Buildfile.ps1 -Target restart-all # Komplett neu starten ohne Build
.\_docker\Buildfile.ps1 -Target rebuild-all # Komplett neu bauen + neu starten
.\_docker\Buildfile.ps1 -Target build # Images bauen
.\_docker\Buildfile.ps1 -Target up # Projekt starten (mit Proxy-Check)
.\_docker\Buildfile.ps1 -Target down # Projekt stoppen
.\_docker\Buildfile.ps1 -Target logs # Apache-Logs verfolgen
.\_docker\Buildfile.ps1 -Target start # Gestoppte Container starten
.\_docker\Buildfile.ps1 -Target stop # Laufende Container stoppen
.\_docker\Buildfile.ps1 -Target image-clean # Ungenutzte Images aufräumen
.\_docker\Buildfile.ps1 -Target proxy-up # Traefik/Proxy starten
.\_docker\Buildfile.ps1 -Target proxy-check # Proxy-Status prüfen
.\_docker\Buildfile.ps1 -Target proxy-ensure # Proxy bei Bedarf starten + prüfen
.\_docker\Buildfile.ps1 -Target proxy-down # Traefik/Proxy stoppen
.\_docker\Buildfile.ps1 -Target proxy-dynamic-perms # Rechte für Traefik dynamic setzen
.\_docker\Buildfile.ps1 -Target pull-prebuilt # Prebuilt Images ziehen
.\_docker\Buildfile.ps1 -Target php-image-current # PHP-Image-Signatur prüfen
.\_docker\Buildfile.ps1 -Target build-php # PHP-Image bauen
.\_docker\Buildfile.ps1 -Target recreate-php # PHP-Container ggf. neu erstellen
.\_docker\Buildfile.ps1 -Target db-import-init-dump # Init-Dump in DB importieren
.\_docker\Buildfile.ps1 -Target db-pull-init # Live-Dump nach _docker/db/init ziehen
.\_docker\Buildfile.ps1 -Target db-pull # Live-Dump nach Repo-Root ziehen
.\_docker\Buildfile.ps1 -Target db-import # ../live.sql.gz importieren

$env:CONFIRM='1'
.\_docker\Buildfile.ps1 -Target db-reset # DB-Volume resetten (CONFIRM=1)
Remove-Item Env:CONFIRM

$env:CONFIRM='1'
.\_docker\Buildfile.ps1 -Target db-reset-from-live # Live-Dump ziehen + DB-Reset
Remove-Item Env:CONFIRM

.\_docker\Buildfile.ps1 -Target check-versions # Pflicht-Variablen prüfen
```

### Bash-Skript Befehle (`Buildfile.sh`)

```bash
bash ./_docker/Buildfile.sh up-all # Stack starten (Proxy muss bereits laufen)
bash ./_docker/Buildfile.sh up-all-build # Stack starten inkl. Build/Proxy-Ensure
bash ./_docker/Buildfile.sh down-all # Projekt + Proxy stoppen
bash ./_docker/Buildfile.sh restart-all # Komplett neu starten ohne Build
bash ./_docker/Buildfile.sh rebuild-all # Komplett neu bauen + neu starten
bash ./_docker/Buildfile.sh build # Images bauen
bash ./_docker/Buildfile.sh up # Projekt starten (mit Proxy-Check)
bash ./_docker/Buildfile.sh down # Projekt stoppen
bash ./_docker/Buildfile.sh logs # Apache-Logs verfolgen
bash ./_docker/Buildfile.sh start # Gestoppte Container starten
bash ./_docker/Buildfile.sh stop # Laufende Container stoppen
bash ./_docker/Buildfile.sh image-clean # Ungenutzte Images aufräumen
bash ./_docker/Buildfile.sh proxy-up # Traefik/Proxy starten
bash ./_docker/Buildfile.sh proxy-check # Proxy-Status prüfen
bash ./_docker/Buildfile.sh proxy-ensure # Proxy bei Bedarf starten + prüfen
bash ./_docker/Buildfile.sh proxy-down # Traefik/Proxy stoppen
bash ./_docker/Buildfile.sh proxy-dynamic-perms # Rechte für Traefik dynamic setzen
bash ./_docker/Buildfile.sh pull-prebuilt # Prebuilt Images ziehen
bash ./_docker/Buildfile.sh php-image-current # PHP-Image-Signatur prüfen
bash ./_docker/Buildfile.sh build-php # PHP-Image bauen
bash ./_docker/Buildfile.sh recreate-php # PHP-Container ggf. neu erstellen
bash ./_docker/Buildfile.sh db-import-init-dump # Init-Dump in DB importieren
bash ./_docker/Buildfile.sh db-pull-init # Live-Dump nach _docker/db/init ziehen
bash ./_docker/Buildfile.sh db-pull # Live-Dump nach Repo-Root ziehen
bash ./_docker/Buildfile.sh db-import # ../live.sql.gz importieren
bash ./_docker/Buildfile.sh db-reset CONFIRM=1 # DB-Volume resetten (CONFIRM=1)
bash ./_docker/Buildfile.sh db-reset-from-live CONFIRM=1 # Live-Dump ziehen + DB-Reset
bash ./_docker/Buildfile.sh check-versions # Pflicht-Variablen prüfen
```

### WSL/Linux-Terminal Befehle

```bash
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target up-all # Stack starten (Proxy muss bereits laufen)
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target up-all-build # Stack starten inkl. Build/Proxy-Ensure
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target down-all # Projekt + Proxy stoppen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target restart-all # Komplett neu starten ohne Build
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target rebuild-all # Komplett neu bauen + neu starten
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target build # Images bauen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target up # Projekt starten (mit Proxy-Check)
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target down # Projekt stoppen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target logs # Apache-Logs verfolgen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target start # Gestoppte Container starten
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target stop # Laufende Container stoppen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target image-clean # Ungenutzte Images aufräumen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target proxy-up # Traefik/Proxy starten
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target proxy-check # Proxy-Status prüfen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target proxy-ensure # Proxy bei Bedarf starten + prüfen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target proxy-down # Traefik/Proxy stoppen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target proxy-dynamic-perms # Rechte für Traefik dynamic setzen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target pull-prebuilt # Prebuilt Images ziehen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target php-image-current # PHP-Image-Signatur prüfen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target build-php # PHP-Image bauen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target recreate-php # PHP-Container ggf. neu erstellen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target db-import-init-dump # Init-Dump in DB importieren
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target db-pull-init # Live-Dump nach _docker/db/init ziehen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target db-pull # Live-Dump nach Repo-Root ziehen
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target db-import # ../live.sql.gz importieren
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target db-reset CONFIRM=1 # DB-Volume resetten (CONFIRM=1)
# Live-Dump ziehen + DB-Reset
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target db-reset-from-live CONFIRM=1
bash /mnt/c/<Projects>/<Project>/_docker/Buildfile.sh --target check-versions # Pflicht-Variablen prüfen
```

### Docker Compose Befehle
Hinweis: Reihenfolge analog `### Makefile Befehle`. Wo nötig, ist vermerkt, dass kein reiner `docker compose`-Befehl
existiert.

```bash
# up-all
docker compose -f _docker/docker-compose.yml up -d # Kernstart ohne Make-Zusatzlogik
# up-all-build
docker compose -f _docker/docker-compose.yml build php # Kernschritt ohne Init-/Fallback-Logik
docker compose -f _docker/docker-compose.yml up -d
# down-all
docker compose -f _docker/docker-compose.yml down
docker compose -f _docker/proxy/traefik/docker-compose.yml down
# restart-all
docker compose -f _docker/docker-compose.yml down
docker compose -f _docker/proxy/traefik/docker-compose.yml down
docker compose -f _docker/proxy/traefik/docker-compose.yml up -d
docker compose -f _docker/docker-compose.yml up -d
# rebuild-all
docker compose -f _docker/docker-compose.yml down
docker compose -f _docker/proxy/traefik/docker-compose.yml down
docker compose -f _docker/proxy/traefik/docker-compose.yml up -d
docker compose -f _docker/docker-compose.yml up -d --build
# build
docker compose -f _docker/docker-compose.yml build
# up
docker compose -f _docker/docker-compose.yml up -d
# down
docker compose -f _docker/docker-compose.yml down
# logs
docker compose -f _docker/docker-compose.yml logs -f apache
# start
docker compose -f _docker/docker-compose.yml start
# stop
docker compose -f _docker/docker-compose.yml stop
# image-clean
# kein reiner docker compose-Befehl (Make nutzt docker image prune/rmi)
# proxy-up
docker compose -f _docker/proxy/traefik/docker-compose.yml up -d
# proxy-check
docker compose -f _docker/proxy/traefik/docker-compose.yml ps
# proxy-ensure
docker compose -f _docker/proxy/traefik/docker-compose.yml ps
docker compose -f _docker/proxy/traefik/docker-compose.yml up -d
# proxy-down
docker compose -f _docker/proxy/traefik/docker-compose.yml down
# proxy-dynamic-perms
# kein reiner docker compose-Befehl (setzt Rechte per docker exec im Proxy-Container)
# pull-prebuilt
docker compose -f _docker/proxy/traefik/docker-compose.yml pull traefik
docker compose -f _docker/docker-compose.yml pull db apache phpmyadmin
# php-image-current
# kein reiner docker compose-Befehl (Make vergleicht Image-Signatur)
# build-php
docker compose -f _docker/docker-compose.yml build php
# recreate-php
docker compose -f _docker/docker-compose.yml up -d --force-recreate --no-deps php
# db-import-init-dump
gzip -dc _docker/db/init/live.sql.gz \
  | docker compose -f _docker/docker-compose.yml exec -T db sh -c \
    'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER" "$MYSQL_DATABASE"'
# db-pull-init
# kein reiner docker compose-Befehl (nutzt _docker/scripts/db_pull.sh via SSH)
# db-pull
# kein reiner docker compose-Befehl (nutzt _docker/scripts/db_pull.sh via SSH)
# db-import
gzip -dc live.sql.gz \
  | docker compose -f _docker/docker-compose.yml exec -T db sh -c \
    'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER" "$MYSQL_DATABASE"'
# db-reset
docker compose -f _docker/docker-compose.yml down -v
docker compose -f _docker/docker-compose.yml up -d
# db-reset-from-live
docker compose -f _docker/docker-compose.yml down -v # ohne vorherigen db-pull-init unvollständig
docker compose -f _docker/docker-compose.yml up -d
# check-versions
# kein reiner docker compose-Befehl (Make prüft Pflichtvariablen aus _docker/.env)
```
