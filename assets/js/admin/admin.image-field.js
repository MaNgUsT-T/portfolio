import { adminTranslate, escapeAdminAttribute, escapeAdminHtml } from './admin.utils.js';
import { openModal } from '../shared/modal.js';

let cachedImages = null;
let cachedImagesPromise = null;

export function initializeImageFields(root = document) {
    const scope = root instanceof Element || root instanceof Document ? root : document;

    scope.querySelectorAll('[data-image-field]').forEach((field) => {
        bindImageField(field);
    });
}

export function bindImageField(field) {
    if (!(field instanceof HTMLElement) || field.dataset.imageFieldInitialized === 'true') {
        return;
    }

    field.dataset.imageFieldInitialized = 'true';

    const input = field.querySelector('[data-image-field-input]');
    const triggerInput = field.querySelector('[data-image-field-trigger-input]');
    const manualInput = field.querySelector('[data-image-field-manual-input]');
    const openButtons = field.querySelectorAll('[data-image-field-open-modal]');
    const modalContent = field.querySelector('[data-image-field-modal-content]');
    const dropzone = field.querySelector('[data-image-field-dropzone]');
    const uploadButton = field.querySelector('[data-image-field-upload-button]');
    const toggleBrowserButton = field.querySelector('[data-image-field-toggle-browser]');
    const fileInput = field.querySelector('[data-image-field-file-input]');
    const status = field.querySelector('[data-image-field-status]');
    const previewContainer = field.querySelector('[data-image-field-preview-container]');
    const browser = field.querySelector('[data-image-field-browser]');
    const search = field.querySelector('[data-image-field-search]');
    const meta = field.querySelector('[data-image-field-meta]');
    const grid = field.querySelector('[data-image-field-grid]');
    const modalTitle = field.dataset.imageFieldModalTitle || adminTranslate('admin.image_field_modal_title', 'Bild auswählen oder hochladen');

    if (
        !(input instanceof HTMLInputElement)
        || !(triggerInput instanceof HTMLInputElement)
        || !(manualInput instanceof HTMLInputElement)
        || !(modalContent instanceof HTMLElement)
        || !(dropzone instanceof HTMLButtonElement)
        || !(uploadButton instanceof HTMLButtonElement)
        || !(toggleBrowserButton instanceof HTMLButtonElement)
        || !(fileInput instanceof HTMLInputElement)
        || !(status instanceof HTMLElement)
        || !(previewContainer instanceof HTMLElement)
        || !(browser instanceof HTMLElement)
        || !(search instanceof HTMLInputElement)
        || !(meta instanceof HTMLElement)
        || !(grid instanceof HTMLElement)
    ) {
        return;
    }

    const uploadEndpoint = field.dataset.uploadEndpoint || './admin-upload.php';
    const imagesEndpoint = field.dataset.imagesEndpoint || './admin-images.php';
    const csrfToken = field.dataset.csrfToken || '';
    const emptyMessage = grid.dataset.emptyMessage || adminTranslate('admin.image_field_empty', 'Keine Bilder gefunden.');
    const loadingMessage = adminTranslate('admin.image_field_loading', 'Bilder werden geladen...');
    const uploadFailedMessage = adminTranslate('admin.image_field_upload_failed', 'Upload fehlgeschlagen.');
    const pathAppliedMessage = adminTranslate('admin.image_field_path_applied', 'Pfad übernommen.');
    const uploadSuccessMessage = adminTranslate('admin.image_field_upload_success', 'Bild erfolgreich hochgeladen.');
    const chooseUploadedMessage = adminTranslate('admin.image_field_choose_uploaded', 'Neues Bild übernommen.');
    const chooseFromListMessage = adminTranslate('admin.image_field_choose_from_list', 'Vorhandenes Bild übernommen.');
    const previewFallback = adminTranslate('admin.image_field_no_preview', 'Noch keine Vorschau.');
    let browserLoaded = false;
    let filteredImages = [];
    let renderedImageCount = 0;
    let lastFocusedElement = null;

    function getGridColumnCount() {
        if (window.matchMedia('(min-width: 64rem)').matches) {
            return 6;
        }

        if (window.matchMedia('(min-width: 48rem)').matches) {
            return 4;
        }

        if (window.matchMedia('(min-width: 36rem)').matches) {
            return 3;
        }

        return 2;
    }

    function getInitialBatchSize() {
        return getGridColumnCount() * 2;
    }

    function getNextBatchSize() {
        return getGridColumnCount();
    }

    function getModalScrollContainer() {
        return modalContent.closest('.modal__body');
    }

    function setStatus(message, type = '') {
        status.textContent = message;
        status.dataset.status = type;
    }

    function normalizePreviewUrl(path) {
        if (typeof path !== 'string' || path.trim() === '') {
            return '';
        }

        const trimmedPath = path.trim();

        if (/^(?:https?:)?\/\//i.test(trimmedPath) || trimmedPath.startsWith('data:')) {
            return trimmedPath;
        }

        if (trimmedPath.startsWith('./')) {
            return '../' + trimmedPath.slice(2);
        }

        if (trimmedPath.startsWith('/')) {
            return trimmedPath;
        }

        return '../' + trimmedPath.replace(/^\/+/, '');
    }

    function renderPreview(path, altText = '') {
        const previewUrl = normalizePreviewUrl(path);

        if (previewUrl === '') {
            previewContainer.innerHTML = '<span class="admin-image-field__preview-empty" data-image-field-preview-empty>' +
                escapeAdminHtml(previewFallback) +
                '</span>';
            return;
        }

        previewContainer.innerHTML = '<img src="' + escapeAdminAttribute(previewUrl) + '" alt="' +
            escapeAdminAttribute(altText || triggerInput.placeholder || input.name) + '" data-image-field-preview>';
    }

    function syncTriggerFields(path) {
        input.value = path;
        triggerInput.value = path;
        manualInput.value = path;
    }

    function setSelectedPath(path, message, metaText = '') {
        syncTriggerFields(path);
        renderPreview(path, triggerInput.placeholder || input.name);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        setStatus(metaText !== '' ? message + ' ' + metaText : message, 'success');
    }

    function getImages() {
        if (Array.isArray(cachedImages)) {
            return Promise.resolve(cachedImages);
        }

        if (cachedImagesPromise) {
            return cachedImagesPromise;
        }

        cachedImagesPromise = fetch(imagesEndpoint, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'same-origin',
        }).then(async (response) => {
            const payload = await response.json();

            if (!response.ok || !payload.ok || !Array.isArray(payload.files)) {
                throw new Error(typeof payload.message === 'string' ? payload.message : loadingMessage);
            }

            cachedImages = payload.files;
            return cachedImages;
        }).finally(() => {
            cachedImagesPromise = null;
        });

        return cachedImagesPromise;
    }

    function refreshImages() {
        cachedImages = null;
        cachedImagesPromise = null;

        return getImages();
    }

    function getImageTypeLabel(image) {
        if (image && typeof image.mime === 'string' && image.mime.trim() !== '') {
            return image.mime.trim().toUpperCase();
        }

        const fileName = image && typeof image.name === 'string' && image.name !== ''
            ? image.name
            : (image && typeof image.path === 'string' ? image.path : '');
        const extension = fileName.includes('.') ? fileName.split('.').pop() || '' : '';

        return extension !== '' ? extension.toUpperCase() : 'DATEI';
    }

    function getImageDisplayName(image) {
        const fileName = image && typeof image.name === 'string' && image.name !== ''
            ? image.name
            : (image && typeof image.path === 'string' ? image.path.split('/').pop() || image.path : '');

        return fileName.replace(/\.[^.]+$/, '');
    }

    function renderGridItems(items, append = false) {
        const markup = items.map((image) => {
            const path = typeof image.path === 'string' ? image.path : '';
            const name = typeof image.name === 'string' && image.name !== '' ? image.name : path;
            const displayName = getImageDisplayName(image);
            const typeLabel = getImageTypeLabel(image);
            const url = typeof image.url === 'string' ? image.url : normalizePreviewUrl(path);
            const selectedClass = input.value.trim() === path ? ' is-selected' : '';
            const thumbMarkup = url === ''
                ? ''
                : '<img src="' + escapeAdminAttribute(url) + '" alt="' + escapeAdminAttribute(name) + '">';

            return [
                '<button type="button" class="admin-image-field__browser-grid-item' + selectedClass + '" data-image-field-select data-image-path="' + escapeAdminAttribute(path) + '">',
                    '<span class="admin-image-field__browser-grid-item-thumb">' + thumbMarkup + '</span>',
                    '<span class="admin-image-field__browser-grid-item-title text-truncate">' + escapeAdminHtml(displayName) + '</span>',
                    '<span class="admin-image-field__browser-grid-item-type">' + escapeAdminHtml(typeLabel) + '</span>',
                '</button>',
            ].join('');
        }).join('');

        if (append) {
            grid.insertAdjacentHTML('beforeend', markup);
            return;
        }

        grid.innerHTML = markup;
    }

    function renderNextGridBatch() {
        if (renderedImageCount >= filteredImages.length) {
            return;
        }

        const batchSize = renderedImageCount === 0 ? getInitialBatchSize() : getNextBatchSize();
        const nextItems = filteredImages.slice(renderedImageCount, renderedImageCount + batchSize);
        renderGridItems(nextItems, renderedImageCount > 0);
        renderedImageCount += nextItems.length;
    }

    function fillGridUntilModalOverflows() {
        const modalScrollContainer = getModalScrollContainer();

        if (!(modalScrollContainer instanceof HTMLElement) || browser.hidden) {
            return;
        }

        while (renderedImageCount < filteredImages.length && modalScrollContainer.scrollHeight <= modalScrollContainer.clientHeight) {
            renderNextGridBatch();
        }
    }

    function maybeLoadNextGridBatchFromModalScroll() {
        const modalScrollContainer = getModalScrollContainer();

        if (!(modalScrollContainer instanceof HTMLElement) || browser.hidden) {
            return;
        }

        if (renderedImageCount >= filteredImages.length) {
            return;
        }

        if (modalScrollContainer.scrollTop + modalScrollContainer.clientHeight < modalScrollContainer.scrollHeight - 48) {
            return;
        }

        renderNextGridBatch();
        fillGridUntilModalOverflows();
    }

    function renderGrid(filter = '') {
        const images = Array.isArray(cachedImages) ? cachedImages : [];
        const normalizedFilter = filter.trim().toLowerCase();
        filteredImages = images.filter((image) => {
            if (!image || typeof image.path !== 'string') {
                return false;
            }

            if (normalizedFilter === '') {
                return true;
            }

            return image.path.toLowerCase().includes(normalizedFilter)
                || (typeof image.name === 'string' && image.name.toLowerCase().includes(normalizedFilter));
        });

        renderedImageCount = 0;

        if (!filteredImages.length) {
            grid.innerHTML = '<p class="admin-image-field__empty">' + escapeAdminHtml(emptyMessage) + '</p>';
            meta.textContent = emptyMessage;
            return;
        }

        meta.textContent = String(filteredImages.length);
        grid.innerHTML = '';
        renderNextGridBatch();
        fillGridUntilModalOverflows();
    }

    function openBrowser() {
        browser.hidden = false;
        toggleBrowserButton.setAttribute('aria-expanded', 'true');
        setStatus(loadingMessage, '');

        if (browserLoaded) {
            renderGrid(search.value);
            setStatus('', '');
            search.focus();
            return;
        }

        refreshImages().then(() => {
            browserLoaded = true;
            renderGrid(search.value);
            setStatus('', '');
            search.focus();
        }).catch((error) => {
            setStatus(error instanceof Error ? error.message : loadingMessage, 'error');
        });
    }

    function closeBrowser() {
        browser.hidden = true;
        toggleBrowserButton.setAttribute('aria-expanded', 'false');
    }

    function openFieldModal(sourceElement = null) {
        lastFocusedElement = sourceElement instanceof HTMLElement ? sourceElement : document.activeElement;
        openModal({
            title: modalTitle,
            content: modalContent,
            opener: lastFocusedElement,
            onClose: () => {
                closeBrowser();
                setStatus('', '');
            },
        });
    }

    function uploadFiles(files) {
        if (!files.length) {
            return;
        }

        const formData = new FormData();
        formData.append('csrf_token', csrfToken);

        files.forEach((file) => {
            formData.append('images[]', file, file.name);
        });

        setStatus(adminTranslate('admin.image_field_uploading', 'Upload läuft...'), '');
        uploadButton.disabled = true;
        dropzone.disabled = true;

        fetch(uploadEndpoint, {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
            },
            credentials: 'same-origin',
        }).then(async (response) => {
            const payload = await response.json();

            if (!response.ok || !payload.ok || !Array.isArray(payload.files)) {
                throw new Error(typeof payload.message === 'string' ? payload.message : uploadFailedMessage);
            }

            const uploadedFiles = payload.files.filter((file) => file && typeof file.path === 'string');

            if (!uploadedFiles.length) {
                throw new Error(uploadFailedMessage);
            }

            cachedImages = Array.isArray(cachedImages)
                ? mergeImageLists(uploadedFiles, cachedImages)
                : uploadedFiles;
            browserLoaded = false;

            if (!browser.hidden) {
                refreshImages().then(() => {
                    browserLoaded = true;
                    renderGrid(search.value);
                }).catch((error) => {
                    setStatus(error instanceof Error ? error.message : loadingMessage, 'error');
                });
            }

            const firstFile = uploadedFiles[0];
            const metaText = Number.isFinite(firstFile.width) && Number.isFinite(firstFile.height)
                ? '(' + String(firstFile.width) + ' x ' + String(firstFile.height) + ')'
                : '';

            setSelectedPath(
                firstFile.path,
                files.length > 1 ? uploadSuccessMessage : chooseUploadedMessage,
                metaText
            );
        }).catch((error) => {
            setStatus(error instanceof Error ? error.message : uploadFailedMessage, 'error');
        }).finally(() => {
            uploadButton.disabled = false;
            dropzone.disabled = false;
            fileInput.value = '';
        });
    }

    openButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            openFieldModal(button);
        });
    });

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        uploadFiles(Array.from(fileInput.files || []));
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.classList.add('is-dragover');
        });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.classList.remove('is-dragover');
        });
    });

    dropzone.addEventListener('drop', (event) => {
        const files = Array.from(event.dataTransfer?.files || []).filter((file) => file.type.startsWith('image/'));
        uploadFiles(files);
    });

    toggleBrowserButton.addEventListener('click', () => {
        if (browser.hidden) {
            openBrowser();
            return;
        }

        closeBrowser();
    });

    search.addEventListener('input', () => {
        renderGrid(search.value);
    });

    document.addEventListener('scroll', (event) => {
        if (event.target !== getModalScrollContainer()) {
            return;
        }

        maybeLoadNextGridBatchFromModalScroll();
    }, { passive: true, capture: true });

    window.addEventListener('resize', () => {
        if (!browserLoaded || browser.hidden) {
            return;
        }

        renderGrid(search.value);
    });

    grid.addEventListener('click', (event) => {
        const selectButton = event.target instanceof Element
            ? event.target.closest('[data-image-field-select]')
            : null;

        if (!(selectButton instanceof HTMLButtonElement)) {
            return;
        }

        const selectedPath = selectButton.dataset.imagePath || '';
        const selectedImage = Array.isArray(cachedImages)
            ? cachedImages.find((image) => image && image.path === selectedPath)
            : null;
        const metaText = selectedImage && Number.isFinite(selectedImage.width) && Number.isFinite(selectedImage.height)
            ? '(' + String(selectedImage.width) + ' x ' + String(selectedImage.height) + ')'
            : '';

        setSelectedPath(selectedPath, chooseFromListMessage || pathAppliedMessage, metaText);
        renderGrid(search.value);
    });

    manualInput.addEventListener('input', () => {
        syncTriggerFields(manualInput.value);
        renderPreview(manualInput.value, triggerInput.placeholder || input.name);

        if (browserLoaded) {
            renderGrid(search.value);
        }
    });

    syncTriggerFields(input.value);
    renderPreview(input.value, triggerInput.placeholder || input.name);
}

function mergeImageLists(primaryImages, secondaryImages) {
    const map = new Map();

    [...primaryImages, ...secondaryImages].forEach((image) => {
        if (!image || typeof image.path !== 'string') {
            return;
        }

        map.set(image.path, image);
    });

    return Array.from(map.values()).sort((left, right) => {
        const leftModified = Number.isFinite(Number(left && left.modified)) ? Number(left.modified) : 0;
        const rightModified = Number.isFinite(Number(right && right.modified)) ? Number(right.modified) : 0;

        if (leftModified !== rightModified) {
            return rightModified - leftModified;
        }

        return String(left.path).localeCompare(String(right.path));
    });
}
