let iconsCache = null;
let iconsPromise = null;

export function icon(name) {
    if (!iconsCache || typeof iconsCache[name] !== 'string') {
        return '';
    }

    return iconsCache[name];
}

function resolveIconsPath() {
    return window.location.pathname.includes('/admin/') || window.location.pathname.includes('/_siteelements/')
        ? '../data/icons.json'
        : './data/icons.json';
}

export async function loadIcons() {
    if (iconsCache) {
        return iconsCache;
    }

    if (iconsPromise) {
        return iconsPromise;
    }

    iconsPromise = fetch(resolveIconsPath(), {
        cache: 'no-store',
        headers: {
            Accept: 'application/json'
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('icons.json konnte nicht geladen werden.');
            }

            return response.json();
        })
        .then((data) => {
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('icons.json enthält kein gültiges Objekt.');
            }

            iconsCache = Object.fromEntries(
                Object.entries(data).filter((entry) => typeof entry[0] === 'string' && typeof entry[1] === 'string')
            );

            return iconsCache;
        })
        .catch((error) => {
            iconsPromise = null;
            throw error;
        });

    return iconsPromise;
}

export function getIconMap() {
    return iconsCache || {};
}
