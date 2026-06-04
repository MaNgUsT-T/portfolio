/*
 * Header scrolled
 *
*/

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 88) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
});



/*
 * Carousel
 *
*/

let demoCarouselItems = $('#splide-carousel').find('.splide__slide').length;
console.log(demoCarouselItems);

function demoCarouselInitialize() {
    if (demoCarouselItems > 0) {
        const demoItemList = new Splide( '#splide-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: '4rem',
            destroy: 1 >= demoCarouselItems ? true : false,
            mediaQuery: 'min',
            breakpoints: {
                768: {
                    perPage: 2,
                    perMove: 2,
                    destroy: 2 >= demoCarouselItems ? true : false
                },
                1200: {
                    perPage: 4,
                    perMove: 4,
                    destroy: 4 >= demoCarouselItems ? true : false
                }
            }
        });
        demoItemList.mount();
    }
}




let educationCarouselItems = $('#education-carousel').find('.splide__slide').length;
console.log(educationCarouselItems);

/*
 * JS
 *
*/

/*
document.addEventListener( 'DOMContentLoaded', function () {
    new Splide( '#education-carousel', {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '4rem',
        destroy: 1 >= educationCarouselItems ? true : false,
        mediaQuery: 'min',
        breakpoints: {
            768: {
                perPage: 2,
                perMove: 2,
                destroy: 2 >= educationCarouselItems ? true : false
            },
            1200: {
                perPage: 4,
                perMove: 4,
                destroy: 4 >= educationCarouselItems ? true : false
            }
        }
    } ).mount();
} );
*/

/*
 * JQuery
 *
*/

function educationCarouselInitialize() {
    if (educationCarouselItems > 0) {
        const educationItemList = new Splide( '#education-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: '4rem',
            destroy: 1 >= educationCarouselItems ? true : false,
            mediaQuery: 'min',
            breakpoints: {
                768: {
                    perPage: 2,
                    perMove: 2,
                    destroy: 2 >= educationCarouselItems ? true : false
                },
                1200: {
                    perPage: 4,
                    perMove: 4,
                    destroy: 4 >= educationCarouselItems ? true : false
                }
            }
        });
        educationItemList.mount();
    }
}

function contactFormInitialize() {
    const form = document.querySelector('#contact-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[data-contact-submit]');
    const statusElement = document.querySelector('[data-contact-status]');
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    function setStatus(message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.dataset.contactStatus = type;
    }

    function clearErrors() {
        form.querySelectorAll('[data-contact-error]').forEach(function(errorElement) {
            errorElement.textContent = '';
        });

        form.querySelectorAll('[aria-invalid="true"]').forEach(function(field) {
            field.removeAttribute('aria-invalid');
        });
    }

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

    function setSubmitting(isSubmitting) {
        form.setAttribute('aria-busy', String(isSubmitting));

        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.innerHTML = isSubmitting ? 'Nachricht wird gesendet...' : defaultSubmitHtml;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
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
                if (!result.ok || !result.payload.ok) {
                    if (result.payload.errors) {
                        renderErrors(result.payload.errors);
                    }

                    setStatus(result.payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
                    return;
                }

                form.reset();
                setStatus(result.payload.message, 'success');
            })
            .catch(function() {
                setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
            })
            .finally(function() {
                setSubmitting(false);
            });
    });
}

(function($) {
    $(document).ready(demoCarouselInitialize);
    $(document).ready(educationCarouselInitialize);
    $(document).ready(contactFormInitialize);
})(jQuery);
