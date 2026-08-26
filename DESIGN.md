# Design System: Lisa Weber Portfolio
**Project ID:** Ich kann keine Stitch-Projekt-ID aus dem aktuellen Repository
bestätigen. Im Workspace liegen HTML-, SCSS-, JS- und JSON-Quellen vor, aber
keine Stitch-Projektmetadaten.

Diese Datei beschreibt das belegbare visuelle System des aktuellen Frontends.
Sie basiert ausschließlich auf dem Stand im Repository. Die Aussagen unten
leiten sich aus `index.html`, `data/data.json`, `assets/scss/` und
`assets/js/app.js` ab, nicht aus einem Stitch-Export.

## 1. Visual theme & atmosphere
Das Frontend wirkt wie ein ruhiges, editoriales Portfolio mit Studio-Charakter.
Die Kombination aus einer klassischen Serifenschrift für Überschriften, einer
neutralen Sans-Serif für Fließtext, sehr hellen Flächen, feinen Rasterpunkten
im Seitenhintergrund und weichen Kartenradien erzeugt eine kultivierte,
hochwertige und zugängliche Stimmung statt einer lauten Produkt-Dashboard-
Ästhetik. Im Hero bleibt die linke Spalte textlich klar, während rechts erst ab
Desktop eine abstrakte, schwebende Interface-Komposition erscheint. Dadurch
fühlt sich die Seite zugleich redaktionell und digital an.

Quellen: `assets/scss/base/_fonts.scss:4-34`,
`assets/scss/base/_basics.scss:14-29`,
`assets/scss/pages/home/_hero.scss:4-79`, `data/data.json:66-95`,
`assets/js/app.js:104-135`.

## 2. Color palette & roles
Das Farbsystem ist hell grundiert und nutzt neutrale Zink-Töne als Bühne,
Violett als primären Interaktionsakzent und Rosé als warme Gegenfarbe. Im Dark
Mode bleiben dieselben Akzentfamilien erhalten, während die neutralen Flächen
auf tiefe Zink-Töne umgestellt werden.

- Soft Zinc Canvas (`#fafafa`): Grundfläche für den Body und mehrere ruhige
  UI-Flächen. Quelle: `assets/scss/_variables.scss:66,172,203,208,215,218`.
- Paper White (`#ffffff`): Karten-, Header- und Offcanvas-Fläche im hellen
  Theme sowie Textkontrast auf dunklen Primärbuttons. Quelle:
  `assets/scss/_variables.scss:5,150,184,189,191`.
- Editorial Ink (`#18181b`): dominante Überschriftenfarbe im hellen Theme und
  Theme-Color des dunklen Modus. Quelle:
  `assets/scss/_variables.scss:75,175,223-248`, `index.html:24-48`.
- Muted Zinc Text (`#52525c`): ruhiger Fließtextton statt hartem Schwarz.
  Quelle: `assets/scss/_variables.scss:72-73,173`.
- Atelier Violet (`#7c3aed`): primäre Aktions- und Hover-Farbe, Preheader-Linie,
  Highlight-Farbe und Hero-Gradient-Start. Quelle:
  `assets/scss/_variables.scss:24,151,194,224,267`,
  `assets/scss/_variables.scss:347,381-385,481,483,488-491`.
- Powder Violet (`#ede9fe`) und Mist Violet (`#f5f3ff`): helle Zustands- und
  Hover-Flächen für Sekundär-Buttons, Highlights und aktive Eingaben. Quelle:
  `assets/scss/_variables.scss:19,18,152-153,179,194,225-226,267,361`.
- Rose Signal (`#fb7185`): warme Akzentfarbe für dekorative Hero-Elemente und
  die zweite Farbtemperatur im System. Quelle:
  `assets/scss/_variables.scss:46,154,227,502`.
- Rose Accent Dark (`#f43f5e`): zweiter Verlaufspunkt im Hero und Basis für
  destruktive Buttons. Quelle:
  `assets/scss/_variables.scss:47,155,228,393-397,489`.
- Clear Focus Blue (`#005fcc`): ausschließlich als sichtbarer Focus-Ring
  reserviert. Quelle: `assets/scss/_variables.scss:9,165,238`,
  `assets/scss/base/_basics.scss:4-6`.

## 3. Typography rules
Die Typografie baut ihre Hierarchie über zwei lokal eingebundene Familien auf:
`Playfair Display` für Überschriften und Markensignale, `Inter` für Fließtext
und Formelemente. `Playfair Display` wird in normaler und kursiver Variante
geladen; die Kursivform wird im Hero sogar direkt innerhalb der Headline
inszeniert. Der Basistext läuft mit geringem Gewicht (`300`) und einer lockeren
Zeilenhöhe (`1.63`), während Überschriften dichter, größer und mit negativer
Laufweite gesetzt sind. Das Ergebnis ist eine Mischung aus Editorial-Spannung
und UI-Lesbarkeit.

Quellen: `assets/scss/base/_fonts.scss:4-34`,
`assets/scss/_variables.scss:102-128,325-341`,
`assets/scss/base/_basics.scss:21-25,32-54,125-137`,
`assets/scss/pages/home/_hero.scss:39-45`, `index.html:62-65`.

## 4. Component stylings
Die Komponenten wiederholen wenige, klar erkennbare Formprinzipien: pillen-
förmige Aktionen, großzügig gerundete Karten, dünne Linien statt schwerer
Umrandungen und sanfte Bewegungen bei Hover oder Öffnungszuständen.

