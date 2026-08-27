# ToDo

Diese Liste sammelt die offenen Verbesserungen aus dem letzten Prüfbericht in einem umsetzbaren Format. Die Einträge
orientieren sich am in `CONTRIBUTING.md` dokumentierten Code-Review-Schema.

## Code-Review

Die folgenden Punkte dokumentieren die aktuelle Codeauswertung. Die Prüfung bezieht sich auf den aktiven Projektcode;
`siteelements`, `main.js`, `main.min.js` und `js/main.min.js.map` sind nicht berücksichtigt.

- `robust`: weitgehend ja. Die neue Normalisierung im Frontend und die stärkere Validierung im Admin verbessern die
  Fehlertoleranz klar, siehe [assets/js/app.js](assets/js/app.js) und
  [admin/admin-save.php](admin/admin-save.php).
- `strukturiert`: ja, deutlich besser als zuvor. Die Trennung in `normalize*()` und `render*()` ist nachvollziehbar
  und konsistent, siehe [assets/js/app.js](assets/js/app.js).
- `sauber`: überwiegend ja. Die Verantwortlichkeiten sind klarer getrennt, aber einzelne Module sind weiterhin
  relativ groß, vor allem [assets/js/app/app.render.js](assets/js/app/app.render.js) und
  [assets/js/app/app.normalize.js](assets/js/app/app.normalize.js).
- `modern`: teilweise. Positiv sind `strict_types`, `async/await`, defensive Guards und atomisches JSON-Schreiben.
  Ich kann aber nicht bestätigen, dass der Code insgesamt modern im Sinn einer durchgängig fein geschnittenen
  modularen Architektur ist, weil einzelne zentrale Module weiterhin relativ groß bleiben.


## Offene Aufgaben

