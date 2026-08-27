import {
    headerScrollInitialize,
    initializeCustomSelects,
    loadIcons,
    mobileNavigationInitialize,
    themeInitialize,
} from '../shared/all.js';
import { contactFormInitialize } from './app.contact-form.js';
import { bootstrapContent } from './app.data.js';
import { educationCarouselInitialize } from './app.education-carousel.js';

// Bootstraps content first so all DOM-dependent enhancements run against the
// rendered markup instead of an empty placeholder.
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadIcons();
        await bootstrapContent();
    } catch (error) {
        console.error(error);
        const root = document.querySelector('[data-site-root]');

        if (root) {
            root.innerHTML = '<p>Die Portfoliodaten konnten nicht geladen werden.</p>';
        }
        return;
    }

    themeInitialize();
    headerScrollInitialize();
    mobileNavigationInitialize();
    initializeCustomSelects();
    educationCarouselInitialize();
    contactFormInitialize();
});
