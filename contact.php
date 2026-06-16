<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

/**
 * Lädt die Formular-Konfiguration aus `form-config.php`.
 *
 * Die Konfiguration wird nur beim ersten Aufruf eingelesen und danach
 * in einer statischen Variable zwischengespeichert.
 *
 * @return array<string, mixed>
 */
function contactConfig(): array
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/form-config.php';
    }

    return $config;
}

/**
 * Liest die Empfängeradresse aus der Formular-Konfiguration.
 *
 * Diese Adresse wird später als Ziel für die Formular-E-Mail verwendet.
 *
 * @return string
 */
function contactRecipient(): string
{
    return contactConfig()['recipient'];
}

/**
 * Liest einen Meldungstext aus der Formular-Konfiguration.
 *
 * So kommen Erfolgs- und Fehlermeldungen immer aus einer zentralen Stelle.
 *
 * @param string $key Schlüssel der gewünschten Meldung.
 * @return string
 */
function contactMessage(string $key): string
{
    return contactConfig()['messages'][$key];
}

/**
 * Sendet eine JSON-Antwort an das Frontend und beendet das Script sofort.
 *
 * Diese Funktion setzt zuerst den HTTP-Statuscode und gibt danach das
 * Antwort-Array als JSON aus.
 *
 * @param int $statusCode HTTP-Statuscode der Antwort.
 * @param array<string, mixed> $payload Daten, die als JSON gesendet werden.
 */
function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Liest einen Wert aus `$_POST` und bereinigt ihn für die weitere Verarbeitung.
 *
 * Nicht-String-Werte werden als leerer String behandelt. Außerdem werden
 * unterschiedliche Zeilenumbrüche vereinheitlicht.
 *
 * @param string $name Name des Formularfeldes.
 * @return string
 */
function field(string $name): string
{
    $value = $_POST[$name] ?? '';

    if (!is_string($value)) {
        return '';
    }

    return trim(str_replace(["\r\n", "\r"], "\n", $value));
}

/**
 * Wandelt einen Text in eine einzelne Zeile um.
 *
 * Mehrere Zeilenumbrüche werden entfernt, damit Felder wie Name, E-Mail
 * oder Betreff keine mehrzeiligen Inhalte enthalten.
 *
 * @param string $value Ursprünglicher Textwert.
 * @return string
 */
function singleLine(string $value): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $value) ?? '');
}

/**
 * Ermittelt die Länge eines Textes.
 *
 * Wenn die `mbstring`-Erweiterung verfügbar ist, wird UTF-8-sicher gezählt.
 * Sonst wird auf `strlen()` zurückgegriffen.
 *
 * @param string $value Zu prüfender Text.
 * @return int Anzahl der Zeichen im Text.
 */
function textLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

// Ablauf des Formulars

// Schritt 1: Diese Datei darf nur POST-Anfragen annehmen.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'ok' => false,
        'message' => contactMessage('method_not_allowed'),
    ]);
}

// Schritt 2: Das Feld "website" ist eine Bot-Falle.
// Wenn dort etwas steht, brechen wir still ab und melden trotzdem Erfolg.
if (field('website') !== '') {
    respond(200, [
        'ok' => true,
        'message' => contactMessage('honeypot_success'),
    ]);
}

// Schritt 3: Jetzt lesen wir alle Werte aus dem Formular ein.
$salutation = singleLine(field('salutation'));
$firstname = singleLine(field('firstname'));
$lastname = singleLine(field('lastname'));
$email = singleLine(field('email'));
$subject = singleLine(field('subject'));
$interest = singleLine(field('radio-group'));
$message = field('message');

$errors = [];

// Schritt 4: Hier prüfen wir, ob einzelne Felder zu lang sind.
foreach (contactConfig()['max_lengths'] as $name => $maxLength) {
    if (textLength(field($name)) > $maxLength) {
        $errors[$name] = contactMessage('too_long');
    }
}

// Schritt 5: Die E-Mail prüfen wir nur, wenn der Nutzer etwas eingegeben hat.
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = contactMessage('email_invalid');
}

// Schritt 6: Pflichtfelder prüfen wir über die Regeln aus der Konfiguration.
foreach (contactConfig()['required_fields'] as $name => $messageKey) {
    if (field($name) === '') {
        $errors[$name] = contactMessage($messageKey);
    }
}

// Schritt 7: Wenn es Fehler gibt, schicken wir sie als JSON an das Frontend zurück.
if ($errors !== []) {
    respond(422, [
        'ok' => false,
        'message' => contactMessage('validation_failed'),
        'errors' => $errors,
    ]);
}

// Schritt 8: Aus den geprüften Daten bauen wir jetzt die E-Mail zusammen.
$senderName = trim($firstname . ' ' . $lastname);
$mailSubject = 'Kontaktformular: ' . $subject;
$mailBody = implode("\n", [
    'Neue Nachricht über das Kontaktformular:',
    '',
    'Anrede: ' . ($salutation !== '' ? $salutation : '-'),
    'Name: ' . $senderName,
    'E-Mail: ' . $email,
    'Interesse: ' . ($interest !== '' ? $interest : '-'),
    '',
    'Nachricht:',
    $message,
]);
$headers = [
    'From: Portfolio Kontakt <' . contactRecipient() . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

// Schritt 9: mail() gibt true bei Erfolg und false bei einem Fehler zurück.
$sent = mail(contactRecipient(), $mailSubject, $mailBody, implode("\r\n", $headers));

if (!$sent) {
    respond(500, [
        'ok' => false,
        'message' => contactMessage('mail_failed'),
    ]);
}

// Schritt 10: Wenn alles klappt, senden wir eine Erfolgsmeldung zurück.
respond(200, [
    'ok' => true,
    'message' => contactMessage('mail_success'),
]);
