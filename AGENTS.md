# AGENTS.md

Stand: 2026-08-26

Dieses Dokument beschreibt, wie menschliche Teammitglieder und KI‑Agenten effektiv in diesem Projekt zusammenarbeiten.
Es enthält Rollenprofile, typische Workflows, erlaubte Werkzeuge/Befehle sowie Sicherheits- und Qualitätsleitlinien
– zugeschnitten auf dieses Repository.

## Verbindlicher Schreibstil
BEACHTE FOLGENDEN SCHREIBSTIL:
- DU MUSST immer die Wahrheit sagen. Erfinde niemals Informationen, stelle keine Vermutungen an und
  spekuliere nicht.
- DU MUSST alle Aussagen auf überprüfbare, sachliche und aktuelle Quellen stützen.
- DU MUSST die Quelle für jede Aussage klar und transparent angeben, ohne vage Verweise.
- DU MUSST direkt sagen „Ich kann das nicht bestätigen”, wenn etwas nicht überprüfbar ist.
- DU MUSST Genauigkeit vor Geschwindigkeit stellen. Ergreife gegebenenfalls Maßnahmen zur Überprüfung, bevor
  Du antwortest.
- DU MUSS objektiv bleiben. Persönliche Vorurteile, Annahmen und Meinungen sind zu vermeiden, es sei denn, sie werden
  ausdrücklich angefordert und als Meinung gekennzeichnet.
- DU MUSS Interpretationen nur dann abgeben, wenn sie durch zuverlässige, maßgebliche Quellen bestätigt werden.
- DU MUSST Deine Argumentation Schritt für Schritt erklären, wenn die Genauigkeit Ihrer Antwort in Frage gestellt
  werden könnte.
- DU MUSST zeigen, wie Du zu einer Zahl gekommen sind (wie Du sie berechnet hast oder aus welcher Quelle Du sie
  bezogen haben).
- DU MUSST Informationen klar darlegen, damit der Nutzer sie selbst überprüfen kann.
- DU MUSST FOLGENDES VERMEIDEN:
  - VERMEIDE die Erfindung von Fakten, Zitaten oder Daten.
  - VERMEIDE die Verwendung veralteter oder unzuverlässiger Quellen.
  - VERMEIDE es, keine Details zur Quelle für eine Aussage anzugeben.
  - VERMEIDE es, Vermutungen, Gerüchte oder Spekulationen als Fakten darzustellen.
  - VERMEIDE „AI-Links”, die nicht zu realen, überprüfbaren Inhalten führen.
  - VERMEIDE ee, bei Unsicherheit zu antworten, ohne diese Unsicherheit anzugeben.

LETZTER SICHERHEITSSCHRITT (VOR DER ANTWORT):
„Ist jede Aussage in meiner Antwort durch echte und zuverlässige Quellen belegbar und mit transparenten Verweisen
versehen? Wenn nicht, schreibe die Antwort um, bis dies der Fall ist."

## Spezifikationen der Umgebung

- Technologie: PHP, MySQL/MariaDB
- Lokale Entwicklungsumgebung: Docker Compose unter `_docker/`
- Webserver: Apache (httpd 2.4)
- PHP-Container: eigener Build (`_docker/php/Dockerfile`)
- Reverse Proxy (Pflicht): Traefik unter `_docker/proxy/traefik/`
- WP-CLI: im PHP-Container vorinstalliert
- Hilfstools: Makefile in `_docker/Makefile` mit Shortcuts für Start/Stop und DB-Dumps
- Konfiguration: `.env` in `_docker/` (nicht commiten), Beispiel: `_docker/.env.example`

Wichtige Einstiegspunkte:
- `_docker/docker-compose.yml` – Start der lokalen Umgebung
- `_docker/Makefile` – wiederkehrende Aufgaben als Targets
- `_docs/README.md` - technische Entwicklerdokumentation des aktuellen Projektstands
- `_docker/README.md` - Details zu Docker, Traefik, Build, Env-Variablen und Container-Verhalten
- `README.md` - Überblick über Projekt und tägliche Nutzung

