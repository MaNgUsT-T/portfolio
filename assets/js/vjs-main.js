/**
 * @fileoverview Haupt-JavaScript-Datei für das Frontend.
 * Beinhaltet die Logik für den scrollenden Header, die mobile Navigation,
 * Splide-Carousels und die asynchrone Verarbeitung des Kontaktformulars.
 *
 * @version 1.0.0
 */

/**
 * Initialisiert die Theme-Umschaltung auf Basis von Browser-Einstellung und manueller Auswahl.
 * Die manuelle Auswahl wird persistent gespeichert und überschreibt die Systempräferenz.
 */
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
            // Zugriff auf localStorage kann blockiert sein. Dann bleibt nur die Laufzeitumschaltung aktiv.
        }
    }

    function getThemeMetaColor(theme) {
        return theme === darkTheme ? themeMetaColors.dark : themeMetaColors.light;
    }

    function syncToggleState(theme) {
        const isDarkTheme = theme === darkTheme;
        const toggleLabel = isDarkTheme ? 'Helles Theme aktivieren' : 'Dunkles Theme aktivieren';

        toggleElements.forEach(function(toggleElement) {
            toggleElement.setAttribute('aria-pressed', String(isDarkTheme));
            toggleElement.setAttribute('aria-label', toggleLabel);
            toggleElement.setAttribute('title', toggleLabel);
            toggleElement.dataset.themeState = theme;
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

/**
 * Berechnet die äußere Höhe des übergebenen Header-Elements.
 * Verwendet Math.ceil, um Sub-Pixel-Werte aufzurunden.
 *
 * @returns {number} Die aufgerundete Höhe des Elements in Pixeln. Gibt 0 zurück, falls das Element nicht existiert.
 */
function calculateHeaderOuterHeight(headerElement) {
    if (!headerElement) return 0;
    return Math.ceil(headerElement.offsetHeight || 0);
}

/**
 * Ermittelt die visuelle Unterkante des Headers im aktuellen Layout.
 * Bei einem fixierten Header entspricht dies exakt dem sichtbaren Offset,
 * unter dem das mobile Offcanvas-Menü beginnen muss.
 *
 * @returns {number} Die aufgerundete Unterkante des Headers in Pixeln.
 */
function calculateHeaderVisualBottom(headerElement) {
    if (!headerElement) return 0;
    return Math.ceil(headerElement.getBoundingClientRect().bottom || 0);
}

/**
 * Synchronisiert den Start-Offset des mobilen Offcanvas-Menüs mit der aktuellen Header-Höhe.
 */
function syncOffcanvasInsetWithHeader(headerElement) {
    const navWrapper = document.querySelector('.header__nav-wrapper');

    if (!navWrapper) {
        return;
    }

    if (window.innerWidth < 1024) {
        /** Mobile: Neuen Wert berechnen */
        const newValue = calculateHeaderVisualBottom(headerElement) + 'px';

        /** Nur ins DOM schreiben, wenn der Wert nicht sowieso schon exakt dieser ist! */
        if (navWrapper.style.insetBlockStart !== newValue) {
            navWrapper.style.insetBlockStart = newValue;
        }
    } else {
        /** Desktop: Nur löschen, wenn überhaupt ein Inline-Style gesetzt ist! */
        if (navWrapper.style.insetBlockStart) {
            navWrapper.style.removeProperty('inset-block-start');
        }
    }
}

/**
 * Plant eine Nachmessung, sobald der Browser die nächste Layout-/Paint-Phase erreicht hat.
 */
function scheduleOffcanvasInsetSync(headerElement) {
    window.requestAnimationFrame(function() {
        syncOffcanvasInsetWithHeader(headerElement);
    });
}

/**
 * Initialisiert das Scroll-Verhalten des Headers.
 * Fügt dem Header eine Modifikator-Klasse hinzu, sobald über seine initiale Höhe hinaus gescrollt wird.
 * Beinhaltet Logik zur Vermeidung von Layout-Thrashing und Scroll-Jitter ("Wackeln").
 */
function headerScrollInitialize() {
    const header = document.querySelector('header');

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
        }
        else if (isScrolled && currentScroll <= calculateHeaderOuterHeight(header)) {
            header.classList.remove('header--scrolled');
            syncOffcanvasInsetWithHeader(header);
            scheduleOffcanvasInsetSync(header);
            isScrolled = false;
        }

        syncOffcanvasInsetWithHeader(header);
    }

    // Resize-Event: Aktualisiert die initiale Höhe nur, wenn sich die Viewport-Breite ändert.
    window.addEventListener('resize', function() {
        if (window.innerWidth !== windowWidth) {
            windowWidth = window.innerWidth;

            const currentlyScrolled = header.classList.contains('header--scrolled');

            // Um die echte Initialhöhe zu messen, muss die "scrolled"-Klasse kurzzeitig entfernt werden
            if (currentlyScrolled) {
                header.classList.remove('header--scrolled');
            }

            initialHeight = calculateHeaderOuterHeight(header);

            // Ursprünglichen Zustand wiederherstellen
            if (currentlyScrolled) {
                header.classList.add('header--scrolled');
            }

            updateHeaderScrollState();
        }
    }, { passive: true });

    // Scroll-Event: Aktualisiert den Scroll-Zustand des Headers.
    window.addEventListener('scroll', function() {
        updateHeaderScrollState();
    }, { passive: true });

    header.addEventListener('transitionend', function(event) {
        if (event.target !== header) {
            return;
        }

        syncOffcanvasInsetWithHeader(header);
    });

    updateHeaderScrollState();
}

/**
 * Initialisiert die mobile Offcanvas-Navigation.
 * Beinhaltet Zugänglichkeits-Features (Aria-Attribute, Fokus-Management),
 * Scrollbar-Kompensation (um ein Springen des Layouts zu verhindern) und
 * einen ResizeObserver für millimetergenaue CSS-Positionierungen.
 */
function mobileNavigationInitialize() {
    const header = document.querySelector('.header');
    let headerOuterHeight = calculateHeaderOuterHeight(header);
    const toggleButton = document.querySelector('[data-mobile-nav-toggle]');
    const panel = document.querySelector('.header__nav-wrapper');
    const overlay = document.querySelector('[data-overlay]');
    const transitionDuration = 300;
    let animationResetTimeout = null;

    if (!header || !toggleButton || !overlay || !panel) {
        return;
    }

    // Selektoren für alle fokussierbaren Elemente innerhalb der Navigation.
    const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    /**
     * Aktualisiert den vertikalen Offset des Offcanvas-Menüs.
     */
    function headerHeightInitialize() {
        headerOuterHeight = calculateHeaderOuterHeight(header);
        syncOffcanvasInsetWithHeader(header);
    }

    /**
     * Berechnet die Breite der Browser-Scrollbar.
     * @returns {number} Die Breite der Scrollbar in Pixeln.
     */
    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    /**
     * Verhindert das "Springen" der Seite, wenn der Body-Scroll gesperrt (overflow: hidden)
     * und die Scrollbar dadurch ausgeblendet wird.
     * @param {number} scrollbarWidth - Die zuvor berechnete Scrollbar-Breite.
     */
    function applyScrollLockCompensation(scrollbarWidth) {
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = scrollbarWidth + 'px';
            toggleButton.style.paddingRight = scrollbarWidth + 'px';
            return;
        }
        document.body.style.removeProperty('padding-right');
        toggleButton.style.removeProperty('padding-right');
    }

    /**
     * Entfernt die Scrollbar-Kompensation.
     */
    function clearScrollLockCompensation() {
        document.body.style.removeProperty('padding-right');
        toggleButton.style.removeProperty('padding-right');
    }

    /**
     * Setzt eine temporäre Klasse für die CSS-Animation und entfernt sie nach Ablauf der Transition wieder.
     */
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

    /**
     * Steuert den Zustand (Offen/Geschlossen) der Navigation und pflegt die ARIA-Attribute für Screenreader.
     *
     * @param {boolean} isOpen - Gibt an, ob die Navigation geöffnet werden soll.
     * @param {boolean} shouldAnimate - Gibt an, ob eine Animation ausgeführt werden soll.
     */
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

        // Aria-Attribute für Barrierefreiheit aktualisieren
        toggleButton.setAttribute('aria-expanded', String(isOpen));
        toggleButton.setAttribute('aria-label', isOpen ? 'Navigation schließen' : 'Navigation öffnen');
        panel.setAttribute('aria-hidden', String(!isOpen));
    }

    /**
     * Schließt die Navigation und gibt den Fokus an den Toggle-Button zurück.
     */
    function closeNavigation() {
        setNavigationState(false, true);
        toggleButton.focus();
    }

    /**
     * Öffnet die Navigation und setzt den Tastatur-Fokus auf das erste fokussierbare Element im Menü.
     */
    function openNavigation() {
        setNavigationState(true, true);

        const firstFocusableElement = panel.querySelector(focusableSelectors);
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }

    /**
     * Wechselt den Zustand der Navigation (Toggle).
     */
    function toggleNavigation() {
        const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeNavigation();
        } else {
            openNavigation();
        }
    }

    // Event-Listener für Navigation Controls
    toggleButton.addEventListener('click', toggleNavigation);
    overlay.addEventListener('click', closeNavigation);

    // Tastaturnavigation: Öffnen/Schließen per Enter- oder Leertaste
    toggleButton.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleNavigation();
        }
    });

    // Navigation schließen, wenn ein regulärer Link geklickt wird
    panel.querySelectorAll('a[href]').forEach(function(link) {
        link.addEventListener('click', function() {
            closeNavigation();
        });
    });

    // Navigation per Escape-Taste schließen (wichtig für Barrierefreiheit)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && toggleButton.getAttribute('aria-expanded') === 'true') {
            closeNavigation();
        }
    });

    // Initiale Offcanvas-Offset-Berechnung.
    headerHeightInitialize();

    // Moderner ResizeObserver: Überwacht Änderungen an der Header-Höhe (z. B. durch CSS-Animationen).
    // Dies ersetzt das veraltete Aktualisieren der Höhe beim Scroll-Event und verhindert steckengebliebene Werte.
    if (window.ResizeObserver) {
        const headerObserver = new ResizeObserver(function() {
            headerHeightInitialize();
        });
        headerObserver.observe(header);
    }

    // Resize-Handling für Layout-Wechsel (Desktop <-> Mobile)
    window.addEventListener('resize', function() {
        headerHeightInitialize();

        // Scrollbar-Kompensation bei geöffneter Navigation während eines Resizes neu berechnen.
        if (toggleButton.getAttribute('aria-expanded') === 'true') {
            clearScrollLockCompensation();
            document.body.classList.remove('nav--open');
            const scrollbarWidth = getScrollbarWidth();
            document.body.classList.add('nav--open');
            applyScrollLockCompensation(scrollbarWidth);
        }

        // Navigation automatisch schließen, wenn der Desktop-Breakpoint erreicht wird.
        if (window.innerWidth >= 1024 && toggleButton.getAttribute('aria-expanded') === 'true') {
            setNavigationState(false, false);
        }
    });
}

