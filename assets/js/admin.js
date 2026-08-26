// @prepros-prepend all.js
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

function adminTranslate(key, fallback = '') {
    const translations = window.adminUi && typeof window.adminUi === 'object'
        ? window.adminUi.translations
        : null;

    if (translations && typeof translations[key] === 'string' && translations[key] !== '') {
        return translations[key];
    }

    return fallback || key;
}

function escapeAdminHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAdminAttribute(value) {
    return escapeAdminHtml(value);
}

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
        bindRepeatable(repeatable);
    });
}

function bindRepeatable(repeatable) {
    if (!(repeatable instanceof HTMLElement) || repeatable.dataset.repeatableInitialized === 'true') {
        return;
    }

    repeatable.dataset.repeatableInitialized = 'true';

    const addButton = repeatable.querySelector(':scope > .admin-repeatable__footer [data-repeatable-add]');

    if (addButton) {
        addButton.addEventListener('click', () => {
            const template = repeatable.querySelector(':scope > [data-repeatable-template]');
            const itemsContainer = repeatable.querySelector(':scope > [data-repeatable-items]');

            if (!(template instanceof HTMLTemplateElement) || !itemsContainer) {
                return;
            }

            const nextIndex = itemsContainer.querySelectorAll('[data-repeatable-item]').length;
            const html = template.innerHTML.replaceAll('__INDEX__', String(nextIndex));
            itemsContainer.insertAdjacentHTML('beforeend', html);
            const insertedItem = itemsContainer.lastElementChild;

            if (insertedItem instanceof HTMLElement) {
                insertedItem.classList.remove('is-prototype');
                if (insertedItem instanceof HTMLDetailsElement) {
                    insertedItem.open = true;
                }
                insertedItem.querySelectorAll('[data-repeatable]').forEach((nestedRepeatable) => {
                    bindRepeatable(nestedRepeatable);
                });
                insertedItem.querySelectorAll('[data-custom-select]').forEach((customSelect) => {
                    bindCustomSelect(customSelect);
                });
                insertedItem.querySelectorAll('[data-icon-picker]').forEach((iconPicker) => {
                    bindIconPicker(iconPicker);
                });
                updateRepeatableTitle(insertedItem);
            }

            normalizeRepeatableIndexes(repeatable);
        });
    }

    repeatable.addEventListener('click', (event) => {
            const toggle = event.target instanceof Element
                ? event.target.closest('[data-repeatable-toggle]')
                : null;

            if (toggle) {
                event.preventDefault();
                event.stopPropagation();

                const summary = toggle.closest('summary');

                if (summary instanceof HTMLElement) {
                    summary.click();
                }

                return;
            }

            const button = event.target instanceof Element
                ? event.target.closest('[data-repeatable-remove]')
                : null;

            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const shouldRemove = window.confirm(adminTranslate('admin.remove_confirm', 'Diesen Eintrag wirklich löschen?'));

            if (!shouldRemove) {
                return;
            }

            const item = button.closest('[data-repeatable-item]');

            if (item) {
                item.remove();
                normalizeRepeatableIndexes(repeatable);
            }
        });

    repeatable.addEventListener('keydown', (event) => {
            const toggle = event.target instanceof Element
                ? event.target.closest('[data-repeatable-toggle]')
                : null;

            if (!toggle || (event.key !== 'Enter' && event.key !== ' ')) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const summary = toggle.closest('summary');

            if (summary instanceof HTMLElement) {
                summary.click();
            }
        });

    repeatable.addEventListener('input', (event) => {
            const target = event.target instanceof Element ? event.target.closest('[data-repeatable-item]') : null;

            if (!(target instanceof HTMLElement)) {
                return;
            }

            updateRepeatableTitle(target);
        });

    repeatable.querySelectorAll('[data-repeatable-item]').forEach((item) => {
        if (item instanceof HTMLElement) {
            updateRepeatableTitle(item);
        }
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
    const idIndexPattern = /(?:__INDEX__|\d+)(?=(?:-[a-z0-9]+)*$)/i;
    const fields = item.querySelectorAll('input[name], textarea[name], select[name]');
    const elementsWithId = item.querySelectorAll('[id]');
    const labels = item.querySelectorAll('label[for]');
    const elementsWithAriaControls = item.querySelectorAll('[aria-controls]');
    const repeatables = item.querySelectorAll('[data-repeatable]');
    const templates = item.querySelectorAll('[data-repeatable-template]');

    fields.forEach((field) => {
        const currentName = field.getAttribute('name');

        if (!currentName) {
            return;
        }

        field.setAttribute('name', currentName.replace(indexPattern, `${prefix}[${index}]`));
    });

    elementsWithId.forEach((element) => {
        const currentId = element.getAttribute('id');

        if (!currentId || !idIndexPattern.test(currentId)) {
            return;
        }

        element.setAttribute('id', currentId.replace(idIndexPattern, String(index)));
    });

    labels.forEach((label) => {
        const currentFor = label.getAttribute('for');

        if (!currentFor || !idIndexPattern.test(currentFor)) {
            return;
        }

        label.setAttribute('for', currentFor.replace(idIndexPattern, String(index)));
    });

    elementsWithAriaControls.forEach((element) => {
        const currentAriaControls = element.getAttribute('aria-controls');

        if (!currentAriaControls || !idIndexPattern.test(currentAriaControls)) {
            return;
        }

        element.setAttribute('aria-controls', currentAriaControls.replace(idIndexPattern, String(index)));
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

function updateRepeatableTitle(item) {
    const titleElement = item.querySelector('[data-repeatable-title]');

    if (!titleElement) {
        return;
    }

    const defaultTitle = item.getAttribute('data-default-title') || '';
    const titleSelectors = [
        '[name$="[label]"]',
        '[name$="[title]"]',
        '[name$="[name]"]',
        'input[name]:not([type="hidden"])',
        'textarea[name]',
        'select[name]',
    ];
    let titleValue = '';

    for (const selector of titleSelectors) {
        const titleField = item.querySelector(selector);

        if (
            !(titleField instanceof HTMLInputElement)
            && !(titleField instanceof HTMLTextAreaElement)
            && !(titleField instanceof HTMLSelectElement)
        ) {
            continue;
        }

        const candidate = titleField.value.trim();

        if (candidate !== '') {
            titleValue = candidate;
            break;
        }
    }

    titleElement.textContent = titleValue || defaultTitle;
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

function initializeIconPickers() {
    const pickers = document.querySelectorAll('[data-icon-picker]');

    pickers.forEach((picker) => {
        bindIconPicker(picker);
    });
}

function bindIconPicker(picker) {
    if (!(picker instanceof HTMLElement) || picker.dataset.iconPickerInitialized === 'true') {
        return;
    }

    picker.dataset.iconPickerInitialized = 'true';

    const root = picker.querySelector('.js-admin-icon-picker');
    const input = picker.querySelector('[data-icon-picker-input]');
    const toggle = picker.querySelector('.js-admin-icon-picker__toggle');
    const panel = picker.querySelector('.js-admin-icon-picker__panel');
    const preview = picker.querySelector('[data-icon-picker-preview]');
    const label = picker.querySelector('[data-icon-picker-label]');
    const search = picker.querySelector('.js-admin-icon-picker__search');
    const meta = picker.querySelector('.js-admin-icon-picker__meta');
    const optionsContainer = picker.querySelector('.js-admin-icon-picker__options');

    if (
        !(root instanceof HTMLElement)
        || !(input instanceof HTMLInputElement)
        || !(toggle instanceof HTMLButtonElement)
        || !(panel instanceof HTMLElement)
        || !(preview instanceof HTMLElement)
        || !(label instanceof HTMLElement)
        || !(search instanceof HTMLInputElement)
        || !(meta instanceof HTMLElement)
        || !(optionsContainer instanceof HTMLElement)
    ) {
        return;
    }

    const iconEntries = Object.keys(iconsCache || {}).sort((left, right) => left.localeCompare(right));
    const placeholder = adminTranslate('admin.icon_picker_placeholder', 'Icon auswählen');
    const emptyMessage = optionsContainer.dataset.emptyMessage || adminTranslate('admin.icon_picker_empty', 'Keine Icons gefunden.');
    const iconWord = adminTranslate('field.icon', 'Icon');

    search.placeholder = adminTranslate('admin.icon_picker_search', 'Icon suchen') + ' ' + iconEntries.length + ' Icons...';

    function closePicker() {
        root.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
    }

    function renderOptions(filterValue = '') {
        const normalizedFilter = filterValue.trim().toLowerCase();
        const filteredEntries = iconEntries.filter((entry) => entry.toLowerCase().includes(normalizedFilter));

        if (!filteredEntries.length) {
            optionsContainer.innerHTML = '';
            meta.textContent = emptyMessage;
            return;
        }

        meta.textContent = filteredEntries.length + ' ' + (filteredEntries.length === 1 ? iconWord : 'Icons');

        optionsContainer.innerHTML = filteredEntries.map((entry) => {
            const isSelected = input.value === entry;
            const selectedClass = isSelected ? ' is-selected' : '';

            return [
                '<button type="button" class="admin-icon-picker__option js-admin-icon-picker__option' + selectedClass +
                    '" data-icon-picker-option data-icon-value="' + escapeAdminAttribute(entry) + '" aria-pressed="' +
                    String(isSelected) + '" aria-label="' + escapeAdminAttribute(entry) + '" title="' + escapeAdminAttribute(entry) + '">',
                '<span class="admin-icon-picker__option-preview">' + icon(entry) + '</span>',
                '<span class="admin-icon-picker__option-label">' + escapeAdminHtml(entry) + '</span>',
                '</button>',
            ].join('');
        }).join('');
    }

    function setSelectedValue(value) {
        const normalizedValue = value.trim();
        const iconSvg = normalizedValue !== '' ? icon(normalizedValue) : '';

        input.value = normalizedValue;
        preview.innerHTML = iconSvg;
        label.textContent = normalizedValue !== '' ? normalizedValue : placeholder;

        optionsContainer.querySelectorAll('[data-icon-picker-option]').forEach((option) => {
            if (!(option instanceof HTMLButtonElement)) {
                return;
            }

            const isSelected = option.dataset.iconValue === normalizedValue;
            option.classList.toggle('is-selected', isSelected);
            option.setAttribute('aria-pressed', String(isSelected));
        });

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function openPicker() {
        root.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        renderOptions(search.value);
        search.focus();
    }

    toggle.addEventListener('click', () => {
        if (panel.hidden) {
            openPicker();
            return;
        }

        closePicker();
    });

    search.addEventListener('input', () => {
        renderOptions(search.value);
    });

    optionsContainer.addEventListener('click', (event) => {
        const option = event.target instanceof Element
            ? event.target.closest('[data-icon-picker-option]')
            : null;

        if (!(option instanceof HTMLButtonElement)) {
            return;
        }

        setSelectedValue(option.dataset.iconValue || '');
        closePicker();
        toggle.focus();
    });

    document.addEventListener('click', (event) => {
        if (!(event.target instanceof Node) || picker.contains(event.target)) {
            return;
        }

        closePicker();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
            closePicker();
            toggle.focus();
        }
    });

    renderOptions();
    setSelectedValue(input.value);
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
        submitButton.innerHTML = isSubmitting ? adminTranslate('auth.login_submitting', 'Login wird geprüft...') : defaultSubmitHtml;
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

                setStatus(result.payload.message || adminTranslate('auth.login_failed', 'Der Login ist fehlgeschlagen.'), 'error');
                return;
            }

            if (typeof result.payload.redirect === 'string' && result.payload.redirect !== '') {
                window.location.href = result.payload.redirect;
                return;
            }

            setStatus(result.payload.message || adminTranslate('auth.login_success', 'Die Admin-Oberfläche wurde geöffnet.'), 'success');
        }).catch(() => {
            setStatus(adminTranslate('auth.connection_failed', 'Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.'), 'error');
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
        submitButton.innerHTML = isSubmitting ? adminTranslate('auth.change_password_submitting', 'Passwort wird gespeichert...') : defaultSubmitHtml;
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

                setStatus(result.payload.message || adminTranslate('auth.change_password_failed', 'Das Passwort konnte nicht geändert werden.'), 'error');
                return;
            }

            form.reset();
            setStatus(result.payload.message || adminTranslate('auth.change_password_success_short', 'Das Passwort wurde geändert.'), 'success');
        }).catch(() => {
            setStatus(adminTranslate('auth.connection_failed', 'Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.'), 'error');
        }).finally(() => {
            setSubmitting(false);
        });
    });
}
