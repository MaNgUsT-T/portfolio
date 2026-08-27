import { normalizeMetaData } from './app.normalize.meta.js';

function setMetaContent(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
        element.setAttribute('content', value);
    }
}

export function applyMeta(data) {
    const meta = normalizeMetaData(data);

    document.title = meta.title;

    setMetaContent('meta[name="description"]', meta.description);
    setMetaContent('meta[name="keywords"]', meta.keywords);
    setMetaContent('meta[property="og:title"]', meta.ogTitle);
    setMetaContent('meta[property="og:description"]', meta.ogDescription);
    setMetaContent('meta[property="og:image"]', meta.ogImage);
    setMetaContent('meta[property="og:site_name"]', meta.ogSiteName);

    const fluidIcon = document.querySelector('link[rel="fluid-icon"]');
    if (fluidIcon) {
        fluidIcon.setAttribute('title', meta.fluidIconTitle);
    }
}
