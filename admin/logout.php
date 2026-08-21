<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();
$siteData = [];

try {
    $siteData = adminLoadSiteData();
} catch (RuntimeException $exception) {
    $siteData = [];
}

adminLogout();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="5;url=./index.php">
    <title><?= adminEscape(adminTitle()) ?> Logout</title>
    <meta name="description" content="<?= adminEscape(adminTitle()) ?> Logout">
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
    <meta property="og:title" content="<?= adminEscape(adminTitle()) ?> Logout">
    <meta property="og:description" content="<?= adminEscape(adminTitle()) ?> Logout">
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

        window.setTimeout(function() {
            window.location.href = './index.php';
        }, 5000);
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
							<h3>Du bist ausgeloggt</h3>
							<p>Die Sitzung wurde beendet. Du wirst in wenigen Sekunden automatisch zur Login-Seite weitergeleitet.</p>
						</div>
					</div>
					<div class="card__footer">
						<a href="./index.php" class="btn btn--primary btn--large">Zur Login-Seite</a>
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