* **Buttons:** Buttons sind pillenförmig (`border-radius: 999.9rem`), laufen
  mit mittlerem Schriftgewicht und erhalten im Hero einen deutlichen Schatten.
  Primär-Buttons verwenden eine dunkle Grundfläche mit violettem Hover, während
  Sekundär-Buttons auf heller Fläche mit feiner Zink-Kontur sitzen und bei
  Interaktion in eine sehr helle Violettfläche wechseln. Quellen:
  `assets/scss/_variables.scss:364-397`,
  `assets/scss/components/_button.scss:4-79`,
  `assets/scss/pages/home/_hero.scss:51-62`.

* **Cards and containers:** Karten nutzen großzügig gerundete Ecken
  (`1.6rem`), eine feine Linie (`0.1rem`) und leichte bis mittlere Schatten.
  Beim Hover färbt sich die Kontur violett auf und Bilder skalieren leicht. Die
  About-, Skills-, Projekte-, Education- und Contact-Bausteine variieren dieses
  Grundmuster, ohne das Grundgerüst zu verlassen. Quellen:
  `assets/scss/_variables.scss:134-146,414-416,477-478`,
  `assets/scss/components/_card.scss:4-34,62-184,229-284`,
  `assets/js/app.js:202-239,246-275,323-411,593-620`.

* **Inputs and forms:** Formfelder stehen auf ruhigen Flächen mit leicht
  gerundeten Ecken (`1.2rem`) und dünner Zink-Kontur. Ausgefüllte Textfelder
  und aktivierte Auswahlfelder kippen in eine sehr helle Violettfläche, sodass
  Zustand sichtbar wird, ohne aggressiv zu wirken. Checkboxen und Radios werden
  vollständig eigens gestylt. Quellen:
  `assets/scss/_variables.scss:177,240,250,361-362`,
  `assets/scss/components/_form.scss:18-116,118-197`,
  `assets/js/app.js:414-549`.

* **Header and navigation:** Der Header bleibt fixiert, verdichtet sich beim
  Scrollen und legt dann eine transluzente, weich verschwommene Fläche über die
  Seite. Auf kleinen Viewports wechselt die Navigation in ein rechts
  einschiebendes Offcanvas-Panel mit derselben ruhigen Materialität. Quellen:
  `assets/scss/_variables.scss:189-192,262-265`,
  `assets/scss/layout/_header.scss:4-191`,
  `assets/js/app.js:75-101`.

* **Hero composition:** Der Hero verbindet eine textliche Leitbühne mit einer
  abstrakten Desktop-Komposition aus vier schwebenden Modulen. Zwei dekorative
  Objekte sind klein und farblich akzentuiert, zwei größere Module erinnern an
  abstrahierte Interface-Karten mit Innenstruktur, Rotation und sanfter
  Tiefenwirkung. Quellen: `assets/scss/_variables.scss:196-201,269-274,488-502`,
  `assets/scss/pages/home/_hero.scss:80-260`, `assets/js/app.js:115-135`.

## 5. Layout principles
Das Layout arbeitet mit einem großzügigen Einspalten-Grundraster und klaren
Sprungstellen in die Zweispaltigkeit. `header`, `footer` und `section`
verwenden dieselben horizontalen Innenabstände, die responsiv über
`clamp(...)` skaliert werden. Der Inhaltscontainer ist auf `115.2rem`
begrenzt. Hero, About und Contact wechseln ab `64rem` in zwei Spalten; Skills,
Projects und Education tun das bereits ab `48rem`. Zwischen den Sektionen
entsteht ein ruhiger Rhythmus durch große vertikale Abstände, subtile
Alternierung heller Flächen und feine horizontale Trennlinien.

Quellen: `assets/scss/_variables.scss:90-100`,
`assets/scss/base/_basics.scss:104-123`,
`assets/scss/pages/home/_all.scss:4-30`,
`assets/scss/pages/home/_projects.scss:4-9`.

## 6. Observed content-quality constraint
Die sichtbare Gestaltung wird aktuell durch mehrere belegbare Textfehler in
`data/data.json` geschwächt, zum Beispiel `Erfarung`, `Philosophe & Ansatzt`,
`Schnitstelle`, `Geestaltung`, `Schopify` und `IOS-app`. Das ist keine
Stilinterpretation, sondern direkt im Contentbestand nachweisbar. Solange diese
Texte unverändert gerendert werden, gehört Copy-Qualität faktisch zum
Designsystem, weil sie die wahrgenommene Hochwertigkeit mitbestimmt.

Quellen: `data/data.json:47,69,89,92,123,128,224,263,268,331,365`,
`assets/js/app.js:75-600`.

## 7. Non-confirmed points
Ich kann aus dem aktuellen Repository nicht bestätigen,

- dass ein Stitch-Projekt mit einer verifizierbaren Projekt-ID existiert,
- dass die aktuelle Oberfläche aus einem Stitch-Screen exportiert wurde,
- wie die Seite visuell im Browser tatsächlich aussieht, weil ich nur den
  Code- und Datenstand, nicht aber einen Laufzeitscreenshot geprüft habe.

Diese Punkte bleiben bewusst offen, bis entsprechende Projektmetadaten oder ein
verifizierter visueller Laufzeitnachweis vorliegen.