/* ==========================================================================
 * Splide.js Carousels
 * ========================================================================== */

// Ermittelt die Anzahl der Demo-Slides im DOM vor der Initialisierung.
let demoCarouselItems = document.querySelectorAll('#splide-carousel .splide__slide').length;
console.log('Demo Items:', demoCarouselItems);

/**
 * Initialisiert das "Demo"-Carousel mittels Splide.js.
 * Deaktiviert (destroy) das Carousel automatisch, wenn nicht genügend Slides
 * für den jeweiligen Breakpoint vorhanden sind.
 */
function demoCarouselInitialize() {
    if (demoCarouselItems > 0) {
        const demoItemList = new Splide('#splide-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: '4rem',
            destroy: 1 >= demoCarouselItems,
            mediaQuery: 'min',
            breakpoints: {
                768: {
                    perPage: 2,
                    perMove: 2,
                    destroy: 2 >= demoCarouselItems
                },
                1200: {
                    perPage: 4,
                    perMove: 4,
                    destroy: 4 >= demoCarouselItems
                }
            }
        });
        demoItemList.mount();
    }
}

// Ermittelt die Anzahl der Education-Slides im DOM vor der Initialisierung.
let educationCarouselItems = document.querySelectorAll('#education-carousel .splide__slide').length;
console.log('Education Items:', educationCarouselItems);

