<?php

declare(strict_types=1);

/**
 * @return array<string, mixed>
 */
function adminConfig(): array
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/admin-config.php';
    }

    return $config;
}

function adminStartSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name((string) adminConfig()['session_name']);
    session_set_cookie_params(adminSessionCookieParams());
    session_start();
}

/**
 * @return array{
 *     lifetime: int,
 *     path: string,
 *     domain: string,
 *     secure: bool,
 *     httponly: bool,
 *     samesite: string
 * }
 */
function adminSessionCookieParams(): array
{
    $cookieConfig = adminConfig()['session_cookie'] ?? [];

    if (!is_array($cookieConfig)) {
        $cookieConfig = [];
    }

    return [
        'lifetime' => adminNormalizeSessionCookieLifetime($cookieConfig['lifetime'] ?? 0),
        'path' => adminNormalizeSessionCookiePath($cookieConfig['path'] ?? '/admin'),
        'domain' => adminNormalizeSessionCookieDomain($cookieConfig['domain'] ?? ''),
        'secure' => adminNormalizeSessionCookieSecure($cookieConfig['secure'] ?? null),
        'httponly' => adminNormalizeSessionCookieHttpOnly($cookieConfig['httponly'] ?? true),
        'samesite' => adminNormalizeSessionCookieSameSite($cookieConfig['samesite'] ?? 'Lax'),
    ];
}

function adminNormalizeSessionCookieLifetime(mixed $lifetime): int
{
    if (is_int($lifetime) && $lifetime >= 0) {
        return $lifetime;
    }

    return 0;
}

function adminNormalizeSessionCookiePath(mixed $path): string
{
    if (!is_string($path)) {
        return '/admin';
    }

    $normalizedPath = trim($path);

    if ($normalizedPath === '') {
        return '/admin';
    }

    return str_starts_with($normalizedPath, '/') ? $normalizedPath : '/' . $normalizedPath;
}

function adminNormalizeSessionCookieDomain(mixed $domain): string
{
    if (!is_string($domain)) {
        return '';
    }

    return trim($domain);
}

function adminNormalizeSessionCookieSecure(mixed $secure): bool
{
    if (is_bool($secure)) {
        return $secure;
    }

    return adminIsHttpsRequest();
}

function adminNormalizeSessionCookieHttpOnly(mixed $httpOnly): bool
{
    if (is_bool($httpOnly)) {
        return $httpOnly;
    }

    return true;
}

function adminNormalizeSessionCookieSameSite(mixed $sameSite): string
{
    if (!is_string($sameSite)) {
        return 'Lax';
    }

    $normalizedSameSite = strtolower(trim($sameSite));

    return match ($normalizedSameSite) {
        'lax' => 'Lax',
        'strict' => 'Strict',
        'none' => 'None',
        default => 'Lax',
    };
}

function adminIsHttpsRequest(): bool
{
    $https = $_SERVER['HTTPS'] ?? null;

    if (is_string($https) && $https !== '' && strtolower($https) !== 'off') {
        return true;
    }

    $requestScheme = $_SERVER['REQUEST_SCHEME'] ?? null;

    if (is_string($requestScheme) && strtolower($requestScheme) === 'https') {
        return true;
    }

    $forwardedProto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? null;

    if (!is_string($forwardedProto)) {
        return false;
    }

    foreach (explode(',', $forwardedProto) as $proto) {
        if (strtolower(trim($proto)) === 'https') {
            return true;
        }
    }

    return false;
}

function adminDefaultLocale(): string
{
    return 'de';
}

/**
 * @return array<int, string>
 */
function adminAllowedLocales(): array
{
    return ['de', 'en'];
}

function adminLocaleSessionKey(): string
{
    return 'admin_locale';
}

function adminNormalizeLocale(?string $locale): string
{
    return in_array($locale, adminAllowedLocales(), true) ? $locale : adminDefaultLocale();
}

function adminCurrentLocale(): string
{
    adminStartSession();

    $locale = $_SESSION[adminLocaleSessionKey()] ?? adminDefaultLocale();

    return adminNormalizeLocale(is_string($locale) ? $locale : null);
}

function adminSetLocale(?string $locale): void
{
    adminStartSession();
    $_SESSION[adminLocaleSessionKey()] = adminNormalizeLocale($locale);
}

function adminDocumentLanguage(): string
{
    return adminCurrentLocale();
}

function adminLangFile(string $locale): string
{
    return __DIR__ . '/lang/' . $locale . '.php';
}

/**
 * @return array<string, string>
 */
function adminTranslations(string $locale): array
{
    static $cache = [];

    $resolvedLocale = adminNormalizeLocale($locale);

    if (isset($cache[$resolvedLocale])) {
        return $cache[$resolvedLocale];
    }

    $file = adminLangFile($resolvedLocale);
    $translations = is_file($file) ? require $file : [];
    $cache[$resolvedLocale] = is_array($translations) ? $translations : [];

    return $cache[$resolvedLocale];
}

function adminTranslationValue(string $key, ?string $locale = null): ?string
{
    $resolvedLocale = $locale ?? adminCurrentLocale();
    $translations = adminTranslations($resolvedLocale);

    if (isset($translations[$key]) && is_string($translations[$key])) {
        return $translations[$key];
    }

    return null;
}

/**
 * @param array<string, string> $replace
 */
function adminT(string $key, array $replace = []): string
{
    $translation = adminTranslationValue($key) ?? adminTranslationValue($key, adminDefaultLocale()) ?? $key;

    if ($replace === []) {
        return $translation;
    }

    $tokens = [];

    foreach ($replace as $replaceKey => $replaceValue) {
        $tokens['{' . $replaceKey . '}'] = $replaceValue;
    }

    return strtr($translation, $tokens);
}

/**
 * @return array<string, string>
 */
function adminJsTranslations(): array
{
    return [
        'admin.remove_confirm' => adminT('admin.remove_confirm'),
        'auth.show_password' => adminT('auth.show_password'),
        'auth.hide_password' => adminT('auth.hide_password'),
        'auth.login_submitting' => adminT('auth.login_submitting'),
        'auth.login_failed' => adminT('auth.login_failed'),
        'auth.login_success' => adminT('auth.login_success'),
        'auth.connection_failed' => adminT('auth.connection_failed'),
        'auth.change_password_submitting' => adminT('auth.change_password_submitting'),
        'auth.change_password_failed' => adminT('auth.change_password_failed'),
        'auth.change_password_success_short' => adminT('auth.change_password_success_short'),
    ];
}

function adminRenderClientConfigScript(): string
{
    $payload = [
        'locale' => adminCurrentLocale(),
        'translations' => adminJsTranslations(),
    ];

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if (!is_string($json)) {
        return '';
    }

    return '<script>window.adminUi=' . $json . ';</script>';
}

