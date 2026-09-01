export function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

export function applyScrollLockCompensation(targets = [], scrollbarWidth = getScrollbarWidth()) {
    const elements = [document.body, ...targets].filter((element) => element instanceof HTMLElement);

    if (scrollbarWidth > 0) {
        elements.forEach((element) => {
            element.style.paddingRight = scrollbarWidth + 'px';
        });

        return;
    }

    clearScrollLockCompensation(targets);
}

export function clearScrollLockCompensation(targets = []) {
    const elements = [document.body, ...targets].filter((element) => element instanceof HTMLElement);

    elements.forEach((element) => {
        element.style.removeProperty('padding-right');
    });
}
