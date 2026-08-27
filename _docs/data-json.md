# Data JSON

Stand: 2026-08-27

Diese Seite beschreibt die technische Struktur von `data/data.json` und `data/data.admin-template.json`.
Maßgeblich sind die aktuellen Dateien im Repository sowie ihre Verwendung im Frontend, im Admin-Bereich und in
`contact.php`.

## `data/data.json`

`data/data.json` ist die führende Inhaltsdatei für die öffentliche Seite und für Teile der Backend-Validierung. Im
aktuellen Stand enthält die Datei auf der obersten Ebene diese Schlüssel:

- `about`
- `contact`
- `education`
- `experience`
- `footer`
- `header`
- `hero`
- `meta`
- `projects`
- `site`
- `skills`

## Technische Bedeutung der Bereiche

Die Hauptbereiche steuern nicht nur Inhalte, sondern auch Laufzeitverhalten.

- `meta` liefert Titel, Beschreibung, Keywords und Open-Graph-Werte.
- `header`, `hero`, `about`, `skills`, `experience`, `projects`, `education`, `contact` und `footer` werden vom
  Frontend gerendert.
- `site` enthält seitenweite Einstellungen, die in mehreren Renderpfaden verwendet werden.
- `contact.form` liefert die Formular-Konfiguration für Frontend und Backend.

## Feldstruktur der Hauptbereiche

Die Hauptbereiche folgen im aktuellen Stand diesen Kernstrukturen:

- `meta`: `title`, `description`, `keywords`, `ogTitle`, `ogDescription`, `ogImage`, `ogSiteName`,
  `fluidIconTitle`
- `site`: `logoIcon`, `logoText`, `socialLinks[]`
- `header`: `navigation[]`, `resumeLink`
- `hero`: `availability`, `headline`, `intro`, `buttons[]`
- `about`: `id`, `preheader`, `title`, `paragraphs[]`, `images[]`, `cards[]`
- `skills`: `id`, `preheader`, `title`, `skills[]`
- `experience`: `id`, `preheader`, `title`, `experience[]`
- `projects`: `id`, `preheader`, `title`, `projects[]`
- `education`: `preheader`, `title`, `carouselLabel`, `courses[]`
- `contact`: `id`, `preheader`, `title`, `introCard`, `form`
- `footer`: `text`, `copyright`, `owner`

## Pflichtfelder auf oberster Ebene

`admin/admin-save.php` validiert im aktuellen Stand alle Hauptbereiche als Objektfelder. Für eine erfolgreich
speicherbare Datenstruktur sind diese Top-Level-Schlüssel damit verpflichtend:

- `meta`
- `site`
- `header`
- `hero`
- `about`
- `skills`
- `experience`
- `projects`
- `education`
- `contact`
- `footer`

## Nested-Objekte und Listen

Mehrere Bereiche bestehen aus wiederkehrenden Nested-Strukturen, die im Frontend normalisiert und im Admin validiert
werden.

- `site.socialLinks[]`: `href`, `title`, `icon`
- `header.navigation[]`: `href`, `label`, `title`
- `header.resumeLink`: `href`, `label`, optional `variant`, optional `large`, optional `icon`
- `hero.buttons[]`: `href`, `label`, optional `variant`, optional `large`, optional `icon`
- `about.images[]`: `src`, `alt`, optional `width`, optional `height`, optional `loading`, optional `className`,
  optional `responsive[]`
- `about.images[].responsive[]`: `media`, `srcset`, optional `width`, optional `height`
- `about.cards[]`: `title`, `text`, `icon`
- `skills.skills[]`: `title`, `icon`, `items[]`
- `experience.experience[]`: `date`, `title`, `company`, `location`, `points[]`
- `projects.projects[]`: `category`, `href`, `title`, `description`, `highlight`, `tags[]`, `image`
- `education.courses[]`: `title`, `provider`, `year`, `status`
- `contact.introCard`: `title`, `text`, `linkLabel`
- `contact.form`: `action`, `fields[]`, `submitButton`, `messages`

## Pflicht-/Optional-Status der Nested-Strukturen