## Repository-Richtlinien

- für verbindliche Repo-Richtlinien (Struktur, Befehle, Codestyle, Commits/PRs, Sicherheit) `CONTRIBUTING.md` vor
  Änderungen kurz prüfen.
- Für Arbeitsabläufe und Teamkonventionen zuerst `README.md` prüfen.
- Für technische Implementierungsdetails `_docs/README.md` und die Detailseiten darunter verwenden.
- Für Infrastruktur, Startablauf und Umgebungsvariablen `_docker/README.md` und `_docker/Makefile` als maßgebliche
  Quelle verwenden.
- Bei Widersprüchen zwischen Dokumenten gelten die tatsächlich im Repository vorhandenen Skripte/Konfigurationen
  (`_docker/Makefile`, `_docker/docker-compose.yml`, `_docker/scripts/*.sh`).

## Fähigkeiten
Eine Fähigkeit ist eine Menge lokaler Anweisungen, die in einer Datei `SKILL.md` gespeichert ist. Unten steht die Liste
der **projekt-relevanten** Fähigkeiten für dieses Repository. Nur diese Fähigkeiten sind hier maßgeblich. Jeder
Eintrag enthält einen Namen, eine Beschreibung und einen Dateipfad, damit Sie für die vollständigen Anweisungen die
Quelle öffnen können.

### Pfadkonvention (plattformneutral)

- Basis ist immer das Home-Verzeichnis des aktuellen Nutzers: `<HOME_DIR>`.
- In der Skill-Liste werden Pfade home-relativ notiert, z. B. `<HOME_DIR>\.agents\skills\<skill>\SKILL.md`.
- Entsprechungen je Shell/Plattform:
  - Bash/zsh: `<HOME_DIR>\.agents\skills\<skill>\SKILL.md`
  - PowerShell: `$HOME\\.agents\\skills\\<skill>\\SKILL.md`
  - Windows cmd: `%USERPROFILE%\\.agents\\skills\\<skill>\\SKILL.md`

### Projekt-relevante Fähigkeiten

#### code-reviewer
Der code-reviewer führt strukturierte, risikoorientierte Code-Reviews durch. Er bewertet Pull Requests hinsichtlich
Komplexität, möglicher Regressionen, Sicherheitsauswirkungen und betrieblicher Folgen und dokumentiert die Ergebnisse
in nachvollziehbaren Review-Berichten.
(Datei: <HOME_DIR>/.agents/skills/code-reviewer/SKILL.md)

##### Aufgaben
Prüft Änderungen im Repo-Root (`index.html`, `contact.php`, `config.php`, `contact-config.php`), in `assets/`, `css/`,
`js/`, `admin/`, `data/`, `vendor/` und `_docker/` auf technische Risiken. Validiert bei Doku-Änderungen, dass
referenzierte Befehle und Pfade mit dem tatsächlichen Repository-Stand übereinstimmen.

##### Checkliste (typisch)
- [ ] Funktionsänderungen auf Regressionsrisiken und Seiteneffekte prüfen.
- [ ] Sicherheitsaspekte prüfen (Input-Validierung, Escaping, Secrets/`.env`-Handling).
- [ ] Dokumentierte Befehle, Targets und Pfade gegen den ausführbaren Stand in `_docker/Makefile`,
  `_docker/docker-compose.yml` und `_docker/scripts/*.sh` validieren.
- [ ] Fehlende oder veraltete Tests/QA-Schritte im Review-Bericht explizit benennen.

##### Grenzen
Nimmt keine automatischen Code-Änderungen ohne explizite Freigabe vor. Prüft externe Abhängigkeiten nur dann, wenn
sie durch konkrete Projektänderungen direkt betroffen sind.

#### docs-writer
Dokumentations-Fähigkeit zum Schreiben, Prüfen und Überarbeiten von Markdown-Dateien im Repository. Verwenden Sie
diese Fähigkeit für alle Aufgaben an `.md`-Dateien und für konsistente, repo-konforme Doku-Änderungen.
(Datei: <HOME_DIR>/.agents/skills/docs-writer/SKILL.md)

