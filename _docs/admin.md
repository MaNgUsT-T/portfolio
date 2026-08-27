# Admin

Stand: 2026-08-27

Diese Seite beschreibt den technischen Ablauf der Admin-Oberfläche. Maßgeblich sind `admin/admin.php`,
`admin/admin-save.php`, `admin/admin-lib.php`, `assets/js/admin.js`, `assets/js/admin/`, `assets/js/shared/all.js`,
`scripts/build-js.mjs`, `js/admin.min.js`, `data/data.json` und `data/data.admin-template.json`.

## Admin-Flow

`admin/admin.php` ist der Einstiegspunkt der Admin-Oberfläche.

1. Die Datei startet die Session.
2. Die Datei sendet Header zum Blocken von Crawlern.
3. Die Datei prüft, ob ein authentifizierter Admin vorliegt.
4. Ohne Authentifizierung erfolgt eine Weiterleitung zum Login.
5. Mit Authentifizierung lädt die Seite `data/data.json` und `data/data.admin-template.json`.
6. Danach rendert die Seite strukturierte Bearbeitungsansichten und den Raw-JSON-Modus.

## Session-Verhalten

Die Session-Verwaltung und Authentifizierungslogik liegen in `admin/admin-lib.php`. `admin/admin.php` ruft
`adminStartSession()` auf und verwendet `adminIsAuthenticated()` als Zugriffsschutz. Flash-Meldungen werden über
`adminConsumeFlash()` in die Oberfläche eingeblendet.

Zusätzlich setzt `adminStartSession()` die Cookie-Parameter aus `admin/admin-config.php` vor `session_start()`. Dazu
gehören im aktuellen Stand `lifetime`, `path`, `domain`, `httponly`, `secure` und `samesite`.

## Validierung

`admin/admin-save.php` prüft zuerst, ob ein authentifizierter Admin vorliegt. Danach prüft die Datei den
`csrf_token`.

Anschließend unterscheidet die Datei zwischen:

- JSON-Modus mit direkter Verarbeitung von `json-payload`
- strukturiertem Modus mit feldweiser Verarbeitung und Validierung

Die Validierungsfunktionen prüfen unter anderem:

- Objekt- und Listenfelder
- Pflicht- und optionale Strings
- Boolean-Felder
- positive Integer
- URL-Ziele
- Buttons
- Bilder
- Kontaktfelder und Optionen

## Bearbeitungsmodi

`admin/admin-save.php` unterstützt im aktuellen Stand zwei Modi, die über `POST[mode]` unterschieden werden.

- `structured`: verarbeitet `POST[data]`, baut daraus mit Hilfe von `data/data.admin-template.json` einen vollständigen
  Payload und validiert ihn
- `json`: verarbeitet `POST[json-payload]` direkt als vollständiges JSON-Objekt, validiert es und speichert es danach

## Request-Vertrag der Admin-Speicherung

Die Speichern-Route `admin/admin-save.php` erwartet immer eine `POST`-Anfrage mit gültigem `csrf_token`.

Für `mode=structured` gilt:

- `POST[data]` muss als Array vorliegen
- `adminBuildStructuredPayload()` kombiniert Template, vorhandene Daten und neue Eingaben zu einem vollständigen
  Payload

Für `mode=json` gilt:

- `POST[json-payload]` muss ein gültiger JSON-String sein
- das decodierte Ergebnis muss ein Objekt in Array-Form sein

Unabhängig vom Modus gelten außerdem:

- `POST[csrf_token]` muss vorhanden und gültig sein
- die Session muss bereits als authentifiziert gelten
- der Ziel-Payload muss alle Hauptbereiche `meta`, `site`, `header`, `hero`, `about`, `skills`, `experience`,
  `projects`, `education`, `contact` und `footer` als Objektfelder enthalten

## Response- und Fehlerverhalten der Admin-Speicherung

`admin/admin-save.php` liefert im aktuellen Stand keine JSON-Antworten zurück, sondern arbeitet mit Flash-Meldungen
und Redirects.

- Bei `GET` oder anderen nicht erlaubten Methoden: HTTP `405`, Error-Flash und Redirect zu `./admin.php`
- Bei ungültigem `csrf_token`: Error-Flash und Redirect zu `./admin.php`
- Bei erfolgreichem Speichern im strukturierten Modus: Success-Flash und Redirect zu `./admin.php`
- Bei erfolgreichem Speichern im JSON-Modus: Success-Flash und Redirect zu `./admin.php`
- Bei `JsonException`: Error-Flash mit Präfix aus der Übersetzung und Redirect zu `./admin.php`
- Bei `RuntimeException`: Error-Flash mit der konkreten Validierungs- oder Laufzeitmeldung und Redirect zu `./admin.php`

