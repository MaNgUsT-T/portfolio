let iconsCache = null;
let iconsPromise = null;

function icon(name) {
    if (!iconsCache || typeof iconsCache[name] !== 'string') {
        return '';
    }

    return iconsCache[name];
}

function resolveIconsPath() {
    return window.location.pathname.includes('/admin/') ? '../data/icons.json' : './data/icons.json';
}

async function loadIcons() {
    if (iconsCache) {
        return iconsCache;
    }

    if (iconsPromise) {
        return iconsPromise;
    }

    iconsPromise = fetch(resolveIconsPath(), {
        cache: 'no-store',
        headers: {
            Accept: 'application/json'
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('icons.json konnte nicht geladen werden.');
            }

            return response.json();
        })
        .then((data) => {
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('icons.json enthält kein gültiges Objekt.');
            }

            iconsCache = Object.fromEntries(
                Object.entries(data).filter((entry) => typeof entry[0] === 'string' && typeof entry[1] === 'string')
            );

            return iconsCache;
        })
        .catch((error) => {
            iconsPromise = null;
            throw error;
        });

    return iconsPromise;
}

function initializeCustomSelects(rootNode = document) {
    const customSelects = rootNode.querySelectorAll('[data-custom-select]');

    customSelects.forEach((customSelect) => {
        bindCustomSelect(customSelect);
    });
}

function bindCustomSelect(customSelect) {
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

function themeInitialize() {
    const themeStorageKey = 'theme-preference';
    const lightTheme = 'light';
    const darkTheme = 'dark';
    const themeMetaColors = {
        light: '#ffffff',
        dark: '#18181b'
    };
    const rootElement = document.documentElement;
    const toggleElements = document.querySelectorAll('[data-theme-toggle]');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const mediaQuery = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    function normalizeThemePreference(value) {
        return value === lightTheme || value === darkTheme ? value : null;
    }

    function getStoredTheme() {
        try {
            return normalizeThemePreference(window.localStorage.getItem(themeStorageKey));
        } catch (error) {
            return null;
        }
    }

    function persistTheme(theme) {
        try {
            window.localStorage.setItem(themeStorageKey, theme);
        } catch (error) {
            return;
        }
    }

    function getThemeMetaColor(theme) {
        return theme === darkTheme ? themeMetaColors.dark : themeMetaColors.light;
    }

    function syncToggleState(theme) {
        const isDarkTheme = theme === darkTheme;
        const toggleLabel = isDarkTheme ? 'Helles Theme aktivieren' : 'Dunkles Theme aktivieren';
        const iconSvg = isDarkTheme ? icon('sun') : icon('moon');

        toggleElements.forEach(function(toggleElement) {
            toggleElement.setAttribute('aria-pressed', String(isDarkTheme));
            toggleElement.setAttribute('aria-label', toggleLabel);
            toggleElement.setAttribute('title', toggleLabel);
            toggleElement.dataset.themeState = theme;
            toggleElement.innerHTML = iconSvg;
        });
    }

    function applyTheme(theme) {
        const normalizedTheme = normalizeThemePreference(theme) || lightTheme;

        rootElement.dataset.theme = normalizedTheme;
        rootElement.style.colorScheme = normalizedTheme;

        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', getThemeMetaColor(normalizedTheme));
        }

        syncToggleState(normalizedTheme);
    }

    function resolveThemePreference(storedTheme, prefersDark) {
        const normalizedStoredTheme = normalizeThemePreference(storedTheme);

        if (normalizedStoredTheme) {
            return normalizedStoredTheme;
        }

        return prefersDark ? darkTheme : lightTheme;
    }

    function getNextTheme(currentTheme) {
        return currentTheme === darkTheme ? lightTheme : darkTheme;
    }

    function getSystemPreference() {
        return !!(mediaQuery && mediaQuery.matches);
    }

    function handleThemeToggle(event) {
        event.preventDefault();

        const activeTheme = normalizeThemePreference(rootElement.dataset.theme) || lightTheme;
        const nextTheme = getNextTheme(activeTheme);

        persistTheme(nextTheme);
        applyTheme(nextTheme);
    }

    function handleThemeToggleKeydown(event) {
        if (event.key !== ' ' && event.key !== 'Spacebar') {
            return;
        }

        handleThemeToggle(event);
    }

    if (!toggleElements.length || rootElement.dataset.themeSwitchInitialized === 'true') {
        return;
    }

    applyTheme(resolveThemePreference(getStoredTheme(), getSystemPreference()));

    toggleElements.forEach(function(toggleElement) {
        toggleElement.addEventListener('click', handleThemeToggle);
        toggleElement.addEventListener('keydown', handleThemeToggleKeydown);
    });

    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', function(event) {
            if (getStoredTheme()) {
                return;
            }

            applyTheme(event.matches ? darkTheme : lightTheme);
        });
    }

    rootElement.dataset.themeSwitchInitialized = 'true';
}

function calculateHeaderOuterHeight(headerElement) {
    if (!headerElement) {
        return 0;
    }

    return Math.ceil(headerElement.offsetHeight || 0);
}

function calculateHeaderVisualBottom(headerElement) {
    if (!headerElement) {
        return 0;
    }

    return Math.ceil(headerElement.getBoundingClientRect().bottom || 0);
}

