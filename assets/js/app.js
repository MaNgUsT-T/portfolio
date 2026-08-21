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
    return [
        '<picture>',
        image.sources.map(function(source) {
            return '<source media="' + escapeAttribute(source.media) + '" srcset="' + escapeAttribute(source.srcset) +
                '" width="' + escapeAttribute(source.width) + '" height="' + escapeAttribute(source.height) + '">';
        }).join(''),
        '<img src="' + escapeAttribute(image.fallback.src) + '" width="' + escapeAttribute(image.fallback.width) +
            '" height="' + escapeAttribute(image.fallback.height) + '" alt="' + escapeAttribute(image.alt) +
            '" loading="' + escapeAttribute(image.loading) + '" class="' + escapeAttribute(image.className) + '">',
        '</picture>'
    ].join('');
}

function renderSocialLinks(items) {
    return items.map(function(item) {
        return '<a href="' + escapeAttribute(item.href) + '" title="' + escapeAttribute(item.title) + '">' +
            icon(item.icon) + '</a>';
    }).join('');
}

function renderHeader(data) {
    return [
        '<header class="header js-header">',
        '<div class="container header__wrapper">',
        '<div class="logo">' + icon('palette') + '<span>' + escapeHtml(data.logoText) + '</span></div>',
        '<div id="header-navigation" aria-hidden="true" class="header__nav-wrapper js-header-nav-wrapper">',
        '<nav role="navigation" aria-label="' + escapeAttribute(data.navigationLabel) + '" class="main-nav"><ul>',
        data.navigation.map(function(item) {
            const title = item.title ? ' title="' + escapeAttribute(item.title) + '"' : '';
            return '<li><a href="' + escapeAttribute(item.href) + '"' + title + '>' + escapeHtml(item.label) + '</a></li>';
        }).join(''),
        '</ul></nav>',
        '<nav class="option-nav"><ul>',
        '<li><a href="#" title="Dunkles Theme aktivieren" aria-label="Dunkles Theme aktivieren" aria-pressed="false" data-theme-toggle>' + icon('moon') + '</a></li>',
        '<li><a href="' + escapeAttribute(data.resumeLink.href) + '" class="btn btn--primary">' + escapeHtml(data.resumeLink.label) + '</a></li>',
        '</ul></nav>',
        '</div>',
        '<div role="button" aria-expanded="false" aria-controls="header-navigation" aria-label="Navigation öffnen" tabindex="0" class="mobile-nav-toggle" data-mobile-nav-toggle>' + icon('menu') + '</div>',
        '</div>',
        '</header>'
    ].join('');
}

