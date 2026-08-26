<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminEnsureAuthenticated();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    adminFlash('error', adminT('error.request_not_allowed'));
    header('Location: ./admin.php');
    exit;
}

$csrfToken = isset($_POST['csrf_token']) && is_string($_POST['csrf_token']) ? $_POST['csrf_token'] : null;

if (!adminVerifyCsrfToken($csrfToken)) {
    adminFlash('error', adminT('error.request_unconfirmed'));
    header('Location: ./admin.php');
    exit;
}

$mode = isset($_POST['mode']) && is_string($_POST['mode']) ? $_POST['mode'] : 'structured';

try {
    if ($mode === 'json') {
        $jsonPayload = isset($_POST['json-payload']) && is_string($_POST['json-payload']) ? $_POST['json-payload'] : '';
        $decoded = json_decode($jsonPayload, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($decoded)) {
            throw new RuntimeException(adminT('error.json_object_required'));
        }

        adminSaveSiteData($decoded);
        adminFlash('success', adminT('success.json_saved'));
        header('Location: ./admin.php');
        exit;
    }

    $submittedData = $_POST['data'] ?? null;

    if (!is_array($submittedData)) {
        throw new RuntimeException(adminT('error.structured_data_missing'));
    }

    $template = adminLoadTemplateData();
    $existingData = adminLoadSiteData();
    $payload = adminBuildStructuredPayload($template, $existingData, $submittedData);
    adminSaveSiteData($payload);
    adminFlash('success', adminT('success.content_saved'));
} catch (JsonException $exception) {
    adminFlash('error', adminT('error.json_invalid_prefix', ['message' => $exception->getMessage()]));
} catch (RuntimeException $exception) {
    adminFlash('error', $exception->getMessage());
}

header('Location: ./admin.php');
exit;
