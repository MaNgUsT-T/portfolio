document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadIcons();
    } catch (error) {
        console.error(error);
    }

    headerScrollInitialize();
    mobileNavigationInitialize();
    initializeTabs();
    initializeRepeatables();
    initializeCustomSelects();
    initializeIconPickers();
    initializePasswordVisibility();
    initializeLoginForm();
    initializeChangePasswordForm();
});
