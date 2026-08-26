// @prepros-prepend all.js
/**
 * @fileoverview Haupt-JavaScript-Datei für das Frontend.
 * Lädt die Portfoliodaten aus data.json, rendert die Seite und initialisiert
 * danach Theme, Navigation, Carousel und Kontaktformular.
 */

const SITE_DATA_PATH = './data/data.json';

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function renderPicture(image) {
    const imageSrc = image.src || (image.fallback && image.fallback.src) || '';
    const imageWidth = image.width || (image.fallback && image.fallback.width) || '';
    const imageHeight = image.height || (image.fallback && image.fallback.height) || '';
    const responsiveSources = Array.isArray(image.responsive)
        ? image.responsive
        : (Array.isArray(image.sources) ? image.sources : []);

    return [
        '<picture>',
        responsiveSources.map(function(source) {
            return [
                '<source media="' + escapeAttribute(source.media) + '" srcset="' + escapeAttribute(source.srcset) +
                    '" width="' + escapeAttribute(source.width) + '" height="' + escapeAttribute(source.height) + '">',
            ].join('');
        }).join(''),
        '<img src="' + escapeAttribute(imageSrc) + '" width="' + escapeAttribute(imageWidth) +
            '" height="' + escapeAttribute(imageHeight) + '" alt="' + escapeAttribute(image.alt) +
            '" loading="' + escapeAttribute(image.loading) + '" class="' + escapeAttribute(image.className) + '">',
        '</picture>'
    ].join('');
}

function renderSocialLinks(items) {
    return items.map(function(item) {
        return [
            '<a href="' + escapeAttribute(item.href) + '" title="' + escapeAttribute(item.title) + '">',
            icon(item.icon),
            '</a>',
        ].join('');
    }).join('');
}

function resolveSiteConfig(data) {
    const site = data && typeof data.site === 'object' && data.site !== null ? data.site : {};
    const header = data && typeof data.header === 'object' && data.header !== null ? data.header : {};
    const footer = data && typeof data.footer === 'object' && data.footer !== null ? data.footer : {};
    const hero = data && typeof data.hero === 'object' && data.hero !== null ? data.hero : {};

    return {
        logoIcon: site.logoIcon || header.logoIcon || 'palette',
        logoText: site.logoText || header.logoText || footer.logoText || 'lisa.weber',
        socialLinks: Array.isArray(site.socialLinks)
            ? site.socialLinks
            : Array.isArray(hero.socialLinks)
                ? hero.socialLinks
                : Array.isArray(footer.socialLinks)
                    ? footer.socialLinks
                    : [],
    };
}

function renderHeader(data, siteConfig) {
    return [
        '<header class="header js-header">',
            '<div class="container header__wrapper">',
                '<div class="logo">' + icon(siteConfig.logoIcon) + '<span>' + escapeHtml(siteConfig.logoText) + '</span></div>',
                '<div id="header-navigation" aria-hidden="true" class="header__nav-wrapper js-header-nav-wrapper">',
                    '<nav role="navigation" aria-label="Navigation" class="main-nav">',
                        '<ul>',
                            data.navigation.map(function(item) {
                                const title = item.title ? ' title="' + escapeAttribute(item.title) + '"' : '';
                                return [
                                    '<li><a href="' + escapeAttribute(item.href) + '"' + title + '>' + escapeHtml(item.label) + '</a></li>',
                                ].join('');
                            }).join(''),
                        '</ul>',
                    '</nav>',
                    '<nav class="option-nav">',
                        '<ul>',
                            '<li><a href="#" title="Dunkles Theme aktivieren" aria-label="Dunkles Theme aktivieren" aria-pressed="false" data-theme-toggle>' + icon('moon') + '</a></li>',
                            '<li><a href="' + escapeAttribute(data.resumeLink.href) + '" class="btn btn--primary">' + escapeHtml(data.resumeLink.label) + '</a></li>',
                        '</ul>',
                    '</nav>',
                '</div>',
                '<div role="button" aria-expanded="false" aria-controls="header-navigation" aria-label="Navigation öffnen" tabindex="0" class="mobile-nav-toggle" data-mobile-nav-toggle>' + icon('menu') + '</div>',
            '</div>',
        '</header>'
    ].join('');
}

