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
    session_start();
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
        throw new RuntimeException('Die Passwort-Konfiguration ist nicht beschreibbar.');
    }

    $configContent = file_get_contents($configFile);

    if ($configContent === false) {
        throw new RuntimeException('Die Passwort-Konfiguration konnte nicht gelesen werden.');
    }

    $hash = password_hash($newPassword, PASSWORD_DEFAULT);

    if ($hash === false) {
        throw new RuntimeException('Das neue Passwort konnte nicht gehasht werden.');
    }

    $updatedContent = preg_replace_callback(
        "/'password_hash' => '[^']*',/",
        static fn (): string => "'password_hash' => '" . $hash . "',",
        $configContent,
        1,
        $replacementCount
    );

    if ($updatedContent === null || $replacementCount !== 1) {
        throw new RuntimeException('Der Passwort-Hash konnte nicht aktualisiert werden.');
    }

    if (file_put_contents($configFile, $updatedContent) === false) {
        throw new RuntimeException('Die Passwort-Konfiguration konnte nicht geschrieben werden.');
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
        $errors[] = 'Das neue Passwort muss mindestens 10 Zeichen lang sein.';
    }

    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = 'Das neue Passwort muss mindestens eine Zahl enthalten.';
    }

    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Das neue Passwort muss mindestens einen Großbuchstaben enthalten.';
    }

    if (preg_match('/[^a-zA-Z0-9]/', $password) !== 1) {
        $errors[] = 'Das neue Passwort muss mindestens ein Sonderzeichen enthalten.';
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
function adminHeaderLogoIconName(array $siteData): string
{
    $header = isset($siteData['header']) && is_array($siteData['header']) ? $siteData['header'] : [];
    $logoIcon = isset($header['logoIcon']) ? trim((string) $header['logoIcon']) : '';

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
    $footer = isset($siteData['footer']) && is_array($siteData['footer']) ? $siteData['footer'] : [];
    $logoText = isset($footer['logoText']) ? (string) $footer['logoText'] : adminTitle();
    $text = isset($footer['text']) ? (string) $footer['text'] : '';
    $copyright = isset($footer['copyright']) ? (string) $footer['copyright'] : '';
    $owner = isset($footer['owner']) ? (string) $footer['owner'] : '';
    $socialLinks = isset($footer['socialLinks']) && is_array($footer['socialLinks']) ? $footer['socialLinks'] : [];

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
        adminIconSvg('palette') .
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
    $attributes = $openInNewTab ? ' target="_blank" rel="noreferrer"' : '';

    return '<li><a class="btn btn--secondary admin-header-action" href="' . adminEscape($href) . '"' . $attributes . '>' .
        '<span class="admin-header-action__icon">' . $iconSvg . '</span>' .
        '<span>' . adminEscape($label) . '</span>' .
        '</a></li>';
}

/**
 * @param array<string, mixed> $siteData
 */
function adminRenderSiteHeader(array $siteData, bool $showMainNavigation = false): string
{
    $header = isset($siteData['header']) && is_array($siteData['header']) ? $siteData['header'] : [];
    $logoText = isset($header['logoText']) ? (string) $header['logoText'] : 'lisa.weber';
    $logoIcon = adminHeaderLogoIconName($siteData);
    $navigation = isset($header['navigation']) && is_array($header['navigation']) ? $header['navigation'] : [];

    $mainNavigationMarkup = '';

    if ($showMainNavigation) {
        $mainNavigationItems = '';

        foreach ($navigation as $item) {
            if (!is_array($item)) {
                continue;
            }

            $href = isset($item['href']) ? adminFrontendHref((string) $item['href']) : '../index.html';
            $label = isset($item['label']) ? (string) $item['label'] : '';

            if ($label === '') {
                continue;
            }

            $mainNavigationItems .= '<li><a href="' . adminEscape($href) . '">' . adminEscape($label) . '</a></li>';
        }

        if ($mainNavigationItems !== '') {
            $mainNavigationMarkup = '<nav role="navigation" aria-label="Navigation" class="main-nav"><ul>' .
                $mainNavigationItems .
                '</ul></nav>';
        }
    }

    $optionItems = '<li><a href="#" title="Dunkles Theme aktivieren" aria-label="Dunkles Theme aktivieren" aria-pressed="false" data-theme-toggle>' .
        adminIconSvg('moon') .
        '</a></li>';

    if ($showMainNavigation) {
        $optionItems .= adminRenderHeaderActionLink('../index.html', 'Frontend öffnen', adminIconSvg('switch-camera'), true);
        $optionItems .= adminRenderHeaderActionLink('./change-password.php', 'Passwort ändern', adminIconSvg('rotate-ccw-key'));
        $optionItems .= adminRenderHeaderActionLink('./logout.php', 'Logout', adminIconSvg('log-out'));
    }

    return '<header class="header js-header"><div class="container header__wrapper"><div class="logo">' .
        adminIconSvg($logoIcon) .
        '<span>' . adminEscape($logoText) . '</span></div><div id="header-navigation" aria-hidden="true" class="header__nav-wrapper js-header-nav-wrapper">' .
        $mainNavigationMarkup .
        '<nav class="option-nav"><ul>' . $optionItems . '</ul></nav></div><div role="button" aria-expanded="false" aria-controls="header-navigation" aria-label="Navigation öffnen" tabindex="0" class="mobile-nav-toggle" data-mobile-nav-toggle>' .
        adminIconSvg('menu') .
        '</div></div></header>';
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
        'message' => 'Der Zugriff wurde verweigert.',
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
        throw new RuntimeException(sprintf('Die Datei "%s" konnte nicht gelesen werden.', $filePath));
    }

    $content = file_get_contents($filePath);

    if ($content === false) {
        throw new RuntimeException(sprintf('Die Datei "%s" konnte nicht gelesen werden.', $filePath));
    }

    try {
        $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new RuntimeException(
            sprintf('Die JSON-Datei "%s" ist ungültig: %s', $filePath, $exception->getMessage()),
            0,
            $exception
        );
    }

    if (!is_array($decoded)) {
        throw new RuntimeException(sprintf('Die JSON-Datei "%s" muss ein Objekt enthalten.', $filePath));
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
 * @param array<string, mixed> $data
 */
function adminSaveSiteData(array $data): void
{
    $directory = dirname(adminDataFile());

    if (!is_dir($directory) || !is_writable($directory)) {
        throw new RuntimeException('Das Datenverzeichnis ist nicht beschreibbar.');
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($json === false) {
        throw new RuntimeException('Die Daten konnten nicht in JSON umgewandelt werden.');
    }

    $json .= PHP_EOL;
    $temporaryFile = tempnam($directory, 'data-json-');

    if ($temporaryFile === false) {
        throw new RuntimeException('Es konnte keine temporäre Datei erzeugt werden.');
    }

    if (file_put_contents($temporaryFile, $json, LOCK_EX) === false) {
        @unlink($temporaryFile);
        throw new RuntimeException('Die temporäre JSON-Datei konnte nicht geschrieben werden.');
    }

    if (!rename($temporaryFile, adminDataFile())) {
        @unlink($temporaryFile);
        throw new RuntimeException('Die JSON-Datei konnte nicht atomar ersetzt werden.');
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

    return in_array($key, ['description', 'text', 'message', 'afterBold'], true) || $length > 120;
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
 * @return mixed
 */
function adminNormalizeSubmittedValue($value, $template)
{
    if (is_array($template)) {
        if (adminIsAssoc($template)) {
            $source = is_array($value) ? $value : [];
            $result = [];

            foreach ($template as $key => $templateValue) {
                $result[$key] = adminNormalizeSubmittedValue($source[$key] ?? null, $templateValue);
            }

            return $result;
        }

        $source = is_array($value) ? array_values($value) : [];
        $itemTemplate = $template[0] ?? '';
        $result = [];

        foreach ($source as $item) {
            $result[] = adminNormalizeSubmittedValue($item, $itemTemplate);
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
 * @param array<string, mixed> $template
 * @param array<string, mixed> $submittedData
 * @return array<string, mixed>
 */
function adminBuildStructuredPayload(array $template, array $submittedData): array
{
    $payload = [];

    foreach ($template as $key => $value) {
        $payload[$key] = adminNormalizeSubmittedValue($submittedData[$key] ?? null, $value);
    }

    return $payload;
}

/**
 * @param mixed $data
 */
function adminRenderFields($data, array $template, array $path = ['data'], int $depth = 0): string
{
    $markup = '';

    foreach ($template as $key => $templateValue) {
        $currentPath = [...$path, $key];
        $currentValue = is_array($data) && array_key_exists($key, $data) ? $data[$key] : $templateValue;
        $label = adminHumanize((string) $key);

        if (is_array($templateValue)) {
            if (adminIsAssoc($templateValue)) {
                $markup .= '<section class="admin-group admin-group--object" data-depth="' . $depth . '">';
                $markup .= '<div class="admin-group__header">';
                $markup .= '<h3>' . adminEscape($label) . '</h3>';
                $markup .= '<p>' . adminEscape('Objektfelder für ' . $label) . '</p>';
                $markup .= '</div>';
                $markup .= '<div class="admin-group__body">';
                $markup .= adminRenderFields(
                    is_array($currentValue) ? $currentValue : [],
                    $templateValue,
                    $currentPath,
                    $depth + 1
                );
                $markup .= '</div></section>';
                continue;
            }

            $markup .= adminRenderArrayField($label, $currentPath, $currentValue, $templateValue, $depth);
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
        $input .= '<label class="admin-checkbox">';
        $input .= '<input type="hidden" name="' . adminEscape($name) . '" value="0">';
        $input .= '<input type="checkbox" name="' . adminEscape($name) . '" value="1"' .
            ($currentValue ? ' checked' : '') . '>';
        $input .= '<span>' . adminEscape($label) . '</span>';
        $input .= '</label>';

        return '<div class="admin-field admin-field--checkbox">' . $input . '</div>';
    }

    if (adminShouldUseTextarea($key, $currentValue)) {
        $input .= '<label class="admin-label" for="' . adminEscape($id) . '">' . adminEscape($label) . '</label>';
        $input .= '<textarea id="' . adminEscape($id) . '" name="' . adminEscape($name) .
            '" rows="4">' . adminEscape($value) . '</textarea>';

        return '<div class="admin-field admin-field--textarea">' . $input . '</div>';
    }

    $input .= '<label class="admin-label" for="' . adminEscape($id) . '">' . adminEscape($label) . '</label>';
    $input .= '<input id="' . adminEscape($id) . '" type="' . adminEscape($type) . '" name="' .
        adminEscape($name) . '" value="' . adminEscape($value) . '">';

    return '<div class="admin-field">' . $input . '</div>';
}

/**
 * @param array<int, string|int> $path
 * @param mixed $currentValue
 * @param array<int, mixed> $template
 */
function adminRenderArrayField(string $label, array $path, $currentValue, array $template, int $depth): string
{
    $items = is_array($currentValue) ? array_values($currentValue) : [];
    $prototypeValue = $template[0] ?? '';
    $arrayPrefix = adminFieldName($path);
    $prototypeMarkup = adminRenderRepeatableItem(
        $label,
        [...$path, '__INDEX__'],
        $prototypeValue,
        $prototypeValue,
        $depth + 1,
        true
    );

    $markup = '<section class="admin-group admin-group--array" data-depth="' . $depth . '">';
    $markup .= '<div class="admin-group__header">';
    $markup .= '<h3>' . adminEscape($label) . '</h3>';
    $markup .= '<p>' . adminEscape('Liste mit wiederholbaren Einträgen') . '</p>';
    $markup .= '</div>';
    $markup .= '<div class="admin-repeatable" data-repeatable data-array-prefix="' . adminEscape($arrayPrefix) . '">';
    $markup .= '<template data-repeatable-template>' . $prototypeMarkup . '</template>';
    $markup .= '<div class="admin-repeatable__items" data-repeatable-items>';

    foreach ($items as $index => $item) {
        $markup .= adminRenderRepeatableItem(
            $label,
            [...$path, $index],
            $item,
            $prototypeValue,
            $depth + 1,
            false
        );
    }

    $markup .= '</div>';
    $markup .= '<div class="admin-repeatable__footer">';
    $markup .= '<button type="button" class="admin-button admin-button--ghost" data-repeatable-add>' .
        adminEscape($label . ' hinzufügen') . '</button>';
    $markup .= '</div></div></section>';

    return $markup;
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

    if (is_array($templateValue) && adminIsAssoc($templateValue)) {
        $body = adminRenderFields(
            is_array($value) ? $value : [],
            $templateValue,
            $path,
            $depth
        );
    } elseif (is_array($templateValue)) {
        $body = adminRenderArrayField($label, $path, $value, $templateValue, $depth);
    } else {
        $body = adminRenderScalarField($label . ' Eintrag', $path, $value, (string) end($path));
    }

    $classes = 'admin-repeatable-item';

    if ($isPrototype) {
        $classes .= ' is-prototype';
    }

    $markup = '<article class="' . $classes . '" data-repeatable-item>';
    $markup .= '<div class="admin-repeatable-item__header">';
    $markup .= '<strong>' . adminEscape($label . ' Eintrag') . '</strong>';
    $markup .= '<button type="button" class="admin-button admin-button--danger" data-repeatable-remove>' .
        adminEscape('Entfernen') . '</button>';
    $markup .= '</div>';
    $markup .= '<div class="admin-repeatable-item__body">' . $body . '</div>';
    $markup .= '</article>';

    return $markup;
}
