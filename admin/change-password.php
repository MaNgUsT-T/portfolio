<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();

function passwordChangeRespond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function passwordChangeWantsJson(): bool
{
    $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? '';

    return is_string($acceptHeader) && str_contains($acceptHeader, 'application/json');
}

$passwordChangeErrors = [];
$passwordFieldErrors = [
    'current_password' => [],
    'new_password' => [],
    'confirm_password' => [],
];
$passwordChangeSuccess = null;
$siteData = [];

try {
    $siteData = adminLoadSiteData();
} catch (RuntimeException $exception) {
    $siteData = [];
}

/**
 * @param array<int, string> $errors
 */
function inlineErrorMarkup(array $errors): string
{
    return implode('<br>', array_map('adminEscape', $errors));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrfToken = isset($_POST['csrf_token']) && is_string($_POST['csrf_token']) ? $_POST['csrf_token'] : null;
    $currentPassword = isset($_POST['current_password']) && is_string($_POST['current_password'])
        ? $_POST['current_password']
        : '';
    $newPassword = isset($_POST['new_password']) && is_string($_POST['new_password']) ? $_POST['new_password'] : '';
    $confirmPassword = isset($_POST['confirm_password']) && is_string($_POST['confirm_password'])
        ? $_POST['confirm_password']
        : '';

    if (!adminVerifyCsrfToken($csrfToken)) {
        $passwordChangeErrors[] = adminT('auth.invalid_csrf');
    } else {
        if ($currentPassword === '') {
            $passwordFieldErrors['current_password'][] = adminT('auth.current_password_required');
        } elseif (!adminVerifyPassword($currentPassword)) {
            $passwordFieldErrors['current_password'][] = adminT('auth.current_password_wrong');
        }

        if ($newPassword === '') {
            $passwordFieldErrors['new_password'][] = adminT('auth.new_password_required');
        } else {
            $passwordFieldErrors['new_password'] = adminPasswordRequirementErrors($newPassword);
        }

        if ($confirmPassword === '') {
            $passwordFieldErrors['confirm_password'][] = adminT('auth.confirm_password_required');
        } else {
            $passwordFieldErrors['confirm_password'] = adminPasswordRequirementErrors($confirmPassword);
        }

        if (
            $newPassword !== ''
            && $confirmPassword !== ''
            && $newPassword !== $confirmPassword
        ) {
            $passwordFieldErrors['new_password'][] = adminT('auth.passwords_mismatch');
            $passwordFieldErrors['confirm_password'][] = adminT('auth.passwords_mismatch');
        }

        $hasFieldErrors = false;

        foreach ($passwordFieldErrors as $fieldErrors) {
            if ($fieldErrors !== []) {
                $hasFieldErrors = true;
                break;
            }
        }

        if ($hasFieldErrors && passwordChangeWantsJson()) {
            passwordChangeRespond(422, [
                'ok' => false,
                'message' => adminT('auth.fix_fields'),
                'errors' => $passwordFieldErrors,
            ]);
        }

        if (!$hasFieldErrors) {
            try {
                adminUpdatePassword($newPassword);
                $passwordChangeSuccess = adminT('auth.change_password_success');
            } catch (RuntimeException $exception) {
                $passwordChangeErrors[] = $exception->getMessage();
            }
        }
    }

    if (passwordChangeWantsJson()) {
        if ($passwordChangeErrors !== []) {
            passwordChangeRespond(422, [
                'ok' => false,
                'message' => implode(' ', $passwordChangeErrors),
                'errors' => $passwordFieldErrors,
            ]);
        }

        passwordChangeRespond(200, [
            'ok' => true,
            'message' => $passwordChangeSuccess ?? adminT('auth.change_password_success_short'),
        ]);
    }
}
?>
<!DOCTYPE html>
<html lang="<?= adminEscape(adminDocumentLanguage()) ?>">
<?= adminRenderHead(['title_suffix_key' => 'auth.change_password_suffix']) ?>
<body class="admin-auth">
    <?= adminRenderSiteHeader($siteData) ?>
	<main>
		<section>
			<div class="container">
				<div class="card card--default-inner">
					<div class="card__body">
						<div class="card__body-wrapper js-card__body-wrapper">
							<div class="admin-logo">
								<?= adminIconSvg(adminHeaderLogoIconName($siteData)) ?>
							</div>
							<h3><?= adminEscape(adminT('auth.change_password_heading')) ?></h3>
							<div class="alert alert--info">
								<strong><?= adminEscape(adminT('auth.password_rules_heading')) ?></strong>
								<ul>
									<li><?= adminEscape(adminT('auth.password_rule_length')) ?></li>
									<li><?= adminEscape(adminT('auth.password_rule_number')) ?></li>
									<li><?= adminEscape(adminT('auth.password_rule_uppercase')) ?></li>
									<li><?= adminEscape(adminT('auth.password_rule_special')) ?></li>
								</ul>
							</div>
							<div
								data-form-status="<?= $passwordChangeSuccess !== null ? 'success' : ($passwordChangeErrors !== [] ? 'error' : '') ?>"
								aria-live="polite"
							><?= $passwordChangeSuccess !== null ? adminEscape($passwordChangeSuccess) : inlineErrorMarkup($passwordChangeErrors) ?></div>
							<form method="post" id="change-password-form" novalidate>
								<input type="hidden" name="csrf_token" value="<?= adminEscape(adminCsrfToken()) ?>">
								<div class="form-group">
									<label for="current_password"><?= adminEscape(adminT('auth.current_password_label')) ?></label>
									<div class="input-group js-password-input">
										<input
											type="password"
											id="current_password"
											name="current_password"
											autocomplete="current-password"
											placeholder="<?= adminEscape(adminT('auth.current_password_placeholder')) ?>"
											data-password-field
											required
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
									<span data-form-error="current_password">
										<?= inlineErrorMarkup($passwordFieldErrors['current_password']) ?>
									</span>
								</div>
								<div class="form-group">
									<label for="new_password"><?= adminEscape(adminT('auth.new_password_label')) ?></label>
									<div class="input-group js-password-input">
										<input
											type="password"
											id="new_password"
											name="new_password"
											autocomplete="new-password"
											placeholder="<?= adminEscape(adminT('auth.new_password_placeholder')) ?>"
											data-password-field
											required
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
									<span data-form-error="new_password">
										<?= inlineErrorMarkup($passwordFieldErrors['new_password']) ?>
									</span>
								</div>
								<div class="form-group">
									<label for="confirm_password"><?= adminEscape(adminT('auth.confirm_password_label')) ?></label>
									<div class="input-group js-password-input">
										<input
											type="password"
											id="confirm_password"
											name="confirm_password"
											autocomplete="new-password"
											placeholder="<?= adminEscape(adminT('auth.confirm_password_placeholder')) ?>"
											data-password-field
											required
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
									<span data-form-error="confirm_password">
										<?= inlineErrorMarkup($passwordFieldErrors['confirm_password']) ?>
									</span>
								</div>
							</form>

						</div>
					</div>
					<div class="card__footer">
						<button
							type="submit"
							form="change-password-form"
							class="btn btn--primary btn--large"
						>
							<?= adminEscape(adminT('auth.change_password_submit')) ?>
						</button>
						<?php if (adminIsAuthenticated()): ?>
							<a href="./admin.php"><?= adminEscape(adminT('auth.back_to_admin')) ?></a>
						<?php else: ?>
							<a href="./index.php"><?= adminEscape(adminT('auth.back_to_login')) ?></a>
						<?php endif; ?>

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