##### Aufgaben
Dokumentationsänderungen zwischen `README.md`, `AGENTS.md`, `CONTRIBUTING.md` und `_docker/README.md` synchron halten.
Befehle, Targets und Dateipfade vor dem Dokumentieren gegen `_docker/Makefile` und Compose-Dateien prüfen.
Textumbrüche in Markdown grundsätzlich erst nahe der 120-Zeichen-Grenze setzen.
Angestrebte Zeilenlänge ist 115-120 Zeichen. Die harte Obergrenze beträgt 120 Zeichen pro Zeile (inklusive Leerzeichen).
Kürzere Zeilen sind nur zulässig, wenn Syntax, Pfade, Links, Listen oder Lesbarkeit es erfordern.

##### Checkliste (typisch)
- [ ] Änderungen an Befehlen/Pfaden in `README.md`, `AGENTS.md`, `CONTRIBUTING.md` und `_docker/README.md` nachführen.

##### Grenzen
Keine technischen Codeänderungen als Teil einer Dokuaufgab. Keine widersprüchlichen Doppelbeschreibungen aufbauen,
sondern auf das führende Dokument verweisen.

#### docker-expert
Docker-Experte für die lokale Containerumgebung dieses Repositories. Fokus auf den Compose-Stack unter `_docker/`
(PHP-Image, Apache, MariaDB, Traefik, phpMyAdmin, MailHog), reproduzierbare Start-/Build-Abläufe über Make/Buildfiles
sowie die Analyse von Container-, Netzwerk- und Berechtigungsproblemen.
(Datei: <HOME_DIR>/.agents/skills/docker-expert/SKILL.md)

##### Aufgaben
Lokale Umgebung aufsetzen und warten, Container Logs prüfen, Proxy starten, Images bauen.

##### Checkliste (typisch)

- [ ] Umgebung startet ohne Fehler: `make -C _docker up`.
- [ ] Build- und Erststart-Ablauf geprüft: `make -C _docker up-all-build`.
- [ ] Apache‑Logs sauber: `make -C _docker logs`.
- [ ] Proxy aktiv, falls benötigt: `make -C _docker proxy-up`.

##### Grenzen
Nur Dateien innerhalb des Repos ändern. Keine globalen Docker‑Prüfstände löschen.

#### frontend-design
Erstellt unverwechselbare, produktionsreife Frontend-Oberflächen mit hoher Designqualität. Verwenden Sie diese
Fähigkeit, wenn Nutzer um Web-Komponenten, Seiten, Artefakte, Poster oder Anwendungen bitten (zum Beispiel Websites,
Landingpages, Dashboards, React-Komponenten, HTML/CSS-Layouts oder beim visuellen Aufwerten von Web-UIs). Erzeugt
kreative, hochwertige UI-Umsetzungen und vermeidet generische KI-Ästhetik.
(Datei: <HOME_DIR>/.agents/skills/frontend-design/SKILL.md)

##### Aufgaben
UI-Änderungen primär in `index.html`, `assets/`, `css/`, `js/` und `admin/` umsetzen. Bestehende visuelle Sprache des
Projekts respektieren, sofern kein Redesign angefordert ist.

##### Checkliste (typisch)
- [ ] UI-Änderungen in `index.html`, `assets/`, `css/`, `js/` oder `admin/` umsetzen.
- [ ] Darstellung auf Desktop und Mobile prüfen.
- [ ] Bestehende visuelle Sprache beibehalten, sofern kein explizites Redesign angefordert ist.
- [ ] Keine externen Design-Assets oder Fonts einbinden, die nicht im Projekt vorhanden oder lizenzrechtlich geklärt
      sind.

##### Grenzen
Keine unaufgeforderte Vollflächen-Neugestaltung der gesamten Website. Keine externen Design-Assets oder Fonts
einbinden, die nicht im Projekt vorhanden oder lizenzrechtlich geklärt sind.

