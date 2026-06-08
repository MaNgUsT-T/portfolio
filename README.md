# DevOps Portfolio

Stand: 2026-06-05

Dieses Repository enthält die PHP-Anwendung für ein modernes, responsives Portfolio-Template, das speziell für
DevOps-Ingenieure entwickelt wurde. Die Anwendung ermöglicht es, technische Fähigkeiten, Cloud-Infrastrukturen und 
I/CD-Projekte professionell zu präsentieren.. Der projektrelevante Code liegt im Repo-Root. `README.md` ist der Einstieg
für den täglichen Projektkontext. Operative Details werden in den jeweils führenden Dokumenten gepflegt.

## Features

- **Modernes Design:** Cleanere Look mit Fokus auf Lesbarkeit und Ästhetik.
- **Tech-Stack Visualisierung:** Kategorisierte Darstellung von Werkzeugen (IaC, Monitoring, Cloud).
- **Projekt-Showcase:** Interaktive Karten für Fallstudien und Dashboards.
- **Berufliche Laufbahn:** Strukturierte Timeline für Arbeitserfahrung.
- **Kontaktformular:** Integrierte Sektion für Anfragen und Networking.

## Technologien

- **Frontend:** Next.js / React
- **Styling:** Tailwind CSS
- **Sprache:** TypeScript
- **Icons:** Lucide Icons


## Dokumentationsstruktur

- `_docker/README.md` - Detaildokumentation der lokalen Docker-Umgebung.
- `AGENTS.md` - Rollen, Verantwortlichkeiten und Arbeitsweise für Agenten.
- `CONTRIBUTING.md` - Beitragsregeln (Codestyle, QA, Commits, PRs).
- `README.md` - Einstieg und Orientierung für den täglichen Projektkontext.

Ziel: Die Dokumente ergänzen sich. Operative Details werden zentral in `_docker/README.md` gepflegt, um Dopplungen zu
vermeiden.

## Projektstruktur

- `_docker/` - Lokale Docker-Umgebung (Compose, Makefile, WP-CLI, Traefik).
- `css/` - Projekt CSS.
- `fonts/` - Projekt Fonts.
- `img/` - Projekt Bilder.
- `js/` - Projekt Js.
- `vendor/` - Drittanbieter Bibliotheken.
- `index.html` - Einstiegspunkt.
- `config.php` - Kontakt Formular Konfiguration.
- `contact.php` - Kontakt Formular.

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
`AGENTS.md` beschreibt Rollen und Arbeitsweise von Agenten. Die Makefile-Flags (`CLEAN_IMAGES`, `CLEAN_BASE_IMAGE`,
`CLEAN_WP_SETUP`, `FORCE_DB_SANITIZE`, `FORCE_PHP_BUILD`, `PULL`, `RECREATE_PHP`) sind in `_docker/.env.example` und
`_docker/README.md` dokumentiert.

## Tests
Derzeit keine automatisierten Tests. Manuelle QA-Schritte bitte in PRs dokumentieren.

## Regeln & Zusammenarbeit

- Vor Codeänderungen: `CONTRIBUTING.md` beachten.
- Für Infrastruktur- und Laufzeitfragen: `_docker/README.md` nutzen.
- Für Rollen- und Agentenregeln: `AGENTS.md` nutzen.
- Bei Dokumentationsänderungen auf Konsistenz zwischen `README.md`, `AGENTS.md`, `CONTRIBUTING.md` und
  `_docker/README.md` achten.

## Lizenz

- In diesem Repository liegt derzeit keine zentrale Lizenzdatei vor.
- Lizenzfragen für projektrelevanten Code bitte vor Veröffentlichung im Team klären.
