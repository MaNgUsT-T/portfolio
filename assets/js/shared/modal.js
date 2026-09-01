import { applyScrollLockCompensation, clearScrollLockCompensation, getScrollbarWidth } from './scroll-lock.js';

const modalState = {
    initialized: false,
    root: null,
    title: null,
    body: null,
    overlay: null,
    activeContent: null,
    sourceHost: null,
    returnFocusTo: null,
    onClose: null,
};

export function initializeModal(root = document) {
    if (modalState.initialized) {
        return modalState;
    }

    const scope = root instanceof Document || root instanceof Element ? root : document;
    const modalRoot = scope.querySelector('[data-modal]');
    const modalTitle = scope.querySelector('[data-modal-title]');
    const modalBody = scope.querySelector('[data-modal-body]');
    const overlay = document.querySelector('[data-overlay]');
    const closeButtons = scope.querySelectorAll('[data-modal-close]');

    if (
        !(modalRoot instanceof HTMLElement)
        || !(modalTitle instanceof HTMLElement)
        || !(modalBody instanceof HTMLElement)
        || !(overlay instanceof HTMLElement)
    ) {
        return modalState;
    }

    modalState.initialized = true;
    modalState.root = modalRoot;
    modalState.title = modalTitle;
    modalState.body = modalBody;
    modalState.overlay = overlay;

    closeButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            closeModal();
        });
    });

    overlay.addEventListener('click', () => {
        closeModal();
    });

    modalRoot.addEventListener('click', (event) => {
        if (event.target === modalRoot) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    return modalState;
}

export function openModal({ title = '', content = null, opener = null, onClose = null } = {}) {
    initializeModal();

    if (
        !modalState.initialized
        || !(modalState.root instanceof HTMLElement)
        || !(modalState.title instanceof HTMLElement)
        || !(modalState.body instanceof HTMLElement)
        || !(content instanceof HTMLElement)
    ) {
        return false;
    }

    if (modalState.activeContent instanceof HTMLElement) {
        closeModal({ restoreFocus: false });
    }

    modalState.sourceHost = content.parentElement instanceof HTMLElement ? content.parentElement : null;
    modalState.activeContent = content;
    modalState.returnFocusTo = opener instanceof HTMLElement ? opener : document.activeElement;
    modalState.onClose = typeof onClose === 'function' ? onClose : null;

    const scrollbarWidth = getScrollbarWidth();

    modalState.title.textContent = title;
    modalState.body.replaceChildren(content);
    document.body.classList.add('modal--open');
    applyScrollLockCompensation([], scrollbarWidth);

    focusFirstModalControl();
    return true;
}

export function closeModal({ restoreFocus = true } = {}) {
    if (
        !(modalState.root instanceof HTMLElement)
        || !(modalState.body instanceof HTMLElement)
        || !(modalState.title instanceof HTMLElement)
    ) {
        return false;
    }

    const activeContent = modalState.activeContent;
    const sourceHost = modalState.sourceHost;
    const returnFocusTo = modalState.returnFocusTo;
    const onClose = modalState.onClose;

    if (typeof onClose === 'function') {
        onClose();
    }

    if (activeContent instanceof HTMLElement && sourceHost instanceof HTMLElement) {
        sourceHost.appendChild(activeContent);
    }

    modalState.body.replaceChildren();
    modalState.title.textContent = '';
    document.body.classList.remove('modal--open');
    clearScrollLockCompensation();
    modalState.activeContent = null;
    modalState.sourceHost = null;
    modalState.returnFocusTo = null;
    modalState.onClose = null;

    if (restoreFocus && returnFocusTo instanceof HTMLElement) {
        returnFocusTo.focus();
    }

    return true;
}

function focusFirstModalControl() {
    if (!(modalState.body instanceof HTMLElement)) {
        return;
    }

    const focusTarget = modalState.body.querySelector(
        'input:not([type="hidden"]):not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusTarget instanceof HTMLElement) {
        focusTarget.focus();

        if (focusTarget instanceof HTMLInputElement || focusTarget instanceof HTMLTextAreaElement) {
            focusTarget.select();
        }
    }
}