- [ ] [Priorität: P3] [Owner: TBD] [Zieltermin: offen] JavaScript-Architektur vollständig auf native ES-Module
  modernisieren, einschließlich expliziter `import`/`export`-Schnittstellen in `assets/js/app/` und
  `assets/js/admin/`, Ablösung der `@prepros-prepend`-Verdrahtung, Umstellung auf einen modulbewussten JS-Build bei
  gleichbleibenden Zielartefakten `js/app.min.js` und `js/admin.min.js`, sowie Aktualisierung der technischen
  Dokumentation in `_docs/` für Build, Modulgrenzen, Einbindung und Verträge.

  Plan: JavaScript auf native ES-Module modernisieren
  Zusammenfassung
  Ziel ist eine vollständige Modernisierung der bestehenden JavaScript-Struktur auf native ES-Module, ohne das
  bestehende Verhalten der öffentlichen Seite oder des Admin-Bereichs zu ändern. Der Plan umfasst app, admin, die
  Build-Kette, die ausgelieferten Artefakte und die Einbindung in index.html sowie die Admin-PHP-Seiten.
  Gewählte Richtung:
  Zielarchitektur: native ES-Module mit import/export
  Scope: vollständig, also Quellcode plus Build-/Einbindungsseite
  Geplante Änderungen
  1. Modularchitektur auf explizite ES-Module umstellen
  assets/js/app/ und assets/js/admin/ werden von impliziten globalen Prepros-Teilmodulen auf echte ES-Module
  umgestellt.
  Jede fachliche Datei exportiert nur die Funktionen, die von anderen Modulen tatsächlich verwendet werden.
  Einstiegspunkte bleiben erhalten, werden aber zu echten Modul-Entrypoints:assets/js/app.js als Frontend-Entrypoint
  assets/js/admin.js als Admin-Entrypoint

  Gemeinsame Frontend-Helfer wie Typ-Normalisierung, Escaping, Metadaten, Datenladen und Section-Rendering werden
  über explizite Imports verdrahtet.
  Gemeinsame Admin-Helfer wie Tabs, Repeatables, Icon-Picker, Passwortsichtbarkeit und Auth-Formulare werden ebenfalls
  explizit importiert.
  Die bisher global bereitgestellten Shared-Funktionen aus assets/js/shared/all.js werden in klar benannte Exporte
  aufgeteilt oder als gezielt importierbares Shared-Modul erhalten.
  Verboten sind nach der Umstellung implizite Querverweise auf Funktionen, die nur deshalb sichtbar sind, weil Dateien
  konkatenierend zusammengeführt werden.
  2. Build-Kette von Prepros-Konkatenation auf modulbewussten Build umstellen
  Die bisherige @prepros-prepend-Kette wird aus assets/js/app.js und assets/js/admin.js entfernt.
  Der JavaScript-Build wird auf einen modulbewussten Ablauf umgestellt, der native import/export korrekt bundelt.
  Die Zielartefakte bleiben aus Kompatibilitätsgründen unverändert:js/app.min.js
  js/admin.min.js
  js/siteelements.min.js nur falls dieser Pfad im Projekt weiterhin aktiv benötigt wird

  Die bestehende Ladeform im HTML/PHP bleibt funktional kompatibel: die Seiten sollen nach der Migration weiterhin
  nur die finalen ausgelieferten Bundles laden und nicht die Rohquellen direkt.
  prepros.config wird entweder auf eine modulverträgliche Nutzung reduziert oder für JS als führende Build-Quelle
  ersetzt; maßgeblich ist, dass das Repository danach nur noch einen klaren, reproduzierbaren JS-Buildpfad hat.
  Die Doku in _docs/build.md und _docs/frontend.md wird an die neue Build- und Modularchitektur angepasst.
  3. Einbindungspunkte an die neue JS-Architektur anpassen
  index.html bleibt Verbraucher von js/app.min.js, muss aber nur dann als type="module" laden, wenn das finale
  Artefakt ungebundelt ausgeliefert würde. Standardannahme dieses Plans: weiterhin gebündelt, daher keine unnötige
  Änderung am Ladevertrag.
  Die Admin-PHP-Seiten bleiben Verbraucher von js/admin.min.js; das Ladeverhalten bleibt kompatibel zur bisherigen
  Struktur.
  Alle Modulgrenzen werden so gesetzt, dass contact.php, admin/index.php und admin/change-password.php denselben
  Frontend-/Admin-Vertrag wie bisher behalten.
  Die bestehende Initialisierungsreihenfolge bleibt erhalten:Frontend: Icons laden, Content bootstrappen, dann
  DOM-abhängige Initialisierer
  Admin: Shared-UI initialisieren, dann Auth- und Formularlogik

  4. Kompatibilität und Qualitätsgrenzen fest einplanen
  Öffentliche JSON-Datenformate und Legacy-Fallbacks in den normalize*()-Schichten bleiben unverändert.
  Request-/Response-Verträge von contact.php, admin/index.php, admin/change-password.php und
  admin/admin-save.php bleiben unverändert.
  Keine visuelle Neugestaltung und keine funktionale Erweiterung im Zuge der Modernisierung.
  Keine PHP-Architekturänderung; PHP bleibt außerhalb der JS-Modernisierung unverändert.
  Wenn ein Shared-Helfer sowohl im öffentlichen Frontend als auch im Admin verwendet wird, wird er in ein bewusstes
  Shared-Modul verschoben statt dupliziert.
  Öffentliche Interfaces und technische Verträge
  Neu sind explizite ES-Modul-Interfaces zwischen den JS-Dateien.
  Bestehende externe Interfaces bleiben gleich:data/data.json-Struktur
  contact.php-Antworten
  Admin-Auth- und Save-Responses
  ausgelieferte Bundle-Dateien unter js/

  Dokumentationsupdate erforderlich für:_docs/frontend.md
  _docs/admin.md
  _docs/build.md
  bei geänderter Einbindung zusätzlich _docs/architecture.md

  Testplan
  Build-Test:JS-Build läuft fehlerfrei durch und erzeugt die vorgesehenen Zielartefakte.

  Frontend-Test:öffentliche Seite lädt vollständig
  Metadaten werden weiterhin gesetzt
  Navigation, Theme, Custom-Select, Education-Carousel und Kontaktformular funktionieren unverändert

  Kontaktformular-Test:Erfolgspfad
  Validierungsfehler
  technische Fehlerantworten

  Admin-Test:Login
  Passwortwechsel
  Tabs
  Repeatables mit Hinzufügen, Entfernen und Reindexing
  Icon-Picker
  strukturierter Save-Flow
  JSON-Modus

  Regressionskontrolle:ausgelieferte Bundles sind synchron zum Quellcode
  _docs/ beschreibt den neuen Build- und Modulpfad korrekt

  Annahmen
  Gewähltes Ziel ist native ES-Modularchitektur, nicht nur eine weitere Verbesserung innerhalb von Prepros-Globals.
  Die Migration soll vollständig sein, also Quellcode plus Build- und Einbindungsebene.
  Die finalen Verbraucher sollen weiterhin gebündelte Artefakte unter js/ laden, nicht zahlreiche Einzelskripte.
  Funktionsverhalten, Datenverträge und UI bleiben gleich; geändert wird primär die interne JS-Architektur.