/**
 * @param array{
 *     title_suffix_key: string,
 *     meta_refresh?: string,
 *     extra_inline_script?: string
 * } $options
 */
function adminRenderHead(array $options = []): string
{
    $titleSuffixKey = isset($options['title_suffix_key']) && is_string($options['title_suffix_key'])
        ? $options['title_suffix_key']
        : '';

    if ($titleSuffixKey === '') {
        throw new InvalidArgumentException('The "title_suffix_key" option is required.');
    }

    $metaRefresh = isset($options['meta_refresh']) && is_string($options['meta_refresh'])
        ? trim($options['meta_refresh'])
        : '';
    $extraInlineScript = isset($options['extra_inline_script']) && is_string($options['extra_inline_script'])
        ? trim($options['extra_inline_script'])
        : '';
    $fullTitle = adminTitle() . ' ' . adminT($titleSuffixKey);
    $escapedTitle = adminEscape($fullTitle);
    $themeBootstrapScript = <<<'JS'
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
JS;

    $headParts = [
        '<head>',
        '    <meta http-equiv="X-UA-Compatible" content="IE=edge">',
        '    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    ];

    if ($metaRefresh !== '') {
        $headParts[] = '    <meta http-equiv="refresh" content="' . adminEscape($metaRefresh) . '">';
    }

    $headParts = array_merge($headParts, [
        '    <title>' . $escapedTitle . '</title>',
        '    <meta name="description" content="' . $escapedTitle . '">',
        '    <meta name="keywords" content="portfolio, admin">',
        '    <meta name="mobile-web-app-capable" content="yes">',
        '    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="GPTBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="ChatGPT-User" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="Google-Extended" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="ClaudeBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="Claude-Web" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="anthropic-ai" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="CCBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta name="PerplexityBot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">',
        '    <meta property="og:title" content="' . $escapedTitle . '">',
        '    <meta property="og:description" content="' . $escapedTitle . '">',
        '    <meta property="og:image" content="../img/favicon_512x512.png">',
        '    <meta property="og:site_name" content="https://www.lisa-weber.de">',
        '    <!-- iOS Homescreen Icon -->',
        '    <link rel="apple-touch-icon-precomposed" href="../img/favicon_512x512.png">',
        '    <!-- iPad Homescreen Icon -->',
        '    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="../img/favicon_512x512.png">',
        '    <!-- new iPad Homescreen Icon -->',
        '    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="../img/favicon_512x512.png">',
        '    <!-- Windows 8 -->',
        '    <meta name="msapplication-TileColor" content="#ffffff">',
        '    <!-- Kachel-Farbe -->',
        '    <meta name="theme-color" content="#ffffff">',
        '    <script>',
        $themeBootstrapScript,
    ]);

    if ($extraInlineScript !== '') {
        $headParts[] = '';
        $headParts[] = $extraInlineScript;
    }

    $headParts = array_merge($headParts, [
        '    </script>',
        '    <meta name="msapplication-TileImage" content="../img/favicon_512x512.png">',
        '    <!-- Fluid -->',
        '    <link rel="fluid-icon" href="../img/favicon_512x512.png" title="' . $escapedTitle . '">',
        '    <!-- Shortcut Icons -->',
        '    <link rel="shortcut icon" href="../img/favicon.ico?rand=1" type="image/x-icon">',
        '    <link rel="icon" href="../img/favicon_16x16.png" sizes="16x16">',
        '    <link rel="icon" href="../img/favicon_32x32.png" sizes="32x32">',
        '    <link rel="icon" href="../img/favicon_48x48.png" sizes="48x48">',
        '    <link rel="icon" href="../img/favicon_64x64.png" sizes="64x64">',
        '    <link rel="icon" href="../img/favicon_128x128.png" sizes="128x128">',
        '',
        '    <link rel="preload" href="../fonts/PlayfairDisplay/PlayfairDisplay.woff2" as="font" type="font/woff2" crossorigin="anonymous">',
        '    <link rel="preload" href="../fonts/PlayfairDisplay/PlayfairDisplay-Italic.woff2" as="font" type="font/woff2" crossorigin="anonymous">',
        '',
        '    <link rel="preload" href="../fonts/Inter/Inter.woff2" as="font" type="font/woff2" crossorigin="anonymous">',
        '',
        '    <link rel="stylesheet" href="../css/styles.min.css">',
        '</head>',
    ]);

    return implode("\n", $headParts);
}

function adminTitle(): string
{
    return (string) adminConfig()['admin_title'];
}

function adminDataFile(): string
{
    return (string) adminConfig()['data_file'];
}

function adminIconsFile(): string
{
    return dirname(__DIR__) . '/data/icons.json';
}

function adminTemplateFile(): string
{
    return (string) adminConfig()['template_file'];
}

function adminSessionKey(): string
{
    return (string) adminConfig()['session_key'];
}

function adminCsrfKey(): string
{
    return (string) adminConfig()['csrf_key'];
}

function adminDefaultPasswordNotice(): string
{
    return (string) adminConfig()['default_password_notice'];
}

function adminPasswordHash(): string
{
    return (string) adminConfig()['password_hash'];
}

function adminConfigFile(): string
{
    return __DIR__ . '/admin-config.php';
}

function adminSendCrawlerBlockHeaders(): void
{
    if (headers_sent()) {
        return;
    }

    $directives = 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate';
    $botSpecificAgents = [
        'googlebot',
        'bingbot',
        'GPTBot',
        'ChatGPT-User',
        'Google-Extended',
        'ClaudeBot',
        'Claude-Web',
        'anthropic-ai',
        'CCBot',
        'PerplexityBot',
        'Bytespider',
    ];

    header('X-Robots-Tag: ' . $directives);

    foreach ($botSpecificAgents as $botSpecificAgent) {
        header('X-Robots-Tag: ' . $botSpecificAgent . ': ' . $directives, false);
    }
}

function adminIsAuthenticated(): bool
{
    adminStartSession();

    return ($_SESSION[adminSessionKey()] ?? false) === true;
}

function adminLogin(string $password): bool
{
    adminStartSession();

    if (!password_verify($password, adminPasswordHash())) {
        return false;
    }

    session_regenerate_id(true);
    $_SESSION[adminSessionKey()] = true;

    return true;
}

function adminVerifyPassword(string $password): bool
{
    return password_verify($password, adminPasswordHash());
}

function adminUpdatePassword(string $newPassword): void
{
    $configFile = adminConfigFile();

    if (!is_file($configFile) || !is_readable($configFile) || !is_writable($configFile)) {
        throw new RuntimeException(adminT('error.password_config_not_writable'));
    }

    $configContent = file_get_contents($configFile);

    if ($configContent === false) {
        throw new RuntimeException(adminT('error.password_config_read_failed'));
    }

    $hash = password_hash($newPassword, PASSWORD_DEFAULT);

    if ($hash === false) {
        throw new RuntimeException(adminT('error.password_hash_failed'));
    }

    $updatedContent = preg_replace_callback(
        "/'password_hash' => '[^']*',/",
        static fn (): string => "'password_hash' => '" . $hash . "',",
        $configContent,
        1,
        $replacementCount
    );

    if ($updatedContent === null || $replacementCount !== 1) {
        throw new RuntimeException(adminT('error.password_hash_update_failed'));
    }

    if (file_put_contents($configFile, $updatedContent) === false) {
        throw new RuntimeException(adminT('error.password_config_not_writable'));
    }
}

function adminPasswordMeetsRequirements(string $password): bool
{
    return adminPasswordRequirementErrors($password) === [];
}

/**
 * @return array<int, string>
 */
function adminPasswordRequirementErrors(string $password): array
{
    $errors = [];

    if (strlen($password) < 10) {
        $errors[] = adminT('auth.password_rule_length');
    }

    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = adminT('auth.password_rule_number');
    }

    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = adminT('auth.password_rule_uppercase');
    }

    if (preg_match('/[^a-zA-Z0-9]/', $password) !== 1) {
        $errors[] = adminT('auth.password_rule_special');
    }

    return $errors;
}

