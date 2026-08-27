# Frontend

Stand: 2026-08-27

Diese Seite beschreibt die technische Frontend-Struktur der öffentlichen Portfolio-Seite. Maßgeblich sind
`index.html`, `assets/js/app.js`, `assets/js/app/`, `assets/js/shared/all.js`, `scripts/build-js.mjs`,
`js/app.min.js`, `assets/scss/`, `css/styles.min.css` und `prepros.config`.

## Einstieg

`index.html` ist der öffentliche Einstiegspunkt. Die Datei enthält im `<body>` nur den Mount-Point
`<div id="app" data-site-root></div>` und lädt die ausgelieferten Artefakte.

Aktuell werden geladen:

- `vendor/splide/splide.min.css`
- `css/styles.min.css`
- `vendor/splide/splide.min.js`
- `js/app.min.js`

## Struktur unter `assets/js/app/`

`assets/js/app.js` ist der öffentliche JavaScript-Entrypoint. Die Datei importiert `assets/js/app/app.entry.js`,
und die eigentlichen Teilmodule unter `assets/js/app/` sind über native ES-Module miteinander verdrahtet.

Die Unterstruktur deckt aktuell diese Bereiche ab:

- `app.utils.js` für gemeinsame Frontend-Hilfsfunktionen
- `app.normalize.*.js` für Daten-Normalisierung
- `app.render.*.js` für HTML-Erzeugung
- `app.meta.js` für Dokument-Metadaten
- `app.data.js` für das Laden von `data/data.json`
- `app.education-carousel.js` für Splide im Education-Bereich
- `app.contact-form.js` für das Kontaktformular
- `app.entry.js` für die Bootstrap-Reihenfolge

Zusätzlich stellt `assets/js/shared/all.js` gemeinsam genutzte UI-Helfer für Icon-Laden, Theme, Navigation und
Custom-Selects bereit.

## Verantwortlichkeiten der Teilmodule

Die Teilmodule arbeiten im aktuellen Stand mit klar getrennten Aufgaben.

- `app.utils.js` stellt defensive Typ- und Escaping-Helfer bereit
- `app.normalize.meta.js` normalisiert Meta-, Button-, Bild- und Site-nahe Daten
- `app.normalize.content.js` normalisiert die inhaltslastigen Sections wie About, Skills, Experience, Projects und
  Education
- `app.normalize.contact.js` normalisiert Kontaktformular und Footer
- `app.normalize.root.js` baut aus den Teilnormalisierungen ein einheitliches Site-View-Model
- `app.render.shared.js` rendert wiederverwendete UI-Bausteine wie Bilder, Buttons und Social-Links
- `app.render.header-hero.js`, `app.render.about-skills.js`, `app.render.experience-projects.js` und
  `app.render.education-contact.js` erzeugen Section-Markup
- `app.render.root.js` setzt die Gesamtseite in derselben Reihenfolge zusammen, die Navigation und Initialisierung
  erwarten
- `app.meta.js` schreibt Metadaten in das bestehende Dokument
- `app.data.js` lädt `data/data.json`, normalisiert den Inhalt und injiziert das Gesamtmarkup
- `app.education-carousel.js` initialisiert Splide nur, wenn genügend Slides vorhanden sind
- `app.contact-form.js` verarbeitet den JSON-basierten Submit-Flow des Kontaktformulars
- `app.entry.js` startet den Ablauf nach `DOMContentLoaded`

## Rendering und Normalisierung

Das Frontend lädt `data/data.json` aktuell über `fetch(..., { cache: 'no-store' })` und normalisiert die Daten vor
dem Rendering.

Danach läuft die Ausgabe in dieser Reihenfolge:

1. `applyMeta(siteData.meta)` aktualisiert die Dokument-Metadaten.
2. Die Renderfunktionen erzeugen Header, Hero, About, Skills, Experience, Projects, Education, Contact und Footer.
3. Der zusammengesetzte HTML-String wird in `[data-site-root]` geschrieben.

Die Normalisierung vor dem Rendering ist relevant, weil nachgelagerte Renderpfade auf eine vorhersagbare
Datenstruktur angewiesen sind.

## Interne Schnittstellen

Die Module kommunizieren im aktuellen Stand über explizite ES-Modul-Schnittstellen und einige wenige zentrale
Fachverträge.

- `normalizeSiteData(data)` liefert das vereinheitlichte View-Model für die gesamte Seite
- `applyMeta(siteData.meta)` erwartet bereits normalisierte Meta-Daten
- `renderHeader()`, `renderHero()`, `renderAbout()`, `renderSkills()`, `renderExperience()`, `renderProjects()`,
  `renderEducation()`, `renderContact()` und `renderFooter()` erwarten jeweils normalisierte Teil-View-Models
