export function initializeCustomSelects(rootNode = document) {
    const customSelects = rootNode.querySelectorAll('[data-custom-select]');

    customSelects.forEach((customSelect) => {
        bindCustomSelect(customSelect);
    });
}

export function bindCustomSelect(customSelect) {
    if (!(customSelect instanceof HTMLElement) || customSelect.dataset.customSelectInitialized === 'true') {
        return;
    }

    const root = customSelect.querySelector('.js-custom-select');
    const nativeSelect = customSelect.querySelector('[data-custom-select-native]');
    const toggle = customSelect.querySelector('.js-custom-select__toggle');
    const panel = customSelect.querySelector('.js-custom-select__panel');
    const label = customSelect.querySelector('.js-custom-select__toggle-label');
    const optionButtons = Array.from(customSelect.querySelectorAll('[data-custom-select-option]')).filter((option) => {
        return option instanceof HTMLButtonElement;
    });

    if (
        !(root instanceof HTMLElement)
        || !(nativeSelect instanceof HTMLSelectElement)
        || !(toggle instanceof HTMLButtonElement)
        || !(panel instanceof HTMLElement)
        || !(label instanceof HTMLElement)
        || !optionButtons.length
    ) {
        return;
    }

    customSelect.dataset.customSelectInitialized = 'true';
    root.classList.add('is-enhanced');

    function getPlaceholder() {
        return customSelect.dataset.customSelectPlaceholder || '';
    }

    function getSelectedOption() {
        return nativeSelect.options[nativeSelect.selectedIndex] || null;
    }

    function getButtonByValue(value) {
        return optionButtons.find((optionButton) => optionButton.dataset.optionValue === value) || null;
    }

    function closeSelect() {
        root.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
    }

    function focusOption(optionButton) {
        if (optionButton instanceof HTMLButtonElement) {
            optionButton.focus();
        }
    }

    function focusSelectedOption() {
        const selectedOption = getButtonByValue(nativeSelect.value) || optionButtons[0] || null;

        focusOption(selectedOption);
    }

    function syncFromNativeSelect(dispatchEvents = false) {
        const selectedOption = getSelectedOption();
        const selectedValue = selectedOption ? selectedOption.value : '';
        const selectedLabel = selectedOption ? selectedOption.textContent || '' : '';
        const nextLabel = selectedLabel || getPlaceholder();

        label.textContent = nextLabel;

        optionButtons.forEach((optionButton) => {
            const isSelected = optionButton.dataset.optionValue === selectedValue;

            optionButton.classList.toggle('is-selected', isSelected);
            optionButton.setAttribute('aria-selected', String(isSelected));
        });

        if (!dispatchEvents) {
            return;
        }

        nativeSelect.dispatchEvent(new Event('input', { bubbles: true }));
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function selectValue(value) {
        const nextValue = String(value);

        if (nativeSelect.value !== nextValue) {
            nativeSelect.value = nextValue;
            syncFromNativeSelect(true);
            return;
        }

        syncFromNativeSelect(false);
    }

    function openSelect() {
        root.classList.add('is-enhanced');
        root.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
    }

    function openAndFocusSelectedOption() {
        openSelect();
        window.requestAnimationFrame(() => {
            focusSelectedOption();
        });
    }

    function moveFocus(currentButton, direction) {
        const currentIndex = optionButtons.indexOf(currentButton);

        if (currentIndex === -1) {
            focusSelectedOption();
            return;
        }

        const nextIndex = currentIndex + direction;

        if (nextIndex < 0 || nextIndex >= optionButtons.length) {
            return;
        }

        focusOption(optionButtons[nextIndex]);
    }

    toggle.addEventListener('click', () => {
        if (panel.hidden) {
            openSelect();
            return;
        }

        closeSelect();
    });

    toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();

            if (panel.hidden) {
                openAndFocusSelectedOption();
                return;
            }

            closeSelect();
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            openAndFocusSelectedOption();
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            openSelect();
            window.requestAnimationFrame(() => {
                focusOption(optionButtons[optionButtons.length - 1] || null);
            });
        }
    });

    panel.addEventListener('click', (event) => {
        const optionButton = event.target instanceof Element
            ? event.target.closest('[data-custom-select-option]')
            : null;

        if (!(optionButton instanceof HTMLButtonElement)) {
            return;
        }

        selectValue(optionButton.dataset.optionValue || '');
        closeSelect();
        toggle.focus();
    });

    panel.addEventListener('keydown', (event) => {
        const optionButton = event.target instanceof Element
            ? event.target.closest('[data-custom-select-option]')
            : null;

        if (!(optionButton instanceof HTMLButtonElement)) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveFocus(optionButton, 1);
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveFocus(optionButton, -1);
            return;
        }

        if (event.key === 'Home') {
            event.preventDefault();
            focusOption(optionButtons[0] || null);
            return;
        }

        if (event.key === 'End') {
            event.preventDefault();
            focusOption(optionButtons[optionButtons.length - 1] || null);
            return;
        }

        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            selectValue(optionButton.dataset.optionValue || '');
            closeSelect();
            toggle.focus();
            return;
        }

        if (event.key === 'Tab') {
            closeSelect();
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeSelect();
            toggle.focus();
        }
    });

    nativeSelect.addEventListener('change', () => {
        syncFromNativeSelect(false);
    });

    const parentForm = nativeSelect.form;

    if (parentForm instanceof HTMLFormElement) {
        parentForm.addEventListener('reset', () => {
            window.requestAnimationFrame(() => {
                syncFromNativeSelect(false);
                closeSelect();
            });
        });
    }

    document.addEventListener('click', (event) => {
        if (!(event.target instanceof Node) || customSelect.contains(event.target)) {
            return;
        }

        closeSelect();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || panel.hidden) {
            return;
        }

        closeSelect();
        toggle.focus();
    });

    syncFromNativeSelect(false);
}
