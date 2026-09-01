import {
    applyScrollLockCompensation,
    clearScrollLockCompensation,
    getScrollbarWidth,
} from './scroll-lock.js';
import { syncOffcanvasInsetWithHeader } from './header.js';

export function mobileNavigationInitialize() {
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
            applyScrollLockCompensation([toggleButton], scrollbarWidth);
        } else {
            clearScrollLockCompensation([toggleButton]);
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
            clearScrollLockCompensation([toggleButton]);
            document.body.classList.remove('nav--open');
            const scrollbarWidth = getScrollbarWidth();
            document.body.classList.add('nav--open');
            applyScrollLockCompensation([toggleButton], scrollbarWidth);
        }

        if (window.innerWidth >= 1024 && toggleButton.getAttribute('aria-expanded') === 'true') {
            setNavigationState(false, false);
        }
    });
}
