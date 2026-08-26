<?php

declare(strict_types=1);

$config = require __DIR__ . '/contact-config.php';
$recipient = $config['recipient'] ?? '';

if (!is_string($recipient) || $recipient === '' || filter_var($recipient, FILTER_VALIDATE_EMAIL) === false) {
    http_response_code(404);
    exit;
}

header('Location: mailto:' . $recipient, true, 302);
exit;
