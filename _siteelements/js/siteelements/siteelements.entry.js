import { headerScrollInitialize } from '../../../assets/js/shared/header.js';
import { loadIcons } from '../../../assets/js/shared/icons.js';
import { mobileNavigationInitialize } from '../../../assets/js/shared/mobile-navigation.js';
import { themeInitialize } from '../../../assets/js/shared/theme.js';
import { initializeCustomSelects } from '../../../assets/js/shared/custom-select.js';
import { demoCarouselInitialize } from './siteelements.carousel.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadIcons();
    } catch (error) {
        console.error(error);
    }

    themeInitialize();
    headerScrollInitialize();
    mobileNavigationInitialize();
    demoCarouselInitialize();
    initializeCustomSelects();
});