Die folgende Referenz beschreibt den aktuell validierten Zielzustand für speicherbare Daten.

- `site.socialLinks[]`
  `href` Pflicht, `title` Pflicht, `icon` Pflicht
- `header.navigation[]`
  `href` Pflicht, `label` Pflicht, `title` optional
- `header.resumeLink`
  `href` Pflicht, `label` Pflicht, `variant` optional, `large` optional, `icon` optional
- `hero.buttons[]`
  `label` Pflicht, `href` optional aber falls vorhanden als gültiges Linkziel, `variant` optional, `large` optional,
  `icon` optional
- `about.images[]`
  `src` Pflicht, `alt` Pflicht, `width` optional, `height` optional, `loading` optional, `className` optional,
  `responsive` optional
- `about.images[].responsive[]`
  `media` Pflicht, `srcset` Pflicht, `width` optional, `height` optional
- `about.cards[]`
  `title` Pflicht, `text` Pflicht, `icon` Pflicht
- `skills.skills[]`
  `title` Pflicht, `icon` Pflicht, `items[]` Pflicht und jeder Eintrag nicht leer
- `experience.experience[]`
  `date` Pflicht, `title` Pflicht, `company` Pflicht, `location` Pflicht, `points[]` Pflicht und jeder Eintrag nicht
  leer
- `projects.projects[]`
  `category` Pflicht, `href` Pflicht, `title` Pflicht, `description` Pflicht, `highlight` Pflicht, `tags[]` Pflicht,
  `image` Pflicht
- `education.courses[]`
  `title` Pflicht, `provider` Pflicht, `year` Pflicht, `status` Pflicht
- `contact.introCard`
  `title` Pflicht, `text` Pflicht, `linkLabel` Pflicht
- `contact.form`
  `action` Pflicht, `fields[]` Pflicht, `submitButton` Pflicht, `messages` Pflicht

## `contact.form`

Der Block `contact.form` ist im aktuellen Stand ein Objekt mit diesen Hauptschlüsseln:

- `action`
- `fields`
- `messages`
- `submitButton`

Die Liste `fields` enthält aktuell acht Felddefinitionen. `contact.php` liest daraus Feldnamen, Pflichtregeln,
Maximal-Längen und feldspezifische Fehlermeldungen.

## `contact.form.fields[]`

Jede Felddefinition in `contact.form.fields[]` wird im aktuellen Stand über dieselbe Konfiguration sowohl im Frontend
als auch im Backend ausgewertet.

Typische Schlüssel sind:

- `label`
- `type`
- `id`
- `name`
- `placeholder`
- `rows`
- `required`
- `row`
- `wrapperClass`
- `maxLength`
- `errorRequired`
- `errorTooLong`
- `errorInvalid`
- `value`
- `options[]`

Im aktuell validierten Zielzustand gelten diese Regeln:

- `label` Pflicht
- `type` Pflicht
- `name` Pflicht
- `required` Pflicht als Boolean
- `row` Pflicht als Boolean
- `id` Pflicht bei `text`, `email`, `textarea`, `select`, `checkbox`
- `rows` Pflicht als positive Ganzzahl nur bei `textarea`, sonst optional
- `placeholder` optional
- `wrapperClass` optional
- `maxLength` optional als positive Ganzzahl
- `errorRequired` optional
- `errorTooLong` optional
- `errorInvalid` optional
- `value` optional, besonders relevant bei `checkbox`
- `options[]` Pflicht bei `select` und `radio`

Die technische Bedeutung einzelner Schlüssel ist:

- `type` steuert den Renderpfad, aktuell vor allem `text`, `email`, `textarea`, `select`, `radio`, `checkbox`
- `row` markiert Felder, die im Frontend nebeneinander in einer `form-row` gruppiert werden können
- `maxLength` steuert die serverseitige Längenprüfung in `contact.php`
- `errorRequired`, `errorTooLong` und `errorInvalid` liefern feldspezifische Fehlermeldungen
- `options[]` wird bei `select` und `radio` ausgewertet

Für `options[]` gelten im aktuellen Stand diese Schlüssel:

- `label`
- `value`
- `selected`
- `id` nur bei `radio`

