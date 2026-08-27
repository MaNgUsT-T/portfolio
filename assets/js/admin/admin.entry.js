// Initialize shared UI helpers before auth forms so navigation, tabs and form
// enhancements are ready when login or password views are rendered.
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
