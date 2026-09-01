import { getIconMap, icon } from '../shared/icons.js';
import { adminTranslate, escapeAdminAttribute, escapeAdminHtml } from './admin.utils.js';

export function initializeIconPickers() {
    const pickers = document.querySelectorAll('[data-icon-picker]');

    pickers.forEach((picker) => {
        bindIconPicker(picker);
    });
}

export function bindIconPicker(picker) {
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

    const iconEntries = Object.keys(getIconMap()).sort((left, right) => left.localeCompare(right));
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
