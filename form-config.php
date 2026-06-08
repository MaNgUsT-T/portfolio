<?php

declare(strict_types=1);

return [
    'recipient' => 'a.lehn@clinton.de',
    'max_lengths' => [
        'firstname' => 30,
        'lastname' => 30,
        'email' => 120,
        'subject' => 80,
        'message' => 2000,
    ],
    'required_fields' => [
        'firstname' => 'firstname_required',
        'lastname' => 'lastname_required',
        'email' => 'email_required',
        'subject' => 'subject_required',
        'message' => 'message_required',
        'gdproptin' => 'gdpr_required',
    ],
    'messages' => [
        'method_not_allowed' => 'Diese Anfrage ist nicht erlaubt.',
        'honeypot_success' => 'Danke, deine Nachricht wurde gesendet.',
        'too_long' => 'Bitte kürzer formulieren.',
        'firstname_required' => 'Bitte gib deinen Vornamen ein.',
        'lastname_required' => 'Bitte gib deinen Nachnamen ein.',
        'email_required' => 'Bitte gib deine E-Mail-Adresse ein.',
        'email_invalid' => 'Bitte gib eine gültige E-Mail-Adresse ein.',
        'subject_required' => 'Bitte gib einen Betreff ein.',
        'message_required' => 'Bitte gib eine Nachricht ein.',
        'gdpr_required' => 'Bitte bestätige die Datenschutzhinweise.',
        'validation_failed' => 'Bitte prüfe deine Angaben.',
        'mail_failed' => 'Die Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.',
        'mail_success' => 'Danke, deine Nachricht wurde gesendet.',
    ],
];