/**
 * Initialisiert das "Education"-Carousel mittels Splide.js.
 * Funktioniert nach dem gleichen Prinzip wie das Demo-Carousel.
 */
function educationCarouselInitialize() {
    if (educationCarouselItems > 0) {
        const educationItemList = new Splide('#education-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: '4rem',
            destroy: 1 >= educationCarouselItems,
            mediaQuery: 'min',
            breakpoints: {
                768: {
                    perPage: 2,
                    perMove: 2,
                    destroy: 2 >= educationCarouselItems
                },
                1200: {
                    perPage: 4,
                    perMove: 4,
                    destroy: 4 >= educationCarouselItems
                }
            }
        });
        educationItemList.mount();
    }
}

/* ==========================================================================
 * Kontaktformular
 * ========================================================================== */

/**
 * Initialisiert das Kontaktformular.
 * Fängt das Standard-Submit-Event ab und sendet die Daten stattdessen asynchron (AJAX/Fetch).
 * Zeigt Statusmeldungen und Validierungsfehler (inkl. ARIA-Invalid) im Frontend an.
 */
function contactFormInitialize() {
    const form = document.querySelector('#contact-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[data-contact-submit]');
    const statusElement = document.querySelector('[data-contact-status]');
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    /**
     * Setzt die globale Statusmeldung (Erfolg oder Fehler) des Formulars.
     * @param {string} message - Die anzuzeigende Nachricht.
     * @param {string} type - Der Typ der Meldung ('success' oder 'error').
     */
    function setStatus(message, type) {
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.dataset.contactStatus = type;
    }

    /**
     * Entfernt alle vorherigen Fehlermeldungen und Aria-Invalid Attribute von den Formularfeldern.
     */
    function clearErrors() {
        form.querySelectorAll('[data-contact-error]').forEach(function(errorElement) {
            errorElement.textContent = '';
        });

        form.querySelectorAll('[aria-invalid="true"]').forEach(function(field) {
            field.removeAttribute('aria-invalid');
        });
    }

    /**
     * Rendert feldspezifische Validierungsfehler aus der Server-Antwort.
     * @param {Object} errors - Ein Objekt mit den Feldnamen als Keys und den Fehlermeldungen als Values.
     */
    function renderErrors(errors) {
        Object.keys(errors).forEach(function(name) {
            const errorElement = form.querySelector('[data-contact-error="' + name + '"]');
            const field = form.elements[name];

            if (errorElement) {
                errorElement.textContent = errors[name];
            }

            if (field) {
                field.setAttribute('aria-invalid', 'true');
            }
        });
    }

    /**
     * Sperrt oder entsperrt das Formular während des Sendevorgangs, um Mehrfach-Submits zu verhindern.
     * @param {boolean} isSubmitting - Status, ob das Formular aktuell gesendet wird.
     */
    function setSubmitting(isSubmitting) {
        form.setAttribute('aria-busy', String(isSubmitting));

        if (!submitButton) return;

        submitButton.disabled = isSubmitting;
        submitButton.innerHTML = isSubmitting ? 'Nachricht wird gesendet...' : defaultSubmitHtml;
    }

    // Formular-Submit-Handler.
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Standard-Weiterleitung blockieren.

        clearErrors();
        setStatus('', '');
        setSubmitting(true);

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(function(response) {
                return response.json().then(function(payload) {
                    return {
                        ok: response.ok,
                        payload: payload
                    };
                });
            })
            .then(function(result) {
                // Server meldet einen Fehler.
                if (!result.ok || !result.payload.ok) {
                    if (result.payload.errors) {
                        renderErrors(result.payload.errors);
                    }

                    setStatus(result.payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
                    return;
                }

                // Erfolgreich gesendet.
                form.reset();
                setStatus(result.payload.message, 'success');
            })
            .catch(function() {
                // Netzwerkfehler.
                setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
            })
            .finally(function() {
                // Button am Ende immer wieder freigeben.
                setSubmitting(false);
            });
    });
}

/* ==========================================================================
 * Initialisierung bei Document Ready
 * ========================================================================== */

// Wartet, bis die HTML-Struktur vollständig geladen ist, bevor Funktionen ausgeführt werden.
document.addEventListener('DOMContentLoaded', function() {
    themeInitialize();
    headerScrollInitialize();
    mobileNavigationInitialize();
    demoCarouselInitialize();
    educationCarouselInitialize();
    contactFormInitialize();
});