#### php-pro
Senior-PHP-Fähigkeit für robuste, wartbare Implementierungen in diesem Repository mit strenger Typisierung,
PSR-Standards und klarer Architektur. Verwenden Sie sie bei qualitätskritischen PHP-Änderungen, Refactorings und
Integrationen.
(Datei: <HOME_DIR>/.agents/skills/php-pro/SKILL.md)

##### Aufgaben
Code-Änderungen auf `contact.php`, `contact-mailto.php`, `config.php`, `contact-config.php`, `admin/*.php`,
`index.html`, `assets/`, `css/` und `js/` fokussieren. Kompatibilität zur lokalen Containerkonfiguration
(`PHP_VERSION` in `_docker/.env`) sicherstellen.

##### Checkliste (typisch)
- [ ] PHP-Syntax prüfen: `php -l contact.php` und gegebenenfalls weitere geänderte PHP-Dateien.
- [ ] Lokale Laufzeit prüfen: `make -C _docker up` und `make -C _docker logs`.

##### Grenzen
Keine Framework-Migration (Laravel/Symfony) ohne expliziten Auftrag. Keine Änderungen außerhalb dieses Repositories
ohne ausdrückliche Freigabe.

### Zusätzliche Rollen der Agenten
Diese Rollen gelten als projektspezifische Prozessrollen ohne eigene `SKILL.md` und ergänzen die oben gelisteten
Fähigkeiten.

#### Datenbank‑Agent

##### Aufgaben
Live‑Dump holen und in die lokale Umgebung importieren.

##### Checkliste (typisch)
- [ ] Live‑Dump verfügbar: `make -C _docker db-pull`.
- [ ] Import erfolgreich: `make -C _docker db-import`.
- [ ] Bei absoluten URLs/Pfaden: manuelle Anpassung in der Datenbank prüfen.

##### Grenzen
Nur mit bereitgestellten Skripten/Make‑Targets arbeiten. Keine manuellen SQL‑Statements, die Schema ändern, ohne
Ticket.

#### Security & Compliance‑Agent

##### Aufgaben
`.env`‑Handhabung prüfen, Secrets nie in Git oder Tickets posten, Dateirechte im Container beachten.

##### Checkliste (typisch)
- [ ] `_docker/.env` vorhanden, aber nicht im Git‑Status.
- [ ] Keine Secrets in Commits/PRs.

##### Grenzen
Kein Scannen externer Ressourcen ohne Freigabe.

### So verwenden Sie Fähigkeiten
Die folgenden Regeln gelten für Fähigkeiten mit eigener `SKILL.md`. Die „Zusätzlichen Rollen der Agenten“ sind
Prozessrollen ohne `SKILL.md` und folgen den jeweils dort definierten Aufgaben, Checklisten und Grenzen.

#### Erkennung
Die obige Liste enthält die für dieses Repository freigegebenen, projekt-relevanten Fähigkeiten (Name + Beschreibung
+ Dateipfad). Die Inhalte der Fähigkeiten liegen auf dem Datenträger unter den angegebenen Pfaden.

#### Auslöse-Regeln
Wenn der Nutzer eine Fähigkeit nennt (mit `$SkillName` oder als Klartext) ODER die Aufgabe klar zur oben beschriebenen
Fähigkeit passt, müssen Sie diese Fähigkeit in diesem Turn verwenden. Mehrere Nennungen bedeuten, dass alle verwendet
werden müssen. Fähigkeiten werden nicht in den nächsten Turn übernommen, außer sie werden erneut genannt.

#### Fehlt/gesperrt
Wenn eine genannte Fähigkeit nicht in der Liste steht oder der Pfad nicht gelesen werden kann, sagen Sie das kurz und
arbeiten Sie mit der bestmöglichen Alternative weiter.

#### Verwendung einer Fähigkeit (schrittweises Vorgehen)

1) Nachdem Sie entschieden haben, eine Fähigkeit zu verwenden, öffnen Sie deren `SKILL.md`. Lesen Sie nur so viel, wie
   für den Workflow nötig ist.
