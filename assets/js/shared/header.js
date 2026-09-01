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

export function syncOffcanvasInsetWithHeader(headerElement) {
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

export function headerScrollInitialize() {
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
