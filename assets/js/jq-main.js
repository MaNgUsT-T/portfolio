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
    const $root = $(document.documentElement);
    const $toggleElements = $('[data-theme-toggle]');
    const $themeColorMeta = $('meta[name="theme-color"]');
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

        $toggleElements.attr({
            'aria-pressed': String(isDarkTheme),
            'aria-label': toggleLabel,
            'title': toggleLabel,
            'data-theme-state': theme
        });
    }

    function applyTheme(theme) {
        const normalizedTheme = normalizeThemePreference(theme) || lightTheme;

        $root.attr('data-theme', normalizedTheme);
        document.documentElement.style.colorScheme = normalizedTheme;

        if ($themeColorMeta.length) {
            $themeColorMeta.attr('content', getThemeMetaColor(normalizedTheme));
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

        const activeTheme = normalizeThemePreference($root.attr('data-theme')) || lightTheme;
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

    if (!$toggleElements.length || $root.attr('data-theme-switch-initialized') === 'true') {
        return;
    }

    applyTheme(resolveThemePreference(getStoredTheme(), getSystemPreference()));

    $toggleElements.on('click', handleThemeToggle);
    $toggleElements.on('keydown', handleThemeToggleKeydown);

    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', function(event) {
            if (getStoredTheme()) {
                return;
            }

            applyTheme(event.matches ? darkTheme : lightTheme);
        });
    }

    $root.attr('data-theme-switch-initialized', 'true');
}

/**
 * Berechnet die äußere Höhe des übergebenen Header-Elements.
 * Verwendet Math.ceil, um Sub-Pixel-Werte aufzurunden.
 *
 * @returns {number} Die aufgerundete Höhe des Elements in Pixeln. Gibt 0 zurück, falls das Element nicht existiert.
 */
function calculateHeaderOuterHeight($headerElement) {
    if (!$headerElement || !$headerElement.length) return 0;
    return Math.ceil($headerElement.outerHeight() || 0);
}

/**
 * Ermittelt die visuelle Unterkante des Headers im aktuellen Layout.
 * Bei einem fixierten Header entspricht dies exakt dem sichtbaren Offset,
 * unter dem das mobile Offcanvas-Menü beginnen muss.
 *
 * @returns {number} Die aufgerundete Unterkante des Headers in Pixeln.
 */
function calculateHeaderVisualBottom($headerElement) {
    if (!$headerElement || !$headerElement.length) return 0;
    return Math.ceil($headerElement[0].getBoundingClientRect().bottom || 0);
}

/**
 * Synchronisiert den Start-Offset des mobilen Offcanvas-Menüs mit der aktuellen Header-Höhe.
 */
function syncOffcanvasInsetWithHeader($headerElement) {
    const $navWrapper = $('.header__nav-wrapper');

    if (!$navWrapper.length) {
        return;
    }

    if ($(window).outerWidth() < 1024) {
        /** Mobile: Neuen Wert berechnen */
        const newValue = calculateHeaderVisualBottom($headerElement) + 'px';

        /** Nur ins DOM schreiben, wenn der Wert nicht sowieso schon exakt dieser ist! */
        if ($navWrapper[0].style.insetBlockStart !== newValue) {
            $navWrapper.css('inset-block-start', newValue);
        }
    } else {
        /** Desktop: Nur löschen, wenn überhaupt ein Inline-Style gesetzt ist! */
        if ($navWrapper[0].style.insetBlockStart) {
            $navWrapper.css('inset-block-start', '');
        }
    }
}

/**
 * Plant eine Nachmessung, sobald der Browser die nächste Layout-/Paint-Phase erreicht hat.
 */
function scheduleOffcanvasInsetSync($headerElement) {
    window.requestAnimationFrame(function() {
        syncOffcanvasInsetWithHeader($headerElement);
    });
}

/**
 * Initialisiert das Scroll-Verhalten des Headers.
 * Fügt dem Header eine Modifikator-Klasse hinzu, sobald über seine initiale Höhe hinaus gescrollt wird.
 * Beinhaltet Logik zur Vermeidung von Layout-Thrashing und Scroll-Jitter ("Wackeln").
 */
