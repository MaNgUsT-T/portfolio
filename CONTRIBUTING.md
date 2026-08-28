# Repository Guidelines (CONTRIBUTING)

Stand: 2026-08-26

Dieses Dokument beschreibt die verbindlichen Beitragsregeln für dieses Repository: Struktur, Entwicklungsabläufe,
Qualitätsanforderungen, Sicherheit sowie Anforderungen an Commits und Pull Requests. `CONTRIBUTING.md` ergänzt
`AGENTS.md`: Hier stehen die Regeln für Beiträge, in `AGENTS.md` stehen Rollen, Verantwortlichkeiten und Arbeitsweise
der Agenten.

## Projektstruktur
Das Repository ist eine PHP-Anwendung mit projektspezifischem Code im Repo-Root. Für Infrastruktur und lokale
Entwicklungsabläufe ist `_docker/` die maßgebliche Arbeitsbasis. Für technische Implementierungsdetails ist `_docs/`
die führende Entwicklerdokumentation.

### Kernmodule im Projekt
- `_docker/` - Lokale Docker-Umgebung (Compose, Makefile, WP-CLI, Traefik).
- `assets/scss/` - Sass-Quellen.
- `assets/js/` - JavaScript-Quellen für Frontend, Admin und Hilfsfunktionen.
- `css/` - Kompilierte CSS-Ausgabe.
- `fonts/` - Projekt Fonts.
- `img/` - Projekt Bilder.
- `js/` - ausgelieferte minifizierte JavaScript-Dateien.
- `vendor/` - Drittanbieter Bibliotheken.
- `index.html` - Einstiegspunkt.
- `admin/` - Admin-Oberfläche für Inhalts- und JSON-Bearbeitung.
- `contact.php` - JSON-Endpunkt für das Kontaktformular.
- `contact-config.php` - Empfänger-Konfiguration für Kontaktanfragen.
- `data/data.json` - Inhalts-, Meta- und Kontaktformular-Konfiguration.
- `data/data.admin-template.json` - Strukturvorlage für die Admin-Oberfläche.

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

Bei Frontend-Änderungen müssen Quell- und Auslieferungsdateien synchron bleiben:

- Änderungen an `assets/js/app.js`, `assets/js/admin.js` oder `assets/js/siteelements.js` gehören zusammen mit den
  zugehörigen Artefakten in `js/`.
- Änderungen an `assets/scss/styles.scss` und den Partials gehören zusammen mit `css/styles.min.css`.
- Für JavaScript und Sass ist `_vite/` der maßgebliche Build-Pfad.
- Vor manueller QA muss der passende `_vite`-Build gelaufen sein.

## Code- und Sicherheitsstandards
Neue Änderungen folgen dem bestehenden Projektstil und vermeiden unnötige Groß-Refactorings in stabilem Altbestand.

### Stil und Benennung
In PHP am bestehenden Stil der jeweiligen Datei orientieren. Neue Bezeichner klar und sprechend benennen.
In JavaScript und SCSS die vorhandene Struktur unter `assets/js/` und `assets/scss/` beibehalten.

### Ein-/Ausgabehärtung
Ausgaben kontextgerecht escapen (zum Beispiel `htmlspecialchars` für HTML-Ausgabe). Eingaben validieren/sanitisieren.
Datenbankzugriffe möglichst über vorbereitete Statements ausführen.

## Qualitätssicherung und Tests
Es gibt aktuell keine PHPUnit-Suite. Daher müssen Pull Requests nachvollziehbare manuelle QA-Schritte enthalten.

### Mindest-QA bei Änderungen

- Nach DB-Import die Erreichbarkeit von App und Admin prüfen.
- Apache-Logs bei Fehlern prüfen (`make -C _docker logs`).
- Bei Änderungen an `data/data.json`, `assets/js/` oder `js/` die öffentliche Seite vollständig laden und die betroffenen
  Bereiche visuell prüfen.
- Bei Änderungen an `admin/` oder `data/data.admin-template.json` die Admin-Oberfläche unter `admin/` öffnen und die
  betroffenen Bearbeitungsflüsse prüfen.
- Bei Änderungen an `contact.php`, `contact-config.php` oder der Kontaktformular-Konfiguration MailHog und
  Formularvalidierung prüfen.

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

- `_docs/README.md` und die Detailseiten darunter (Architektur, Data JSON, Frontend, Admin, Contact form)
- `_docker/README.md` (Abläufe, Troubleshooting)
- `_docker/Makefile`, `_docker/Buildfile.sh`, `_docker/Buildfile.ps1` (ausführbare Targets)
- `AGENTS.md` (Rollen und Zusammenarbeit)

## Glossar
- `db-pull`/`db-import`: Targets zum Ziehen und Importieren eines Live-Dumps.
- `VIRTUAL_HOST`/`PHPMYADMIN_HOST`: Hostnamen für Traefik-Routing.
- `dev-proxy`: gemeinsames Docker-Netz für Traefik.
- `config.php.local`: lokale Konfiguration, die im Container `config.php` überschreibt.
- `js/*.min.js`: ausgelieferte JavaScript-Artefakte, die aus den Einstiegspunkten unter `assets/js/` erzeugt werden.
- `js/*.min.js.map`: externe Source Maps der ausgelieferten JavaScript-Artefakte.
- `_vite/vite.mjs`: baut die ES-Modul-Einstiegspunkte unter `assets/js/` sowie `assets/scss/styles.scss` in die
  ausgelieferten Artefakte unter `js/` und `css/`.

## ToDo (Code-Review)
Die ToDo-Liste wird mit Priorität, Owner und Zieltermin gepflegt.
Format: `[ ] [Priorität: P1|P2|P3] [Owner: <Name/TBD>] [Zieltermin: YYYY-MM-DD|offen] <Aufgabe>`.

Vielen Dank für die Beachtung dieser Leitlinien. Bei Unklarheiten bitte Rücksprache im Team halten oder ein kurzes
Architektur-/Tech-Debrief im PR hinterlegen.
