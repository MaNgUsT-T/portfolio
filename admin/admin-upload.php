<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();
adminEnsureAuthenticated();
adminEnsureRequestMethod('POST');

$csrfToken = isset($_POST['csrf_token']) && is_string($_POST['csrf_token']) ? $_POST['csrf_token'] : null;
adminEnsureConfirmedRequest($csrfToken);

$filesInput = $_FILES['images'] ?? null;

if (!is_array($filesInput)) {
    adminRespondJson(422, [
        'ok' => false,
        'message' => adminT('error.upload_no_files'),
    ]);
}

$uploadedFiles = adminNormalizeUploadedFilesArray($filesInput);

if ($uploadedFiles === []) {
    $uploadedFiles = [[
        'name' => isset($filesInput['name']) && is_string($filesInput['name']) ? $filesInput['name'] : '',
        'full_path' => isset($filesInput['full_path']) && is_string($filesInput['full_path']) ? $filesInput['full_path'] : '',
        'type' => isset($filesInput['type']) && is_string($filesInput['type']) ? $filesInput['type'] : '',
        'tmp_name' => isset($filesInput['tmp_name']) && is_string($filesInput['tmp_name']) ? $filesInput['tmp_name'] : '',
        'error' => isset($filesInput['error']) ? (int) $filesInput['error'] : UPLOAD_ERR_NO_FILE,
        'size' => isset($filesInput['size']) ? (int) $filesInput['size'] : 0,
    ]];
}

try {
    $storedFiles = [];

    foreach ($uploadedFiles as $uploadedFile) {
        $storedFiles[] = adminStoreUploadedImage($uploadedFile);
    }

    $firstFile = $storedFiles[0] ?? null;

    adminRespondJson(200, [
        'ok' => true,
        'message' => adminT('admin.image_field_upload_success'),
        'files' => $storedFiles,
        'path' => is_array($firstFile) ? ($firstFile['path'] ?? '') : '',
        'width' => is_array($firstFile) ? ($firstFile['width'] ?? 0) : 0,
        'height' => is_array($firstFile) ? ($firstFile['height'] ?? 0) : 0,
    ]);
} catch (Throwable $exception) {
    adminRespondJson(422, [
        'ok' => false,
        'message' => $exception->getMessage(),
    ]);
}
