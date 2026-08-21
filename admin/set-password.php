<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(200);
    adminSendCrawlerBlockHeaders();
    header('Content-Type: text/html; charset=utf-8');
    $siteData = [];

    try {
        $siteData = adminLoadSiteData();
    } catch (RuntimeException $exception) {
        $siteData = [];
    }
    ?>
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?= adminEscape(adminTitle()) ?> Passwort setzen</title>
        <meta name="description" content="<?= adminEscape(adminTitle()) ?> Passwort setzen">
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
        <meta property="og:title" content="<?= adminEscape(adminTitle()) ?> Passwort setzen">
        <meta property="og:description" content="<?= adminEscape(adminTitle()) ?> Passwort setzen">
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
        <?= adminRenderSiteHeader($siteData) ?>

        <main class="admin-layout admin-layout--auth">
            <div class="admin-auth card">
                <div class="admin-auth__intro">
                    <p class="admin-eyebrow">CLI</p>
                    <h1>Passwort nur per Kommandozeile setzen</h1>
                    <p>Diese Datei ist absichtlich kein Web-Formular. Das Admin-Passwort wird nur per CLI-Befehl geändert.</p>
                </div>

                <div class="admin-group admin-group--json">
                    <div class="admin-group__header">
                        <h3>Befehl</h3>
                        <p>Im Projektverzeichnis auf dem Server oder in der lokalen Umgebung ausführen.</p>
                    </div>
                    <div class="admin-group__body">
                        <pre class="admin-code-block">docker compose -f _docker/docker-compose.yml run --rm --no-deps php php /var/www/html/admin/set-password.php 'DEIN-NEUES-PASSWORT'</pre>
                    </div>
                </div>

                <div class="admin-auth__links">
                    <a href="./index.php">Zur Login-Seite</a>
                </div>
            </div>
        </main>

        <?= adminRenderSiteFooter($siteData) ?>
        <div class="backdrop" data-overlay></div>

        <script src="../js/admin.min.js"></script>
    </body>
    </html>
    <?php
    exit;
}

/**
 * @return resource
 */
function cliStream(string $name)
{
    $constantName = strtoupper($name);

    if (defined($constantName)) {
        $stream = constant($constantName);

        if (is_resource($stream)) {
            return $stream;
        }
    }

    $stream = fopen('php://' . $name, 'wb');

    if ($stream === false) {
        throw new RuntimeException('Der Stream php://' . $name . ' konnte nicht geöffnet werden.');
    }

    return $stream;
}

$stderr = cliStream('stderr');
$stdout = cliStream('stdout');
$configFile = __DIR__ . '/admin-config.php';

if (!is_file($configFile) || !is_readable($configFile) || !is_writable($configFile)) {
    fwrite($stderr, "Die Datei admin-config.php ist nicht lesbar oder nicht beschreibbar.\n");
    exit(1);
}

$password = $argv[1] ?? '';

if (!is_string($password) || $password === '') {
    fwrite($stderr, "Verwendung: php admin/set-password.php \"NEUES-PASSWORT\"\n");
    exit(1);
}

$configContent = file_get_contents($configFile);

if ($configContent === false) {
    fwrite($stderr, "admin-config.php konnte nicht gelesen werden.\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

if ($hash === false) {
    fwrite($stderr, "Das Passwort konnte nicht gehasht werden.\n");
    exit(1);
}

$updatedContent = preg_replace_callback(
    "/'password_hash' => '[^']*',/",
    static fn (): string => "'password_hash' => '" . $hash . "',",
    $configContent,
    1,
    $replacementCount
);

if ($updatedContent === null || $replacementCount !== 1) {
    fwrite($stderr, "Der Eintrag password_hash konnte nicht aktualisiert werden.\n");
    exit(1);
}

if (file_put_contents($configFile, $updatedContent) === false) {
    fwrite($stderr, "admin-config.php konnte nicht geschrieben werden.\n");
    exit(1);
}

fwrite($stdout, "Das Admin-Passwort wurde aktualisiert.\n");
