# Portfolio mit JSON-Content und Admin-Oberfläche

Stand: 2026-08-26

Dieses Repository enthält ein datengetriebenes Portfolio auf Basis von
`index.html`, PHP-Endpunkten und einer lokalen Docker-Umgebung. Die
öffentliche Seite lädt Inhalte aus `data/data.json`, rendert sie clientseitig
über `js/app.min.js` und nutzt `contact.php` als JSON-Endpunkt für das
Kontaktformular. Der Frontend-Build für JavaScript und Sass läuft über
`_vite/`.

## Wichtig

Bevor Sie das Projekt produktiv oder gemeinsam nutzen, müssen Sie das initiale Admin-Passwort über `admin/change-password.php`
in der Oberfläche ändern und nicht durch eine Änderung im Repository. Dabei müssen Sie `change-me-admin-password` als
aktuelles altes Passwort eintragen.

Außerdem müssen Sie die E-Mail-Konfiguration in `contact-config.php` an Ihre Zieladresse anpassen, weil dort der Empfänger
für Kontaktanfragen definiert ist.

## Übersicht

- Öffentliche Seite: `index.html` + `js/app.min.js`
- Inhaltsquelle: `data/data.json`
- Admin-Bereich: `admin/admin.php`
- Kontakt-Endpunkt: `contact.php`
- Lokale Laufzeit: `_docker/`

## Schnellstart (lokal)

### Alle Befehle vom Repo-Root aus

```bash
make -C _docker up-all-build # Erststart (Proxy + Projekt, PHP-Build bei Bedarf)
make -C _docker up-all # Folgestart (ohne Build; Traefik muss bereits laufen)
make -C _docker stop # Stoppen
make -C _docker logs # Logs (Apache)
```

Nach dem Start gibt die Docker-Umgebung zusätzlich zur Projekt-URL auch die lokalen phpMyAdmin- und MailHog-URLs aus.
MailHog zeigt lokal abgefangene Kontaktformular-Mails an; Details stehen in `_docker/README.md`.

## Frontend-Build mit `_vite`

Für Änderungen an `assets/js/` oder `assets/scss/` ist `_vite/` der
maßgebliche Build-Pfad. Alle Befehle laufen vom Repo-Root aus.

Einmalige Installation der Build-Abhängigkeiten:

```bash
npm --prefix _vite install
```

Einmaliger vollständiger Build:

```bash
npm --prefix _vite run build
```

Teil-Builds:

```bash
npm --prefix _vite run build:js
npm --prefix _vite run build:css
```

Watch-Modus während der Entwicklung:

```bash
npm --prefix _vite run dev
```

Der Build schreibt die ausgelieferten Dateien nach `js/app.min.js`,
`js/admin.min.js`, `js/siteelements.min.js` und `css/styles.min.css`.

## PhpStorm

In PhpStorm ist `_vite/package.json` die richtige Paketbasis für die
Build-Skripte.

- Package-Datei: `_vite/package.json`
- Einmaliger Build: Script `build`
- Watch-Modus: Script `dev`
- Teil-Builds: `build:js`, `build:css`, `dev:js`, `dev:css`

## Technische Dokumentation

Die technische Detaildokumentation liegt unter `_docs/`.

- `_docs/architecture.md` beschreibt Gesamtaufbau und Datenfluss.
- `_docs/data-json.md` beschreibt die Struktur von `data/data.json` und
  `data/data.admin-template.json`.
- `_docs/frontend.md` beschreibt `assets/js/app/`, Rendering,
  Normalisierung und Build.
- `_docs/admin.md` beschreibt Admin-Flow, Validierung, Save-Flow und
  Session-Verhalten.
- `_docs/contact-form.md` beschreibt den Vertrag von `contact.php`,
  Felder, Antworten und Fehlerfälle.

### Falls Traefik nicht läuft
`make -C _docker proxy-up` oder erneut `make -C _docker up-all-build` ausführen.
Hinweis: `proxy-up` setzt die Dynamic-Permissions nicht automatisch. Bei Bedarf
danach `make -C _docker proxy-dynamic-perms`.

### Skriptäquivalente zu Make

```bash
bash ./_docker/Buildfile.sh up-all-build # Erststart (Proxy + Projekt, PHP-Build bei Bedarf)
bash ./_docker/Buildfile.sh up-all # Folgestart (ohne Build; Traefik muss bereits laufen)
bash ./_docker/Buildfile.sh stop # Stoppen
bash ./_docker/Buildfile.sh logs # Logs (Apache)
```
oder
```powershell
.\_docker\Buildfile.ps1 -Target up-all-build # Erststart (Proxy + Projekt, PHP-Build bei Bedarf)
.\_docker\Buildfile.ps1 -Target up-all # Folgestart (ohne Build; Traefik muss bereits laufen)
.\_docker\Buildfile.ps1 -Target stop # Stoppen
.\_docker\Buildfile.ps1 -Target logs # Logs (Apache)
```

Für DB-Import, URL-/Pfad-Lokalisierung, WP-CLI und Troubleshooting ist `_docker/README.md` die operative Referenz.
`AGENTS.md` beschreibt Rollen und Arbeitsweise von Agenten. Die Makefile-Flags `CLEAN_IMAGES`, `CLEAN_BASE_IMAGE`,
`FORCE_PHP_BUILD`, `PULL` und `RECREATE_PHP` sind in `_docker/Makefile`, `_docker/.env.example` und `_docker/README.md`
dokumentiert.

Weitere Beitragsregeln und QA-Anforderungen stehen in `CONTRIBUTING.md`.
Operative Docker- und Laufzeitdetails stehen in `_docker/README.md`.
Rollen und Agentenregeln stehen in `AGENTS.md`.

## Lizenz

- In diesem Repository liegt derzeit keine zentrale Lizenzdatei vor.
- Lizenzfragen für projektrelevanten Code bitte vor Veröffentlichung im Team klären.