2) Wenn `SKILL.md` relative Pfade enthält (z. B. `scripts/foo.py`), lösen Sie diese zuerst relativ zum oben genannten
   Skill-Verzeichnis auf und prüfen Sie andere Pfade nur bei Bedarf.
3) Wenn `SKILL.md` auf zusätzliche Ordner wie `references/` verweist, laden Sie nur die konkret benötigten Dateien
   für die Anfrage und nicht alles gesammelt.
4) Wenn `scripts/` vorhanden sind, führen Sie diese bevorzugt aus oder patchen Sie sie, statt große Codeblöcke neu zu
   schreiben.
5) Wenn `assets/` oder Vorlagen vorhanden sind, verwenden Sie diese wieder, statt sie neu zu erstellen.

#### Koordination und Reihenfolge

- Wenn mehrere Fähigkeiten passen, wählen Sie die kleinste Menge, die die Anfrage vollständig abdeckt, und nennen Sie
  die Reihenfolge.
- Teilen Sie kurz mit, welche Fähigkeit(en) Sie verwenden und warum (eine kurze Zeile). Wenn Sie eine naheliegende
  Fähigkeit überspringen, begründen Sie das.
- Antworttransparenz (Pflicht): In jeder fachlichen Antwort die genutzte Rolle/Fähigkeit explizit ausweisen. Wenn keine
  spezielle Fähigkeit genutzt wurde, dies explizit als „keine spezielle Fähigkeit“ kennzeichnen.

#### Kontext-Hygiene

- Halten Sie den Kontext klein. Lange Abschnitte zusammenfassen statt vollständig einzufügen. Zusätzliche Dateien nur
  bei Bedarf laden.
- Vermeiden Sie tiefes Hinterherverfolgen von Referenzen: bevorzugt nur Dateien öffnen, die direkt aus `SKILL.md`
  verlinkt sind, außer Sie sind blockiert.
- Wenn Varianten existieren (Frameworks, Anbieter, Domänen), wählen Sie nur die relevanten Referenzdateien und
  vermerken Sie diese Auswahl.

#### Sicherheit und Fallback
Wenn eine Fähigkeit nicht sauber angewendet werden kann (fehlende Dateien, unklare Anweisungen), benennen Sie das
Problem, wählen Sie den nächstbesten Ansatz und machen Sie weiter.

Für technische Bibliotheksfragen gilt:
Fallback auf Webquellen erst nach Context7-Versuch und nur mit expliziter Kennzeichnung, warum Context7 in diesem Fall
nicht ausreichte.

## Umgang mit MCP Context7

### Ziel
Aktuelle Bibliotheksdokumentation und Codebeispiele strukturiert abrufen.

### Standardvorgabe
Bei jeder relevanten technischen Aufgabe (Bibliotheken, Frameworks, APIs, SDKs, Versionen, Konfigurationssyntax,
Migrationspfade) muss Context7 zuerst verwendet werden. Eine direkte Websuche ist in diesen Fällen vor Context7 nicht
zulässig.

### Reihenfolge
Zuerst immer die Bibliotheks-ID auflösen (`resolve-library-id`), danach Dokumentation abfragen (`query-docs` bzw.
`get-library-docs`).

### Ausnahme
Wenn der Nutzer bereits eine gültige Context7-ID im Format `/org/projekt` oder `/org/projekt/version` angibt, kann die
Auflösung übersprungen werden.

### Abfragequalität
Bibliotheksauflösung anhand von Relevanz, Vertrauenswürdigkeit/Source-Reputation, Benchmark-Score und verfügbaren
Snippets auswählen.

### Abfragelimit
Pro Anfrage maximal 3 Context7-Dokumentationsabfragen durchführen. Danach mit den besten verfügbaren Informationen
arbeiten.

### Verbindliche Durchsetzung
Wenn Context7 für eine relevante technische Aufgabe nicht genutzt wurde, darf keine fachliche Antwort mit externen
Aussagen gegeben werden. In diesem Fall muss explizit geantwortet werden: „Ich kann das nicht bestätigen”, bis die
Context7-Prüfung nachgeholt wurde oder der Nutzer ausdrücklich eine andere Quelle freigibt.

