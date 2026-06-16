/* ==========================================================================
 * Header scrolled
 * ========================================================================== */

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 88) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
});

/* ==========================================================================
 * Carousel
 * ========================================================================== */

/* ==========================================================================
 * Splide.js Carousels
 * ========================================================================== */

// Native Zählung der Education-Slides per Vanilla JS.
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

    // Formular Submit Handler
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Standard-Weiterleitung blockieren

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
                // Server meldet einen Fehler (z.B. Validierung fehlgeschlagen)
                if (!result.ok || !result.payload.ok) {
                    if (result.payload.errors) {
                        renderErrors(result.payload.errors);
                    }

                    setStatus(result.payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
                    return;
                }

                // Erfolgreich gesendet
                form.reset();
                setStatus(result.payload.message, 'success');
            })
            .catch(function() {
                // Netzwerkfehler (z.B. keine Internetverbindung)
                setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
            })
            .finally(function() {
                setSubmitting(false); // Button am Ende immer wieder freigeben
            });
    });
}

/* ==========================================================================
 * Initialisierung bei Document Ready (Natives JavaScript)
 * ========================================================================== */

// Der DOMContentLoaded-Event-Listener ist die native Alternative zu $(document).ready()
// Er wartet, bis die HTML-Struktur vollständig geladen ist, bevor Funktionen ausgeführt werden.
document.addEventListener('DOMContentLoaded', function() {
    educationCarouselInitialize();
    contactFormInitialize();
});






