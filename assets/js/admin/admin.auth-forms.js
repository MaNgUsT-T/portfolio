// Centralizes async auth-form behavior so login and password change can share
// the same status, validation and submit-state handling.
import { adminTranslate } from './admin.utils.js';

function createAdminFormState(form, submitButton, statusElement, submittingLabel) {
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
        // The backend can return one or multiple messages per field. Normalize
        // both cases so the inline error slots stay simple in the markup.
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
        submitButton.innerHTML = isSubmitting ? submittingLabel : defaultSubmitHtml;
    }

    function submitForm(onSuccess, onErrorMessage) {
        // All admin auth requests post the current form and expect JSON so both
        // forms can reuse the same request and response contract.
        return fetch(form.getAttribute('action') || window.location.href, {
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

                setStatus(onErrorMessage(result.payload), 'error');
                return;
            }

            onSuccess(result.payload);
        });
    }

    return {
        clearErrors,
        setStatus,
        setSubmitting,
        submitForm,
    };
}

export function initializeLoginForm() {
    const form = document.querySelector('#auth-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[form="auth-form"][type="submit"]');
    const statusElement = form.closest('.card__body-wrapper')?.querySelector('[data-form-status]') ?? null;
    const formState = createAdminFormState(
        form,
        submitButton,
        statusElement,
        adminTranslate('auth.login_submitting', 'Login wird geprüft...')
    );

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        formState.clearErrors();
        formState.setStatus('', '');
        formState.setSubmitting(true);

        formState.submitForm(
            (payload) => {
                // Successful login usually redirects into the admin. The status
                // fallback only matters if the backend intentionally stays put.
                if (typeof payload.redirect === 'string' && payload.redirect !== '') {
                    window.location.href = payload.redirect;
                    return;
                }

                formState.setStatus(
                    payload.message || adminTranslate('auth.login_success', 'Die Admin-Oberfläche wurde geöffnet.'),
                    'success'
                );
            },
            (payload) => {
                return payload.message || adminTranslate('auth.login_failed', 'Der Login ist fehlgeschlagen.');
            }
        ).catch(() => {
            formState.setStatus(
                adminTranslate('auth.connection_failed', 'Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.'),
                'error'
            );
        }).finally(() => {
            formState.setSubmitting(false);
        });
    });
}

export function initializeChangePasswordForm() {
    const form = document.querySelector('#change-password-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[form="change-password-form"][type="submit"]');
    const statusElement = form.closest('.card__body-wrapper')?.querySelector('[data-form-status]') ?? null;
    const formState = createAdminFormState(
        form,
        submitButton,
        statusElement,
        adminTranslate('auth.change_password_submitting', 'Passwort wird gespeichert...')
    );

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        formState.clearErrors();
        formState.setStatus('', '');
        formState.setSubmitting(true);

        formState.submitForm(
            (payload) => {
                // Clear sensitive input after a successful password change so
                // the new value does not remain in the browser fields.
                form.reset();
                formState.setStatus(
                    payload.message || adminTranslate('auth.change_password_success_short', 'Das Passwort wurde geändert.'),
                    'success'
                );
            },
            (payload) => {
                return payload.message || adminTranslate('auth.change_password_failed', 'Das Passwort konnte nicht geändert werden.');
            }
        ).catch(() => {
            formState.setStatus(
                adminTranslate('auth.connection_failed', 'Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.'),
                'error'
            );
        }).finally(() => {
            formState.setSubmitting(false);
        });
    });
}
