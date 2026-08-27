<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminEnsureAuthenticated();

function adminValidationFieldLabel(string ...$segments): string
{
    return implode(' > ', array_map(static function (string $segment): string {
        return adminFieldLabel($segment);
    }, $segments));
}

function adminIsNonEmptyString(mixed $value): bool
{
    return is_string($value) && trim($value) !== '';
}

function adminIsValidLinkTarget(string $value): bool
{
    if ($value === '') {
        return false;
    }

    if (
        $value === '#'
        || str_starts_with($value, '#')
        || str_starts_with($value, './')
        || str_starts_with($value, '../')
        || str_starts_with($value, '/')
    ) {
        return true;
    }

    if (preg_match('/^mailto:/i', $value) === 1) {
        return filter_var($value, FILTER_VALIDATE_URL) !== false;
    }

    return filter_var($value, FILTER_VALIDATE_URL) !== false;
}

/**
 * @param array<string, mixed> $payload
 */
function adminAssertObjectField(array $payload, string $key): void
{
    if (
        !array_key_exists($key, $payload)
        || !is_array($payload[$key])
        || ($payload[$key] !== [] && !adminIsAssoc($payload[$key]))
    ) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminFieldLabel($key)]));
    }
}

/**
 * @param array<string, mixed> $payload
 */
function adminAssertListField(array $payload, string $key, string $labelKey): void
{
    if (!array_key_exists($key, $payload) || !is_array($payload[$key]) || !array_is_list($payload[$key])) {
        throw new RuntimeException(adminT('error.invalid_list_field', ['field' => adminFieldLabel($labelKey)]));
    }
}

/**
 * @param array<string, mixed> $payload
 */
function adminAssertNestedObjectField(array $payload, string $parentKey, string $childKey): void
{
    adminAssertObjectField($payload, $parentKey);

    $parent = $payload[$parentKey];

    if (
        !is_array($parent)
        || !array_key_exists($childKey, $parent)
        || !is_array($parent[$childKey])
        || ($parent[$childKey] !== [] && !adminIsAssoc($parent[$childKey]))
    ) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminFieldLabel($childKey)]));
    }
}

/**
 * @param array<string, mixed> $payload
 */
function adminAssertDirectObjectField(array $payload, string $key, string $labelKey): void
{
    if (
        !array_key_exists($key, $payload)
        || !is_array($payload[$key])
        || ($payload[$key] !== [] && !adminIsAssoc($payload[$key]))
    ) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminFieldLabel($labelKey)]));
    }
}

/**
 * @param array<string, mixed> $payload
 */
function adminAssertDoubleNestedListField(array $payload, string $parentKey, string $childObjectKey, string $listKey): void
{
    adminAssertNestedObjectField($payload, $parentKey, $childObjectKey);

    $parent = $payload[$parentKey];
    $childObject = is_array($parent) ? ($parent[$childObjectKey] ?? null) : null;

    if (!is_array($childObject) || !array_key_exists($listKey, $childObject) || !is_array($childObject[$listKey]) || !array_is_list($childObject[$listKey])) {
        throw new RuntimeException(adminT('error.invalid_list_field', ['field' => adminFieldLabel($listKey)]));
    }
}

/**
 * @param array<string, mixed> $context
 */
function adminAssertRequiredString(array $context, string $key, string $label): void
{
    if (!array_key_exists($key, $context) || !adminIsNonEmptyString($context[$key])) {
        throw new RuntimeException(adminT('error.required_string_field', ['field' => $label]));
    }
}

/**
 * @param array<string, mixed> $context
 */
function adminAssertOptionalString(array $context, string $key, string $label): void
{
    if (array_key_exists($key, $context) && $context[$key] !== '' && !is_string($context[$key])) {
        throw new RuntimeException(adminT('error.invalid_string_field', ['field' => $label]));
    }
}

/**
 * @param array<string, mixed> $context
 */
function adminAssertBooleanField(array $context, string $key, string $label): void
{
    if (array_key_exists($key, $context) && !is_bool($context[$key])) {
        throw new RuntimeException(adminT('error.invalid_boolean_field', ['field' => $label]));
    }
}

/**
 * @param array<string, mixed> $context
 */
