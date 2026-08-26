<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();

if (!adminIsAuthenticated()) {
    adminRedirectToLogin();
}

$flash = adminConsumeFlash();
$siteData = [];
$templateData = [];
$loadError = null;

try {
    $siteData = adminLoadSiteData();
    $templateData = adminLoadTemplateData();
} catch (RuntimeException $exception) {
    $loadError = $exception->getMessage();
}
?>
<!DOCTYPE html>
<html lang="<?= adminEscape(adminDocumentLanguage()) ?>">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= adminEscape(adminTitle()) ?> <?= adminEscape(adminT('admin.page_suffix')) ?></title>
    <meta name="description" content="<?= adminEscape(adminTitle()) ?> <?= adminEscape(adminT('admin.page_suffix')) ?>">
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
    <meta property="og:title" content="<?= adminEscape(adminTitle()) ?> <?= adminEscape(adminT('admin.page_suffix')) ?>">
    <meta property="og:description" content="<?= adminEscape(adminTitle()) ?> <?= adminEscape(adminT('admin.page_suffix')) ?>">
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
	<link rel="fluid-icon" href="../img/favicon_512x512.png" title="<?= adminEscape(adminTitle()) ?> <?= adminEscape(adminT('admin.page_suffix')) ?>">
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
<body class="admin-content">
    <?= adminRenderSiteHeader($siteData, true) ?>



	<main>
		<section>
			<div class="container">
				<h1><?= adminEscape(adminT('admin.heading')) ?></h1>
				<p><?= adminEscape(adminT('admin.structured_intro')) ?> <code>data/data.json</code>.</p>
				<p><span class="pill"><?= adminEscape(adminT('admin.badge.direct_save')) ?></span> <span class="pill"><?= adminEscape(adminT('admin.badge.csrf')) ?></span> <span class="pill"><?= adminEscape(adminT('admin.badge.utf8_json')) ?></span></p>

				<?php if ($flash !== null): ?>
					<div class="alert alert--<?= adminEscape($flash['type']) ?>">
						<?= adminEscape($flash['message']) ?>
					</div>
				<?php endif; ?>

				<?php if ($loadError !== null): ?>
					<div class="alert alert--error"><?= adminEscape($loadError) ?></div>
				<?php endif; ?>

			</div>
		</section>



		<?php if ($loadError == null): ?>
			<div class="admin-tabs" data-tabs>



				<section role="tablist" aria-label="<?= adminEscape(adminT('tabs.editor_modes')) ?>">
					<div class="container">
							<button type="button" class="tab-button is-active" data-tab-trigger="structured" role="tab">
								<?= adminEscape(adminT('tabs.content')) ?>
							</button>
							<button type="button" class="tab-button" data-tab-trigger="json" role="tab">
								<?= adminEscape(adminT('tabs.json')) ?>
							</button>
					</div>
				</section>

				<div class="tab-panel is-active" data-tab-panel="structured" role="tabpanel">
					<?= adminRenderFields($siteData, $templateData) ?>
				</div>



				<div class="tab-panel" data-tab-panel="json" role="tabpanel" hidden>
					<section>
						<div class="container">
							<p class="preheader"><?= adminEscape(adminT('admin.raw_json_hint')) ?></p>
							<h2><?= adminEscape(adminT('admin.raw_json_heading')) ?></h2>
							<div class="card card--default-inner">
								<div class="card__body">
									<div class="card__body-wrapper">
										<form method="post" action="./admin-save.php" id="json-form" class="admin-form">
											<input type="hidden" name="mode" value="json">
											<input type="hidden" name="csrf_token" value="<?= adminEscape(adminCsrfToken()) ?>">
											<div class="form-group">
												<textarea
													name="json-payload"
													rows="32"
												><?= adminEscape(
												json_encode(
														$siteData,
														JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
													) ?: ''
												) ?></textarea>
												<span data-form-error="message"></span></div>
										</form>
									</div>
								</div>
								<div class="card__footer">
									<button
										type="submit"
										form="json-form"
										class="btn btn--primary btn--large"
									>
										<?= adminEscape(adminT('admin.save_json')) ?>
									</button>
								</div>
							</div>
						</div>
					</section>
				</div>

			</div>
		<?php endif; ?>


	</main>



    <?= adminRenderSiteFooter($siteData) ?>
    <div class="backdrop" data-overlay></div>
    <?= adminRenderClientConfigScript() ?>
    <script src="../js/admin.min.js"></script>
</body>
</html>
