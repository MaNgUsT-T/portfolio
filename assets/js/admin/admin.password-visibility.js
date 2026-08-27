function initializePasswordVisibility() {
    const toggles = document.querySelectorAll('[data-password-toggle]');

    toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const wrapper = toggle.closest('.js-password-input');

            if (!wrapper) {
                return;
            }

            const field = wrapper.querySelector('[data-password-field]');
            if (!(field instanceof HTMLInputElement)) {
                return;
            }

            const showPassword = field.type === 'password';
            field.type = showPassword ? 'text' : 'password';
            toggle.setAttribute('aria-label', showPassword
                ? adminTranslate('auth.hide_password', 'Passwort verbergen')
                : adminTranslate('auth.show_password', 'Passwort anzeigen'));
            toggle.setAttribute('title', showPassword
                ? adminTranslate('auth.hide_password', 'Passwort verbergen')
                : adminTranslate('auth.show_password', 'Passwort anzeigen'));
            toggle.innerHTML = showPassword ? icon('eye-off') : icon('eye');
        });
    });
}
