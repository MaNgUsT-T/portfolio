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
        $passwordChangeErrors[] = 'Das Formular konnte nicht bestätigt werden. Bitte erneut versuchen.';
    } else {
        if ($currentPassword === '') {
            $passwordFieldErrors['current_password'][] = 'Bitte gib das aktuelle Passwort ein.';
        } elseif (!adminVerifyPassword($currentPassword)) {
            $passwordFieldErrors['current_password'][] = 'Das aktuelle Passwort ist nicht korrekt.';
        }

        if ($newPassword === '') {
            $passwordFieldErrors['new_password'][] = 'Bitte gib ein neues Passwort ein.';
        } else {
            $passwordFieldErrors['new_password'] = adminPasswordRequirementErrors($newPassword);
        }

        if ($confirmPassword === '') {
            $passwordFieldErrors['confirm_password'][] = 'Bitte wiederhole das neue Passwort.';
        } else {
            $passwordFieldErrors['confirm_password'] = adminPasswordRequirementErrors($confirmPassword);
        }

        if (
            $newPassword !== ''
            && $confirmPassword !== ''
            && $newPassword !== $confirmPassword
        ) {
            $passwordFieldErrors['new_password'][] = 'Die beiden neuen Passwortfelder stimmen nicht überein.';
            $passwordFieldErrors['confirm_password'][] = 'Die beiden neuen Passwortfelder stimmen nicht überein.';
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
                'message' => 'Bitte korrigiere die markierten Felder.',
                'errors' => $passwordFieldErrors,
            ]);
        }

        if (!$hasFieldErrors) {
            try {
                adminUpdatePassword($newPassword);
                $passwordChangeSuccess = 'Das Passwort wurde geändert. Du kannst dich jetzt mit dem neuen Passwort einloggen.';
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
            'message' => $passwordChangeSuccess ?? 'Das Passwort wurde geändert.',
        ]);
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= adminEscape(adminTitle()) ?> Passwort ändern</title>
    <meta name="description" content="<?= adminEscape(adminTitle()) ?> Passwort ändern">
    <meta name="keywords" content="portfolio, admin">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="GPTBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="ChatGPT-User" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="Google-Extended" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="ClaudeBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="Claude-Web" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="anthropic-ai" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="CCBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta name="PerplexityBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">
    <meta property="og:title" content="<?= adminEscape(adminTitle()) ?> Passwort ändern">
    <meta property="og:description" content="<?= adminEscape(adminTitle()) ?> Passwort ändern">
    <meta property="og:image" content="../img/favicon_512x512.png">
    <meta property="og:site_name" content="https://www.lisa-weber.de">
	<!-- iOS Homescreen Icon -->
	<link rel="apple-touch-icon-precomposed" href="../img/favicon_512x512.png">
	<!-- iPad Homescreen Icon -->
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="../img/favicon_512x512.png">
	<!-- new iPad Homescreen Icon -->
	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="../img/favicon_512x512.png">
	<!-- Windows 8 -->
	<meta name="msapplication-TileColor" content="#ffffff">
	<!-- Kachel-Farbe -->
	<meta name="theme-color" content="#ffffff">
	<script>
        (function() {
            const themeStorageKey = 'theme-preference';
            const rootElement = document.documentElement;
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');

            let storedTheme = null;

            try {
                storedTheme = localStorage.getItem(themeStorageKey);
            } catch (error) {
                storedTheme = null;
            }

            const resolvedTheme = storedTheme === 'light' || storedTheme === 'dark'
                ? storedTheme
                : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

            rootElement.dataset.theme = resolvedTheme;
            rootElement.style.colorScheme = resolvedTheme;

            if (themeColorMeta) {
                themeColorMeta.setAttribute('content', resolvedTheme === 'dark' ? '#18181b' : '#ffffff');
            }
        })();
	</script>
	<meta name="msapplication-TileImage" content="../img/favicon_512x512.png">
	<!-- Fluid -->
	<link rel="fluid-icon" href="../img/favicon_512x512.png" title="<?= adminEscape(adminTitle()) ?> Login">
	<!-- Shortcut Icons -->
	<link rel="shortcut icon" href="../img/favicon.ico?rand=1" type="image/x-icon">
	<link rel="icon" href="../img/favicon_16x16.png" sizes="16x16">
	<link rel="icon" href="../img/favicon_32x32.png" sizes="32x32">
	<link rel="icon" href="../img/favicon_48x48.png" sizes="48x48">
	<link rel="icon" href="../img/favicon_64x64.png" sizes="64x64">
	<link rel="icon" href="../img/favicon_128x128.png" sizes="128x128">

	<link rel="preload" href="../fonts/PlayfairDisplay/PlayfairDisplay.woff2" as="font" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" href="../fonts/PlayfairDisplay/PlayfairDisplay-Italic.woff2" as="font" type="font/woff2" crossorigin="anonymous">

	<link rel="preload" href="../fonts/Inter/Inter.woff2" as="font" type="font/woff2" crossorigin="anonymous">

	<link rel="stylesheet" href="../css/styles.min.css">