function adminAssertPositiveIntegerField(array $context, string $key, string $label): void
{
    if (!array_key_exists($key, $context)) {
        return;
    }

    $value = $context[$key];

    if (!is_int($value) || $value < 1) {
        throw new RuntimeException(adminT('error.invalid_integer_field', ['field' => $label]));
    }
}

/**
 * @param array<string, mixed> $context
 */
function adminAssertRequiredUrlField(array $context, string $key, string $label): void
{
    adminAssertRequiredString($context, $key, $label);

    if (!adminIsValidLinkTarget((string) $context[$key])) {
        throw new RuntimeException(adminT('error.invalid_url_field', ['field' => $label]));
    }
}

/**
 * @param array<string, mixed> $button
 */
function adminValidateButton(array $button, string $label): void
{
    adminAssertRequiredString($button, 'label', $label . ' > ' . adminFieldLabel('label'));
    adminAssertOptionalString($button, 'variant', $label . ' > ' . adminFieldLabel('variant'));
    adminAssertBooleanField($button, 'large', $label . ' > ' . adminFieldLabel('large'));
    adminAssertOptionalString($button, 'icon', $label . ' > ' . adminFieldLabel('icon'));

    if (array_key_exists('href', $button)) {
        adminAssertRequiredUrlField($button, 'href', $label . ' > ' . adminFieldLabel('action'));
    }
}

/**
 * @param array<string, mixed> $image
 */
function adminValidateImage(array $image, string $label): void
{
    adminAssertRequiredUrlField($image, 'src', $label . ' > ' . adminFieldLabel('src'));
    adminAssertRequiredString($image, 'alt', $label . ' > ' . adminFieldLabel('alt'));
    adminAssertOptionalString($image, 'width', $label . ' > ' . adminFieldLabel('width'));
    adminAssertOptionalString($image, 'height', $label . ' > ' . adminFieldLabel('height'));
    adminAssertOptionalString($image, 'loading', $label . ' > ' . adminFieldLabel('loading'));
    adminAssertOptionalString($image, 'className', $label . ' > ' . adminFieldLabel('className'));

    if (array_key_exists('responsive', $image)) {
        if (!is_array($image['responsive']) || !array_is_list($image['responsive'])) {
            throw new RuntimeException(adminT('error.invalid_list_field', ['field' => $label . ' > ' . adminFieldLabel('responsive')]));
        }

        foreach ($image['responsive'] as $source) {
            if (!is_array($source)) {
                throw new RuntimeException(adminT('error.invalid_object_field', ['field' => $label . ' > ' . adminFieldLabel('responsive')]));
            }

            adminAssertRequiredString($source, 'media', $label . ' > ' . adminFieldLabel('responsive') . ' > media');
            adminAssertRequiredUrlField($source, 'srcset', $label . ' > ' . adminFieldLabel('responsive') . ' > srcset');
        }
    }
}

/**
 * @param array<string, mixed> $field
 */