## Save-Flow

Nach erfolgreicher Validierung schreibt `adminSaveSiteData()` in `admin/admin-lib.php` die neue Fassung von
`data/data.json`.

Der Ablauf ist aktuell:

1. JSON serialisieren
2. Zeilenumbruch anhängen
3. temporäre Datei im Zielverzeichnis erzeugen
4. Datei mit `LOCK_EX` schreiben
5. temporäre Datei per `rename()` atomar auf `data/data.json` ersetzen

## Login- und Passwortwechsel-Verträge

Neben `admin/admin-save.php` gibt es im Admin-Bereich zwei weitere JSON-fähige Auth-Flows.

- `admin/index.php` verarbeitet Login-Anfragen
- `admin/change-password.php` verarbeitet Passwortwechsel

Beide Endpunkte liefern nur dann JSON zurück, wenn der Request im Header `Accept: application/json` enthält.

Der Login-Flow antwortet im JSON-Modus mit:

- Erfolg: HTTP `200`, `ok: true`, `message`, `redirect: "./admin.php"`
- Fehler: HTTP `422`, `ok: false`, `message`, `errors.password[]`

Der Passwortwechsel antwortet im JSON-Modus mit:

- Erfolg: HTTP `200`, `ok: true`, `message`
- Validierungsfehler: HTTP `422`, `ok: false`, `message`, `errors.current_password[]`, `errors.new_password[]`,
  `errors.confirm_password[]`

Ohne JSON-Accept arbeiten beide Flows mit HTML-Ausgabe plus inline gerenderten Fehlermeldungen.

## Fehlerstruktur der JSON-Auth-Flows

Die JSON-Auth-Flows liefern im aktuellen Stand feldbezogene Fehlerlisten.

- Login
  `errors.password` ist ein Array aus Fehlermeldungen
- Passwortwechsel
  `errors.current_password`, `errors.new_password` und `errors.confirm_password` sind jeweils Arrays aus
  Fehlermeldungen

Die Frontend-Initialisierung in `assets/js/admin/admin.auth-forms.js` kann deshalb sowohl Einzelmeldungen als auch
Mehrfachmeldungen pro Feld verarbeiten.

## Clientseitige Admin-Helfer

`assets/js/admin.js` ist der Admin-JavaScript-Entrypoint und importiert `assets/js/admin/admin.entry.js`. Nach
`DOMContentLoaded` initialisiert das gebündelte Admin-Skript aktuell:

- Header-Scroll
- Mobile-Navigation
- Tabs
- Repeatables
- Custom-Selects
- Icon-Picker
- Passwort-Sichtbarkeit
- Login-Formular
- Passwortwechsel-Formular

`scripts/build-js.mjs` erzeugt aus `assets/js/admin.js` das ausgelieferte Artefakt `js/admin.min.js`.

## Verantwortlichkeiten der Admin-JS-Module

Die unter `assets/js/admin/` eingebundenen Teilmodule decken im aktuellen Stand diese Rollen ab:

- `admin.utils.js` für gemeinsame kleine Hilfsfunktionen
- `admin.tabs.js` für Tab-Wechsel
- `admin.repeatables.js` für dynamisch wiederholbare Feldgruppen und deren Index-Neuberechnung
- `admin.icon-picker.js` für Icon-Auswahl und Suche
- `admin.password-visibility.js` für Umschalten der Passwortsichtbarkeit
- `admin.auth-forms.js` für gemeinsame JSON-Logik von Login und Passwortwechsel
- `admin.entry.js` für die Initialisierungsreihenfolge

Die Module importieren ihre Abhängigkeiten explizit. Gemeinsame UI-Helfer wie Icon-Laden, Navigation und
Custom-Selects kommen aus `assets/js/shared/all.js`.

## DOM-Vertrag der Admin-JS-Module

Die wichtigsten Admin-Teilmodule erwarten im aktuellen Stand diese DOM-Strukturen:

- `admin.tabs.js`
  `[data-tabs]`, `[data-tab-trigger]`, `[data-tab-panel]`
- `admin.repeatables.js`
  `[data-repeatable]`, `[data-repeatable-items]`, `[data-repeatable-template]`, `[data-repeatable-item]`
- `admin.icon-picker.js`
  `[data-icon-picker]` sowie die internen Klassen und Data-Attribute des Picker-Markups
- `admin.password-visibility.js`
  `[data-password-toggle]` und `[data-password-field]` innerhalb `.js-password-input`
- `admin.auth-forms.js`
  `#auth-form` oder `#change-password-form` plus Status- und Fehler-Slots
