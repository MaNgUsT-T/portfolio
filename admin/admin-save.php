<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminEnsureAuthenticated();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    adminFlash('error', 'Diese Anfrage ist nicht erlaubt.');
    header('Location: ./admin.php');
    exit;
}

$csrfToken = isset($_POST['csrf_token']) && is_string($_POST['csrf_token']) ? $_POST['csrf_token'] : null;

if (!adminVerifyCsrfToken($csrfToken)) {
    adminFlash('error', 'Die Anfrage konnte nicht bestätigt werden.');
    header('Location: ./admin.php');
    exit;
}

$mode = isset($_POST['mode']) && is_string($_POST['mode']) ? $_POST['mode'] : 'structured';

try {
    if ($mode === 'json') {
        $jsonPayload = isset($_POST['json_payload']) && is_string($_POST['json_payload']) ? $_POST['json_payload'] : '';
        $decoded = json_decode($jsonPayload, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($decoded)) {
            throw new RuntimeException('Das JSON muss ein Objekt enthalten.');
        }

        adminSaveSiteData($decoded);
        adminFlash('success', 'Die JSON-Datei wurde gespeichert.');
        header('Location: ./admin.php');
        exit;
    }

    $submittedData = $_POST['data'] ?? null;

    if (!is_array($submittedData)) {
        throw new RuntimeException('Die strukturierten Formulardaten fehlen.');
    }

    $template = adminLoadTemplateData();
    $payload = adminBuildStructuredPayload($template, $submittedData);
    adminSaveSiteData($payload);
    adminFlash('success', 'Die Inhalte wurden gespeichert.');
} catch (JsonException $exception) {
    adminFlash('error', 'Das JSON ist ungültig: ' . $exception->getMessage());
} catch (RuntimeException $exception) {
    adminFlash('error', $exception->getMessage());
}

header('Location: ./admin.php');
exit;