function adminValidateContactField(array $field, int $index): void
{
    $fieldLabel = adminFieldLabel('fields') . ' #' . ($index + 1);

    adminAssertRequiredString($field, 'label', $fieldLabel . ' > ' . adminFieldLabel('label'));
    adminAssertRequiredString($field, 'type', $fieldLabel . ' > ' . adminFieldLabel('type'));
    adminAssertRequiredString($field, 'name', $fieldLabel . ' > ' . adminFieldLabel('name'));
    adminAssertBooleanField($field, 'required', $fieldLabel . ' > ' . adminFieldLabel('required'));
    adminAssertBooleanField($field, 'row', $fieldLabel . ' > ' . adminFieldLabel('row'));
    adminAssertOptionalString($field, 'placeholder', $fieldLabel . ' > ' . adminFieldLabel('placeholder'));
    adminAssertOptionalString($field, 'errorRequired', $fieldLabel . ' > ' . adminFieldLabel('errorRequired'));
    adminAssertOptionalString($field, 'errorTooLong', $fieldLabel . ' > ' . adminFieldLabel('errorTooLong'));
    adminAssertOptionalString($field, 'errorInvalid', $fieldLabel . ' > ' . adminFieldLabel('errorInvalid'));
    adminAssertPositiveIntegerField($field, 'maxLength', $fieldLabel . ' > ' . adminFieldLabel('maxLength'));

    $type = is_string($field['type'] ?? null) ? $field['type'] : 'text';

    if (in_array($type, ['text', 'email', 'textarea', 'select', 'checkbox'], true)) {
        adminAssertRequiredString($field, 'id', $fieldLabel . ' > ' . adminFieldLabel('id'));
    }

    if ($type === 'textarea') {
        adminAssertPositiveIntegerField($field, 'rows', $fieldLabel . ' > ' . adminFieldLabel('rows'));
    }

    if ($type === 'checkbox') {
        adminAssertOptionalString($field, 'value', $fieldLabel . ' > ' . adminFieldLabel('value'));
    }

    if (in_array($type, ['select', 'radio'], true)) {
        if (!array_key_exists('options', $field) || !is_array($field['options']) || !array_is_list($field['options'])) {
            throw new RuntimeException(adminT('error.invalid_list_field', ['field' => $fieldLabel . ' > ' . adminFieldLabel('options')]));
        }

        foreach ($field['options'] as $optionIndex => $option) {
            if (!is_array($option)) {
                throw new RuntimeException(adminT('error.invalid_object_field', ['field' => $fieldLabel . ' > ' . adminFieldLabel('options')]));
            }

            $optionLabel = $fieldLabel . ' > ' . adminFieldLabel('options') . ' #' . ($optionIndex + 1);
            adminAssertRequiredString($option, 'label', $optionLabel . ' > ' . adminFieldLabel('label'));
            if ($type === 'radio') {
                adminAssertRequiredString($option, 'value', $optionLabel . ' > ' . adminFieldLabel('value'));
            } else {
                adminAssertOptionalString($option, 'value', $optionLabel . ' > ' . adminFieldLabel('value'));
            }

            if ($type === 'radio') {
                adminAssertRequiredString($option, 'id', $optionLabel . ' > ' . adminFieldLabel('id'));
            }

            if (array_key_exists('selected', $option) && !is_bool($option['selected'])) {
                throw new RuntimeException(adminT('error.invalid_boolean_field', ['field' => $optionLabel . ' > ' . adminFieldLabel('selected')]));
            }
        }
    }
}

/**
 * @param array<string, mixed> $payload
 */
