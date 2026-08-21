// @prepros-prepend all.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadIcons();
    } catch (error) {
        console.error(error);
    }

    themeInitialize();
    headerScrollInitialize();
    mobileNavigationInitialize();
    initializeTabs();
    initializeRepeatables();
    initializePasswordVisibility();
    initializeLoginForm();
    initializeChangePasswordForm();
});

function initializeTabs() {
    const tabRoot = document.querySelector('[data-tabs]');

    if (!tabRoot) {
        return;
    }

    const triggers = tabRoot.querySelectorAll('[data-tab-trigger]');
    const panels = tabRoot.querySelectorAll('[data-tab-panel]');

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const target = trigger.getAttribute('data-tab-trigger');

            triggers.forEach((item) => {
                item.classList.toggle('is-active', item === trigger);
            });

            panels.forEach((panel) => {
                const isActive = panel.getAttribute('data-tab-panel') === target;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
        });
    });
}

function initializeRepeatables() {
    const repeatables = document.querySelectorAll('[data-repeatable]');

    repeatables.forEach((repeatable) => {
        const addButton = repeatable.querySelector('[data-repeatable-add]');

        if (addButton) {
            addButton.addEventListener('click', () => {
                const template = repeatable.querySelector('[data-repeatable-template]');
                const itemsContainer = repeatable.querySelector('[data-repeatable-items]');

                if (!(template instanceof HTMLTemplateElement) || !itemsContainer) {
                    return;
                }

                const nextIndex = itemsContainer.querySelectorAll('[data-repeatable-item]').length;
                const html = template.innerHTML.replaceAll('__INDEX__', String(nextIndex));
                itemsContainer.insertAdjacentHTML('beforeend', html);
                normalizeRepeatableIndexes(repeatable);
            });
        }

        repeatable.addEventListener('click', (event) => {
            const button = event.target instanceof Element
                ? event.target.closest('[data-repeatable-remove]')
                : null;

            if (!button) {
                return;
            }

            const item = button.closest('[data-repeatable-item]');

            if (item) {
                item.remove();
                normalizeRepeatableIndexes(repeatable);
            }
        });
    });
}

function normalizeRepeatableIndexes(repeatable) {
    const items = repeatable.querySelectorAll('[data-repeatable-item]');
    const prefix = repeatable.getAttribute('data-array-prefix');

    if (!prefix) {
        return;
    }

    items.forEach((item, index) => {
        updateNamesForIndex(item, prefix, index);
    });
}

function updateNamesForIndex(item, prefix, index) {
    const escapedPrefix = escapeRegExp(prefix);
    const indexPattern = new RegExp(`${escapedPrefix}\\[(?:__INDEX__|\\d+)\\]`);
    const fields = item.querySelectorAll('input[name], textarea[name], select[name]');
    const repeatables = item.querySelectorAll('[data-repeatable]');
    const templates = item.querySelectorAll('[data-repeatable-template]');

    fields.forEach((field) => {
        const currentName = field.getAttribute('name');

        if (!currentName) {
            return;
        }

        field.setAttribute('name', currentName.replace(indexPattern, `${prefix}[${index}]`));
    });

    repeatables.forEach((repeatable) => {
        const currentPrefix = repeatable.getAttribute('data-array-prefix');

        if (!currentPrefix) {
            return;
        }

        repeatable.setAttribute(
            'data-array-prefix',
            currentPrefix.replace(indexPattern, `${prefix}[${index}]`)
        );
    });

    templates.forEach((template) => {
        template.innerHTML = template.innerHTML.replace(indexPattern, `${prefix}[${index}]`);
    });
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
            toggle.setAttribute('aria-label', showPassword ? 'Passwort verbergen' : 'Passwort anzeigen');
            toggle.setAttribute('title', showPassword ? 'Passwort verbergen' : 'Passwort anzeigen');
            toggle.innerHTML = showPassword ? icon('eye-off') : icon('eye');
        });
    });
}

