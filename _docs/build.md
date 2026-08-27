# Build und Änderungsmatrix

Stand: 2026-08-27

Diese Seite beschreibt die technische Build-Zuordnung des aktuellen Projektstands und zeigt, welche Dateien bei
typischen Änderungen gemeinsam geprüft und aktualisiert werden müssen. Maßgeblich sind `prepros.config`,
`assets/js/`, `assets/scss/`, `js/`, `css/`, `data/data.json`, `data/data.admin-template.json`, `contact.php` und
`admin/admin-save.php`.

## Build-Zuordnung

Die ausgelieferten Artefakte werden im aktuellen Stand aus diesen Quell-Dateien erzeugt:

- `assets/js/app.js` -> `js/app.min.js`
- `assets/js/admin.js` -> `js/admin.min.js`
- `assets/js/siteelements.js` -> `js/siteelements.min.js`
- `assets/scss/styles.scss` -> `css/styles.min.css`

## Relevante Prepros-Regeln

`prepros.config` ist die maßgebliche Quelle für die Build-Verkettung.

- Die Einstiegspunkte unter `assets/js/*.js` werden exportseitig ignoriert und in minifizierte Artefakte unter `js/`
  überführt.
- Für JavaScript ist die Bundle-JS-Aufgabe mit Babel aktiv.
- Für Sass ist `dart-sass` aktiv.
- Source Maps sind für die relevanten Aufgaben im aktuellen Stand deaktiviert.

## Änderungsmatrix

Die folgenden Zuordnungen beschreiben, welche Bereiche bei Änderungen gemeinsam geprüft werden sollten.

- Änderung an `data/data.json`
  Prüfen: `_docs/data-json.md`, `_docs/frontend.md`, `_docs/contact-form.md`, öffentliche Seitenausgabe,
  Kontaktformular, gegebenenfalls Admin-Darstellung
- Änderung an `data/data.admin-template.json`
  Prüfen: `_docs/data-json.md`, `_docs/admin.md`, strukturierter Admin-Modus, Save-Flow in `admin/admin-save.php`
- Änderung an `assets/js/app/` oder `assets/js/app.js`
  Prüfen: `js/app.min.js`, `_docs/frontend.md`, öffentliche Seitenausgabe, betroffene Interaktionen
- Änderung an `assets/js/admin/` oder `assets/js/admin.js`
  Prüfen: `js/admin.min.js`, `_docs/admin.md`, Login, Passwortwechsel, Tabs, Repeatables, Icon-Picker
- Änderung an `assets/scss/` oder `assets/scss/styles.scss`
  Prüfen: `css/styles.min.css`, öffentliche Seite und Admin visuell
- Änderung an `contact.php`
  Prüfen: `_docs/contact-form.md`, `_docs/data-json.md`, `assets/js/app/app.contact-form.js`, MailHog,
  Formularvalidierung
- Änderung an `contact-config.php`
  Prüfen: `_docs/contact-form.md`, Mail-Versand, Trennung zwischen öffentlicher JSON-Datei und Empfänger-Konfiguration
- Änderung an `admin/admin-save.php`
  Prüfen: `_docs/admin.md`, `_docs/data-json.md`, strukturierter Modus, JSON-Modus, Flash-Meldungen
- Änderung an `admin/admin-lib.php`
  Prüfen: `_docs/admin.md`, Auth- und Session-Verhalten, Save-Flow, Render-Helfer
- Änderung an `prepros.config`
  Prüfen: `_docs/build.md`, `_docs/frontend.md`, `README.md`, reale Zielartefakte unter `js/` und `css/`

## Mindestabgleich nach Build-relevanten Änderungen

Nach Änderungen an Build- oder Quell-Dateien ist der Arbeitsstand im aktuellen Projekt erst dann konsistent, wenn:

- die passende minifizierte Datei unter `js/` oder `css/` aktualisiert ist
- die betroffene technische Detailseite unter `_docs/` noch zum Code passt
- die in `CONTRIBUTING.md` geforderte manuelle QA für den betroffenen Bereich durchgeführt wurde