function adminValidateBusinessRules(array $payload): void
{
    $meta = $payload['meta'];
    $site = $payload['site'];
    $header = $payload['header'];
    $hero = $payload['hero'];
    $about = $payload['about'];
    $skills = $payload['skills'];
    $experience = $payload['experience'];
    $projects = $payload['projects'];
    $education = $payload['education'];
    $contact = $payload['contact'];
    $contactForm = is_array($contact['form'] ?? null) ? $contact['form'] : [];
    $contactIntroCard = is_array($contact['introCard'] ?? null) ? $contact['introCard'] : [];
    $footer = $payload['footer'];

    foreach (['title', 'description', 'keywords', 'ogTitle', 'ogDescription', 'ogImage', 'ogSiteName', 'fluidIconTitle'] as $metaField) {
        adminAssertRequiredString($meta, $metaField, adminValidationFieldLabel('meta', $metaField));
    }

    adminAssertRequiredString($site, 'logoIcon', adminValidationFieldLabel('site', 'logoIcon'));
    adminAssertRequiredString($site, 'logoText', adminValidationFieldLabel('site', 'logoText'));

    if (array_key_exists('socialLinks', $site)) {
        if (!is_array($site['socialLinks']) || !array_is_list($site['socialLinks'])) {
            throw new RuntimeException(adminT('error.invalid_list_field', ['field' => adminValidationFieldLabel('site', 'socialLinks')]));
        }

        foreach ($site['socialLinks'] as $index => $link) {
            if (!is_array($link)) {
                throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('site', 'socialLinks')]));
            }

            $linkLabel = adminValidationFieldLabel('site', 'socialLinks') . ' #' . ($index + 1);
            adminAssertRequiredUrlField($link, 'href', $linkLabel . ' > href');
            adminAssertRequiredString($link, 'title', $linkLabel . ' > title');
            adminAssertRequiredString($link, 'icon', $linkLabel . ' > ' . adminFieldLabel('icon'));
        }
    }

    foreach ($header['navigation'] as $index => $item) {
        if (!is_array($item)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('header', 'navigation')]));
        }

        $itemLabel = adminValidationFieldLabel('header', 'navigation') . ' #' . ($index + 1);
        adminAssertRequiredUrlField($item, 'href', $itemLabel . ' > href');
        adminAssertRequiredString($item, 'label', $itemLabel . ' > ' . adminFieldLabel('label'));
        adminAssertOptionalString($item, 'title', $itemLabel . ' > title');
    }

    if (!is_array($header['resumeLink'] ?? null)) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('header', 'action')]));
    }

    adminAssertRequiredUrlField($header['resumeLink'], 'href', adminValidationFieldLabel('header', 'action') . ' > href');
    adminAssertRequiredString($header['resumeLink'], 'label', adminValidationFieldLabel('header', 'action') . ' > ' . adminFieldLabel('label'));

    adminAssertRequiredString($hero, 'availability', adminValidationFieldLabel('hero', 'availability'));
    adminAssertRequiredString($hero, 'headline', adminValidationFieldLabel('hero', 'headline'));
    adminAssertRequiredString($hero, 'intro', adminValidationFieldLabel('hero', 'intro'));

    if (!array_key_exists('buttons', $hero) || !is_array($hero['buttons']) || !array_is_list($hero['buttons'])) {
        throw new RuntimeException(adminT('error.invalid_list_field', ['field' => adminValidationFieldLabel('hero', 'buttons')]));
    }

    foreach ($hero['buttons'] as $index => $button) {
        if (!is_array($button)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('hero', 'buttons')]));
        }

        adminValidateButton($button, adminValidationFieldLabel('hero', 'buttons') . ' #' . ($index + 1));
    }

    foreach (['id', 'preheader', 'title'] as $field) {
        adminAssertRequiredString($about, $field, adminValidationFieldLabel('about', $field));
    }

    foreach ($about['paragraphs'] as $index => $paragraph) {
        if (!adminIsNonEmptyString($paragraph)) {
            throw new RuntimeException(adminT('error.required_string_field', ['field' => adminValidationFieldLabel('about', 'paragraphs') . ' #' . ($index + 1)]));
        }
    }

    foreach ($about['cards'] as $index => $card) {
        if (!is_array($card)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('about', 'aboutCards')]));
        }

        $cardLabel = adminValidationFieldLabel('about', 'aboutCards') . ' #' . ($index + 1);
        adminAssertRequiredString($card, 'title', $cardLabel . ' > ' . adminFieldLabel('title'));
        adminAssertRequiredString($card, 'text', $cardLabel . ' > text');
        adminAssertRequiredString($card, 'icon', $cardLabel . ' > ' . adminFieldLabel('icon'));
    }

    foreach ($about['images'] ?? [] as $index => $image) {
        if (!is_array($image)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('about', 'images')]));
        }

        adminValidateImage($image, adminValidationFieldLabel('about', 'images') . ' #' . ($index + 1));
    }

    foreach (['id', 'preheader', 'title'] as $field) {
        adminAssertRequiredString($skills, $field, adminValidationFieldLabel('skills', $field));
    }

    foreach ($skills['skills'] as $index => $group) {
        if (!is_array($group)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('skills', 'skills')]));
        }

        $groupLabel = adminValidationFieldLabel('skills', 'skills') . ' #' . ($index + 1);
        adminAssertRequiredString($group, 'title', $groupLabel . ' > ' . adminFieldLabel('title'));
        adminAssertRequiredString($group, 'icon', $groupLabel . ' > ' . adminFieldLabel('icon'));

        if (!array_key_exists('items', $group) || !is_array($group['items']) || !array_is_list($group['items'])) {
            throw new RuntimeException(adminT('error.invalid_list_field', ['field' => $groupLabel . ' > ' . adminFieldLabel('items')]));
        }

        foreach ($group['items'] as $itemIndex => $item) {
            if (!adminIsNonEmptyString($item)) {
                throw new RuntimeException(adminT('error.required_string_field', ['field' => $groupLabel . ' > ' . adminFieldLabel('items') . ' #' . ($itemIndex + 1)]));
            }
        }
    }

    foreach (['id', 'preheader', 'title'] as $field) {
        adminAssertRequiredString($experience, $field, adminValidationFieldLabel('experience', $field));
    }

    foreach ($experience['experience'] as $index => $item) {
        if (!is_array($item)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('experience', 'experience')]));
        }

        $itemLabel = adminValidationFieldLabel('experience', 'experience') . ' #' . ($index + 1);
        foreach (['date', 'title', 'company', 'location'] as $field) {
            adminAssertRequiredString($item, $field, $itemLabel . ' > ' . adminHumanize($field));
        }

        if (!array_key_exists('points', $item) || !is_array($item['points']) || !array_is_list($item['points'])) {
            throw new RuntimeException(adminT('error.invalid_list_field', ['field' => $itemLabel . ' > ' . adminFieldLabel('points')]));
        }

        foreach ($item['points'] as $pointIndex => $point) {
            if (!adminIsNonEmptyString($point)) {
                throw new RuntimeException(adminT('error.required_string_field', ['field' => $itemLabel . ' > ' . adminFieldLabel('points') . ' #' . ($pointIndex + 1)]));
            }
        }
    }

    foreach (['id', 'preheader', 'title'] as $field) {
        adminAssertRequiredString($projects, $field, adminValidationFieldLabel('projects', $field));
    }

    foreach ($projects['projects'] as $index => $item) {
        if (!is_array($item)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('projects', 'projects')]));
        }

        $itemLabel = adminValidationFieldLabel('projects', 'projects') . ' #' . ($index + 1);
        foreach (['category', 'title', 'description', 'highlight'] as $field) {
            adminAssertRequiredString($item, $field, $itemLabel . ' > ' . adminHumanize($field));
        }
        adminAssertRequiredUrlField($item, 'href', $itemLabel . ' > href');

        if (!array_key_exists('tags', $item) || !is_array($item['tags']) || !array_is_list($item['tags'])) {
            throw new RuntimeException(adminT('error.invalid_list_field', ['field' => $itemLabel . ' > ' . adminFieldLabel('tags')]));
        }

        foreach ($item['tags'] as $tagIndex => $tag) {
            if (!adminIsNonEmptyString($tag)) {
                throw new RuntimeException(adminT('error.required_string_field', ['field' => $itemLabel . ' > ' . adminFieldLabel('tags') . ' #' . ($tagIndex + 1)]));
            }
        }

        if (!is_array($item['image'] ?? null)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => $itemLabel . ' > ' . adminFieldLabel('image')]));
        }

        adminValidateImage($item['image'], $itemLabel . ' > ' . adminFieldLabel('image'));
    }

    foreach (['preheader', 'title', 'carouselLabel'] as $field) {
        adminAssertRequiredString($education, $field, adminValidationFieldLabel('education', $field));
    }

    foreach ($education['courses'] as $index => $course) {
        if (!is_array($course)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('education', 'courses')]));
        }

        $courseLabel = adminValidationFieldLabel('education', 'courses') . ' #' . ($index + 1);
        foreach (['title', 'provider', 'year', 'status'] as $field) {
            adminAssertRequiredString($course, $field, $courseLabel . ' > ' . adminHumanize($field));
        }
    }

    foreach (['id', 'preheader', 'title'] as $field) {
        adminAssertRequiredString($contact, $field, adminValidationFieldLabel('contact', $field));
    }

    if ($contactIntroCard === []) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('contact', 'introCard')]));
    }

    foreach (['title', 'text', 'linkLabel'] as $field) {
        adminAssertRequiredString($contactIntroCard, $field, adminValidationFieldLabel('contact', 'introCard') . ' > ' . adminHumanize($field));
    }

    if ($contactForm === []) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('contact', 'form')]));
    }

    adminAssertRequiredUrlField($contactForm, 'action', adminValidationFieldLabel('contact', 'action'));

    foreach ($contactForm['fields'] as $index => $field) {
        if (!is_array($field)) {
            throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('contact', 'fields')]));
        }

        adminValidateContactField($field, $index);
    }

    if (!is_array($contactForm['submitButton'] ?? null)) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('contact', 'submitButton')]));
    }

    adminValidateButton($contactForm['submitButton'], adminValidationFieldLabel('contact', 'submitButton'));

    if (!is_array($contactForm['messages'] ?? null)) {
        throw new RuntimeException(adminT('error.invalid_object_field', ['field' => adminValidationFieldLabel('contact', 'messages')]));
    }

    foreach (['methodNotAllowed', 'honeypotSuccess', 'validationFailed', 'mailFailed', 'mailSuccess', 'defaultTooLong', 'mailSubjectPrefix', 'emptySubjectFallback'] as $field) {
        adminAssertRequiredString($contactForm['messages'], $field, adminValidationFieldLabel('contact', 'messages') . ' > ' . adminHumanize($field));
    }

    foreach (['text', 'copyright', 'owner'] as $field) {
        adminAssertRequiredString($footer, $field, adminValidationFieldLabel('footer', $field));
    }
}

