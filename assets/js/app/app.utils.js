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
    return escapeHtml(value);
}
