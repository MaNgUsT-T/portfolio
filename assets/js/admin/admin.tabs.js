function initializeTabs() {
    const tabRoot = document.querySelector('[data-tabs]');

    if (!tabRoot) {
        return;
    }

    const triggers = tabRoot.querySelectorAll('[data-tab-trigger]');
    const panels = tabRoot.querySelectorAll('[data-tab-panel]');

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const target = trigger.getAttribute('data-tab-trigger');

            triggers.forEach((item) => {
                item.classList.toggle('is-active', item === trigger);
            });

            panels.forEach((panel) => {
                const isActive = panel.getAttribute('data-tab-panel') === target;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
        });
    });
}