</head>
<body class="admin-auth">
    <?= adminRenderSiteHeader($siteData, adminIsAuthenticated()) ?>
	<main>
		<section>
			<div class="container">
				<div class="card card--default-inner">
					<div class="card__body">
						<div class="card__body-wrapper">
							<div class="admin-logo">
								<?= adminIconSvg(adminHeaderLogoIconName($siteData)) ?>
							</div>
							<h3>Neues Passwort setzen</h3>
							<div class="alert alert--info">
								<strong>Passwort-Regeln:</strong>
								<ul>
									<li>Das neue Passwort muss mindestens 10 Zeichen lang sein.</li>
									<li>Mindestens eine Zahl.</li>
									<li>Einen Großbuchstaben.</li>
									<li>ein Sonderzeichen enthalten.</li>
								</ul>
							</div>
							<div
								data-form-status="<?= $passwordChangeSuccess !== null ? 'success' : ($passwordChangeErrors !== [] ? 'error' : '') ?>"
								aria-live="polite"
							><?= $passwordChangeSuccess !== null ? adminEscape($passwordChangeSuccess) : inlineErrorMarkup($passwordChangeErrors) ?></div>
							<form method="post" id="change-password-form" novalidate>
								<input type="hidden" name="csrf_token" value="<?= adminEscape(adminCsrfToken()) ?>">
								<div class="form-group">
									<label for="current_password">Aktuelles Passwort</label>
									<div class="input-group js-password-input">
										<input
											type="password"
											id="current_password"
											name="current_password"
											autocomplete="current-password"
											placeholder="Aktuelles Passwort"
											data-password-field
											required
										>
										<button
											type="button"
											title="Passwort anzeigen"
											class="admin-password-icon-button"
											aria-label="Passwort anzeigen"
											data-password-toggle
											class="icon-button"
										>
											<?= adminIconSvg('eye', ['class' => 'admin-password-icon', 'data-password-icon' => 'eye']) ?>
										</button>
									</div>
									<span data-form-error="current_password">
										<?= inlineErrorMarkup($passwordFieldErrors['current_password']) ?>
									</span>
								</div>
								<div class="form-group">
									<label for="new_password">Neues Passwort</label>
									<div class="input-group js-password-input">
										<input
											type="password"
											id="new_password"
											name="new_password"
											autocomplete="new-password"
											placeholder="Neues Passwort"
											data-password-field
											required
										>
										<button
											type="button"
											title="Passwort anzeigen"
											aria-label="Passwort anzeigen"
											data-password-toggle
											class="icon-button"
										>
											<?= adminIconSvg('eye', ['class' => 'admin-password-icon', 'data-password-icon' => 'eye']) ?>
										</button>
									</div>
									<span data-form-error="new_password">
										<?= inlineErrorMarkup($passwordFieldErrors['new_password']) ?>
									</span>
								</div>
								<div class="form-group">
									<label for="confirm_password">Neues Passwort wiederholen</label>
									<div class="input-group js-password-input">
										<input
											type="password"
											id="confirm_password"
											name="confirm_password"
											autocomplete="new-password"
											placeholder="Neues Passwort wiederholen"
											data-password-field
											required
										>
										<button
											type="button"
											title="Passwort anzeigen"
											aria-label="Passwort anzeigen"
											data-password-toggle
											class="icon-button"
										>
											<?= adminIconSvg('eye', ['class' => 'admin-password-icon', 'data-password-icon' => 'eye']) ?>
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
							Passwort speichern
						</button>
						<?php if (adminIsAuthenticated()): ?>
							<a href="./admin.php">Zur Admin-Seite</a>
						<?php else: ?>
							<a href="./index.php">Zur Login-Seite</a>
						<?php endif; ?>

					</div>
				</div>
			</div>
		</section>
	</main>

    <?= adminRenderSiteFooter($siteData) ?>
    <div class="backdrop" data-overlay></div>

    <script src="../js/admin.min.js"></script>
</body>
</html>
