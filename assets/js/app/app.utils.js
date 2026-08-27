// Shared coercion and escaping helpers keep the normalize and render layers
// defensive when older or incomplete JSON payloads are loaded.
export function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function objectOrEmpty(value) {
    return isPlainObject(value) ? value : {};
}

export function arrayOrEmpty(value) {
    return Array.isArray(value) ? value : [];
}

export function stringOrEmpty(value) {
    return typeof value === 'string' ? value : '';
}

export function booleanOrFalse(value) {
    return value === true;
}

export function numberOrEmpty(value) {
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : stringOrEmpty(value);
}

export function objectArrayOrEmpty(value) {
    // Normalize mixed arrays into object-only collections so downstream mappers
    // can read keys without repeating guard clauses in every section module.
    return arrayOrEmpty(value).map(function(item) {
        return objectOrEmpty(item);
    });
}

export function stringArrayOrEmpty(value) {
    return arrayOrEmpty(value).filter(function(item) {
        return typeof item === 'string';
    });
}

export function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function escapeAttribute(value) {
    // Attribute escaping intentionally mirrors HTML escaping because all
    // current call sites write into quoted attribute values.
    return escapeHtml(value);
}