/**
 * @param array<string, string> $attributes
 */
function adminIconSvg(string $iconName, array $attributes = []): string
{
    $icons = adminIcons();

    if (!isset($icons[$iconName])) {
        return '';
    }

    $svg = $icons[$iconName];

    if ($attributes === []) {
        return $svg;
    }

    foreach ($attributes as $attributeName => $attributeValue) {
        $pattern = '/\s' . preg_quote($attributeName, '/') . '="[^"]*"/';

        if (preg_match($pattern, $svg) === 1) {
            $svg = (string) preg_replace(
                $pattern,
                ' ' . $attributeName . '="' . adminEscape($attributeValue) . '"',
                $svg,
                1
            );
            continue;
        }

        $svg = (string) preg_replace(
            '/^<svg\b/',
            '<svg ' . $attributeName . '="' . adminEscape($attributeValue) . '"',
            $svg,
            1
        );
    }

    return $svg;
}

function adminIconExists(string $iconName): bool
{
    return isset(adminIcons()[$iconName]);
}

/**
 * @param array<string, mixed> $siteData
 */
function adminSiteBranding(array $siteData): array
{
    $site = isset($siteData['site']) && is_array($siteData['site']) ? $siteData['site'] : [];
    $header = isset($siteData['header']) && is_array($siteData['header']) ? $siteData['header'] : [];
    $footer = isset($siteData['footer']) && is_array($siteData['footer']) ? $siteData['footer'] : [];
    $hero = isset($siteData['hero']) && is_array($siteData['hero']) ? $siteData['hero'] : [];

    $logoIcon = isset($site['logoIcon']) ? trim((string) $site['logoIcon']) : '';
    $logoText = isset($site['logoText']) ? (string) $site['logoText'] : '';
    $socialLinks = isset($site['socialLinks']) && is_array($site['socialLinks']) ? $site['socialLinks'] : [];

    if ($logoIcon === '') {
        $logoIcon = isset($header['logoIcon']) ? trim((string) $header['logoIcon']) : '';
    }

    if ($logoText === '') {
        if (isset($header['logoText'])) {
            $logoText = (string) $header['logoText'];
        } elseif (isset($footer['logoText'])) {
            $logoText = (string) $footer['logoText'];
        }
    }

    if ($socialLinks === []) {
        if (isset($hero['socialLinks']) && is_array($hero['socialLinks'])) {
            $socialLinks = $hero['socialLinks'];
        } elseif (isset($footer['socialLinks']) && is_array($footer['socialLinks'])) {
            $socialLinks = $footer['socialLinks'];
        }
    }

    return [
        'logoIcon' => $logoIcon,
        'logoText' => $logoText,
        'socialLinks' => $socialLinks,
    ];
}

/**
 * @param array<string, mixed> $siteData
 */
function adminHeaderLogoIconName(array $siteData): string
{
    $branding = adminSiteBranding($siteData);
    $logoIcon = trim((string) ($branding['logoIcon'] ?? ''));

    if ($logoIcon !== '' && adminIconExists($logoIcon)) {
        return $logoIcon;
    }

    return 'palette';
}

/**
 * @return array<string, string>
 */
function adminIcons(): array
{
    static $icons = null;

    if (is_array($icons)) {
        return $icons;
    }

    $decoded = adminReadJsonFile(adminIconsFile());
    $icons = [];

    foreach ($decoded as $key => $value) {
        if (!is_string($key) || !is_string($value)) {
            continue;
        }

        $icons[$key] = $value;
    }

    return $icons;
}

/**
 * @param array<string, mixed> $siteData
 */
function adminRenderSiteFooter(array $siteData): string
{
    $branding = adminSiteBranding($siteData);
    $footer = isset($siteData['footer']) && is_array($siteData['footer']) ? $siteData['footer'] : [];
    $logoText = (string) ($branding['logoText'] ?? '');
    $text = isset($footer['text']) ? (string) $footer['text'] : '';
    $copyright = isset($footer['copyright']) ? (string) $footer['copyright'] : '';
    $owner = isset($footer['owner']) ? (string) $footer['owner'] : '';
    $socialLinks = isset($branding['socialLinks']) && is_array($branding['socialLinks']) ? $branding['socialLinks'] : [];

    if ($logoText === '') {
        $logoText = adminTitle();
    }

    $socialMarkup = '';

    foreach ($socialLinks as $item) {
        if (!is_array($item)) {
            continue;
        }

        $href = isset($item['href']) ? (string) $item['href'] : '#';
        $title = isset($item['title']) ? (string) $item['title'] : '';
        $iconName = isset($item['icon']) ? (string) $item['icon'] : '';
        $iconSvg = adminIconSvg($iconName);

        if ($iconSvg === '') {
            continue;
        }

        $socialMarkup .= '<a href="' . adminEscape($href) . '" title="' . adminEscape($title) . '">' . $iconSvg . '</a>';
    }

    $footerText = adminEscape($text);
    if ($copyright !== '' || $owner !== '') {
        $footerText .= ' <span class="text-nowrap">&copy; ' . adminEscape($copyright) . '</span> ' . adminEscape($owner);
    }

    return '<footer class="footer"><div class="container footer__wrapper"><div class="logo">' .
        adminIconSvg(adminHeaderLogoIconName($siteData)) .
        '<span>' . adminEscape($logoText) . '</span></div><p>' . $footerText . '</p><div class="social-icons">' .
        $socialMarkup .
        '</div></div></footer>';
}

