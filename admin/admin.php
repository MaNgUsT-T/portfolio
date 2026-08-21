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
<html lang="de">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= adminEscape(adminTitle()) ?></title>
    <meta name="description" content="<?= adminEscape(adminTitle()) ?> Admin">
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
    <meta property="og:title" content="<?= adminEscape(adminTitle()) ?> Admin">
    <meta property="og:description" content="<?= adminEscape(adminTitle()) ?> Admin">
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
<body>
    <?= adminRenderSiteHeader($siteData, true) ?>

    <main class="admin-main">
        <section class="admin-section admin-section--intro">
            <div class="container admin-layout">
                <div class="admin-hero">
                    <div class="admin-hero__copy">
                        <p class="admin-eyebrow">Content Backend</p>
                        <h1>Inhalte bearbeiten</h1>
                        <p>Die strukturierte Ansicht deckt alle aktuellen Bereiche aus <code>data/data.json</code> ab.</p>
                    </div>

                    <div class="admin-panel__meta admin-panel__meta--hero">
                        <span>Direktes Dateispeichern</span>
                        <span>CSRF geschützt</span>
                        <span>UTF-8 JSON</span>
                    </div>
                </div>

                <?php if ($flash !== null): ?>
                    <div class="admin-alert admin-alert--<?= adminEscape($flash['type']) ?>">
                        <?= adminEscape($flash['message']) ?>
                    </div>
                <?php endif; ?>

                <?php if ($loadError !== null): ?>
                    <div class="admin-alert admin-alert--error"><?= adminEscape($loadError) ?></div>
                <?php else: ?>
                    <div class="admin-panel">
                        <div class="admin-panel__intro">
                            <div>
                                <p class="admin-eyebrow">Editor</p>
                                <h2>Struktur und JSON</h2>
                                <p>Grob nach dem Aufbau der Siteelements: Header, Intro-Bereich und klare Editor-Sektionen.</p>
                            </div>
                        </div>

                        <div class="admin-tabs" data-tabs>
                            <div class="admin-tabs__list" role="tablist" aria-label="Editor Modi">
                                <button type="button" class="admin-tab is-active" data-tab-trigger="structured" role="tab">
                                    Inhalte
                                </button>
                                <button type="button" class="admin-tab" data-tab-trigger="json" role="tab">
                                    JSON
                                </button>
                            </div>

                            <div class="admin-tab-panel is-active" data-tab-panel="structured" role="tabpanel">
                                <form method="post" action="./admin-save.php" class="admin-form admin-editor">
                                    <input type="hidden" name="mode" value="structured">
                                    <input type="hidden" name="csrf_token" value="<?= adminEscape(adminCsrfToken()) ?>">

                                    <div class="admin-section-grid">
                                        <?= adminRenderFields($siteData, $templateData) ?>
                                    </div>

                                    <div class="admin-sticky-actions">
                                        <button type="submit" class="admin-button admin-button--primary">Struktur speichern</button>
                                    </div>
                                </form>
                            </div>

                            <div class="admin-tab-panel" data-tab-panel="json" role="tabpanel" hidden>
                                <form method="post" action="./admin-save.php" class="admin-form admin-editor">
                                    <input type="hidden" name="mode" value="json">
                                    <input type="hidden" name="csrf_token" value="<?= adminEscape(adminCsrfToken()) ?>">

                                    <div class="admin-group admin-group--json">
                                        <div class="admin-group__header">
                                            <h3>Rohes JSON</h3>
                                            <p>Nur verwenden, wenn die strukturierte Ansicht nicht ausreicht.</p>
                                        </div>
                                        <div class="admin-group__body">
                                            <textarea name="json_payload" rows="32" class="admin-json-field"><?= adminEscape(
                                                json_encode(
                                                    $siteData,
                                                    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
                                                ) ?: ''
                                            ) ?></textarea>
                                        </div>
                                    </div>

                                    <div class="admin-sticky-actions">
                                        <button type="submit" class="admin-button admin-button--primary">JSON speichern</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </section>
    </main>

    <?= adminRenderSiteFooter($siteData) ?>
    <div class="backdrop" data-overlay></div>
    <script src="../js/admin.min.js"></script>
</body>
</html>
