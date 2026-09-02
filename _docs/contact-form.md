# Kontaktformular

Stand: 2026-09-01

Diese Seite beschreibt den technischen Vertrag von `contact.php`. Maßgeblich sind `contact.php`,
`contact-config.php` und der Bereich `contact.form` in `data/data.json`.

## Zweck

`contact.php` ist ein JSON-Endpunkt für das öffentliche Kontaktformular. Die Datei liest die sichtbare
Formular-Konfiguration aus `data/data.json`, hält den Mail-Empfänger aber getrennt in `contact-config.php`.

## Eingangsvertrag

Die Datei verarbeitet Formulardaten auf Basis der Felddefinitionen aus `contact.form.fields`. Zusätzlich verwendet
sie einen Honeypot-Namen aus `contactHoneypotName()`, der aktuell den Wert `honeypot` zurückgibt. Das öffentliche
Frontend rendert das Honeypot-Feld zwar weiterhin im DOM, sendet den Wert im aktuellen Stand aber erst in
`assets/js/app/app.contact-form.js` gezielt per `FormData.append('honeypot', ...)`, damit Browser-Autofill und
Passwortmanager das Feld seltener automatisch befüllen.

Die serverseitige Validierung verwendet aus der JSON-Konfiguration unter anderem:

- Feldnamen
- Pflichtregeln
- Maximal-Längen
- feldspezifische Fehlermeldungen

Im aktuellen Stand liest `contact.php` diese konkreten Formularfelder:

- `salutation`
- `firstname`
- `lastname`
- `email`
- `subject`
- `radio-group`
- `message`
- `honeypot`

Die Werte werden dabei unterschiedlich vorbehandelt:

- `field()` liest Rohwerte aus `$_POST`, verwirft Nicht-Strings und normalisiert Zeilenumbrüche
- `singleLine()` reduziert Felder wie Name, E-Mail, Betreff und Interesse auf eine Zeile
- `message` bleibt mehrzeilig erhalten
- `textLength()` prüft Längen UTF-8-sicher über `mb_strlen()`, falls verfügbar

Im gerenderten HTML trägt das Honeypot-Feld bewusst keinen `name`- und keinen `id`-Wert. Stattdessen verwendet das
Frontend nur `data-honeypot-field`, `autocomplete="new-password"` und einen manuellen Append beim Senden.

## Request-Regeln

Der technische Request-Vertrag ist im aktuellen Stand eng gefasst.

- Nur `POST` ist erlaubt
- andere Methoden liefern sofort HTTP `405`
- ein befülltes Honeypot-Feld beendet den Flow frühzeitig mit einer technisch erfolgreichen, aber als Spam markierten
  Antwort
- die Empfängeradresse wird nicht aus `data/data.json`, sondern aus `contact-config.php` gelesen
- `Reply-To` wird nur gesetzt, wenn die Benutzer-E-Mail gültig und header-sicher ist

## Antwortvertrag

`contact.php` liefert JSON-Antworten mit mindestens den Schlüsseln `ok` und
`message`.

Die Nachrichtenbasis kommt aus `contact.form.messages`. Falls dort ein technisch benötigter Schlüssel fehlt oder
leer ist, ergänzt `contact.php` interne Fallbacks.

Im aktuellen Stand treten diese Antwortformen auf:

- HTTP `200`, `ok: true`, `message` bei erfolgreichem Versand
- HTTP `200`, `ok: true`, `honeypot: true`, `message` bei ausgelöstem Honeypot mit Hinweis auf automatisches
  Ausfüllen des versteckten Spam-Schutz-Felds
- HTTP `405`, `ok: false`, `message` bei nicht erlaubter Methode
- HTTP `422`, `ok: false`, `message`, `errors` bei Validierungsfehlern
- HTTP `500`, `ok: false`, `message` bei technischen Fehlern wie ungültiger Konfiguration, ungültigem JSON oder
  fehlgeschlagenem Mail-Versand

Das Feld `errors` ist im aktuellen Stand ein Objekt `feldname -> fehlermeldung`.

Aktuell können im Fehlerobjekt insbesondere diese Schlüssel auftreten:

- `firstname`
- `lastname`
- `email`
- `subject`
- `message`
- weitere konfigurierte Feldnamen aus `contact.form.fields[]`, wenn für sie Pflicht- oder Längenregeln definiert sind

## Fehlerfälle

Im aktuellen Stand behandelt `contact.php` unter anderem diese Fehlerfälle:

- `data/data.json` kann nicht gelesen werden
- `data/data.json` enthält ungültiges JSON
- die geladene JSON-Struktur ist kein Objekt
- der konfigurierte Empfänger fehlt
- der konfigurierte Empfänger ist keine gültige E-Mail-Adresse
- der konfigurierte Empfänger enthält unsichere Header-Zeichen
- Validierung einzelner Felder schlägt fehl
- der Mail-Versand schlägt fehl

Zusätzlich gelten im aktuellen Stand diese Validierungsregeln:

- Maximal-Längen werden dynamisch aus `contact.form.fields[].maxLength` gelesen
- Pflichtfelder werden dynamisch aus `contact.form.fields[].required` gelesen
- feldspezifische Fehlermeldungen werden dynamisch aus den zugehörigen `error*`-Schlüsseln gelesen
- `email` wird nur validiert, wenn ein Wert vorhanden ist
- der Mail-Betreff wird aus `mailSubjectPrefix` und `subject` aufgebaut
- fehlt `subject`, wird `emptySubjectFallback` verwendet

## Sicherheitsrelevante Punkte

Die Datei trennt die Empfängeradresse bewusst von der öffentlichen Inhaltsdatei. Zusätzlich prüft
`contactHeaderValueIsSafe()` auf Zeilenumbrüche, um Header-Injection in Mail-Headern zu blockieren.

Die Mail wird im aktuellen Stand mit diesen Headern aufgebaut:

- `From: Portfolio Kontakt <empfaengeradresse>`
- `Content-Type: text/plain; charset=UTF-8`
- optional `Reply-To: <benutzeradresse>`

## Beziehung zum Frontend

Das öffentliche Frontend in `assets/js/app/app.contact-form.js` verarbeitet die Antworten von `contact.php` direkt.

- Bei `422` werden die Fehlermeldungen feldweise in `[data-form-error="<feldname>"]` geschrieben
- Bei Erfolg wird das Formular zurückgesetzt und die `message` in das Status-Element übernommen
- Bei `honeypot: true` zeigt das Frontend die `message` als Fehlerstatus und setzt das Formular nicht zurück
- Bei ungültigem JSON oder Nicht-JSON-Antworten zeigt das Frontend generische technische Fehlermeldungen an

## Abhängigkeiten

Änderungen am Kontaktformular sollten immer zusammen mit diesen Dateien geprüft werden.

- `data/data.json`
- `contact-config.php`
- `assets/js/app/app.render.contact.js`
- `assets/js/app/app.contact-form.js`
- `admin/admin-save.php`