function adminFrontendHref(string $href): string
{
    if ($href === '') {
        return '../index.html';
    }

    if (str_starts_with($href, '#')) {
        return '../index.html' . $href;
    }

    return $href;
}

function adminRenderHeaderActionLink(string $href, string $label, string $iconSvg, bool $openInNewTab = false): string
{
    $externalAttributes = $openInNewTab ? ' target="_blank" rel="noreferrer"' : '';

    return '<li><a href="' . adminEscape($href) . '" title="' . adminEscape($label) . '" aria-label="' . adminEscape($label) . '"' . $externalAttributes . '>' . $iconSvg . '</a></li>';
}

function adminCurrentRequestUri(): string
{
    $requestUri = $_SERVER['REQUEST_URI'] ?? './admin.php';

    return is_string($requestUri) && $requestUri !== '' ? $requestUri : './admin.php';
}

function adminRenderLocaleSwitcher(string $redirect): string
{
    $currentLocale = adminCurrentLocale();
    $options = '';

    foreach (adminAllowedLocales() as $locale) {
        $label = adminT('locale.code.' . $locale);
        $selected = $locale === $currentLocale ? ' selected' : '';
        $options .= '<option value="' . adminEscape($locale) . '"' . $selected . '>' . adminEscape($label) . '</option>';
    }

    return '<li><form method="post" action="./admin-locale.php" class="admin-locale-switcher">' .
        '<input type="hidden" name="csrf_token" value="' . adminEscape(adminCsrfToken()) . '">' .
        '<input type="hidden" name="redirect" value="' . adminEscape($redirect) . '">' .
        '<select id="admin-locale-switcher" name="locale" title="' . adminEscape(adminT('header.language_switch')) . '" aria-label="' . adminEscape(adminT('header.language_switch')) . '" onchange="this.form.submit()">' .
        $options .
        '</select>' .
    '</form></li>';
}

/**
 * @param array<string, mixed> $siteData
 */
function adminRenderSiteHeader(array $siteData, bool $showMainNavigation = false): string
{
    $branding = adminSiteBranding($siteData);
    $header = isset($siteData['header']) && is_array($siteData['header']) ? $siteData['header'] : [];
    $logoText = isset($branding['logoText']) && $branding['logoText'] !== '' ? (string) $branding['logoText'] : 'lisa.weber';
    $logoIcon = adminHeaderLogoIconName($siteData);

    $mainNavigationMarkup = '';

    if ($showMainNavigation) {
        $mainNavigationItems = '';

        foreach (adminNavigationItems() as $item) {
            $href = $item['href'];
            $label = $item['label'];
            $mainNavigationItems .= '<li><a href="' . adminEscape($href) . '">' . adminEscape($label) . '</a></li>';
        }

        if ($mainNavigationItems !== '') {
            $mainNavigationMarkup = '<nav role="navigation" aria-label="' . adminEscape(adminT('header.navigation')) . '" class="main-nav"><ul>' . $mainNavigationItems . '</ul></nav>';
        }
    }

    $optionItems = '';

    if ($showMainNavigation) {
        // $optionItems .= adminRenderLocaleSwitcher(adminCurrentRequestUri());
        $optionItems .= adminRenderHeaderActionLink('../index.html', adminT('header.open_frontend'), adminIconSvg('switch-camera'), true);
        $optionItems .= adminRenderHeaderActionLink('./change-password.php', adminT('header.change_password'), adminIconSvg('rotate-ccw-key'));
        $optionItems .= adminRenderHeaderActionLink('./logout.php', adminT('header.logout'), adminIconSvg('log-out'));
    }

    $navigationMarkup = '';

    if ($showMainNavigation) {
        $navigationMarkup = '<div id="header-navigation" aria-hidden="true" class="header__nav-wrapper js-header-nav-wrapper">' .
            $mainNavigationMarkup .
            '<nav class="option-nav"><ul>' . $optionItems . '</ul></nav>' .
            '</div>' .
            '<div role="button" aria-expanded="false" aria-controls="header-navigation" aria-label="' . adminEscape(adminT('header.open_navigation')) . '" tabindex="0" class="mobile-nav-toggle" data-mobile-nav-toggle>' .
            adminIconSvg('menu') .
            '</div>';
    }

    return '<header class="header js-header">' .
        '<div class="container header__wrapper">' .
        '<div class="logo">' .
        adminIconSvg($logoIcon) .
        '<span>' . adminEscape($logoText) . '</span>' .
        '</div>' .
        $navigationMarkup .
        '</div>' .
        '</header>';
}

function adminLogout(): void
{
    adminStartSession();
    unset($_SESSION[adminSessionKey()], $_SESSION[adminCsrfKey()]);
}

