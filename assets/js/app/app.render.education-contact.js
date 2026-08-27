// Renders the education carousel and the full contact section, including the
// dynamic form controls used by the frontend validation layer.
function renderEducation(viewModel) {
    return [
        '<section class="education">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div id="education-carousel" role="group" aria-label="' + escapeAttribute(viewModel.carouselLabel) + '" class="splide splide--education">',
                    '<div class="splide__track">',
                        '<ul class="splide__list">',
                            viewModel.courses.map(function(item) {
                                return [
                                    '<li class="splide__slide">',
                                        '<div class="card card--education-item">',
                                            '<div class="card__header">',
                                                '<div class="card__icon">',
                                                    icon('certificate'),
                                                '</div>',
                                            '</div>',
                                            '<div class="card__body">',
                                                '<div class="card__body-wrapper">',
                                                    '<h3>' + escapeHtml(item.title) + '</h3>',
                                                    '<p>' + escapeHtml(item.provider) + '</p>',
                                                '</div>',
                                            '</div>',
                                            '<div class="card__footer">',
                                                '<p>' + escapeHtml(item.year) + '</p>',
                                                '<p class="highlight">' + icon('verify') + escapeHtml(item.status) + '</p>',
                                            '</div>',
                                        '</div>',
                                    '</li>',
                                ].join('');
                            }).join(''),
                        '</ul>',
                    '</div>',
                    '<div class="splide__arrows">',
                        '<button class="splide__arrow splide__arrow--prev">' + icon('arrow-right') + '</button>',
                        '<button class="splide__arrow splide__arrow--next">' + icon('arrow-right') + '</button>',
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderField(viewModel) {
    const requiredSuffix = viewModel.required ? ' <sup>*</sup>' : '';
    const errorMarkup = '<span data-form-error="' + escapeAttribute(viewModel.name) + '"></span>';

    if (viewModel.type === 'textarea') {
        return [
            '<div class="' + viewModel.wrapperClass + '">' +
                '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
                '<textarea ',
                    'id="' + escapeAttribute(viewModel.id) + '" ',
                    'name="' + escapeAttribute(viewModel.name) + '" ',
                    'placeholder="' + escapeAttribute(viewModel.placeholder) + '" ',
                    'rows="' + escapeAttribute(viewModel.rows) + '"></textarea>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    if (viewModel.type === 'radio') {
        return [
            '<div class="' + viewModel.wrapperClass + '">',
                '<label>' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
                viewModel.options.map(function(option) {
                    return [
                        '<div class="form-check">',
                            '<input ',
                                'type="radio" ',
                                'id="' + escapeAttribute(option.id) + '" ',
                                'name="' + escapeAttribute(viewModel.name) + '" ',
                                'value="' + escapeAttribute(option.value) + '" ',
                            '>',
                            '<label for="' + escapeAttribute(option.id) + '">' + escapeHtml(option.label) + '</label>',
                        '</div>',
                    ].join('');
                }).join(''),
                errorMarkup,
            '</div>',
        ].join('');
    }

    if (viewModel.type === 'select') {
        // The native select remains the source of truth; the custom UI mirrors
        // it so keyboard, submission and validation still behave predictably.
        const selectedOption = viewModel.options.find(function(option) {
            return option.selected;
        }) || viewModel.options[0] || { value: '', label: '' };
        const placeholder = viewModel.options[0] ? viewModel.options[0].label : viewModel.label;

        return [
            '<div class="' + viewModel.wrapperClass + ' custom-select-field" data-custom-select data-custom-select-placeholder="' +
                escapeAttribute(placeholder) + '">',
                '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
                '<div class="custom-select js-custom-select">',
                    '<select id="' + escapeAttribute(viewModel.id) + '" name="' + escapeAttribute(viewModel.name) +
                        '" class="custom-select__native js-custom-select__native" data-custom-select-native>',
                        viewModel.options.map(function(option) {
                            const selected = option.selected ? ' selected' : '';

                            return '<option value="' + escapeAttribute(option.value) + '"' + selected + '>' + escapeHtml(option.label) + '</option>';
                        }).join(''),
                    '</select>',
                    '<div class="custom-select__ui js-custom-select__ui">',
                        '<button type="button" class="custom-select__toggle js-custom-select__toggle" aria-expanded="false" ' +
                            'aria-haspopup="listbox" aria-controls="' + escapeAttribute(viewModel.id) + '-panel">',
                            '<span class="custom-select__toggle-label js-custom-select__toggle-label" data-custom-select-label>' +
                                escapeHtml(selectedOption.label || placeholder) + '</span>',
                            '<span class="custom-select__toggle-indicator">' + icon('chevron-down') + '</span>',
                        '</button>',
                        '<div id="' + escapeAttribute(viewModel.id) + '-panel" class="custom-select__panel js-custom-select__panel" role="listbox" hidden>',
                            '<div class="custom-select__options">',
                                viewModel.options.map(function(option) {
                                    const isSelected = option.selected ? ' is-selected' : '';

                                    return [
                                        '<button type="button" class="custom-select__option js-custom-select__option' + isSelected +
                                            '" data-custom-select-option data-option-value="' + escapeAttribute(option.value) +
                                            '" aria-selected="' + String(option.selected) + '" title="' + escapeAttribute(option.label) + '">',
                                            escapeHtml(option.label),
                                        '</button>',
                                    ].join('');
                                }).join(''),
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    if (viewModel.type === 'checkbox') {
        return [
            '<div class="' + viewModel.wrapperClass + '">',
                '<div class="form-check">',
                    '<input ',
                        'type="checkbox" ',
                        'id="' + escapeAttribute(viewModel.id) + '" ',
                        'name="' + escapeAttribute(viewModel.name) + '" ',
                        'value="' + escapeAttribute(viewModel.value || '1') + '" ',
                    '>',
                    '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + '</label>',
                '</div>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    const attributes = [
        'type="' + escapeAttribute(viewModel.type) + '"',
        'id="' + escapeAttribute(viewModel.id) + '"',
        'name="' + escapeAttribute(viewModel.name) + '"'
    ];

    if (viewModel.placeholder) {
        attributes.push('placeholder="' + escapeAttribute(viewModel.placeholder) + '"');
    }

    return [
        '<div class="' + viewModel.wrapperClass + '">',
            '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
            '<input ' + attributes.join(' ') + '>',
            errorMarkup,
        '</div>',
    ].join('');
}

function renderContactHoneypotField() {
    // Hidden bot trap that is ignored by users and checked server-side.
    return [
        '<div class="form-group form-group--honeypot" aria-hidden="true">',
            '<input ',
                'type="text" ',
                'id="honeypot" ',
                'name="honeypot" ',
                'autocomplete="off" ',
                'tabindex="-1"',
            '>',
        '</div>',
    ].join('');
}

function renderContactFields(fields) {
    const markup = [];

    for (let index = 0; index < fields.length; index += 1) {
        const field = fields[index];

        if (field.row) {
            const nextField = fields[index + 1];

            if (nextField && nextField.row) {
                // Pair adjacent row fields into one two-column wrapper while
                // leaving every other field in the natural document flow.
                markup.push([
                    '<div class="form-row">',
                        renderField(field),
                        renderField(nextField),
                    '</div>',
                ].join(''));
                index += 1;
                continue;
            }
        }

        markup.push(renderField(field));
    }

    return markup.join('');
}

function renderContact(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="contact">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="contact__wrapper">',
                    [
                        '<div class="card card--contact-item">',
                            '<div class="card__header">',
                                '<div class="card__icon">' + icon('coffee') + '</div>',
                                '<h3>' + escapeHtml(viewModel.introCard.title) + '</h3>',
                            '</div>',
                            '<div class="card__body">',
                                '<div class="card__body-wrapper">',
                                    '<p>' + escapeHtml(viewModel.introCard.text) + '</p>',
                                    '<a href="./contact-mailto.php"><span>' + icon('mail') + '</span><b>' + escapeHtml(viewModel.introCard.linkLabel) + '</b></a>',
                                '</div>',
                            '</div>',
                        '</div>',
                    ].join(''),
                    '<div class="card card--contact-item">',
                        '<div class="card__body">',
                            '<div class="card__body-wrapper">',
                                '<div class="contact-form__status" data-form-status aria-live="polite"></div>',
                                // The submit button lives in the card footer,
                                // so the form keeps a stable `id` for the
                                // external `form` attribute binding.
                                '<form method="post" action="' + escapeAttribute(viewModel.form.action) + '" id="contact-form" class="contact-form" novalidate>',
                                    renderContactHoneypotField(),
                                    renderContactFields(viewModel.form.fields),
                                '</form>',
                            '</div>',
                        '</div>',
                        '<div class="card__footer">',
                            renderButtonElement(viewModel.form.submitButton, [
                                'type="submit"',
                                'form="contact-form"',
                                'data-contact-submit',
                            ]),
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderFooter(viewModel, siteConfig) {
    return [
        '<footer class="footer">',
            '<div class="container footer__wrapper">',
                '<div class="logo">' + icon(siteConfig.logoIcon) + '<span>' + escapeHtml(siteConfig.logoText) + '</span></div>',
                '<p>' + escapeHtml(viewModel.text) + ' <span class="text-nowrap">&copy; ' + escapeHtml(viewModel.copyright) + '</span> ' + escapeHtml(viewModel.owner) + '</p>',
                '<div class="social-icons">' + renderSocialLinks(siteConfig.socialLinks) + '</div>',
            '</div>',
        '</footer>'
    ].join('');
}
