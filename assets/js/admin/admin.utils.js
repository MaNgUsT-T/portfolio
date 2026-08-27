export function adminTranslate(key, fallback = '') {
    const translations = window.adminUi && typeof window.adminUi === 'object'
        ? window.adminUi.translations
        : null;

    if (translations && typeof translations[key] === 'string' && translations[key] !== '') {
        return translations[key];
    }

    return fallback || key;
}

export function escapeAdminHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function escapeAdminAttribute(value) {
    return escapeAdminHtml(value);
}