/**
 * @param array<string, mixed> $payload
 */
function adminValidateSiteDataPayload(array $payload): void
{
    foreach (['meta', 'site', 'header', 'hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact', 'footer'] as $objectField) {
        adminAssertObjectField($payload, $objectField);
    }

    adminAssertListField($payload['header'], 'navigation', 'navigation');
    adminAssertDirectObjectField($payload['header'], 'resumeLink', 'action');
    adminAssertListField($payload['about'], 'paragraphs', 'paragraphs');
    adminAssertListField($payload['about'], 'cards', 'aboutCards');
    adminAssertListField($payload['about'], 'images', 'images');
    adminAssertListField($payload['skills'], 'skills', 'skills');
    adminAssertListField($payload['experience'], 'experience', 'experience');
    adminAssertListField($payload['projects'], 'projects', 'projects');
    adminAssertListField($payload['education'], 'courses', 'courses');
    adminAssertNestedObjectField($payload, 'contact', 'introCard');
    adminAssertDoubleNestedListField($payload, 'contact', 'form', 'fields');
    adminAssertNestedObjectField($payload['contact'], 'form', 'submitButton');
    adminAssertNestedObjectField($payload['contact'], 'form', 'messages');
    adminValidateBusinessRules($payload);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    adminFlash('error', adminT('error.request_not_allowed'));
    header('Location: ./admin.php');
    exit;
}

