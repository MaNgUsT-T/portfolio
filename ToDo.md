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

Aktuell sind aus dem letzten Prüfbericht keine offenen Aufgaben mehr in dieser Datei vorhanden.
