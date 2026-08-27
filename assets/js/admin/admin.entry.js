import {
    headerScrollInitialize,
    initializeCustomSelects,
    loadIcons,
    mobileNavigationInitialize,
} from '../shared/all.js';
import { initializeChangePasswordForm, initializeLoginForm } from './admin.auth-forms.js';
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
    initializeTabs();
    initializeRepeatables();
    initializeCustomSelects();
    initializeIconPickers();
    initializePasswordVisibility();
    initializeLoginForm();
    initializeChangePasswordForm();
});
