# Build und Änderungsmatrix

Stand: 2026-09-01

Diese Seite beschreibt die technische Build-Zuordnung des aktuellen Projektstands und zeigt, welche Dateien bei
typischen Änderungen gemeinsam geprüft und aktualisiert werden müssen. Maßgeblich sind `_vite/vite.mjs`,
`_vite/lib/`, `assets/js/`, `assets/scss/`, `js/`, `css/`, `data/data.json`,
`data/data.admin-template.json`, `contact.php` und `admin/admin-save.php`.

## Build-Zuordnung

Die ausgelieferten Artefakte werden im aktuellen Stand aus diesen Quell-Dateien erzeugt:

- `assets/js/app.js` -> `js/app.min.js`
- `assets/js/admin.js` -> `js/admin.min.js`
- `_siteelements/js/siteelements.js` -> `js/siteelements.min.js`
- `assets/scss/styles.scss` -> `css/styles.min.css`

## Frontend-Build

Der maßgebliche Build-Pfad für JavaScript und Sass liegt unter `_vite/`.

- `assets/js/app.js` importiert den öffentlichen ES-Modul-Entrypoint `assets/js/app/app.entry.js`.
- `assets/js/admin.js` importiert den Admin-Entrypoint `assets/js/admin/admin.entry.js`.
- `_vite/vite.mjs` steuert den JS-Build über `_vite/lib/tasks/js.mjs`.
- `_vite/vite.mjs` steuert den Sass-Build über `_vite/lib/tasks/css.mjs`.
- Der JS-Task verwendet Vite, bündelt die relativen Import-Abhängigkeiten und schreibt minifizierte Artefakte nach
  `js/app.min.js`, `js/admin.min.js` und `js/siteelements.min.js`.
- Der Sass-Task kompiliert `assets/scss/styles.scss` nach `css/styles.min.css`.
- Für jedes JavaScript-Artefakt erzeugt der Build zusätzlich eine externe Source Map unter `js/*.min.js.map`.
- Für `css/styles.min.css` erzeugt der Build zusätzlich `css/styles.min.css.map`.
- Die ausgelieferten Seiten laden weiterhin nur die Bundles unter `js/` und nicht die Rohquellen direkt.

## Build-Befehle

Die täglichen Build-Befehle laufen vom Repo-Root aus:

- `npm --prefix _vite install` installiert die Build-Abhängigkeiten
- `npm --prefix _vite run build` baut JavaScript und Sass
- `npm --prefix _vite run build:js` baut nur JavaScript
- `npm --prefix _vite run build:css` baut nur Sass
- `npm --prefix _vite run dev` überwacht `assets/js/**/*.js` und `assets/scss/**/*.scss`
- `npm --prefix _vite run dev:js` überwacht nur JavaScript
- `npm --prefix _vite run dev:css` überwacht nur Sass

## Änderungsmatrix

Die folgenden Zuordnungen beschreiben, welche Bereiche bei Änderungen gemeinsam geprüft werden sollten.

- Änderung an `data/data.json`
  Prüfen: `_docs/data-json.md`, `_docs/frontend.md`, `_docs/contact-form.md`, öffentliche Seitenausgabe,
  Kontaktformular, gegebenenfalls Admin-Darstellung
- Änderung an `data/data.admin-template.json`
  Prüfen: `_docs/data-json.md`, `_docs/admin.md`, strukturierter Admin-Modus, Save-Flow in `admin/admin-save.php`
- Änderung an `assets/js/app/` oder `assets/js/app.js`
  Prüfen: `_vite/vite.mjs`, `_vite/lib/tasks/js.mjs`, `js/app.min.js`, `_docs/frontend.md`, öffentliche
  Seitenausgabe, betroffene
  Interaktionen
- Änderung an `assets/js/admin/` oder `assets/js/admin.js`
  Prüfen: `_vite/vite.mjs`, `_vite/lib/tasks/js.mjs`, `js/admin.min.js`, `_docs/admin.md`, Login,
  Passwortwechsel, Modal, Bildfelder, Tabs, Repeatables, Icon-Picker
- Änderung an `_siteelements/js/**/*.js`
  Prüfen: `_vite/vite.mjs`, `_vite/lib/tasks/js.mjs`, `js/siteelements.min.js`, `siteelements.html`
- Änderung an `assets/scss/` oder `assets/scss/styles.scss`
  Prüfen: `_vite/vite.mjs`, `_vite/lib/tasks/css.mjs`, `css/styles.min.css`, öffentliche Seite und Admin visuell
- Änderung an `contact.php`
  Prüfen: `_docs/contact-form.md`, `_docs/data-json.md`, `assets/js/app/app.contact-form.js`, MailHog,
  Formularvalidierung
- Änderung an `contact-config.php`
  Prüfen: `_docs/contact-form.md`, Mail-Versand, Trennung zwischen öffentlicher JSON-Datei und Empfänger-Konfiguration
- Änderung an `admin/admin-save.php`
  Prüfen: `_docs/admin.md`, `_docs/data-json.md`, strukturierter Modus, JSON-Modus, Flash-Meldungen
- Änderung an `admin/admin-lib.php`
  Prüfen: `_docs/admin.md`, Auth- und Session-Verhalten, Save-Flow, Render-Helfer
- Änderung an `_vite/`
  Prüfen: `_docs/build.md`, `_docs/frontend.md`, `CONTRIBUTING.md`, reale Zielartefakte unter `js/` und `css/`

## Mindestabgleich nach Build-relevanten Änderungen

Nach Änderungen an Build- oder Quell-Dateien ist der Arbeitsstand im aktuellen Projekt erst dann konsistent, wenn:

- `npm --prefix _vite run build` oder der passende `_vite`-Teilbuild nach JS- oder Sass-Änderungen erneut gelaufen ist
- die passende minifizierte Datei unter `js/` oder `css/` aktualisiert ist
- die betroffene technische Detailseite unter `_docs/` noch zum Code passt
- die in `CONTRIBUTING.md` geforderte manuelle QA für den betroffenen Bereich durchgeführt wurde
