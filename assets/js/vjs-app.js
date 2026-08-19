/**
 * @fileoverview Haupt-JavaScript-Datei für das Frontend.
 * Lädt die Portfoliodaten aus data.json, rendert die Seite und initialisiert
 * danach Theme, Navigation, Carousel und Kontaktformular.
 */

const SITE_DATA_PATH = './data.json';

const ICONS = {
    palette: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"></path><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',
    menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>',
    arrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>',
    externalLink: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>',
    location: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    verify: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>',
    certificate: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>',
    coffee: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"></path><path d="M6 2v2"></path></svg>',
    mail: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>',
    dribbble: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"></path><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"></path><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"></path></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>',
    tag: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"></path><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"></path><path d="m2.3 2.3 7.286 7.286"></path><circle cx="11" cy="11" r="2"></circle></svg>',
    layout: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>',
    smartphone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>',
    figma: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path></svg>',
    code: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>',
    layers: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>',
    monitorPlay: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.25a.75.75 0 0 1-1.142-.64z"></path><path d="M12 17v4"></path><path d="M8 21h8"></path><rect x="2" y="3" width="20" height="14" rx="2"></rect></svg>'
};

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

function icon(name) {
    return ICONS[name] || '';
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
        '<header class="header">',
        '<div class="container header__wrapper">',
        '<div class="logo">' + icon('palette') + '<span>' + escapeHtml(data.logoText) + '</span></div>',
        '<div id="header-navigation" aria-hidden="true" class="header__nav-wrapper">',
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
    const errorMarkup = field.name === 'website' ? '' : '<span data-contact-error="' + escapeAttribute(field.name) + '"></span>';
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
        '<div class="card card--contact-item"><div class="card__body"><div class="card__body-wrapper"><div class="contact-form__status" data-contact-status aria-live="polite"></div><form method="post" action="' +
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
            escapeHtml(data.form.consent.label) + '</label></div><span data-contact-error="' +
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

function themeInitialize() {
    const themeStorageKey = 'theme-preference';
    const lightTheme = 'light';
    const darkTheme = 'dark';
    const themeMetaColors = {
        light: '#ffffff',
        dark: '#18181b'
    };
    const rootElement = document.documentElement;
    const toggleElements = document.querySelectorAll('[data-theme-toggle]');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const mediaQuery = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    function normalizeThemePreference(value) {
        return value === lightTheme || value === darkTheme ? value : null;
    }

    function getStoredTheme() {
        try {
            return normalizeThemePreference(window.localStorage.getItem(themeStorageKey));
        } catch (error) {
            return null;
        }
    }

    function persistTheme(theme) {
        try {
            window.localStorage.setItem(themeStorageKey, theme);
        } catch (error) {
            return;
        }
    }

    function getThemeMetaColor(theme) {
        return theme === darkTheme ? themeMetaColors.dark : themeMetaColors.light;
    }

    function syncToggleState(theme) {
        const isDarkTheme = theme === darkTheme;
        const toggleLabel = isDarkTheme ? 'Helles Theme aktivieren' : 'Dunkles Theme aktivieren';
        const iconSvg = isDarkTheme ? icon('sun') : icon('moon');

        toggleElements.forEach(function(toggleElement) {
            toggleElement.setAttribute('aria-pressed', String(isDarkTheme));
            toggleElement.setAttribute('aria-label', toggleLabel);
            toggleElement.setAttribute('title', toggleLabel);
            toggleElement.dataset.themeState = theme;
            toggleElement.innerHTML = iconSvg;
        });
    }

    function applyTheme(theme) {
        const normalizedTheme = normalizeThemePreference(theme) || lightTheme;

        rootElement.dataset.theme = normalizedTheme;
        rootElement.style.colorScheme = normalizedTheme;

        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', getThemeMetaColor(normalizedTheme));
        }

        syncToggleState(normalizedTheme);
    }

    function resolveThemePreference(storedTheme, prefersDark) {
        const normalizedStoredTheme = normalizeThemePreference(storedTheme);

        if (normalizedStoredTheme) {
            return normalizedStoredTheme;
        }

        return prefersDark ? darkTheme : lightTheme;
    }

    function getNextTheme(currentTheme) {
        return currentTheme === darkTheme ? lightTheme : darkTheme;
    }

    function getSystemPreference() {
        return !!(mediaQuery && mediaQuery.matches);
    }

    function handleThemeToggle(event) {
        event.preventDefault();

        const activeTheme = normalizeThemePreference(rootElement.dataset.theme) || lightTheme;
        const nextTheme = getNextTheme(activeTheme);

        persistTheme(nextTheme);
        applyTheme(nextTheme);
    }

    function handleThemeToggleKeydown(event) {
        if (event.key !== ' ' && event.key !== 'Spacebar') {
            return;
        }

        handleThemeToggle(event);
    }

    if (!toggleElements.length || rootElement.dataset.themeSwitchInitialized === 'true') {
        return;
    }

    applyTheme(resolveThemePreference(getStoredTheme(), getSystemPreference()));

    toggleElements.forEach(function(toggleElement) {
        toggleElement.addEventListener('click', handleThemeToggle);
        toggleElement.addEventListener('keydown', handleThemeToggleKeydown);
    });

    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', function(event) {
            if (getStoredTheme()) {
                return;
            }

            applyTheme(event.matches ? darkTheme : lightTheme);
        });
    }

    rootElement.dataset.themeSwitchInitialized = 'true';
}

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

function syncOffcanvasInsetWithHeader(headerElement) {
    const navWrapper = document.querySelector('.header__nav-wrapper');

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

function headerScrollInitialize() {
    const header = document.querySelector('header');

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

function mobileNavigationInitialize() {
    const header = document.querySelector('.header');
    const toggleButton = document.querySelector('[data-mobile-nav-toggle]');
    const panel = document.querySelector('.header__nav-wrapper');
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

    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function applyScrollLockCompensation(scrollbarWidth) {
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = scrollbarWidth + 'px';
            toggleButton.style.paddingRight = scrollbarWidth + 'px';
            return;
        }

        document.body.style.removeProperty('padding-right');
        toggleButton.style.removeProperty('padding-right');
    }

    function clearScrollLockCompensation() {
        document.body.style.removeProperty('padding-right');
        toggleButton.style.removeProperty('padding-right');
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
            applyScrollLockCompensation(scrollbarWidth);
        } else {
            clearScrollLockCompensation();
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
            clearScrollLockCompensation();
            document.body.classList.remove('nav--open');
            const scrollbarWidth = getScrollbarWidth();
            document.body.classList.add('nav--open');
            applyScrollLockCompensation(scrollbarWidth);
        }

        if (window.innerWidth >= 1024 && toggleButton.getAttribute('aria-expanded') === 'true') {
            setNavigationState(false, false);
        }
    });
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
    const statusElement = document.querySelector('[data-contact-status]');
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    function setStatus(message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.dataset.contactStatus = type;
    }

    function renderErrors(errors) {
        Object.keys(errors).forEach(function(name) {
            const errorElement = form.querySelector('[data-contact-error="' + name + '"]');
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

        form.querySelectorAll('[data-contact-error]').forEach(function(errorElement) {
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
