# ToDo

Diese Liste sammelt die offenen Verbesserungen aus dem letzten Prüfbericht in
einem umsetzbaren Format. Die Einträge orientieren sich am in
`CONTRIBUTING.md` dokumentierten Code-Review-Schema.

## Code-Review

Die folgenden Punkte dokumentieren die aktuelle Codeauswertung. Die Prüfung
bezieht sich auf den aktiven Projektcode; `siteelements`, `main.js`,
`main.min.js` und `js/main.min.js.map` sind nicht berücksichtigt.

- `robust`: weitgehend ja. Die neue Normalisierung im Frontend und die stärkere Validierung im Admin verbessern
  die Fehlertoleranz klar, siehe
  [assets/js/app.js](/assets/js/app.js:397) und [admin/admin-save.php](/admin/admin-save.php:116).
- 
- `strukturiert`: ja, deutlich besser als zuvor. Die Trennung in`normalize*()` und `render*()` ist nachvollziehbar und 
  konsistent, siehe [assets/js/app.js](/assets/js/app.js:149) und [assets/js/app.js](/assets/js/app.js:474).

- `sauber`: überwiegend ja. Die Verantwortlichkeiten sind klarer getrennt, aber die Dateien sind weiterhin relativ groß
  und nicht in Module aufgeteilt, vor allem [assets/js/app.js](/assets/js/app.js:1).

- `modern`: teilweise. Positiv sind `strict_types`, `async/await`, defensive
  Guards und atomisches JSON-Schreiben. Ich kann aber nicht bestätigen, dass
  der Code insgesamt modern im Sinn aktueller modularer Architektur ist, weil
  zentrale Bereiche weiterhin in großen, monolithischen Dateien liegen.

- `gut auskommentiert`: nur teilweise. Der Code ist verständlich, aber nicht
  umfassend dokumentiert. Viele Funktionen sind selbsterklärend benannt; eine
  besonders starke oder systematische Kommentierung ist nicht durchgehend
  erkennbar.

- `dokumentiert`: nur eingeschränkt. Ich kann nicht bestätigen, dass die
  Implementierung selbst umfassend dokumentiert ist. Es gibt Projekt-Dokumente,
  aber aus dem aktuell geprüften Code folgt keine vollständige technische
  Entwicklerdokumentation.