function headerScrollInitialize() {
    const $header = $('header');

    if (!$header.length) {
        return;
    }

    let isScrolled = false;
    let initialHeight = calculateHeaderOuterHeight($header);
    let windowWidth = $(window).outerWidth();

    function updateHeaderScrollState() {
        const currentScroll = $(window).scrollTop();

        if (!isScrolled && currentScroll > initialHeight) {
            $header.addClass('header--scrolled');
            syncOffcanvasInsetWithHeader($header);
            scheduleOffcanvasInsetSync($header);
            isScrolled = true;
        }
        else if (isScrolled && currentScroll <= calculateHeaderOuterHeight($header)) {
            $header.removeClass('header--scrolled');
            syncOffcanvasInsetWithHeader($header);
            scheduleOffcanvasInsetSync($header);
            isScrolled = false;
        }

        syncOffcanvasInsetWithHeader($header);
    }

    // Resize-Event: Aktualisiert die initiale Höhe nur, wenn sich die Viewport-Breite ändert.
    $(window).on('resize', function() {
        if ($(window).outerWidth() !== windowWidth) {
            windowWidth = $(window).outerWidth();

            const currentlyScrolled = $header.hasClass('header--scrolled');

            // Um die echte Initialhöhe zu messen, muss die "scrolled"-Klasse kurzzeitig entfernt werden
            if (currentlyScrolled) {
                $header.removeClass('header--scrolled');
            }

            initialHeight = calculateHeaderOuterHeight($header);

            // Ursprünglichen Zustand wiederherstellen
            if (currentlyScrolled) {
                $header.addClass('header--scrolled');
            }

            updateHeaderScrollState();
        }
    });

    // Scroll-Event: Aktualisiert den Scroll-Zustand des Headers.
    $(window).on('scroll', updateHeaderScrollState);

    $header.on('transitionend', function(event) {
        if (event.target !== $header[0]) {
            return;
        }
        syncOffcanvasInsetWithHeader($header);
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
    const $header = $('.header');
    const $toggleButton = $('[data-mobile-nav-toggle]');
    const $panel = $('.header__nav-wrapper');
    const $overlay = $('[data-overlay]');
    const transitionDuration = 300;
    let animationResetTimeout = null;

    if (!$header.length || !$toggleButton.length || !$overlay.length || !$panel.length) {
        return;
    }

    let headerOuterHeight = calculateHeaderOuterHeight($header);

    // Selektoren für alle fokussierbaren Elemente innerhalb der Navigation.
    const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    /**
     * Aktualisiert den vertikalen Offset des Offcanvas-Menüs.
     */
    function headerHeightInitialize() {
        headerOuterHeight = calculateHeaderOuterHeight($header);
        syncOffcanvasInsetWithHeader($header);
    }

    /**
     * Berechnet die Breite der Browser-Scrollbar.
     * @returns {number} Die Breite der Scrollbar in Pixeln.
     */
    function getScrollbarWidth() {
        return $(window).outerWidth() - $('html').prop('clientWidth');
    }

    /**
     * Verhindert das "Springen" der Seite, wenn der Body-Scroll gesperrt (overflow: hidden)
     * und die Scrollbar dadurch ausgeblendet wird.
     * @param {number} scrollbarWidth - Die zuvor berechnete Scrollbar-Breite.
     */
    function applyScrollLockCompensation(scrollbarWidth) {
        if (scrollbarWidth > 0) {
            $('body').css('padding-right', scrollbarWidth + 'px');
            $toggleButton.css('padding-right', scrollbarWidth + 'px');
            return;
        }
        $('body').css('padding-right', '');
        $toggleButton.css('padding-right', '');
    }

    /**
     * Entfernt die Scrollbar-Kompensation.
     */
    function clearScrollLockCompensation() {
        $('body').css('padding-right', '');
        $toggleButton.css('padding-right', '');
    }

    /**
     * Setzt eine temporäre Klasse für die CSS-Animation und entfernt sie nach Ablauf der Transition wieder.
     */
    function enableNavigationAnimation() {
        if (animationResetTimeout) {
            clearTimeout(animationResetTimeout);
        }

        $('body').addClass('nav--animate');
        animationResetTimeout = setTimeout(function() {
            $('body').removeClass('nav--animate');
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
            $('body').removeClass('nav--animate');
        }

        $('body').toggleClass('nav--open', isOpen);

        if (isOpen) {
            applyScrollLockCompensation(scrollbarWidth);
        } else {
            clearScrollLockCompensation();
        }

        // Aria-Attribute für Barrierefreiheit aktualisieren
        $toggleButton.attr('aria-expanded', isOpen.toString());
        $toggleButton.attr('aria-label', isOpen ? 'Navigation schließen' : 'Navigation öffnen');
        $panel.attr('aria-hidden', (!isOpen).toString());
    }

    /**
     * Schließt die Navigation und gibt den Fokus an den Toggle-Button zurück.
     */
    function closeNavigation() {
        setNavigationState(false, true);
        $toggleButton.trigger('focus');
    }

    /**
     * Öffnet die Navigation und setzt den Tastatur-Fokus auf das erste fokussierbare Element im Menü.
     */
    function openNavigation() {
        setNavigationState(true, true);

        const $firstFocusableElement = $panel.find(focusableSelectors).first();
        if ($firstFocusableElement.length) {
            $firstFocusableElement.trigger('focus');
        }
    }

    /**
     * Wechselt den Zustand der Navigation (Toggle).
     */
    function toggleNavigation() {
        const isOpen = $toggleButton.attr('aria-expanded') === 'true';
        if (isOpen) {
            closeNavigation();
        } else {
            openNavigation();
        }
    }

    // Event-Listener für Navigation Controls
    $toggleButton.on('click', toggleNavigation);
    $overlay.on('click', closeNavigation);

    // Tastaturnavigation: Öffnen/Schließen per Enter- oder Leertaste
    $toggleButton.on('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleNavigation();
        }
    });

    // Navigation schließen, wenn ein regulärer Link geklickt wird
    $panel.find('a[href]').on('click', closeNavigation);

    // Navigation per Escape-Taste schließen (wichtig für Barrierefreiheit)
    $(document).on('keydown', function(event) {
        if (event.key === 'Escape' && $toggleButton.attr('aria-expanded') === 'true') {
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
        headerObserver.observe($header[0]);
    }

    // Resize-Handling für Layout-Wechsel (Desktop <-> Mobile)
    $(window).on('resize', function() {
        headerHeightInitialize();

        // Scrollbar-Kompensation bei geöffneter Navigation während eines Resizes neu berechnen.
        if ($toggleButton.attr('aria-expanded') === 'true') {
            clearScrollLockCompensation();
            $('body').removeClass('nav--open');
            const scrollbarWidth = getScrollbarWidth();
            $('body').addClass('nav--open');
            applyScrollLockCompensation(scrollbarWidth);
        }

        // Navigation automatisch schließen, wenn der Desktop-Breakpoint erreicht wird.
        if ($(window).outerWidth() >= 1024 && $toggleButton.attr('aria-expanded') === 'true') {
            setNavigationState(false, false);
        }
    });
}

/* ==========================================================================
 * Splide.js Carousels
 * ========================================================================== */

// Ermittelt die Anzahl der Demo-Slides im DOM vor der Initialisierung.
let demoCarouselItems = $('#splide-carousel').find('.splide__slide').length;
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
let educationCarouselItems = $('#education-carousel').find('.splide__slide').length;
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
    const $form = $('#contact-form');

    if (!$form.length) {
        return;
    }

    const $submitButton = $('[data-contact-submit]');
    const $statusElement = $('[data-contact-status]');
    const defaultSubmitHtml = $submitButton.length ? $submitButton.html() : '';

    /**
     * Setzt die globale Statusmeldung (Erfolg oder Fehler) des Formulars.
     * @param {string} message - Die anzuzeigende Nachricht.
     * @param {string} type - Der Typ der Meldung ('success' oder 'error').
     */
    function setStatus(message, type) {
        if (!$statusElement.length) return;
        $statusElement.text(message);
        $statusElement.attr('data-contact-status', type);
    }

    /**
     * Entfernt alle vorherigen Fehlermeldungen und Aria-Invalid Attribute von den Formularfeldern.
     */
    function clearErrors() {
        $form.find('[data-contact-error]').text('');
        $form.find('[aria-invalid="true"]').removeAttr('aria-invalid');
    }

    /**
     * Rendert feldspezifische Validierungsfehler aus der Server-Antwort.
     * @param {Object} errors - Ein Objekt mit den Feldnamen als Keys und den Fehlermeldungen als Values.
     */
    function renderErrors(errors) {
        $.each(errors, function(name, errorMsg) {
            const $errorElement = $form.find('[data-contact-error="' + name + '"]');
            const $field = $form.find('[name="' + name + '"]');

            if ($errorElement.length) {
                $errorElement.text(errorMsg);
            }
            if ($field.length) {
                $field.attr('aria-invalid', 'true');
            }
        });
    }

    /**
     * Sperrt oder entsperrt das Formular während des Sendevorgangs, um Mehrfach-Submits zu verhindern.
     * @param {boolean} isSubmitting - Status, ob das Formular aktuell gesendet wird.
     */
    function setSubmitting(isSubmitting) {
        $form.attr('aria-busy', isSubmitting.toString());

        if (!$submitButton.length) return;

        $submitButton.prop('disabled', isSubmitting);
        $submitButton.html(isSubmitting ? 'Nachricht wird gesendet...' : defaultSubmitHtml);
    }

    // Formular-Submit-Handler.
    $form.on('submit', function(event) {
        event.preventDefault(); // Standard-Weiterleitung blockieren.

        clearErrors();
        setStatus('', '');
        setSubmitting(true);

        $.ajax({
            url: $form.attr('action'),
            method: 'POST',
            data: new FormData($form[0]),
            processData: false,
            contentType: false,
            dataType: 'json',
            headers: {
                'Accept': 'application/json'
            }
        })
            .done(function(payload) {
                // Server meldet einen Fehler.
                if (!payload.ok) {
                    if (payload.errors) {
                        renderErrors(payload.errors);
                    }
                    setStatus(payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
                    return;
                }

                // Erfolgreich gesendet.
                $form[0].reset();
                setStatus(payload.message, 'success');
            })
            .fail(function(jqXHR) {
                const payload = jqXHR.responseJSON;

                if (payload && payload.errors) {
                    renderErrors(payload.errors);
                    setStatus(payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
                    return;
                }

                // Netzwerkfehler.
                setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
            })
            .always(function() {
                // Button am Ende immer wieder freigeben.
                setSubmitting(false);
            });
    });
}

/* ==========================================================================
 * Initialisierung bei Document Ready
 * ========================================================================== */

// Wartet, bis die HTML-Struktur vollständig geladen ist, bevor Funktionen ausgeführt werden.
jQuery(function($) {
    themeInitialize();
    headerScrollInitialize();
    mobileNavigationInitialize();
    demoCarouselInitialize();
    educationCarouselInitialize();
    contactFormInitialize();
});
