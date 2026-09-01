<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();
adminEnsureAuthenticated();
adminEnsureRequestMethod('GET');

try {
    $images = adminListImageFiles();

    adminRespondJson(200, [
        'ok' => true,
        'files' => $images,
        'message' => adminT('admin.image_field_choose_from_list'),
    ]);
} catch (RuntimeException $exception) {
    adminRespondJson(500, [
        'ok' => false,
        'message' => $exception->getMessage(),
    ]);
}