function initializeLoginForm() {
    const form = document.querySelector('#auth-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[form="auth-form"][type="submit"]');
    const statusElement = form.closest('.card__body-wrapper')?.querySelector('[data-form-status]') ?? null;
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    function escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function setStatus(message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.innerHTML = message;
        statusElement.dataset.formStatus = type;
    }

    function clearErrors() {
        form.querySelectorAll('[data-form-error]').forEach((errorElement) => {
            errorElement.innerHTML = '';
        });

        form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
            field.removeAttribute('aria-invalid');
        });
    }

    function normalizeMessages(messages) {
        if (Array.isArray(messages)) {
            return messages.filter((message) => typeof message === 'string' && message !== '');
        }

        if (typeof messages === 'string' && messages !== '') {
            return [messages];
        }

        return [];
    }

    function renderErrors(errors) {
        Object.keys(errors).forEach((name) => {
            const messages = normalizeMessages(errors[name]);
            const errorElement = form.querySelector('[data-form-error="' + name + '"]');
            const field = form.elements[name];

            if (errorElement) {
                errorElement.innerHTML = messages.map((message) => escapeHtml(message)).join('<br>');
            }

            if (field instanceof HTMLElement) {
                field.setAttribute('aria-invalid', 'true');
            }
        });
    }

    function setSubmitting(isSubmitting) {
        form.setAttribute('aria-busy', String(isSubmitting));

        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.innerHTML = isSubmitting ? 'Login wird geprüft...' : defaultSubmitHtml;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        clearErrors();
        setStatus('', '');
        setSubmitting(true);

        fetch(form.getAttribute('action') || window.location.href, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                Accept: 'application/json'
            }
        }).then((response) => {
            return response.json().then((payload) => {
                return {
                    ok: response.ok,
                    payload: payload
                };
            });
        }).then((result) => {
            if (!result.ok || !result.payload.ok) {
                if (result.payload.errors) {
                    renderErrors(result.payload.errors);
                }

                setStatus(result.payload.message || 'Der Login ist fehlgeschlagen.', 'error');
                return;
            }

            if (typeof result.payload.redirect === 'string' && result.payload.redirect !== '') {
                window.location.href = result.payload.redirect;
                return;
            }

            setStatus(result.payload.message || 'Die Admin-Oberfläche wurde geöffnet.', 'success');
        }).catch(() => {
            setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
        }).finally(() => {
            setSubmitting(false);
        });
    });
}

function initializeChangePasswordForm() {
    const form = document.querySelector('#change-password-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[form="change-password-form"][type="submit"]');
    const statusElement = form.closest('.card__body-wrapper')?.querySelector('[data-form-status]') ?? null;
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    function escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function setStatus(message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.innerHTML = message;
        statusElement.dataset.formStatus = type;
    }

    function clearErrors() {
        form.querySelectorAll('[data-form-error]').forEach((errorElement) => {
            errorElement.innerHTML = '';
        });

        form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
            field.removeAttribute('aria-invalid');
        });
    }

    function normalizeMessages(messages) {
        if (Array.isArray(messages)) {
            return messages.filter((message) => typeof message === 'string' && message !== '');
        }

        if (typeof messages === 'string' && messages !== '') {
            return [messages];
        }

        return [];
    }

    function renderErrors(errors) {
        Object.keys(errors).forEach((name) => {
            const messages = normalizeMessages(errors[name]);
            const errorElement = form.querySelector('[data-form-error="' + name + '"]');
            const field = form.elements[name];

            if (errorElement) {
                errorElement.innerHTML = messages.map((message) => escapeHtml(message)).join('<br>');
            }

            if (field instanceof HTMLElement) {
                field.setAttribute('aria-invalid', 'true');
            }
        });
    }

    function setSubmitting(isSubmitting) {
        form.setAttribute('aria-busy', String(isSubmitting));

        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.innerHTML = isSubmitting ? 'Passwort wird gespeichert...' : defaultSubmitHtml;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        clearErrors();
        setStatus('', '');
        setSubmitting(true);

        fetch(form.getAttribute('action') || window.location.href, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                Accept: 'application/json'
            }
        }).then((response) => {
            return response.json().then((payload) => {
                return {
                    ok: response.ok,
                    payload: payload
                };
            });
        }).then((result) => {
            if (!result.ok || !result.payload.ok) {
                if (result.payload.errors) {
                    renderErrors(result.payload.errors);
                }

                setStatus(result.payload.message || 'Das Passwort konnte nicht geändert werden.', 'error');
                return;
            }

            form.reset();
            setStatus(result.payload.message || 'Das Passwort wurde geändert.', 'success');
        }).catch(() => {
            setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
        }).finally(() => {
            setSubmitting(false);
        });
    });
}
