<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function contactConfig(): array
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/form-config.php';
    }

    return $config;
}

function contactRecipient(): string
{
    return contactConfig()['recipient'];
}

function contactMessage(string $key): string
{
    return contactConfig()['messages'][$key];
}

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function field(string $name): string
{
    $value = $_POST[$name] ?? '';

    if (!is_string($value)) {
        return '';
    }

    return trim(str_replace(["\r\n", "\r"], "\n", $value));
}

function singleLine(string $value): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $value) ?? '');
}

function textLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'ok' => false,
        'message' => contactMessage('method_not_allowed'),
    ]);
}

if (field('website') !== '') {
    respond(200, [
        'ok' => true,
        'message' => contactMessage('honeypot_success'),
    ]);
}

$salutation = singleLine(field('salutation'));
$firstname = singleLine(field('firstname'));
$lastname = singleLine(field('lastname'));
$email = singleLine(field('email'));
$subject = singleLine(field('subject'));
$interest = singleLine(field('radio-group'));
$message = field('message');

$errors = [];

foreach (contactConfig()['max_lengths'] as $name => $maxLength) {
    if (textLength(field($name)) > $maxLength) {
        $errors[$name] = contactMessage('too_long');
    }
}

if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = contactMessage('email_invalid');
}

foreach (contactConfig()['required_fields'] as $name => $messageKey) {
    if (field($name) === '') {
        $errors[$name] = contactMessage($messageKey);
    }
}

if ($errors !== []) {
    respond(422, [
        'ok' => false,
        'message' => contactMessage('validation_failed'),
        'errors' => $errors,
    ]);
}

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

$sent = mail(contactRecipient(), $mailSubject, $mailBody, implode("\r\n", $headers));

if (!$sent) {
    respond(500, [
        'ok' => false,
        'message' => contactMessage('mail_failed'),
    ]);
}

respond(200, [
    'ok' => true,
    'message' => contactMessage('mail_success'),
]);
