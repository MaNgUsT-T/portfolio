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
