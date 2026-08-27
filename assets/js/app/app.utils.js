// Shared coercion and escaping helpers keep the normalize and render layers
// defensive when older or incomplete JSON payloads are loaded.
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function objectOrEmpty(value) {
    return isPlainObject(value) ? value : {};
}

function arrayOrEmpty(value) {
    return Array.isArray(value) ? value : [];
}

function stringOrEmpty(value) {
    return typeof value === 'string' ? value : '';
}

function booleanOrFalse(value) {
    return value === true;
}

function numberOrEmpty(value) {
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : stringOrEmpty(value);
}

function objectArrayOrEmpty(value) {
    // Normalize mixed arrays into object-only collections so downstream mappers
    // can read keys without repeating guard clauses in every section module.
    return arrayOrEmpty(value).map(function(item) {
        return objectOrEmpty(item);
    });
}

function stringArrayOrEmpty(value) {
    return arrayOrEmpty(value).filter(function(item) {
        return typeof item === 'string';
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    // Attribute escaping intentionally mirrors HTML escaping because all
    // current call sites write into quoted attribute values.
    return escapeHtml(value);
}