function renderHero(data) {
    const primaryButton = data.buttons[0];
    const secondaryButton = data.buttons[1];

    return [
        '<section id="hero" class="hero">',
        '<div class="container hero__wrapper">',
        '<div class="hero__col">',
        '<p class="availability">' + escapeHtml(data.availability) + '</p>',
        '<h1>' + escapeHtml(data.headline.beforeItalic) + '<i>' + escapeHtml(data.headline.italic) + '</i>' +
            escapeHtml(data.headline.afterItalic) + '</h1>',
        '<p>' + escapeHtml(data.intro.beforeBold) + '<b>' + escapeHtml(data.intro.bold) + '</b>' +
            escapeHtml(data.intro.afterBold) + '</p>',
        '<div class="hero__buttons">',
        '<a href="' + escapeAttribute(primaryButton.href) + '" class="btn btn--primary btn--large">' +
            escapeHtml(primaryButton.label) + icon('arrowRight') + '</a>',
        '<a href="' + escapeAttribute(secondaryButton.href) + '" class="btn btn--secondary btn--large">' +
            escapeHtml(secondaryButton.label) + '</a>',
        '</div>',
        '<div class="social-icons">' + renderSocialLinks(data.socialLinks) + '</div>',
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

function renderAbout(data) {
    return [
        '<section id="' + escapeAttribute(data.id) + '" class="about">',
        '<div class="container">',
        '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
        '<h2>' + escapeHtml(data.title) + '</h2>',
        '<div class="about__wrapper">',
        '<div class="about__col">',
        data.paragraphs.map(function(paragraph) {
            return '<p>' + escapeHtml(paragraph) + '</p>';
        }).join(''),
        renderPicture(data.image),
        '</div>',
        '<div class="about__col">',
        data.cards.map(function(card) {
            return '<div class="card card--about-item"><div class="card__header"><div class="card__icon">' +
                icon(card.icon) + '</div></div><div class="card__body"><div class="card__body-wrapper"><h3>' +
                escapeHtml(card.title) + '</h3><p>' + escapeHtml(card.text) + '</p></div></div></div>';
        }).join(''),
        '</div>',
        '</div>',
        '</div>',
        '</section>'
    ].join('');
}

function renderSkills(data) {
    return [
        '<section id="' + escapeAttribute(data.id) + '" class="skills">',
        '<div class="container">',
        '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
        '<h2>' + escapeHtml(data.title) + '</h2>',
        '<div class="skills__wrapper">',
        data.groups.map(function(group) {
            return '<div class="card card--skill-item"><div class="card__header"><div class="card__icon">' +
                icon(group.icon) + '</div><h3>' + escapeHtml(group.title) + '</h3></div><div class="card__footer">' +
                group.items.map(function(item) {
                    return '<p class="pill">' + escapeHtml(item) + '</p>';
                }).join('') + '</div></div>';
        }).join(''),
        '</div>',
        '</div>',
        '</section>'
    ].join('');
}

function renderExperience(data) {
    return [
        '<section id="' + escapeAttribute(data.id) + '" class="experience">',
        '<div class="container">',
        '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
        '<h2>' + escapeHtml(data.title) + '</h2>',
        '<div class="experience__wrapper">',
        data.items.map(function(item, index) {
            const itemClass = index === 0 ? 'experience-item__body' : 'experience-item__card';
            return '<div class="experience-item"><div class="experience-item__timepoint"></div><div class="experience-item__date"><p>' +
                escapeHtml(item.date) + '</p></div><div class="' + itemClass + ' card card--experience-item"><div class="card__body"><div class="card__body-wrapper"><p>' +
                escapeHtml(item.date) + '</p><h3>' + escapeHtml(item.title) + '</h3><p class="workplace-point"><b>' +
                escapeHtml(item.company) + '</b><span>' + icon('location') + escapeHtml(item.location) +
                '</span></p><ul>' + item.points.map(function(point) {
                    return '<li>' + escapeHtml(point) + '</li>';
                }).join('') + '</ul></div></div></div></div>';
        }).join(''),
        '</div>',
        '</div>',
        '</section>'
    ].join('');
}

function renderProjects(data) {
    return [
        '<section id="' + escapeAttribute(data.id) + '" class="projects">',
        '<div class="container">',
        '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
        '<h2>' + escapeHtml(data.title) + '</h2>',
        '<div class="projects__wrapper">',
        data.items.map(function(item) {
            return '<article class="card card--project-item"><figure>' + renderPicture(item.image) +
                '<figcaption class="pill">' + escapeHtml(item.category) + '</figcaption></figure><div class="card__body"><div class="card__body-wrapper"><a href="' +
                escapeAttribute(item.href) + '"><h3>' + escapeHtml(item.title) + '<span>' + icon('externalLink') +
                '</span></h3></a><p>' + escapeHtml(item.description) + '</p><p class="highlight">' + icon('arrowRight') +
                escapeHtml(item.highlight) + '</p></div></div><div class="card__footer">' + item.tags.map(function(tag) {
                    return '<p class="pill">' + escapeHtml(tag) + '</p>';
                }).join('') + '</div></article>';
        }).join(''),
        '</div>',
        '</div>',
        '</section>'
    ].join('');
}

function renderEducation(data) {
    return [
        '<section class="education">',
        '<div class="container">',
        '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
        '<h2>' + escapeHtml(data.title) + '</h2>',
        '<div id="education-carousel" role="group" aria-label="' + escapeAttribute(data.carouselLabel) + '" class="splide splide--education">',
        '<div class="splide__track"><ul class="splide__list">',
        data.items.map(function(item) {
            return '<li class="splide__slide"><div class="card card--education-item"><div class="card__header"><div class="card__icon">' +
                icon('certificate') + '</div></div><div class="card__body"><div class="card__body-wrapper"><h3>' +
                escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.provider) + '</p></div></div><div class="card__footer"><p>' +
                escapeHtml(item.year) + '</p><p class="highlight">' + icon('verify') + escapeHtml(item.status) +
                '</p></div></div></li>';
        }).join(''),
        '</ul></div>',
        '<div class="splide__arrows"><button class="splide__arrow splide__arrow--prev">' + icon('arrowRight') +
            '</button><button class="splide__arrow splide__arrow--next">' + icon('arrowRight') + '</button></div>',
        '</div>',
        '</div>',
        '</section>'
    ].join('');
}

function renderField(field) {
    const requiredSuffix = field.required ? ' <sup>*</sup>' : '';
    const errorMarkup = field.name === 'website' ? '' : '<span data-form-error="' + escapeAttribute(field.name) + '"></span>';
    const wrapperClass = field.wrapperClass || 'form-group';

    if (field.type === 'textarea') {
        return '<div class="' + wrapperClass + '"><label for="' + escapeAttribute(field.id) + '">' +
            escapeHtml(field.label) + requiredSuffix + '</label><textarea id="' + escapeAttribute(field.id) +
            '" name="' + escapeAttribute(field.name) + '" placeholder="' + escapeAttribute(field.placeholder) +
            '" rows="' + escapeAttribute(field.rows) + '"></textarea>' + errorMarkup + '</div>';
    }

    const attributes = [
        'type="' + escapeAttribute(field.type) + '"',
        'id="' + escapeAttribute(field.id) + '"',
        'name="' + escapeAttribute(field.name) + '"'
    ];

    if (field.placeholder) {
        attributes.push('placeholder="' + escapeAttribute(field.placeholder) + '"');
    }
    if (field.autocomplete) {
        attributes.push('autocomplete="' + escapeAttribute(field.autocomplete) + '"');
    }
    if (field.tabindex) {
        attributes.push('tabindex="' + escapeAttribute(field.tabindex) + '"');
    }

    return '<div class="' + wrapperClass + '"><label for="' + escapeAttribute(field.id) + '">' +
        escapeHtml(field.label) + requiredSuffix + '</label><input ' + attributes.join(' ') + '>' + errorMarkup + '</div>';
}

function renderContact(data) {
    const standaloneFields = data.form.fields.filter(function(field) {
        return !field.row && field.name !== 'website';
    });
    const rowFields = data.form.fields.filter(function(field) {
        return field.row;
    });
    const websiteField = data.form.fields.find(function(field) {
        return field.name === 'website';
    });

    return [
        '<section id="' + escapeAttribute(data.id) + '" class="contact">',
        '<div class="container">',
        '<p class="preheader">' + escapeHtml(data.preheader) + '</p>',
        '<h2>' + escapeHtml(data.title) + '</h2>',
        '<div class="contact__wrapper">',
        '<div class="card card--contact-item"><div class="card__header"><div class="card__icon">' + icon('coffee') +
            '</div><h3>' + escapeHtml(data.introCard.title) + '</h3></div><div class="card__body"><div class="card__body-wrapper"><p>' +
            escapeHtml(data.introCard.text) + '</p><a href="' + escapeAttribute(data.introCard.emailHref) + '" title=""><span>' +
            icon('mail') + '</span><b>' + escapeHtml(data.introCard.emailLabel) + '</b></a></div></div></div>',
        '<div class="card card--contact-item"><div class="card__body"><div class="card__body-wrapper"><div class="contact-form__status" data-form-status aria-live="polite"></div><form method="post" action="' +
            escapeAttribute(data.form.action) + '" id="contact-form" class="contact-form" novalidate>',
        renderField(websiteField),
        '<div class="form-group"><label for="salutation">' + escapeHtml(data.form.salutationLabel) + '</label><select id="salutation" name="salutation">' +
            data.form.salutationOptions.map(function(option) {
                const selected = option.selected ? ' selected' : '';
                return '<option value="' + escapeAttribute(option.value) + '"' + selected + '>' + escapeHtml(option.label) + '</option>';
            }).join('') + '</select></div>',
        '<div class="form-row">' + rowFields.map(renderField).join('') + '</div>',
        standaloneFields.map(renderField).join(''),
        '<div class="form-group">' + data.form.radioGroup.options.map(function(option) {
            return '<div class="form-check"><input type="radio" id="' + escapeAttribute(option.id) + '" name="' +
                escapeAttribute(data.form.radioGroup.name) + '" value="' + escapeAttribute(option.value) +
                '"><label for="' + escapeAttribute(option.id) + '">' + escapeHtml(option.label) + '</label></div>';
        }).join('') + '</div>',
        '<div class="form-group"><div class="form-check"><input type="checkbox" id="' +
            escapeAttribute(data.form.consent.id) + '" name="' + escapeAttribute(data.form.consent.name) + '" value="' +
            escapeAttribute(data.form.consent.value) + '"><label for="' + escapeAttribute(data.form.consent.id) + '">' +
            escapeHtml(data.form.consent.label) + '</label></div><span data-form-error="' +
            escapeAttribute(data.form.consent.name) + '"></span></div>',
        '</form></div></div><div class="card__footer"><button type="submit" form="contact-form" class="btn btn--primary btn--large" data-contact-submit>' +
            icon('send') + ' ' + escapeHtml(data.form.submitLabel) + '</button></div></div>',
        '</div>',
        '</div>',
        '</section>'
    ].join('');
}

function renderFooter(data) {
    return [
        '<footer class="footer">',
        '<div class="container footer__wrapper">',
        '<div class="logo">' + icon('palette') + '<span>' + escapeHtml(data.logoText) + '</span></div>',
        '<p>' + escapeHtml(data.text) + ' <span class="text-nowrap">&copy; ' + escapeHtml(data.copyright) +
            '</span> ' + escapeHtml(data.owner) + '</p>',
        '<div class="social-icons">' + renderSocialLinks(data.socialLinks) + '</div>',
        '</div>',
        '</footer>'
    ].join('');
}

function renderApp(data) {
    return [
        renderHeader(data.header),
        '<main>',
        renderHero(data.hero),
        renderAbout(data.about),
        renderSkills(data.skills),
        renderExperience(data.experience),
        renderProjects(data.projects),
        renderEducation(data.education),
        renderContact(data.contact),
        '</main>',
        renderFooter(data.footer),
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
    educationCarouselInitialize();
    contactFormInitialize();
});
