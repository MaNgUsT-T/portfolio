import { isPlainObject } from './app.utils.js';

export function contactFormInitialize() {
    const form = document.querySelector('#contact-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[data-contact-submit]');
    const statusElement = document.querySelector('[data-form-status]');
    const honeypotField = form.querySelector('[data-honeypot-field]');
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    function setStatus(message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.dataset.formStatus = type;
    }

    function renderErrors(errors) {
        if (!isPlainObject(errors)) {
            return;
        }

        Object.keys(errors).forEach(function(name) {
            const errorElement = form.querySelector('[data-form-error="' + name + '"]');
            const field = form.querySelector('[name="' + name + '"]');
            const message = typeof errors[name] === 'string' ? errors[name] : '';

            if (errorElement) {
                errorElement.textContent = message;
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

    function parseResponse(response) {
        return response.text().then(function(body) {
            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            let payload = null;

            if (body !== '' && contentType.includes('application/json')) {
                try {
                    payload = JSON.parse(body);
                } catch (error) {
                    return {
                        ok: response.ok,
                        payload: null,
                        errorType: 'invalid-json',
                    };
                }
            }

            return {
                ok: response.ok,
                payload: isPlainObject(payload) ? payload : null,
                errorType: payload === null ? 'non-json' : '',
            };
        });
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        form.querySelectorAll('[data-form-error]').forEach(function(errorElement) {
            errorElement.textContent = '';
        });
        form.querySelectorAll('[aria-invalid="true"]').forEach(function(field) {
            field.removeAttribute('aria-invalid');
        });

        setStatus('', '');
        setSubmitting(true);

        const formData = new FormData(form);

        if (honeypotField instanceof HTMLInputElement) {
            formData.append('honeypot', honeypotField.value);
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json'
            }
        }).then(function(response) {
            return parseResponse(response);
        }).then(function(result) {
            if (result.errorType === 'invalid-json') {
                setStatus('Der Server hat eine ungültige Antwort gesendet. Bitte versuche es später erneut.', 'error');
                return;
            }

            if (result.payload === null) {
                setStatus(
                    result.ok
                        ? 'Der Server hat keine verwertbare Antwort gesendet. Bitte versuche es erneut.'
                        : 'Der Server hat einen Fehler zurückgegeben. Bitte versuche es später erneut.',
                    'error'
                );
                return;
            }

            if (!result.ok || !result.payload.ok) {
                if (result.payload.errors) {
                    renderErrors(result.payload.errors);
                }

                setStatus(result.payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
                return;
            }

            if (result.payload.honeypot === true) {
                setStatus(result.payload.message || 'Bitte prüfe deine Angaben.', 'error');
                return;
            }

            form.reset();
            setStatus(result.payload.message, 'success');
        }).catch(function() {
            setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
        }).finally(function() {
            setSubmitting(false);
        });
    });
}