- `bootstrapContent()` lädt Daten, ruft `applyMeta()` auf und schreibt das Gesamtmarkup in `[data-site-root]`
- `contactFormInitialize()` erwartet ein bereits gerendertes Formular mit `#contact-form`, Fehler-Slots per
  `data-form-error` und einem Status-Element mit `data-form-status`

## DOM-Voraussetzungen je Teilmodul

Mehrere Frontend-Module arbeiten nur, wenn bestimmte DOM-Knoten bereits vorhanden sind.

- `app.data.js`
  erwartet `[data-site-root]` als Mount-Point
- `app.meta.js`
  erwartet vorhandene Meta-Tags und optional `link[rel="fluid-icon"]`, aktualisiert aber nur, was im DOM existiert
- `app.education-carousel.js`
  erwartet `#education-carousel` mit `.splide__slide`-Einträgen
- `app.contact-form.js`
  erwartet `#contact-form`, ein Submit-Element mit `data-contact-submit`, Fehler-Slots mit `data-form-error` und ein
  Status-Element mit `data-form-status`
- Theme- und Navigationsinitialisierung aus den Shared-Skripten
  erwarten die beim Rendering erzeugten Header- und Overlay-Strukturen

## Rückgabeverträge der Kernfunktionen

Die wichtigsten Frontend-Funktionen kommunizieren im aktuellen Stand über diese Rückgabeformen:

- `normalize*()`-Funktionen liefern plain objects oder Arrays in der jeweils vereinheitlichten Zielstruktur
- `render*()`-Funktionen liefern HTML-Markup als String
- `loadSiteData()` liefert ein bereits normalisiertes Site-Objekt
- `bootstrapContent()` liefert kein Ergebnis zurück, sondern schreibt Metadaten und Markup direkt in das Dokument
- `contactFormInitialize()` und `educationCarouselInitialize()` initialisieren Verhalten rein über Seiteneffekte

## Vertrag des Kontaktformular-Frontends

Das Frontend des Kontaktformulars arbeitet im aktuellen Stand gegen einen klaren HTTP- und DOM-Vertrag.

- Gesendet wird per `fetch(form.action, { method: 'POST', body: new FormData(form) })`
- Im Request wird `Accept: application/json` gesetzt
- Bei Validierungsfehlern erwartet das Frontend ein JSON-Objekt mit `ok: false`, `message` und optional `errors`
- `errors` wird als Objekt `feldname -> fehlermeldung` ausgewertet
- Bei Erfolg erwartet das Frontend `ok: true` und eine `message`
- Nicht verwertbare Antworten werden technisch unterschieden in `invalid-json` und `non-json`

## Bootstrap-Reihenfolge

`assets/js/app/app.entry.js` initialisiert die öffentliche Seite nach `DOMContentLoaded` in dieser Reihenfolge:

1. `loadIcons()`
2. `bootstrapContent()`
3. `themeInitialize()`
4. `headerScrollInitialize()`
5. `mobileNavigationInitialize()`
6. `initializeCustomSelects()`
7. `educationCarouselInitialize()`
8. `contactFormInitialize()`

Die Reihenfolge ist technisch relevant, weil mehrere Initialisierer bereits gerenderte DOM-Knoten erwarten.

## Build-Zuordnung

`scripts/build-js.mjs` ist der führende Build-Pfad für das Frontend-JavaScript. Das Skript folgt den relativen
Imports von `assets/js/app.js` und schreibt danach das ausgelieferte Bundle.

- `assets/js/app.js` -> `js/app.min.js`
- `assets/js/admin.js` -> `js/admin.min.js`
- `assets/js/siteelements.js` -> `js/siteelements.min.js`
- `assets/scss/styles.scss` -> `css/styles.min.css`

`prepros.config` hält für JavaScript nur noch die Projekt-Metadaten und die deaktivierten Auto-Compile-Einträge der
JS-Entrypoints. Damit sind Änderungen an den Quell-Dateien erst vollständig, wenn `node scripts/build-js.mjs` gelaufen
ist und die ausgelieferten Dateien dazu passen.

## Grenzen der Frontend-Schicht

Das Frontend validiert und rendert Inhalte, ist aber nicht die führende Stelle für Sicherheits- oder Persistenzlogik.

- Harte Feldvalidierung für das Kontaktformular liegt final in `contact.php`
- Strukturelle Validierung der Inhaltsdaten liegt final in `admin/admin-save.php`
- Der Frontend-Code verlässt sich darauf, dass `data/icons.json` und `data/data.json` verfügbar sind
- Die ausgelieferten Artefakte bleiben `js/app.min.js` und `css/styles.min.css`
