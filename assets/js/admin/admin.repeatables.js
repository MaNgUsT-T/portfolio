import { bindCustomSelect } from '../shared/all.js';
import { bindIconPicker } from './admin.icon-picker.js';
import { adminTranslate } from './admin.utils.js';

export function initializeRepeatables() {
    const repeatables = document.querySelectorAll('[data-repeatable]');

    repeatables.forEach((repeatable) => {
        bindRepeatable(repeatable);
    });
}

function bindRepeatable(repeatable) {
    // Each repeatable root is bound once and then manages add/remove, keyboard
    // support and title updates for all current and future child items.
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
                // Newly inserted markup can contain nested repeatables and
                // custom widgets, so those hooks must be rebound immediately.
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
    // The same positional token appears in field names, ids and nested data
    // attributes. Rewriting all of them together keeps cloned items unique and
    // preserves the submitted JSON structure expected by the backend.
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

    repeatables.forEach((repeatableElement) => {
        const currentPrefix = repeatableElement.getAttribute('data-array-prefix');

        if (!currentPrefix) {
            return;
        }

        repeatableElement.setAttribute(
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

    // Prefer semantic label/title/name fields before falling back to the first
    // visible input so collapsed cards keep a useful summary in the UI.
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