function syncOffcanvasInsetWithHeader(headerElement) {
    const navWrapper = document.querySelector('.js-header-nav-wrapper');

    if (!navWrapper) {
        return;
    }

    if (window.innerWidth < 1024) {
        const newValue = calculateHeaderVisualBottom(headerElement) + 'px';

        if (navWrapper.style.insetBlockStart !== newValue) {
            navWrapper.style.insetBlockStart = newValue;
        }
        return;
    }

    if (navWrapper.style.insetBlockStart) {
        navWrapper.style.removeProperty('inset-block-start');
    }
}

function scheduleOffcanvasInsetSync(headerElement) {
    window.requestAnimationFrame(function() {
        syncOffcanvasInsetWithHeader(headerElement);
    });
}

function headerScrollInitialize() {
    const header = document.querySelector('.js-header');

    if (!header) {
        return;
    }

    let isScrolled = false;
    let initialHeight = calculateHeaderOuterHeight(header);
    let windowWidth = window.innerWidth;

    function updateHeaderScrollState() {
        const currentScroll = window.scrollY;

        if (!isScrolled && currentScroll > initialHeight) {
            header.classList.add('header--scrolled');
            syncOffcanvasInsetWithHeader(header);
            scheduleOffcanvasInsetSync(header);
            isScrolled = true;
        } else if (isScrolled && currentScroll <= calculateHeaderOuterHeight(header)) {
            header.classList.remove('header--scrolled');
            syncOffcanvasInsetWithHeader(header);
            scheduleOffcanvasInsetSync(header);
            isScrolled = false;
        }

        syncOffcanvasInsetWithHeader(header);
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth !== windowWidth) {
            windowWidth = window.innerWidth;
            const currentlyScrolled = header.classList.contains('header--scrolled');

            if (currentlyScrolled) {
                header.classList.remove('header--scrolled');
            }

            initialHeight = calculateHeaderOuterHeight(header);

            if (currentlyScrolled) {
                header.classList.add('header--scrolled');
            }

            updateHeaderScrollState();
        }
    }, { passive: true });

    window.addEventListener('scroll', updateHeaderScrollState, { passive: true });

    header.addEventListener('transitionend', function(event) {
        if (event.target !== header) {
            return;
        }

        syncOffcanvasInsetWithHeader(header);
    });

    updateHeaderScrollState();
}

function mobileNavigationInitialize() {
    const header = document.querySelector('.js-header');
    const toggleButton = document.querySelector('[data-mobile-nav-toggle]');
    const panel = document.querySelector('.js-header-nav-wrapper');
    const overlay = document.querySelector('[data-overlay]');
    const transitionDuration = 300;
    let animationResetTimeout = null;

    if (!header || !toggleButton || !overlay || !panel) {
        return;
    }

    const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function headerHeightInitialize() {
        syncOffcanvasInsetWithHeader(header);
    }

    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function applyScrollLockCompensation(scrollbarWidth) {
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = scrollbarWidth + 'px';
            toggleButton.style.paddingRight = scrollbarWidth + 'px';
            return;
        }

        document.body.style.removeProperty('padding-right');
        toggleButton.style.removeProperty('padding-right');
    }

    function clearScrollLockCompensation() {
        document.body.style.removeProperty('padding-right');
        toggleButton.style.removeProperty('padding-right');
    }

    function enableNavigationAnimation() {
        if (animationResetTimeout) {
            clearTimeout(animationResetTimeout);
        }

        document.body.classList.add('nav--animate');
        animationResetTimeout = window.setTimeout(function() {
            document.body.classList.remove('nav--animate');
            animationResetTimeout = null;
        }, transitionDuration);
    }

    function setNavigationState(isOpen, shouldAnimate) {
        const scrollbarWidth = isOpen ? getScrollbarWidth() : 0;

        if (shouldAnimate) {
            enableNavigationAnimation();
        } else {
            document.body.classList.remove('nav--animate');
        }

        document.body.classList.toggle('nav--open', isOpen);

        if (isOpen) {
            applyScrollLockCompensation(scrollbarWidth);
        } else {
            clearScrollLockCompensation();
        }

        toggleButton.setAttribute('aria-expanded', String(isOpen));
        toggleButton.setAttribute('aria-label', isOpen ? 'Navigation schließen' : 'Navigation öffnen');
        panel.setAttribute('aria-hidden', String(!isOpen));
    }

    function closeNavigation() {
        setNavigationState(false, true);
        toggleButton.focus();
    }

    function openNavigation() {
        setNavigationState(true, true);

        const firstFocusableElement = panel.querySelector(focusableSelectors);
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }

    function toggleNavigation() {
        const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
            closeNavigation();
        } else {
            openNavigation();
        }
    }

    toggleButton.addEventListener('click', toggleNavigation);
    overlay.addEventListener('click', closeNavigation);

    toggleButton.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleNavigation();
        }
    });

    panel.querySelectorAll('a[href]').forEach(function(link) {
        link.addEventListener('click', closeNavigation);
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && toggleButton.getAttribute('aria-expanded') === 'true') {
            closeNavigation();
        }
    });

    headerHeightInitialize();

    if (window.ResizeObserver) {
        new ResizeObserver(function() {
            headerHeightInitialize();
        }).observe(header);
    }

    window.addEventListener('resize', function() {
        headerHeightInitialize();

        if (toggleButton.getAttribute('aria-expanded') === 'true') {
            clearScrollLockCompensation();
            document.body.classList.remove('nav--open');
            const scrollbarWidth = getScrollbarWidth();
            document.body.classList.add('nav--open');
            applyScrollLockCompensation(scrollbarWidth);
        }

        if (window.innerWidth >= 1024 && toggleButton.getAttribute('aria-expanded') === 'true') {
            setNavigationState(false, false);
        }
    });
}