function adminEnsureAuthenticated(): void
{
    if (adminIsAuthenticated()) {
        return;
    }

    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'message' => adminT('error.access_denied'),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function adminRedirectToLogin(): void
{
    header('Location: ./index.php');
    exit;
}

function adminCsrfToken(): string
{
    adminStartSession();

    if (!isset($_SESSION[adminCsrfKey()]) || !is_string($_SESSION[adminCsrfKey()])) {
        $_SESSION[adminCsrfKey()] = bin2hex(random_bytes(32));
    }

    return $_SESSION[adminCsrfKey()];
}

function adminVerifyCsrfToken(?string $token): bool
{
    adminStartSession();

    if (!is_string($token) || $token === '') {
        return false;
    }

    $sessionToken = $_SESSION[adminCsrfKey()] ?? null;

    return is_string($sessionToken) && hash_equals($sessionToken, $token);
}

/**
 * @return array<string, mixed>
 */
function adminReadJsonFile(string $filePath): array
{
    if (!is_file($filePath) || !is_readable($filePath)) {
        throw new RuntimeException(adminT('error.file_unreadable', ['file' => $filePath]));
    }

    $content = file_get_contents($filePath);

    if ($content === false) {
        throw new RuntimeException(adminT('error.file_unreadable', ['file' => $filePath]));
    }

    try {
        $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new RuntimeException(
            adminT('error.json_invalid_file', ['file' => $filePath, 'message' => $exception->getMessage()]),
            0,
            $exception
        );
    }

    if (!is_array($decoded)) {
        throw new RuntimeException(adminT('error.json_file_object_required', ['file' => $filePath]));
    }

    return $decoded;
}

/**
 * @return array<string, mixed>
 */
function adminLoadSiteData(): array
{
    return adminReadJsonFile(adminDataFile());
}

/**
 * @return array<string, mixed>
 */
function adminLoadTemplateData(): array
{
    return adminReadJsonFile(adminTemplateFile());
}

/**
 * @return array<int, array{href:string,label:string}>
 */
function adminNavigationItems(): array
{
    $items = [];

    try {
        $template = adminLoadTemplateData();
    } catch (RuntimeException $exception) {
        return $items;
    }

    foreach ($template as $key => $value) {
        if (!is_string($key)) {
            continue;
        }

        $items[] = [
            'href' => './admin.php#' . adminFieldId([$key]),
            'label' => adminFieldLabel($key),
        ];
    }

    return $items;
}

/**
 * @param array<string, mixed> $data
 */
function adminSaveSiteData(array $data): void
{
    $directory = dirname(adminDataFile());

    if (!is_dir($directory) || !is_writable($directory)) {
        throw new RuntimeException(adminT('error.data_dir_not_writable'));
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($json === false) {
        throw new RuntimeException(adminT('error.json_encode_failed'));
    }

    $json .= PHP_EOL;
    $temporaryFile = tempnam($directory, 'data-json-');

    if ($temporaryFile === false) {
        throw new RuntimeException(adminT('error.temp_file_failed'));
    }

    if (file_put_contents($temporaryFile, $json, LOCK_EX) === false) {
        @unlink($temporaryFile);
        throw new RuntimeException(adminT('error.temp_json_write_failed'));
    }

    if (!rename($temporaryFile, adminDataFile())) {
        @unlink($temporaryFile);
        throw new RuntimeException(adminT('error.atomic_replace_failed'));
    }
}

/**
 * @param mixed $value
 */
function adminEscape($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function adminFlash(string $type, string $message): void
{
    adminStartSession();
    $_SESSION['admin_flash'] = [
        'type' => $type,
        'message' => $message,
    ];
}

/**
 * @return array{type:string,message:string}|null
 */
function adminConsumeFlash(): ?array
{
    adminStartSession();

    $flash = $_SESSION['admin_flash'] ?? null;
    unset($_SESSION['admin_flash']);

    if (!is_array($flash) || !isset($flash['type'], $flash['message'])) {
        return null;
    }

    return [
        'type' => (string) $flash['type'],
        'message' => (string) $flash['message'],
    ];
}

function adminHumanize(string $value): string
{
    $humanized = preg_replace('/([a-z])([A-Z])/', '$1 $2', $value) ?? $value;
    $humanized = str_replace(['_', '-'], ' ', $humanized);

    return ucfirst(trim($humanized));
}

function adminFieldLabel(string $key): string
{
    return adminTranslationValue('field.' . $key) ?? adminHumanize($key);
}

function adminRepeatableLabel(string $key, string $label): string
{
    return adminTranslationValue('repeatable.' . $key) ?? $label;
}

/**
 * @param array<int, string|int> $path
 */
function adminFieldName(array $path): string
{
    $first = array_shift($path);
    $name = (string) $first;

    foreach ($path as $segment) {
        $name .= '[' . $segment . ']';
    }

    return $name;
}

/**
 * @param array<int, string|int> $path
 */
function adminFieldId(array $path): string
{
    $parts = array_map(
        static function ($segment): string {
            return preg_replace('/[^a-z0-9]+/i', '-', (string) $segment) ?: 'field';
        },
        $path
    );

    return implode('-', $parts);
}

/**
 * @param array<int, string|int> $path
 */
function adminPathContainsArrayIndex(array $path): bool
{
    foreach ($path as $segment) {
        if (is_int($segment)) {
            return true;
        }
    }

    return false;
}

/**
 * @param mixed $value
 */
function adminValueToString($value): string
{
    if (is_bool($value)) {
        return $value ? '1' : '0';
    }

    if ($value === null) {
        return '';
    }

    return (string) $value;
}

/**
 * @param mixed $value
 */
function adminShouldUseTextarea(string $key, $value): bool
{
    if (!is_string($value)) {
        return false;
    }

    if (str_contains($value, "\n")) {
        return true;
    }

    $length = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);

    return in_array($key, ['description', 'text', 'message', 'afterBold', 'intro', 'headline'], true) || $length > 120;
}

/**
 * @param mixed $value
 */
function adminIsAssoc($value): bool
{
    return is_array($value) && array_keys($value) !== range(0, count($value) - 1);
}

/**
 * @param mixed $value
 * @param mixed $existingValue
 * @return mixed
 */
function adminNormalizeSubmittedValue($value, $template, $existingValue = null)
{
    if (is_array($template)) {
        if (adminIsAssoc($template)) {
            $source = is_array($value) ? $value : [];
            $existing = is_array($existingValue) ? $existingValue : [];
            $result = [];

            foreach ($template as $key => $templateValue) {
                if (array_key_exists($key, $source)) {
                    $result[$key] = adminNormalizeSubmittedValue(
                        $source[$key],
                        $templateValue,
                        $existing[$key] ?? null
                    );
                    continue;
                }

                if (array_key_exists($key, $existing)) {
                    $result[$key] = $existing[$key];
                    continue;
                }

                $result[$key] = adminNormalizeSubmittedValue(null, $templateValue, null);
            }

            return $result;
        }

        $source = is_array($value) ? array_values($value) : [];
        $fallbackTemplate = $template[0] ?? '';
        $result = [];

        foreach ($source as $index => $item) {
            $existingItem = is_array($existingValue) && array_key_exists($index, $existingValue) ? $existingValue[$index] : null;
            $itemTemplate = adminResolveArrayItemTemplate($item, $template, $fallbackTemplate);
            $result[] = adminNormalizeSubmittedValue($item, $itemTemplate, $existingItem);
        }

        return $result;
    }

    if (is_bool($template)) {
        if (is_bool($value)) {
            return $value;
        }

        return in_array((string) $value, ['1', 'true', 'on', 'yes'], true);
    }

    if (is_int($template)) {
        return (int) $value;
    }

    if (is_float($template)) {
        return (float) $value;
    }

    return is_scalar($value) || $value === null ? trim((string) $value) : '';
}

/**
 * @param mixed $template
 * @return mixed
 */
function adminEmptyValueFromTemplate($template)
{
    if (is_array($template)) {
        if (adminIsAssoc($template)) {
            $result = [];

            foreach ($template as $key => $templateValue) {
                $result[$key] = adminEmptyValueFromTemplate($templateValue);
            }

            return $result;
        }

        return [];
    }

    if (is_bool($template)) {
        return false;
    }

    if (is_int($template)) {
        return 0;
    }

    if (is_float($template)) {
        return 0.0;
    }

    return '';
}

/**
 * @param array<string, mixed> $template
 * @param array<string, mixed> $existingData
 * @param array<string, mixed> $submittedData
 * @return array<string, mixed>
 */
function adminBuildStructuredPayload(array $template, array $existingData, array $submittedData): array
{
    $payload = [];

    foreach ($template as $key => $value) {
        if (array_key_exists($key, $submittedData)) {
            $payload[$key] = adminNormalizeSubmittedValue($submittedData[$key], $value, $existingData[$key] ?? null);
            continue;
        }

        if (array_key_exists($key, $existingData)) {
            $payload[$key] = $existingData[$key];
            continue;
        }

        $payload[$key] = $value;
    }

    return $payload;
}

/**
 * @param mixed $data
 */
function adminHeadingTagForDepth(int $depth): string
{
    $level = min(max($depth + 2, 2), 6);

    return 'h' . (string) $level;
}

/**
 * @param mixed $data
 */
function adminRenderFields($data, array $template, array $path = ['data'], int $depth = 0): string
{
    $markup = '';

    foreach ($template as $key => $templateValue) {
        $currentPath = [...$path, $key];
        $currentValue = is_array($data) && array_key_exists($key, $data)
            ? $data[$key]
            : (adminPathContainsArrayIndex($path) ? adminEmptyValueFromTemplate($templateValue) : $templateValue);
        $label = adminFieldLabel((string) $key);

        if (is_array($templateValue)) {
            if (adminIsAssoc($templateValue)) {
                $headingTag = adminHeadingTagForDepth($depth);

                if ($depth === 0) {
                    $formId = adminFieldId([$key, 'form']);

                    $markup .= '<section id="' . adminEscape(adminFieldId([$key])) . '" data-depth="' . $depth . '"><div class="container">';
						$markup .= '<p class="preheader">' . adminEscape(adminT('admin.object_fields_for', ['label' => $label])) . '</p>';
						$markup .= '<' . $headingTag . '>' . adminEscape($label) . '</' . $headingTag . '>';
						$markup .= '<div class="card card--default-inner">';
							$markup .= '<div class="card__body">';
								$markup .= '<div class="card__body-wrapper">';
									$markup .= '<form method="post" action="./admin-save.php" id="' . adminEscape($formId) . '" class="admin-form">';
									$markup .= '<input type="hidden" name="mode" value="structured">';
									$markup .= '<input type="hidden" name="csrf_token" value="' . adminEscape(adminCsrfToken()) . '">';
										$markup .= adminRenderFields(
											is_array($currentValue) ? $currentValue : [],
											$templateValue,
											$currentPath,
											$depth + 1
										);
									$markup .= '</form>';
								$markup .= '</div>';
							$markup .= '</div>';
							$markup .= '<div class="card__footer">';
								$markup .= '<button type="submit" form="' . adminEscape($formId) . '" class="btn btn--primary btn--large">' . adminEscape(adminT('admin.save_structure')) . '</button>';
							$markup .= '</div>';
						$markup .= '</div>';
                    $markup .= '</div></section>';
                } else {

					$markup .= '<div data-depth="' . $depth . '" class="admin-nonrepeatable">';
						$markup .= '<' . $headingTag . '>' . adminEscape($label) . '</' . $headingTag . '>';

						$markup .= '<div class="admin-nonrepeatable__items">';
							$markup .= adminRenderFields(
							is_array($currentValue) ? $currentValue : [],
							$templateValue,
							$currentPath,
							$depth + 1
						);
						$markup .= '</div>';
					$markup .= '</div>';
                }

                continue;
            }

            $markup .= adminRenderArrayField((string) $key, $label, $currentPath, $currentValue, $templateValue, $depth);
            continue;
        }

        $markup .= adminRenderScalarField($label, $currentPath, $currentValue, (string) $key);
    }

    return $markup;
}

/**
 * @param array<int, string|int> $path
 * @param mixed $currentValue
 */
function adminRenderScalarField(string $label, array $path, $currentValue, string $key): string
{
    $name = adminFieldName($path);
    $id = adminFieldId($path);
    $value = adminValueToString($currentValue);
    $type = $currentValue === '1' || $currentValue === '0' ? 'text' : 'text';
    $input = '';

    if (is_bool($currentValue)) {
		$input .= '<input type="hidden" id="' . adminEscape($id) . '" name="' . adminEscape($name) . '" value="0">';
		$input .= '<input type="checkbox" id="' . adminEscape($id) . '" name="' . adminEscape($name) . '" value="1"' .
			($currentValue ? ' checked' : '') . '>';
        $input .= '<label for="' . adminEscape($id) . '">' . adminEscape($label) . '</label>';

		return '<div class="form-group"><div class="form-check">' . $input . '</div></div>';
    }

    if (adminIsIconField($key, $currentValue)) {
        return adminRenderIconPickerField($label, $name, $id, $value);
    }

    if (adminIsButtonVariantField($key, $currentValue)) {
        return adminRenderButtonVariantField($label, $name, $id, $value);
    }

    $customSelectOptions = adminCustomSelectOptions($path, $key, $currentValue);

    if ($customSelectOptions !== []) {
        return adminRenderCustomSelectField($label, $name, $id, $value, $customSelectOptions);
    }

    if (adminShouldUseTextarea($key, $currentValue)) {
        $input .= '<label for="' . adminEscape($id) . '">' . adminEscape($label) . '</label>';
        $input .= '<textarea id="' . adminEscape($id) . '" name="' . adminEscape($name) .
            '" rows="">' . adminEscape($value) . '</textarea>';

        return '<div class=form-group">' . $input . '</div>';
    }

    $input .= '<label for="' . adminEscape($id) . '">' . adminEscape($label) . '</label>';
    $input .= '<input type="' . adminEscape($type) . '" id="' . adminEscape($id) . '" name="' .
        adminEscape($name) . '" placeholder="' . adminEscape($label) . '" value="' . adminEscape($value) . '">';

    return '<div class="form-group">' . $input . '</div>';
}

function adminIsIconField(string $key, $currentValue): bool
{
    if (!is_string($currentValue) && !is_numeric($currentValue) && $currentValue !== null) {
        return false;
    }

    return (bool) preg_match('/icon$/i', $key);
}

function adminRenderIconPickerField(string $label, string $name, string $id, string $value): string
{
    $previewIcon = $value !== '' ? adminIconSvg($value) : '';
    $buttonId = $id . '-picker';
    $searchId = $id . '-search';
    $displayValue = $value !== '' ? $value : adminT('admin.icon_picker_placeholder');
    $searchPlaceholder = adminT('admin.icon_picker_search');
    $emptyMessage = adminT('admin.icon_picker_empty');

    $markup = '<div class="form-group admin-icon-picker-field js-admin-icon-picker-field" data-icon-picker>';
    $markup .= '<label for="' . adminEscape($buttonId) . '">' . adminEscape($label) . '</label>';
    $markup .= '<div class="admin-icon-picker js-admin-icon-picker">';
    $markup .= '<input type="hidden" id="' . adminEscape($id) . '" name="' . adminEscape($name) . '" value="' . adminEscape($value) . '" data-icon-picker-input>';
    $markup .= '<button type="button" id="' . adminEscape($buttonId) . '" class="admin-icon-picker__toggle js-admin-icon-picker__toggle" aria-expanded="false" aria-controls="' . adminEscape($id) . '-panel">';
    $markup .= '<span class="admin-icon-picker__toggle-preview js-admin-icon-picker__toggle-preview" data-icon-picker-preview>' . $previewIcon . '</span>';
    $markup .= '<span class="admin-icon-picker__toggle-label js-admin-icon-picker__toggle-label" data-icon-picker-label>' . adminEscape($displayValue) . '</span>';
    $markup .= '<span class="admin-icon-picker__toggle-indicator">' . adminIconSvg('chevron-down') . '</span>';
    $markup .= '</button>';
    $markup .= '<div id="' . adminEscape($id) . '-panel" class="admin-icon-picker__panel js-admin-icon-picker__panel" hidden>';
    $markup .= '<div class="admin-icon-picker__panel-header">';
    $markup .= '<input type="search" id="' . adminEscape($searchId) . '" class="admin-icon-picker__search js-admin-icon-picker__search" placeholder="' . adminEscape($searchPlaceholder) . '" autocomplete="off">';
    $markup .= '<p class="admin-icon-picker__meta js-admin-icon-picker__meta"></p>';
    $markup .= '</div>';
    $markup .= '<div class="admin-icon-picker__options js-admin-icon-picker__options" data-empty-message="' . adminEscape($emptyMessage) . '"></div>';
    $markup .= '</div>';
    $markup .= '</div>';
    $markup .= '</div>';

    return $markup;
}

function adminIsButtonVariantField(string $key, $currentValue): bool
{
    if ($key !== 'variant') {
        return false;
    }

    return is_string($currentValue) || is_numeric($currentValue) || $currentValue === null;
}

function adminButtonVariantOptions(): array
{
    return [
        'btn--primary' => 'btn--primary',
        'btn--secondary' => 'btn--secondary',
        'btn--danger' => 'btn--danger',
    ];
}

function adminRenderButtonVariantField(string $label, string $name, string $id, string $value): string
{
    return adminRenderCustomSelectField($label, $name, $id, $value, adminButtonVariantOptions());
}

/**
 * @param array<int, string|int> $path
 * @param mixed $currentValue
 * @return array<string, string>
 */
function adminCustomSelectOptions(array $path, string $key, $currentValue): array
{
    if (!is_string($currentValue) && !is_numeric($currentValue) && $currentValue !== null) {
        return [];
    }

    $value = adminValueToString($currentValue);

    if ($key === 'type' && adminPathContains($path, 'fields')) {
        return adminContactFieldTypeOptions();
    }

    if ($key === 'label' && adminIsSalutationOptionPath($path) && array_key_exists($value, adminSalutationLabelOptions())) {
        return adminSalutationLabelOptions();
    }

    if ($key === 'value' && adminIsSalutationOptionPath($path) && array_key_exists($value, adminSalutationValueOptions())) {
        return adminSalutationValueOptions();
    }

    return [];
}

/**
 * @return array<string, string>
 */
function adminContactFieldTypeOptions(): array
{
    return [
        'text' => 'text',
        'email' => 'email',
        'textarea' => 'textarea',
        'select' => 'select',
        'radio' => 'radio',
        'checkbox' => 'checkbox',
    ];
}

/**
 * @return array<string, string>
 */
function adminSalutationLabelOptions(): array
{
    return [
        'Anrede' => 'Anrede',
        'Herr' => 'Herr',
        'Frau' => 'Frau',
        'Diverse' => 'Diverse',
    ];
}

/**
 * @return array<string, string>
 */
function adminSalutationValueOptions(): array
{
    return [
        '' => adminT('admin.empty_value'),
        'Herr' => 'Herr',
        'Frau' => 'Frau',
        'Diverse' => 'Diverse',
    ];
}

/**
 * @param array<int, string|int> $path
 */
function adminPathContains(array $path, string $segment): bool
{
    foreach ($path as $pathSegment) {
        if ((string) $pathSegment === $segment) {
            return true;
        }
    }

    return false;
}

/**
 * @param array<int, string|int> $path
 */
function adminIsSalutationOptionPath(array $path): bool
{
    $segments = array_map(static fn ($segment): string => (string) $segment, $path);

    return (bool) preg_match(
        '#^data/contact/form/fields/\d+/options/\d+/(label|value)$#',
        implode('/', $segments)
    );
}

/**
 * @param array<string, string> $options
 */
function adminRenderCustomSelectField(string $label, string $name, string $id, string $value, array $options): string
{
    $buttonId = $id . '-picker';
    $panelId = $id . '-panel';
    $selectedLabel = $options[$value] ?? adminT('admin.custom_select_placeholder');
    $placeholder = adminT('admin.custom_select_placeholder');
    $optionsMarkup = '';
    $nativeOptionsMarkup = '';

    foreach ($options as $optionValue => $optionLabel) {
        $isSelected = $value === (string) $optionValue;
        $selectedClass = $isSelected ? ' is-selected' : '';
        $selectedAttribute = $isSelected ? ' selected' : '';

        if ($placeholder === '' && $optionLabel !== '') {
            $placeholder = $optionLabel;
        }

        $nativeOptionsMarkup .= '<option value="' . adminEscape((string) $optionValue) . '"' . $selectedAttribute . '>' .
            adminEscape($optionLabel) . '</option>';

        $optionsMarkup .= '<button type="button" class="custom-select__option js-custom-select__option' .
            $selectedClass . '" data-custom-select-option data-option-value="' . adminEscape((string) $optionValue) .
            '" aria-selected="' . ($isSelected ? 'true' : 'false') . '" title="' . adminEscape($optionLabel) . '">' .
            adminEscape($optionLabel) . '</button>';
    }

    $markup = '<div class="form-group custom-select-field" data-custom-select data-custom-select-placeholder="' .
        adminEscape($placeholder) . '">';
    $markup .= '<label for="' . adminEscape($buttonId) . '">' . adminEscape($label) . '</label>';
    $markup .= '<div class="custom-select js-custom-select">';
    $markup .= '<select id="' . adminEscape($id) . '" name="' . adminEscape($name) .
        '" class="custom-select__native js-custom-select__native" data-custom-select-native>' .
        $nativeOptionsMarkup . '</select>';
    $markup .= '<div class="custom-select__ui js-custom-select__ui">';
    $markup .= '<button type="button" id="' . adminEscape($buttonId) .
        '" class="custom-select__toggle js-custom-select__toggle" aria-expanded="false" aria-haspopup="listbox" ' .
        'aria-controls="' . adminEscape($panelId) . '">';
    $markup .= '<span class="custom-select__toggle-label js-custom-select__toggle-label" data-custom-select-label>' .
        adminEscape($selectedLabel) . '</span>';
    $markup .= '<span class="custom-select__toggle-indicator">' . adminIconSvg('chevron-down') . '</span>';
    $markup .= '</button>';
    $markup .= '<div id="' . adminEscape($panelId) . '" class="custom-select__panel js-custom-select__panel" role="listbox" hidden>';
    $markup .= '<div class="custom-select__options">' . $optionsMarkup . '</div>';
    $markup .= '</div>';
    $markup .= '</div>';
    $markup .= '</div>';
    $markup .= '</div>';

    return $markup;
}

/**
 * @param array<int, string|int> $path
 * @param mixed $currentValue
 * @param array<int, mixed> $template
 */
function adminRenderArrayField(string $key, string $label, array $path, $currentValue, array $template, int $depth): string
{
    $items = is_array($currentValue) ? array_values($currentValue) : [];
    $prototypeValue = $template[0] ?? '';
    $emptyPrototypeValue = adminEmptyValueFromTemplate($prototypeValue);
    $arrayPrefix = adminFieldName($path);
    $headingTag = adminHeadingTagForDepth($depth);
    $singularLabel = adminRepeatableLabel($key, $label);
    $prototypeMarkup = adminRenderRepeatableItem(
        $singularLabel,
        [...$path, '__INDEX__'],
        $emptyPrototypeValue,
        $prototypeValue,
        $depth + 1,
        true
    );

    $markup = '<div data-repeatable data-array-prefix="' . adminEscape($arrayPrefix) . '" data-depth="' . $depth . '" class="admin-repeatable">';
		$markup .= '<' . $headingTag . '>' . adminEscape($label) . '</' . $headingTag . '>';
    	$markup .= '<template data-repeatable-template>' . $prototypeMarkup . '</template>';
		$markup .= '<div data-repeatable-items class="admin-repeatable__items">';

			foreach ($items as $index => $item) {
                $itemTemplate = adminResolveArrayItemTemplate($item, $template, $prototypeValue);
				$markup .= adminRenderRepeatableItem(
					$singularLabel,
					[...$path, $index],
					$item,
					$itemTemplate,
					$depth + 1,
					false
				);
			}

    	$markup .= '</div>';
    	$markup .= '<div class="admin-repeatable__footer">';
    		$markup .= '<button type="button" class="btn btn--secondary" data-repeatable-add>' . adminEscape(adminT('admin.add_item', ['label' => $singularLabel])) . '</button>';
    $markup .= '</div></div>';

    return $markup;
}

/**
 * @param mixed $item
 * @param array<int, mixed> $template
 * @param mixed $fallbackTemplate
 * @return mixed
 */
function adminResolveArrayItemTemplate($item, array $template, $fallbackTemplate)
{
    if (!is_array($item) || !adminIsAssoc($item)) {
        return $fallbackTemplate;
    }

    $itemType = isset($item['type']) && is_scalar($item['type']) ? (string) $item['type'] : null;
    $itemName = isset($item['name']) && is_scalar($item['name']) ? (string) $item['name'] : null;

    foreach ($template as $candidate) {
        if (!is_array($candidate) || !adminIsAssoc($candidate)) {
            continue;
        }

        $candidateType = isset($candidate['type']) && is_scalar($candidate['type']) ? (string) $candidate['type'] : null;
        $candidateName = isset($candidate['name']) && is_scalar($candidate['name']) ? (string) $candidate['name'] : null;

        if ($itemType !== null && $candidateType === $itemType && $itemName !== null && $candidateName === $itemName) {
            return $candidate;
        }
    }

    foreach ($template as $candidate) {
        if (!is_array($candidate) || !adminIsAssoc($candidate)) {
            continue;
        }

        $candidateType = isset($candidate['type']) && is_scalar($candidate['type']) ? (string) $candidate['type'] : null;

        if ($itemType !== null && $candidateType === $itemType) {
            return $candidate;
        }
    }

    return $fallbackTemplate;
}

/**
 * @param array<int, string|int> $path
 * @param mixed $value
 * @param mixed $templateValue
 */
function adminRenderRepeatableItem(
    string $label,
    array $path,
    $value,
    $templateValue,
    int $depth,
    bool $isPrototype
): string {
    $body = '';
    $itemTitle = adminT('admin.item_entry', ['label' => $label]);

    if (is_array($templateValue) && adminIsAssoc($templateValue)) {
        $body = adminRenderFields(
            is_array($value) ? $value : [],
            $templateValue,
            $path,
            $depth
        );

        if (is_array($value)) {
            foreach (['label', 'title', 'name'] as $titleKey) {
                if (!isset($value[$titleKey]) || !is_scalar($value[$titleKey])) {
                    continue;
                }

                $candidate = trim((string) $value[$titleKey]);

                if ($candidate !== '') {
                    $itemTitle = $candidate;
                    break;
                }
            }
        }
    } elseif (is_array($templateValue)) {
        $body = adminRenderArrayField((string) end($path), $label, $path, $value, $templateValue, $depth);
    } else {
        if (is_scalar($value)) {
            $candidate = trim((string) $value);

            if ($candidate !== '') {
                $itemTitle = $candidate;
            }
        }

        $body = adminRenderScalarField(adminT('admin.item_entry', ['label' => $label]), $path, $value, (string) end($path));
    }

    $classes = 'admin-repeatable-item';

    if ($isPrototype) {
        $classes .= ' is-prototype';
    }

    $markup = '<details class="form-group ' . $classes . '" data-repeatable-item data-default-title="' . adminEscape(adminT('admin.item_entry', ['label' => $label])) . '">';
		$markup .= '<summary class="admin-repeatable-item__summary">';
			$markup .= '<strong data-repeatable-title>' . adminEscape($itemTitle) . '</strong>';
			$markup .= '<span class="btn btn--summary-open" data-repeatable-toggle tabindex="0" role="button" aria-label="' . adminEscape(adminT('admin.toggle_item', ['label' => $itemTitle])) . '">' . adminIconSvg('square-pen') . '</span>';
			$markup .= '<button type="button" class="btn btn--danger" data-repeatable-remove title="' . adminEscape(adminT('admin.remove')) . '" aria-label="' . adminEscape(adminT('admin.remove')) . '">' . adminIconSvg('trash-2') . '</button>';
		$markup .= '</summary>';
    	$markup .= '<div class="admin-repeatable-item__body">';
    		$markup .= $body;
		$markup .= '</div>';
    $markup .= '</details>';

    return $markup;
}
