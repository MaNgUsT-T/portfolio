# Repository Guidelines (CONTRIBUTING)

Stand: 2026-06-25

Dieses Dokument beschreibt die verbindlichen Beitragsregeln für dieses Repository: Struktur, Entwicklungsabläufe,
Qualitätsanforderungen, Sicherheit sowie Anforderungen an Commits und Pull Requests. `CONTRIBUTING.md` ergänzt
`AGENTS.md`: Hier stehen die Regeln für Beiträge, in `AGENTS.md` stehen Rollen, Verantwortlichkeiten und Arbeitsweise
der Agenten.

## Projektstruktur
Das Repository ist eine PHP-Anwendung mit projektspezifischem Code im Repo-Root. Für Infrastruktur und lokale
Entwicklungsabläufe ist `_docker/` die maßgebliche Arbeitsbasis.

### Kernmodule im Projekt
- `_docker/` - Lokale Docker-Umgebung (Compose, Makefile, WP-CLI, Traefik).
- `css/` - Projekt CSS.
- `fonts/` - Projekt Fonts.
- `img/` - Projekt Bilder.
- `js/` - Projekt Js.
- `vendor/` - Drittanbieter Bibliotheken.
- `index.html` - Einstiegspunkt.
- `config.php` - Datenbank Konfiguration.
- `contact.php` - Kontakt Formular.
- `form-config.php` - Kontakt Formular Konfiguration.

### Infrastruktur und Hilfsverzeichnisse
Die lokale Entwicklungsumgebung liegt unter `_docker/` (Compose, Makefile, Buildfiles, Dockerfiles, Skripte).

## Lokale Entwicklung
Operative Docker-, Proxy-, DB- und WP-CLI-Abläufe werden zentral in `_docker/README.md` gepflegt. Dieses Dokument
benennt nur die verbindlichen Einstiege und Regeln.

### Schnellbefehle (Copy/Paste)
Für Start/Stop der lokalen Umgebung:

```bash
make -C _docker up-all-build
make -C _docker up-all
make -C _docker stop
```

Skriptäquivalente zu Make:

```bash
bash ./_docker/Buildfile.sh <target>
```

```powershell
.\_docker\Buildfile.ps1 -Target <target>
```

### WP-CLI-Regel
WP-CLI wird im PHP-Container immer als `www-data` ausgeführt, um Rechteprobleme zu vermeiden.
Basisaufruf und Alias:

```bash
docker compose -f _docker/docker-compose.yml exec --user=www-data php wp <cmd>
alias d-wp="docker compose -f _docker/docker-compose.yml exec --user=www-data php wp"
```

### Linting
Für lokale Syntax- und Stilprüfungen:

```bash
php -l <file.php>
```

## Code- und Sicherheitsstandards
Neue Änderungen folgen dem bestehenden Projektstil und vermeiden unnötige Groß-Refactorings in stabilem Altbestand.

### Stil und Benennung
In PHP am bestehenden Stil der jeweiligen Datei orientieren. Neue Bezeichner klar und sprechend benennen.

### Ein-/Ausgabehärtung
Ausgaben kontextgerecht escapen (zum Beispiel `htmlspecialchars` für HTML-Ausgabe). Eingaben validieren/sanitisieren.
Datenbankzugriffe möglichst über vorbereitete Statements ausführen.

## Qualitätssicherung und Tests
Es gibt aktuell keine PHPUnit-Suite. Daher müssen Pull Requests nachvollziehbare manuelle QA-Schritte enthalten.

### Mindest-QA bei Änderungen

- Nach DB-Import die Erreichbarkeit von App und Admin prüfen.
- Apache-Logs bei Fehlern prüfen (`make -C _docker logs`).

## Commits und Pull Requests
Commit-Messages folgen dem Ticket-Präfix aus der Projekthistorie, zum Beispiel `8401 – Änderung kurz
beschreiben`.
Jeder PR beschreibt klar das Was/Warum, verlinkt das Ticket und enthält passende Nachweise (Screenshots, Testschritte,
Rollout-/Rollback-Hinweise).
Änderungen klein und thematisch sauber halten; keine unnötigen Refactors.

## Sicherheit und Konfiguration
Secrets werden niemals committed oder in Tickets/Chats abgelegt. Für lokale Konfiguration wird `_docker/.env` verwendet
(Vorlage: `_docker/.env.example`).

## Referenzen (Single Source)
Operative Abläufe und Ziel-Implementierungen werden nicht dupliziert gepflegt, sondern über diese Quellen
referenziert:

- `_docker/README.md` (Abläufe, Troubleshooting)
- `_docker/Makefile`, `_docker/Buildfile.sh`, `_docker/Buildfile.ps1` (ausführbare Targets)
- `AGENTS.md` (Rollen und Zusammenarbeit)

## Glossar
- `db-pull`/`db-import`: Targets zum Ziehen und Importieren eines Live-Dumps.
- `VIRTUAL_HOST`/`PHPMYADMIN_HOST`: Hostnamen für Traefik-Routing.
- `dev-proxy`: gemeinsames Docker-Netz für Traefik.
- `config.php.local`: lokale Konfiguration, die im Container `config.php` überschreibt.

## ToDo (Code-Review)
Die ToDo-Liste wird mit Priorität, Owner und Zieltermin gepflegt.
Format: `[ ] [Priorität: P1|P2|P3] [Owner: <Name/TBD>] [Zieltermin: YYYY-MM-DD|offen] <Aufgabe>`.

Vielen Dank für die Beachtung dieser Leitlinien. Bei Unklarheiten bitte Rücksprache im Team halten oder ein kurzes
Architektur-/Tech-Debrief im PR hinterlegen.
