<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();

if (!adminIsAuthenticated()) {
    adminRedirectToLogin();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Location: ./admin.php');
    exit;
}

$csrfToken = isset($_POST['csrf_token']) && is_string($_POST['csrf_token']) ? $_POST['csrf_token'] : null;

if (adminVerifyCsrfToken($csrfToken)) {
    $locale = isset($_POST['locale']) && is_string($_POST['locale']) ? $_POST['locale'] : adminDefaultLocale();
    adminSetLocale($locale);
}

$redirect = isset($_POST['redirect']) && is_string($_POST['redirect']) ? $_POST['redirect'] : './admin.php';

if (!str_starts_with($redirect, '/') && !str_starts_with($redirect, './')) {
    $redirect = './admin.php';
}

header('Location: ' . $redirect);
exit;