function renderHero(data, siteConfig) {
    const heroButtons = Array.isArray(data.buttons) ? data.buttons : [];
    const headlineMarkup = typeof data.headline === 'string'
        ? data.headline
        : escapeHtml(data.headline.beforeItalic) + '<i>' + escapeHtml(data.headline.italic) + '</i>' +
            escapeHtml(data.headline.afterItalic);
    const introMarkup = typeof data.intro === 'string'
        ? data.intro
        : escapeHtml(data.intro.beforeBold) + '<b>' + escapeHtml(data.intro.bold) + '</b>' +
            escapeHtml(data.intro.afterBold);

    return [
        '<section id="hero" class="hero">',
            '<div class="container hero__wrapper">',
                '<div class="hero__col">',
                    '<p class="availability">' + escapeHtml(data.availability) + '</p>',
                    '<h1>' + headlineMarkup + '</h1>',
                    '<p>' + introMarkup + '</p>',
                    heroButtons.length ? '<div class="hero__buttons">' + heroButtons.map(renderButtonLink).join('') + '</div>' : '',
                    '<div class="social-icons">' + renderSocialLinks(siteConfig.socialLinks) + '</div>',
                '</div>',
                '<div class="hero__col">',
                    '<div>',
                        '<div class="hero-element"></div>',
                        '<div class="hero-element"><div></div><div></div><div></div><div><span></span><span></span></div></div>',
                        '<div class="hero-element"><div><div></div><div><div></div><div></div></div></div><div></div><div></div><div></div></div>',
                        '<div class="hero-element"></div>',
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderButtonLink(button) {
    if (!button || typeof button !== 'object') {
        return '';
    }

    const variant = typeof button.variant === 'string' && ['btn--primary', 'btn--secondary', 'btn--danger'].includes(button.variant)
        ? button.variant
        : 'btn--primary';
    const classNames = ['btn', variant];

    if (button.large === true) {
        classNames.push('btn--large');
    }

    const iconMarkup = typeof button.icon === 'string' && button.icon !== '' ? icon(button.icon) : '';

    return [
        '<a href="' + escapeAttribute(button.href || '#') + '" class="' + escapeAttribute(classNames.join(' ')) + '">',
        escapeHtml(button.label || ''),
        iconMarkup,
        '</a>',
    ].join('');
}

function resolveButtonConfig(button, fallbackLabel) {
    if (!button || typeof button !== 'object') {
        return {
            label: fallbackLabel || '',
            variant: 'btn--primary',
            large: false,
            icon: '',
        };
    }

    return {
        label: typeof button.label === 'string' ? button.label : (fallbackLabel || ''),
        variant: typeof button.variant === 'string' ? button.variant : 'btn--primary',
        large: button.large === true,
        icon: typeof button.icon === 'string' ? button.icon : '',
    };
}

function renderButtonElement(button, attributes) {
    const buttonConfig = resolveButtonConfig(button, '');
    const variant = ['btn--primary', 'btn--secondary', 'btn--danger'].includes(buttonConfig.variant)
        ? buttonConfig.variant
        : 'btn--primary';
    const classNames = ['btn', variant];
    const htmlAttributes = Array.isArray(attributes) ? attributes.slice() : [];

    if (buttonConfig.large === true) {
        classNames.push('btn--large');
    }

    htmlAttributes.push('class="' + escapeAttribute(classNames.join(' ')) + '"');

    return [
        '<button ' + htmlAttributes.join(' ') + '>',
            escapeHtml(buttonConfig.label),
            buttonConfig.icon !== '' ? icon(buttonConfig.icon) : '',
        '</button>',
    ].join('');
}

function renderAbout(data) {
    const aboutImages = Array.isArray(data.images)
        ? data.images
        : (data.image ? [data.image] : []);

    return [
        '<section id="' + escapeAttribute(data.id) + '" class="about">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
                '<h2>' + escapeHtml(data.title) + '</h2>',
                '<div class="about__wrapper">',
                    '<div class="about__col">',
                        data.paragraphs.map(function(paragraph) {
                            return [
                                '<p>' + escapeHtml(paragraph) + '</p>',
                            ].join('');
                        }).join(''),
                        '<div class="about__images">' + aboutImages.map(function(image) {
                            return renderPicture(image);
                        }).join('') + '</div>',
                    '</div>',
                    '<div class="about__col">',
                        data.cards.map(function(card) {
                            return [
                                '<div class="card card--about-item">',
                                    '<div class="card__header">',
                                        '<div class="card__icon">' + icon(card.icon) + '</div>',
                                    '</div>',
                                    '<div class="card__body">',
                                        '<div class="card__body-wrapper">',
                                            '<h3>' + escapeHtml(card.title) + '</h3>',
                                            '<p>' + escapeHtml(card.text) + '</p>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            ].join('');
                        }).join(''),
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderSkills(data) {
    const skillGroups = Array.isArray(data.skills)
        ? data.skills
        : (Array.isArray(data.groups) ? data.groups : []);

    return [
        '<section id="' + escapeAttribute(data.id) + '" class="skills">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
                '<h2>' + escapeHtml(data.title) + '</h2>',
                '<div class="skills__wrapper">',
                    skillGroups.map(function(group) {
                        return [
                            '<div class="card card--skill-item">',
                                '<div class="card__header">',
                                    '<div class="card__icon">' + icon(group.icon) + '</div>',
                                     '<h3>' + escapeHtml(group.title) + '</h3>',
                                '</div>',
                                '<div class="card__footer">' + group.items.map(function(item) {
                                    return [
                                        '<p class="pill">'+ escapeHtml(item) + '</p>',
                                    ].join('');
                                }).join('') + '</div>',
                            '</div>',
                        ].join('');
                    }).join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderExperience(data) {
    const experienceItems = Array.isArray(data.experience)
        ? data.experience
        : (Array.isArray(data.items) ? data.items : []);

    return [
        '<section id="' + escapeAttribute(data.id) + '" class="experience">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
                '<h2>' + escapeHtml(data.title) + '</h2>',
                '<div class="experience__wrapper">',
                    experienceItems.map(function(item, index) {
                        const itemClass = index === 0 ? 'experience-item__body' : 'experience-item__card';
                        return [
                            '<div class="experience-item">',
                                '<div class="experience-item__timepoint"></div>',
                                '<div class="experience-item__date">',
                                    '<p>' + escapeHtml(item.date) + '</p>',
                                '</div>',
                                '<div class="' + itemClass + ' card card--experience-item">',
                                    '<div class="card__body">',
                                        '<div class="card__body-wrapper">',
                                            '<p>' + escapeHtml(item.date) + '</p>',
                                            '<h3>' + escapeHtml(item.title) + '</h3>',
                                            '<p class="workplace-point"><b>' + escapeHtml(item.company) + '</b><span>' + icon('location') + escapeHtml(item.location) + '</span></p>',
                                            '<ul>' + item.points.map(function(point) {
                                                    return [
                                                        '<li>',
                                                        escapeHtml(point),
                                                        '</li>',
                                                    ].join('');
                                                }).join(''),
                                            '</ul>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        ].join('');
                    }).join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderProjects(data) {
    const projectItems = Array.isArray(data.projects)
        ? data.projects
        : (Array.isArray(data.items) ? data.items : []);

    return [
        '<section id="' + escapeAttribute(data.id) + '" class="projects">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
                '<h2>' + escapeHtml(data.title) + '</h2>',
                '<div class="projects__wrapper">',
                    projectItems.map(function(item) {
                        return [
                            '<article class="card card--project-item">',
                                '<figure>',
                                    renderPicture(item.image),
                                    '<figcaption class="pill">' + escapeHtml(item.category) + '</figcaption>',
                                '</figure>',
                                '<div class="card__body">',
                                    '<div class="card__body-wrapper">',
                                        '<a href="' + escapeAttribute(item.href) + '">',
                                            '<h3>' + escapeHtml(item.title) + '<span>' + icon('externalLink') + '</span></h3>' +
                                        '</a>',
                                        '<p>' + escapeHtml(item.description) + '</p>',
                                        '<p class="highlight">' + icon('arrow-right') + escapeHtml(item.highlight) + '</p>',
                                    '</div>',
                                '</div>',
                                '<div class="card__footer">',
                                    item.tags.map(function(tag) {
                                        return [
                                            '<p class="pill">' + escapeHtml(tag) + '</p>',
                                        ].join('');
                                    }).join(''),
                                '</div>',
                            '</article>',
                        ].join('');
                    }).join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderEducation(data) {
    const courseItems = Array.isArray(data.courses)
        ? data.courses
        : (Array.isArray(data.items) ? data.items : []);

    return [
        '<section class="education">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
                '<h2>' + escapeHtml(data.title) + '</h2>',
                '<div id="education-carousel" role="group" aria-label="' + escapeAttribute(data.carouselLabel) + '" class="splide splide--education">',
                    '<div class="splide__track">',
                        '<ul class="splide__list">',
                            courseItems.map(function(item) {
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

function renderField(field) {
    if (!field || typeof field !== 'object') {
        return '';
    }

    const requiredSuffix = field.required ? ' <sup>*</sup>' : '';
    const errorMarkup = '<span data-form-error="' + escapeAttribute(field.name) + '"></span>';
    const wrapperClass = field.wrapperClass || 'form-group';

    if (field.type === 'textarea') {
        return [
            '<div class="' + wrapperClass + '">' +
                '<label for="' + escapeAttribute(field.id) + '">' + escapeHtml(field.label) + requiredSuffix + '</label>',
                '<textarea ',
                    'id="' + escapeAttribute(field.id) + '" ',
                    'name="' + escapeAttribute(field.name) + '" ',
                    'placeholder="' + escapeAttribute(field.placeholder) + '" ',
                    'rows="' + escapeAttribute(field.rows) + '"></textarea>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    if (field.type === 'radio') {
        const options = Array.isArray(field.options) ? field.options : [];

        return [
            '<div class="' + wrapperClass + '">',
                '<label>' + escapeHtml(field.label) + requiredSuffix + '</label>',
                options.map(function(option) {
                    return [
                        '<div class="form-check">',
                            '<input ',
                                'type="radio" ',
                                'id="' + escapeAttribute(option.id) + '" ',
                                'name="' + escapeAttribute(field.name) + '" ',
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

    if (field.type === 'select') {
        const options = Array.isArray(field.options) ? field.options : [];
        const selectedOption = options.find(function(option) {
            return option && option.selected;
        }) || options[0] || { value: '', label: '' };
        const placeholder = options[0] && typeof options[0].label === 'string'
            ? options[0].label
            : (field.label || '');

        return [
            '<div class="' + wrapperClass + ' custom-select-field" data-custom-select data-custom-select-placeholder="' +
                escapeAttribute(placeholder) + '">',
                '<label for="' + escapeAttribute(field.id) + '">' + escapeHtml(field.label) + requiredSuffix + '</label>',
                '<div class="custom-select js-custom-select">',
                    '<select id="' + escapeAttribute(field.id) + '" name="' + escapeAttribute(field.name) +
                        '" class="custom-select__native js-custom-select__native" data-custom-select-native>',
                        options.map(function(option) {
                            const selected = option.selected ? ' selected' : '';

                            return [
                                '<option value="' + escapeAttribute(option.value) + '"' + selected + '>' +
                                    escapeHtml(option.label) + '</option>',
                            ].join('');
                        }).join(''),
                    '</select>',
                    '<div class="custom-select__ui js-custom-select__ui">',
                        '<button type="button" class="custom-select__toggle js-custom-select__toggle" aria-expanded="false" ' +
                            'aria-haspopup="listbox" aria-controls="' + escapeAttribute(field.id) + '-panel">',
                            '<span class="custom-select__toggle-label js-custom-select__toggle-label" data-custom-select-label>' +
                                escapeHtml(selectedOption.label || placeholder) + '</span>',
                            '<span class="custom-select__toggle-indicator">' + icon('chevron-down') + '</span>',
                        '</button>',
                        '<div id="' + escapeAttribute(field.id) + '-panel" class="custom-select__panel js-custom-select__panel" ' +
                            'role="listbox" hidden>',
                            '<div class="custom-select__options">',
                                options.map(function(option) {
                                    const isSelected = option.selected ? ' is-selected' : '';

                                    return [
                                        '<button type="button" class="custom-select__option js-custom-select__option' + isSelected +
                                            '" data-custom-select-option data-option-value="' + escapeAttribute(option.value) +
                                            '" aria-selected="' + String(!!option.selected) + '" title="' +
                                            escapeAttribute(option.label) + '">',
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

    if (field.type === 'checkbox') {
        return [
            '<div class="' + wrapperClass + '">',
                '<div class="form-check">',
                    '<input ',
                        'type="checkbox" ',
                        'id="' + escapeAttribute(field.id) + '" ',
                        'name="' + escapeAttribute(field.name) + '" ',
                        'value="' + escapeAttribute(field.value || '1') + '" ',
                    '>',
                    '<label for="' + escapeAttribute(field.id) + '">' + escapeHtml(field.label) + '</label>',
                '</div>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    const attributes = [
        'type="' + escapeAttribute(field.type) + '"',
        'id="' + escapeAttribute(field.id) + '"',
        'name="' + escapeAttribute(field.name) + '"'
    ];

    if (field.placeholder) {
        attributes.push('placeholder="' + escapeAttribute(field.placeholder) + '"');
    }
    return [
        '<div class="' + wrapperClass + '">',
            '<label for="' + escapeAttribute(field.id) + '">' + escapeHtml(field.label) + requiredSuffix + '</label>',
            '<input ' + attributes.join(' ') + '>',
            errorMarkup,
        '</div>',
    ].join('');
}

function renderContactHoneypotField() {
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

        if (field && field.row === true) {
            const nextField = fields[index + 1];

            if (nextField && nextField.row === true) {
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

function renderContact(data) {
    const fields = Array.isArray(data.form.fields) ? data.form.fields : [];
    const introEmailHref = './contact-mailto.php';
    const introEmailLabel = data.introCard.linkLabel || 'E-Mail senden';
    const submitButton = resolveButtonConfig(data.form.submitButton, data.form.submitLabel || '');

    return [
        '<section id="' + escapeAttribute(data.id) + '" class="contact">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
                '<h2>' + escapeHtml(data.title) + '</h2>',
                '<div class="contact__wrapper">',
                    [
                        '<div class="card card--contact-item">',
                            '<div class="card__header">',
                                '<div class="card__icon">' + icon('coffee') + '</div>',
                                '<h3>' + escapeHtml(data.introCard.title) + '</h3>',
                            '</div>',
                            '<div class="card__body">',
                                '<div class="card__body-wrapper">',
                                    '<p>' + escapeHtml(data.introCard.text) + '</p>',
                                    '<a href="' + escapeAttribute(introEmailHref) + '"><span>' + icon('mail') + '</span><b>' + escapeHtml(introEmailLabel) + '</b></a>',
                                '</div>',
                            '</div>',
                        '</div>',
                    ].join(''),
                    '<div class="card card--contact-item">',
                        '<div class="card__body">',
                            '<div class="card__body-wrapper">',
                                '<div class="contact-form__status" data-form-status aria-live="polite"></div>',
                                '<form method="post" action="' + escapeAttribute(data.form.action) + '" id="contact-form" class="contact-form" novalidate>',
                                    renderContactHoneypotField(),
                                    renderContactFields(fields),
                                    [
                                '</form>',
                            '</div>',
                        '</div>',
                        '<div class="card__footer">',
                            renderButtonElement(submitButton, [
                                'type="submit"',
                                'form="contact-form"',
                                'data-contact-submit',
                            ]),
                        '</div>',
                    '</div>',
                    ].join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderFooter(data, siteConfig) {
    return [
        '<footer class="footer">',
            '<div class="container footer__wrapper">',
                '<div class="logo">' + icon(siteConfig.logoIcon) + '<span>' + escapeHtml(siteConfig.logoText) + '</span></div>',
                '<p>' + escapeHtml(data.text) + ' <span class="text-nowrap">&copy; ' + escapeHtml(data.copyright) + '</span> ' + escapeHtml(data.owner) + '</p>',
                '<div class="social-icons">' + renderSocialLinks(siteConfig.socialLinks) + '</div>',
            '</div>',
        '</footer>'
    ].join('');
}

function renderApp(data) {
    const siteConfig = resolveSiteConfig(data);

    return [
        renderHeader(data.header, siteConfig),
        '<main>',
        renderHero(data.hero, siteConfig),
        renderAbout(data.about),
        renderSkills(data.skills),
        renderExperience(data.experience),
        renderProjects(data.projects),
        renderEducation(data.education),
        renderContact(data.contact),
        '</main>',
        renderFooter(data.footer, siteConfig),
        '<div class="backdrop" data-overlay></div>'
    ].join('');
}

function setMetaContent(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
        element.setAttribute('content', value);
    }
}

function applyMeta(data) {
    document.title = data.title;

    setMetaContent('meta[name="description"]', data.description);
    setMetaContent('meta[name="keywords"]', data.keywords);
    setMetaContent('meta[property="og:title"]', data.ogTitle);
    setMetaContent('meta[property="og:description"]', data.ogDescription);
    setMetaContent('meta[property="og:image"]', data.ogImage);
    setMetaContent('meta[property="og:site_name"]', data.ogSiteName);

    const fluidIcon = document.querySelector('link[rel="fluid-icon"]');
    if (fluidIcon) {
        fluidIcon.setAttribute('title', data.fluidIconTitle);
    }
}

async function loadSiteData() {
    const response = await fetch(SITE_DATA_PATH, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('data.json konnte nicht geladen werden.');
    }

    return response.json();
}

async function bootstrapContent() {
    const siteData = await loadSiteData();
    const root = document.querySelector('[data-site-root]');

    if (!root) {
        return;
    }

    applyMeta(siteData.meta);
    root.innerHTML = renderApp(siteData);
}

function educationCarouselInitialize() {
    const itemCount = document.querySelectorAll('#education-carousel .splide__slide').length;

    if (itemCount <= 0) {
        return;
    }

    new Splide('#education-carousel', {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '4rem',
        destroy: 1 >= itemCount,
        mediaQuery: 'min',
        breakpoints: {
            768: {
                perPage: 2,
                perMove: 2,
                destroy: 2 >= itemCount
            },
            1200: {
                perPage: 4,
                perMove: 4,
                destroy: 4 >= itemCount
            }
        }
    }).mount();
}

function contactFormInitialize() {
    const form = document.querySelector('#contact-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[data-contact-submit]');
    const statusElement = document.querySelector('[data-form-status]');
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    function setStatus(message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.dataset.formStatus = type;
    }

    function renderErrors(errors) {
        Object.keys(errors).forEach(function(name) {
            const errorElement = form.querySelector('[data-form-error="' + name + '"]');
            const field = form.querySelector('[name="' + name + '"]');

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

        form.querySelectorAll('[data-form-error]').forEach(function(errorElement) {
            errorElement.textContent = '';
        });
        form.querySelectorAll('[aria-invalid="true"]').forEach(function(field) {
            field.removeAttribute('aria-invalid');
        });

        setStatus('', '');
        setSubmitting(true);

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                Accept: 'application/json'
            }
        }).then(function(response) {
            return response.json().then(function(payload) {
                return {
                    ok: response.ok,
                    payload: payload
                };
            });
        }).then(function(result) {
            if (!result.ok || !result.payload.ok) {
                if (result.payload.errors) {
                    renderErrors(result.payload.errors);
                }

                setStatus(result.payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
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

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadIcons();
        await bootstrapContent();
    } catch (error) {
        console.error(error);
        const root = document.querySelector('[data-site-root]');

        if (root) {
            root.innerHTML = '<p>Die Portfoliodaten konnten nicht geladen werden.</p>';
        }
        return;
    }

    themeInitialize();
    headerScrollInitialize();
    mobileNavigationInitialize();
    initializeCustomSelects();
    educationCarouselInitialize();
    contactFormInitialize();
});