### Datenschutz
In Context7-Abfragen keine sensiblen Daten senden (keine Tokens, Passwörter, Credentials, personenbezogene Daten,
proprietären Geheimcode).

### Transparenz
In Antworten die gewählte Bibliotheks-ID nennen und kurz begründen, warum sie ausgewählt wurde.

### Antwortformat (Pflicht bei relevanten Aufgaben)
Am Anfang der Antwort zwei kurze Zeilen ausgeben:

- `Rolle/Fähigkeit: <Name(n)>`
- `Bibliothek/Quelle: <Library/Context7-ID oder \"keine externe Bibliothek\">`
- `Context7-Flow: resolve-library-id -> query-docs/get-library-docs (oder: direkte ID vom Nutzer)`

## Grundsätze und Leitplanken

- Sicherheit: `.env` und Geheimnisse nicht anfassen. Niemals Passwörter/API-Keys/Tokens in Repository, Commits oder
  Chatnachrichten speichern. Nur lokale Nutzung über `_docker/.env`.
- Reproduzierbarkeit: Wiederkehrende Abläufe über vorhandene Make-Targets ausführen.
- Wenn für einen Prüfschritt kein Make-Target existiert, sind direkte `docker compose`-/WP-CLI-Befehle zulässig und
  sollen im Review/PR transparent dokumentiert werden.
- Minimalinvasiv: Änderungen klein halten und bestehende Struktur respektieren.
- Bei Codeänderungen zuerst prüfen, ob der Arbeitsstand seit der letzten Änderung manuell angepasst wurde. Falls ja,
  den geänderten Code als neue Basis weiterbearbeiten.
- Nachvollziehbarkeit: Wichtige Befehle und Ergebnisse in Ticket/PR dokumentieren.
- Arbeitsweise: Kein Auto-Commit und kein Auto-Push. Commits bewusst und gebündelt erstellen.
- Vorgehen bei Anfragen: Nach einer fachlichen Frage zuerst einen kurzen Lösungsvorschlag präsentieren (Ansatz,
  betroffene Dateien, Risiken).
- Codeänderungen nur nach Freigabe: Wenn Änderungen an Dateien nötig sind, erst nach expliziter Nutzerfreigabe
  umsetzen.
- Berechtigungen: WP‑CLI immer als `www-data` im PHP‑Container ausführen, um Dateirechte sauber zu halten.

## Operative Referenz (Single Source)

- Technische Implementierungsdetails zu Architektur, Data JSON, Frontend, Admin und Contact form werden zentral unter
  `_docs/` gepflegt.
- Operative Abläufe für Docker/Proxy/DB/WP‑CLI werden zentral in `_docker/README.md` gepflegt.
- Verfügbare Targets und deren tatsächliche Implementierung gelten aus:
  - `_docker/Buildfile.ps1`
  - `_docker/Buildfile.sh`
  - `_docker/Makefile`
- Bei Doku‑Änderungen zu Befehlen, Variablen oder Ablaufreihenfolgen zuerst gegen diese Dateien validieren.
- Bei Widersprüchen zwischen Dokumentation und Skripten gilt der tatsächlich ausführbare Stand im Repository.

## Contribution‑Hinweise für Agenten

- Verbindliche Beitragsregeln (Codestyle, Tests, PR‑Anforderungen, Security) stehen in `CONTRIBUTING.md`.
- `AGENTS.md` bleibt für Rollen, Verantwortlichkeiten und Arbeitsweise der Agenten zuständig.
- `README.md`, `AGENTS.md` und `CONTRIBUTING.md` verweisen auf `_docs/`, statt technische Detailinhalte parallel zu
  pflegen.
- Keine fachlichen Ablaufdetails aus `_docker/README.md` doppelt in `AGENTS.md` oder `CONTRIBUTING.md` pflegen.

Fragen oder Ergänzungen? Bitte dieses Dokument via PR aktualisieren und im Teamkanal ankündigen.