$csrfToken = isset($_POST['csrf_token']) && is_string($_POST['csrf_token']) ? $_POST['csrf_token'] : null;

if (!adminVerifyCsrfToken($csrfToken)) {
    adminFlash('error', adminT('error.request_unconfirmed'));
    header('Location: ./admin.php');
    exit;
}

$mode = isset($_POST['mode']) && is_string($_POST['mode']) ? $_POST['mode'] : 'structured';

try {
    if ($mode === 'json') {
        $jsonPayload = isset($_POST['json-payload']) && is_string($_POST['json-payload']) ? $_POST['json-payload'] : '';
        $decoded = json_decode($jsonPayload, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($decoded)) {
            throw new RuntimeException(adminT('error.json_object_required'));
        }

        adminValidateSiteDataPayload($decoded);
        adminSaveSiteData($decoded);
        adminFlash('success', adminT('success.json_saved'));
        header('Location: ./admin.php');
        exit;
    }

    $submittedData = $_POST['data'] ?? null;

    if (!is_array($submittedData)) {
        throw new RuntimeException(adminT('error.structured_data_missing'));
    }

    $template = adminLoadTemplateData();
    $existingData = adminLoadSiteData();
    $payload = adminBuildStructuredPayload($template, $existingData, $submittedData);
    adminValidateSiteDataPayload($payload);
    adminSaveSiteData($payload);
    adminFlash('success', adminT('success.content_saved'));
} catch (JsonException $exception) {
    adminFlash('error', adminT('error.json_invalid_prefix', ['message' => $exception->getMessage()]));
} catch (RuntimeException $exception) {
    adminFlash('error', $exception->getMessage());
}

header('Location: ./admin.php');
exit;
