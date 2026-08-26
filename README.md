# Portfolio mit JSON-Content und Admin-Oberfläche

Stand: 2026-08-26

Dieses Repository enthält ein datengetriebenes Portfolio auf Basis von `index.html`, PHP-Endpunkten und einer lokalen
Docker-Umgebung. Die öffentliche Seite lädt ihre Inhalte aus `data/data.json`, rendert die Bereiche clientseitig über
`js/app.min.js` und nutzt `contact.php` als JSON-Endpunkt für das Kontaktformular. `README.md` ist der Einstieg für den
täglichen Projektkontext. Operative Details werden in den jeweils führenden Dokumenten gepflegt.

## Funktionsumfang

- **Dynamische Inhaltsausgabe:** `assets/js/app.js` lädt `data/data.json`, setzt Metadaten und rendert Header, Hero,
  About, Skills, Experience, Projects, Education, Contact und Footer in den Mount-Point `#app`.
- **Admin-Oberfläche:** `admin/admin.php` lädt `data/data.json` und `data/data.admin-template.json` und bietet eine
  strukturierte Bearbeitung sowie eine Raw-JSON-Ansicht mit direktem Speichern.
- **Kontaktformular:** `contact.php` validiert Formularfelder anhand der Konfiguration in `data/data.json` und liefert
  JSON-Antworten an das Frontend zurück.
- **Frontend-Interaktionen:** Das Frontend initialisiert Theme-Umschaltung, Mobile-Navigation, Custom-Selects und ein
  Splide-Karussell für den Education-Bereich.
- **Lokale Entwicklungsumgebung:** `_docker/` stellt Apache, PHP, MariaDB, Traefik, phpMyAdmin und MailHog für lokale
  Entwicklung und Tests bereit.

## Technologien

- **Frontend-Markup:** `index.html` als Einstiegspunkt
- **Frontend-Logik:** Vanilla JavaScript in `assets/js/` mit kompilierten Artefakten in `js/`
- **Styling:** SCSS in `assets/scss/` mit kompilierter Ausgabe in `css/styles.min.css`
- **Backend:** PHP-Endpunkte wie `contact.php` sowie PHP-basierte Admin-Seiten unter `admin/`
- **Datenhaltung:** JSON-Dateien unter `data/`, insbesondere `data/data.json` und `data/icons.json`
- **Bibliotheken:** Splide unter `vendor/splide/` und Lucide unter `vendor/luside/`
- **Build-Sync:** `prepros.config` definiert die Zuordnung von SCSS- und JS-Quellen zu den ausgelieferten Minified-Dateien


## Dokumentationsstruktur

- `_docker/README.md` - Detaildokumentation der lokalen Docker-Umgebung.
- `AGENTS.md` - Rollen, Verantwortlichkeiten und Arbeitsweise für Agenten.
- `CONTRIBUTING.md` - Beitragsregeln (Codestyle, QA, Commits, PRs).
- `README.md` - Einstieg und Orientierung für den täglichen Projektkontext.

Ziel: Die Dokumente ergänzen sich. Operative Details werden zentral in `_docker/README.md` gepflegt, um Dopplungen zu
vermeiden.

## Projektstruktur

- `_docker/` - Lokale Docker-Umgebung (Compose, Makefile, WP-CLI, Traefik).
- `assets/scss/` - Sass-Quellen.
- `assets/js/` - JavaScript-Quellen für Frontend, Admin und Hilfsfunktionen.
- `css/` - Kompilierte CSS-Ausgabe.
- `fonts/` - Projekt Fonts.
- `img/` - Projekt Bilder.
- `js/` - Ausgelieferte minifizierte JavaScript-Dateien.
- `vendor/` - Drittanbieter Bibliotheken.
- `index.html` - Einstiegspunkt.
- `admin/` - PHP-basierte Admin-Oberfläche für Inhalts- und JSON-Bearbeitung.
- `contact.php` - JSON-Endpunkt für das Kontaktformular.
- `contact-config.php` - Empfänger-Konfiguration für Kontaktanfragen.
- `data/data.json` - Inhalts-, Meta- und Kontaktformular-Konfiguration.
- `data/data.admin-template.json` - Strukturvorlage für die Admin-Oberfläche.
- `siteelements.html` - zusätzliche HTML-Bausteine für statische Seitenelemente.

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

### Relevante Laufzeitdateien

Für den öffentlichen Seitenaufbau ist diese Kette maßgeblich:

1. `data/data.json` liefert Inhalte und Metadaten.
2. `assets/js/app.js` ist die Quelllogik für Rendering und Initialisierung.
3. `js/app.min.js` ist das ausgelieferte Frontend-Artefakt, das `index.html` tatsächlich lädt.
4. `assets/scss/styles.scss` liefert die Styling-Quellen.
5. `css/styles.min.css` ist die ausgelieferte CSS-Datei.

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

## Tests
Derzeit gibt es keine automatisierte Test-Suite im Repository. Manuelle QA-Schritte gehören deshalb in jeden PR.

Typische QA-Schritte:

- Start der lokalen Umgebung prüfen.
- Öffentliche Seite über die lokale URL laden.
- Admin-Oberfläche unter `admin/` öffnen, wenn eine Änderung den Inhalts- oder Auth-Bereich betrifft.
- Kontaktformular und MailHog prüfen, wenn Formularlogik oder Kontaktkonfiguration geändert wurde.
- Sicherstellen, dass Quell- und Minified-Artefakte synchron sind, wenn `assets/js/` oder `assets/scss/` geändert wurden.

## Regeln & Zusammenarbeit

- Vor Codeänderungen: `CONTRIBUTING.md` beachten.
- Für Infrastruktur- und Laufzeitfragen: `_docker/README.md` nutzen.
- Für Rollen- und Agentenregeln: `AGENTS.md` nutzen.
- Bei Dokumentationsänderungen auf Konsistenz zwischen `README.md`, `AGENTS.md`, `CONTRIBUTING.md` und
  `_docker/README.md` achten.

## Lizenz

- In diesem Repository liegt derzeit keine zentrale Lizenzdatei vor.
- Lizenzfragen für projektrelevanten Code bitte vor Veröffentlichung im Team klären.