Mit Validierungsstatus:

- `label` Pflicht
- `value` Pflicht bei `radio`, optional bei `select`
- `selected` optional, falls vorhanden Boolean
- `id` Pflicht bei `radio`

## `contact.form.messages`

Im aktuellen Stand enthält `messages` diese Schlüssel:

- `defaultTooLong`
- `emptySubjectFallback`
- `honeypotSuccess`
- `mailFailed`
- `mailSubjectPrefix`
- `mailSuccess`
- `methodNotAllowed`
- `validationFailed`

`contact.php` ergänzt fehlende oder leere Werte mit internen Fallbacks.

Alle Schlüssel in `contact.form.messages` sind für speicherbare Admin-Daten Pflicht.

## `data/data.admin-template.json`

`data/data.admin-template.json` beschreibt die Struktur für das strukturierte Admin-UI. Im aktuellen Stand verwendet
die Datei auf oberster Ebene dieselben Hauptschlüssel wie `data/data.json`:

- `about`
- `contact`
- `education`
- `experience`
- `footer`
- `header`
- `hero`
- `meta`
- `projects`
- `site`
- `skills`

Das Template gruppiert die bearbeitbaren Bereiche fachlich und dient `admin/admin.php` als Grundlage für die
strukturierte Oberfläche.

## Rolle des Templates

`data/data.admin-template.json` ist im aktuellen Stand keine zweite Inhaltsquelle, sondern eine Strukturvorlage.

- Das Template definiert, welche Bereiche und Feldgruppen im strukturierten Admin-Modus aufgebaut werden.
- `adminBuildStructuredPayload()` verwendet das Template zusammen mit den vorhandenen Daten und den neuen Formwerten.
- Die finale Validierung läuft immer gegen den daraus erzeugten Ziel-Payload, nicht gegen das Template allein.

## Historische Varianten und Fallbacks

Das Frontend unterstützt im aktuellen Stand mehrere ältere oder alternative JSON-Formen, damit bestehende Daten nicht
vor einer Anzeige erst manuell migriert werden müssen.

- `about.image` wird weiterhin akzeptiert und intern zu `about.images[]` normalisiert.
- `skills.groups` wird weiterhin akzeptiert und intern zu `skills.skills[]` normalisiert.
- `experience.items` wird weiterhin akzeptiert und intern zu `experience.experience[]` normalisiert.
- `projects.items` wird weiterhin akzeptiert und intern zu `projects.projects[]` normalisiert.
- `education.items` wird weiterhin akzeptiert und intern zu `education.courses[]` normalisiert.
- `image.sources` wird weiterhin akzeptiert und intern wie `image.responsive[]` behandelt.
- `hero.headline` und `hero.intro` können als String oder als Rich-Text-Objekt vorliegen.
- `site.socialLinks` kann historisch auch aus `hero.socialLinks` oder `footer.socialLinks` abgeleitet werden.

## Zusammenhang zwischen JSON, Frontend und Admin

Die JSON-Struktur ist im aktuellen Projektstand kein reines Content-Format, sondern ein technischer Vertrag zwischen
mehreren Schichten.

- `assets/js/app/` normalisiert und rendert die öffentlichen Bereiche.
- `admin/admin-save.php` validiert Struktur und Business-Regeln gegen dieselben Hauptfelder.
- `contact.php` liest `contact.form.fields` und `contact.form.messages` direkt für Validierung und Antworten aus.
- `data/data.admin-template.json` bestimmt, wie strukturierte Eingaben im Admin wieder zu `data/data.json`
  zusammengesetzt werden.

## Änderungsfolgen

Strukturänderungen an `data/data.json` oder `data/data.admin-template.json` betreffen in der Regel mehrere Stellen
gleichzeitig.

- Die öffentliche Seitenausgabe kann sich ändern.
- Die Metadaten können sich ändern.
- Die Kontaktformular-Validierung kann sich ändern.
- Das strukturierte Admin-UI muss weiter zur Datenstruktur passen.

Deshalb sollten Strukturänderungen immer zusammen mit `assets/js/app/`, `admin/admin-save.php` und `contact.php`
geprüft werden.
