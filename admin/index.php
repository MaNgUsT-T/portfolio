<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();

function loginRespond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function loginWantsJson(): bool
{
    $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? '';

    return is_string($acceptHeader) && str_contains($acceptHeader, 'application/json');
}

if (adminIsAuthenticated()) {
    header('Location: ./admin.php');
    exit;
}

$loginError = null;
$loginFieldErrors = [
    'password' => [],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrfToken = isset($_POST['csrf_token']) && is_string($_POST['csrf_token']) ? $_POST['csrf_token'] : null;
    $password = isset($_POST['password']) && is_string($_POST['password']) ? $_POST['password'] : '';

    if (!adminVerifyCsrfToken($csrfToken)) {
        $loginError = adminT('auth.invalid_csrf');
    } elseif ($password === '') {
        $loginFieldErrors['password'][] = adminT('auth.password_required');
    } elseif (!adminLogin($password)) {
        $loginFieldErrors['password'][] = adminT('auth.password_wrong');
    } else {
        if (loginWantsJson()) {
            loginRespond(200, [
                'ok' => true,
                'message' => adminT('auth.login_success'),
                'redirect' => './admin.php',
            ]);
        }

        adminFlash('success', adminT('auth.login_success'));
        header('Location: ./admin.php');
        exit;
    }

    if (loginWantsJson()) {
        if ($loginFieldErrors['password'] !== []) {
            loginRespond(422, [
                'ok' => false,
                'message' => adminT('auth.fix_fields'),
                'errors' => $loginFieldErrors,
            ]);
        }

        loginRespond(422, [
            'ok' => false,
            'message' => $loginError ?? adminT('auth.login_failed'),
            'errors' => $loginFieldErrors,
        ]);
    }
}

$flash = adminConsumeFlash();
$siteData = [];

try {
    $siteData = adminLoadSiteData();
} catch (RuntimeException $exception) {
    $siteData = [];
}
?>
<!DOCTYPE html>
<html lang="<?= adminEscape(adminDocumentLanguage()) ?>">
<?= adminRenderHead(['title_suffix_key' => 'auth.login_suffix']) ?>
<body class="admin-auth">
    <?= adminRenderSiteHeader($siteData) ?>
    <main>
		<section>
			<div class="container">
				<div class="card card--default-inner">
					<div class="card__body">
						<div class="card__body-wrapper">
							<div class="admin-logo">
								<?= adminIconSvg(adminHeaderLogoIconName($siteData)) ?>
							</div>
							<h3><?= adminEscape(adminT('auth.login_heading')) ?></h3>
							<div
								data-form-status="<?= $loginError !== null ? 'error' : '' ?>"
								aria-live="polite"
							><?= $loginError !== null ? adminEscape($loginError) : '' ?></div>
							<form method="post" id="auth-form" novalidate>
								<input type="hidden" name="csrf_token" value="<?= adminEscape(adminCsrfToken()) ?>">
								<div class="form-group">
									<label for="password"><?= adminEscape(adminT('auth.password_label')) ?></label>
									<div class="input-group js-password-input">
										<input
											type="password"
											id="password"
											name="password"
											autocomplete="current-password"
											placeholder="<?= adminEscape(adminT('auth.password_placeholder')) ?>"
											required
											data-password-field
										>
										<button
											type="button"
											title="<?= adminEscape(adminT('auth.show_password')) ?>"
											aria-label="<?= adminEscape(adminT('auth.show_password')) ?>"
											data-password-toggle
											class="icon-button"
										>
											<?= adminIconSvg('eye') ?>
										</button>
									</div>
									<span data-form-error="password"><?= implode('<br>', array_map('adminEscape', $loginFieldErrors['password'])) ?></span>
								</div>
								<p><a href="./change-password.php"><?= adminEscape(adminT('auth.change_password_link')) ?></a></p>
							</form>
						</div>
					</div>
					<div class="card__footer">
						<button
							type="submit"
							form="auth-form"
							class="btn btn--primary btn--large"
						>
							<?= adminEscape(adminT('auth.login_submit')) ?>
						</button>
					</div>
				</div>
			</div>
		</section>
    </main>
    <?= adminRenderSiteFooter($siteData) ?>
    <div class="backdrop" data-overlay></div>
    <?= adminRenderClientConfigScript() ?>
    <script src="../js/admin.min.js"></script>
</body>
</html>
