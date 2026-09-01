import { initializeCustomSelects } from '../shared/custom-select.js';
import { headerScrollInitialize } from '../shared/header.js';
import { loadIcons } from '../shared/icons.js';
import { initializeModal } from '../shared/modal.js';
import { mobileNavigationInitialize } from '../shared/mobile-navigation.js';
import { initializeChangePasswordForm, initializeLoginForm } from './admin.auth-forms.js';
import { initializeImageFields } from './admin.image-field.js';
import { initializeIconPickers } from './admin.icon-picker.js';
import { initializePasswordVisibility } from './admin.password-visibility.js';
import { initializeRepeatables } from './admin.repeatables.js';
import { initializeTabs } from './admin.tabs.js';

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
    initializeModal();
    initializeImageFields();
    initializeTabs();
    initializeRepeatables();
    initializeCustomSelects();
    initializeIconPickers();
    initializePasswordVisibility();
    initializeLoginForm();
    initializeChangePasswordForm();
});
