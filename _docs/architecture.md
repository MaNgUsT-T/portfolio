# Architektur

Stand: 2026-08-27

Diese Seite beschreibt den technischen Gesamtaufbau des aktuellen Projektstands. Maßgeblich sind die tatsächlich
geladenen Einstiegspunkte in `index.html`, die Frontend-Quellen unter `assets/js/`, die PHP-Dateien unter `admin/`
sowie die lokale Laufzeitkonfiguration unter `_docker/`.

## Gesamtaufbau

Das Repository kombiniert eine statische HTML-Einstiegsseite, clientseitiges Rendering aus JSON-Daten,
PHP-Endpunkte für Admin und Kontaktformular sowie eine lokale Docker-Umgebung.

- `index.html` ist der öffentliche Einstiegspunkt.
- `js/app.min.js` ist das von `index.html` geladene Frontend-Artefakt.
- `data/data.json` liefert Inhalte, Metadaten und Formular-Konfiguration.
- `admin/admin.php` ist die geschützte Admin-Oberfläche.
- `admin/admin-save.php` verarbeitet Admin-Speichervorgänge.
- `contact.php` ist der JSON-Endpunkt für das Kontaktformular.
- `_docker/` enthält die lokale Laufzeitumgebung.

## Datenfluss der öffentlichen Seite

Die öffentliche Seite rendert ihre Inhaltsbereiche nicht direkt aus `index.html`, sondern baut sie zur Laufzeit aus
JSON-Daten auf.

1. `index.html` stellt mit `<div id="app" data-site-root></div>` den Mount-Point bereit und lädt `js/app.min.js`.
2. Das Frontend lädt zuerst `data/icons.json`.
3. Danach lädt das Frontend `data/data.json`.
4. Die Daten werden normalisiert.
5. `applyMeta()` schreibt die Metadaten in das aktuelle Dokument.
6. Die Renderfunktionen schreiben Header, Hero, About, Skills, Experience, Projects, Education, Contact und Footer
   in `[data-site-root]`.
7. Erst danach initialisieren DOM-abhängige Funktionen wie Theme-Umschaltung, Mobile-Navigation, Custom-Selects,
   Splide und das Kontaktformular.

## Datenfluss im Admin-Bereich

Die Admin-Oberfläche verwendet dieselbe Inhaltsdatei wie das öffentliche Frontend und ergänzt sie um eine
Template-Struktur.

1. `admin/admin.php` prüft Session und Authentifizierung.
2. Die Seite lädt `data/data.json` und `data/data.admin-template.json`.
3. Das strukturierte Admin-UI rendert Felder auf Basis des Templates.
4. Im JSON-Modus wird die vollständige JSON-Struktur direkt bearbeitet.
5. `admin/admin-save.php` validiert die eingehenden Daten.
6. `admin/admin-lib.php` schreibt `data/data.json` atomar über eine temporäre Datei plus `rename()`.

## Backend-Grenzen

Das Backend ist im aktuellen Stand kein Framework mit zentralem Router, sondern eine kleine Menge spezialisierter
PHP-Einstiegspunkte.

- `contact.php` verarbeitet Formular-Requests und liefert JSON-Antworten.
- `admin/*.php` deckt Login, Logout, Passwortwechsel, Bearbeitung und Speichern ab.
- `contact-config.php` hält den Mail-Empfänger getrennt von der öffentlichen JSON-Datei.

## Maßgebliche Referenzen

Für Architekturfragen sollten diese Dateien zuerst geprüft werden.

- `index.html`
- `assets/js/app.js`
- `assets/js/app/`
- `admin/admin.php`
- `admin/admin-save.php`
- `admin/admin-lib.php`
- `contact.php`
- `prepros.config`
- `_docker/Makefile`
